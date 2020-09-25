package no.nav.data.team.member;

import no.nav.data.common.export.ExcelBuilder;
import no.nav.data.common.utils.DateUtil;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.common.utils.StringUtils;
import no.nav.data.team.member.MemberExportService.Member.Relation;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.shared.Lang;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.team.TeamService;
import no.nav.data.team.team.domain.Team;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import static java.util.Comparator.comparing;
import static java.util.Optional.ofNullable;
import static java.util.stream.Collectors.toList;
import static no.nav.data.common.utils.StreamUtils.convert;
import static org.apache.commons.lang3.StringUtils.EMPTY;

@Service
public class MemberExportService {

    public enum SpreadsheetType {
        ALL,
        PRODUCT_AREA,
        TEAM,
        ROLE
    }

    private final TeamService teamService;
    private final ProductAreaService productAreaService;

    public MemberExportService(TeamService teamService, ProductAreaService productAreaService) {
        this.teamService = teamService;
        this.productAreaService = productAreaService;
    }

    public byte[] generateSpreadsheet(SpreadsheetType type, String filter) {
        var pas = productAreaService.getAll();
        var members = switch (type) {
            case ALL -> getAll(pas);
            case PRODUCT_AREA -> getForProductArea(StringUtils.toUUID(filter), pas);
            case TEAM -> mapTeamMembers(List.of(teamService.get(StringUtils.toUUID(filter))), pas).collect(toList());
            case ROLE -> StreamUtils.filter(getAll(pas), m -> convert(m.member().getRoles(), Enum::name).contains(filter));
        };
        return generateFor(members);
    }

    private List<Member> getAll(List<ProductArea> pas) {
        return Stream.concat(
                mapTeamMembers(teamService.getAll(), pas),
                mapPaMembers(pas)
        ).collect(toList());
    }

    private List<Member> getForProductArea(UUID id, List<ProductArea> pas) {
        return Stream.concat(
                mapPaMembers(List.of(productAreaService.get(id))),
                mapTeamMembers(teamService.findByProductArea(id), pas)
        ).collect(toList());
    }

    private Stream<Member> mapPaMembers(List<ProductArea> productAreas) {
        return productAreas.stream().flatMap(pa -> pa.getMembers().stream().map(m -> new Member(Relation.PA, m.convertToResponse(), null, pa)));
    }

    private Stream<Member> mapTeamMembers(List<Team> teams, List<ProductArea> pas) {
        return teams.stream().flatMap(t -> t.getMembers().stream().map(m -> {
            ProductArea productArea = t.getProductAreaId() != null ? StreamUtils.find(pas, pa -> pa.getId().equals(t.getProductAreaId())) : null;
            return new Member(Relation.TEAM, m.convertToResponse(), t, productArea);
        }));
    }

    private byte[] generateFor(List<Member> members) {
        var doc = new ExcelBuilder(Lang.MEMBERS);
        doc.addRow()
                .addCell(Lang.RELATION)
                .addCell(Lang.PRODUCT_AREA)
                .addCell(Lang.TEAM)
                .addCell(Lang.IDENT)
                .addCell(Lang.GIVEN_NAME)
                .addCell(Lang.FAMILY_NAME)
                .addCell(Lang.TYPE)
                .addCell(Lang.ROLES)
                .addCell(Lang.OTHER)
                .addCell(Lang.EMAIL)
                .addCell(Lang.START_DATE)
                .addCell(Lang.END_DATE)
        ;

        Comparator<Member> c1 = comparing(m -> ofNullable(m.member.getResource().getFamilyName()).orElse(""));
        Comparator<Member> c2 = c1.thenComparing(m -> ofNullable(m.member.getResource().getGivenName()).orElse(""));
        members.sort(c2);
        members.forEach(m -> add(doc, m));

        return doc.build();
    }

    private void add(ExcelBuilder doc, Member member) {
        doc.addRow()
                .addCell(member.relationType())
                .addCell(member.productAreaName())
                .addCell(member.teamName())
                .addCell(member.member.getNavIdent())
                .addCell(member.member.getResource().getGivenName())
                .addCell(member.member.getResource().getFamilyName())
                .addCell(member.memberType())
                .addCell(member.roles())
                .addCell(member.member.getDescription())
                .addCell(member.member.getResource().getEmail())
                .addCell(DateUtil.formatDate(member.member.getResource().getStartDate()))
                .addCell(DateUtil.formatDate(member.member.getResource().getEndDate()))
        ;
    }

    record Member(Relation relation, MemberResponse member, Team team, ProductArea pa) {

        enum Relation {
            TEAM(Team.class),
            PA(ProductArea.class);

            private final Class<? extends Membered> type;

            Relation(Class<? extends Membered> type) {
                this.type = type;
            }
        }

        public String relationType() {
            return Lang.objectType(relation.type);
        }

        public String productAreaName() {
            return pa != null ? pa.getName() : EMPTY;
        }

        public String teamName() {
            return switch (relation) {
                case TEAM -> team.getName();
                case PA -> EMPTY;
            };
        }

        public String memberType() {
            if (member.getResource().getResourceType() == null) {
                return EMPTY;
            }
            return Lang.memberType(member.getResource().getResourceType());
        }

        public String roles() {
            return String.join(", ", convert(member.getRoles(), Lang::roleName));
        }


    }

}
