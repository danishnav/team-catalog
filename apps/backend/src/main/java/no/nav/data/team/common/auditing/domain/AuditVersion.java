package no.nav.data.team.common.auditing.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.team.common.auditing.dto.AuditResponse;
import no.nav.data.team.common.utils.JsonUtils;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.Table;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@FieldNameConstants
@Table(name = "AUDIT_VERSION")
public class AuditVersion {

    @Id
    @Type(type = "pg-uuid")
    @Column(name = "AUDIT_ID")
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Enumerated(EnumType.STRING)
    @Column(name = "ACTION", nullable = false, updatable = false)
    private Action action;

    @Column(name = "TABLE_NAME", nullable = false, updatable = false)
    private String table;

    @Column(name = "TABLE_ID", nullable = false, updatable = false)
    private String tableId;

    @Column(name = "TIME", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime time = LocalDateTime.now();

    @Column(name = "USER_ID", nullable = false, updatable = false)
    private String user;

    @Type(type = "jsonb")
    @Column(name = "DATA", nullable = false, updatable = false)
    private String data;

    public AuditResponse convertToResponse() {
        return AuditResponse.builder()
                .id(id.toString())
                .action(action)
                .table(table)
                .tableId(tableId)
                .time(time)
                .user(user)
                .data(JsonUtils.toJsonNode(this.data))
                .build();
    }

    public static String tableName(Class<? extends Auditable> aClass) {
        return aClass.getAnnotation(Table.class).name();
    }

}
