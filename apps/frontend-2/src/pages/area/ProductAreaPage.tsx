import "dayjs/plugin/localizedFormat";

import { css } from "@emotion/css";
import { EditFilled } from "@navikt/ds-icons";
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import { BodyShort, Button, Heading } from "@navikt/ds-react";
import dayjs from "dayjs";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { getAllTeamsForProductArea, getProductArea } from "../../api";
import { getAllClusters } from "../../api/clusterApi";
import { AuditName } from "../../components/AuditName";
import { CardContainer, ClusterCard } from "../../components/common/Card";
import DescriptionSection from "../../components/common/DescriptionSection";
import Members from "../../components/common/Members";
import { ResourceInfoLayout } from "../../components/common/ResourceInfoContainer";
import { LargeDivider } from "../../components/Divider";
import { ErrorMessageWithLink } from "../../components/ErrorMessageWithLink";
import { Markdown } from "../../components/Markdown";
import PageTitle from "../../components/PageTitle";
import StatusField from "../../components/StatusField";
import { TeamsSection } from "../../components/team/TeamsSection";
import { AreaType, ResourceType, Status } from "../../constants";
import { Group, userHasGroup, useUser } from "../../hooks/useUser";
import { intl } from "../../util/intl/intl";
import OwnerAreaSummary from "./OwnerAreaSummary";
import ShortAreaSummarySection from "./ShortAreaSummarySection";

dayjs.locale("nb");

const ProductAreaPage = () => {
  const { areaId } = useParams<{ areaId: string }>();
  const user = useUser();

  const productAreasQuery = useQuery({
    queryKey: ["getProductArea", areaId],
    queryFn: () => getProductArea(areaId as string),
    enabled: !!areaId,
  });

  const clustersForProductAreaQuery = useQuery({
    queryKey: ["getAllClusters", areaId],
    queryFn: () => getAllClusters("active"),
    select: (clusters) => clusters.content.filter((cluster) => cluster.productAreaId === areaId),
  });

  const allTeamsForProductAreaQuery = useQuery({
    queryKey: ["getAllTeamsForProductArea", areaId],
    queryFn: () => getAllTeamsForProductArea(areaId as string),
    enabled: !!areaId,
    select: (data) => data.content.filter((team) => team.status === Status.ACTIVE),
  });

  const productArea = productAreasQuery.data;
  const productAreaMembers = productArea?.members ?? [];
  const teams = allTeamsForProductAreaQuery.data ?? [];
  const clusters = clustersForProductAreaQuery.data ?? [];

  const numberOfExternalMembers = (productArea?.members ?? []).filter(
    (member) => member.resource.resourceType === ResourceType.EXTERNAL
  ).length;

  return (
    <div>
      {productAreasQuery.isError && (
        <ErrorMessageWithLink
          errorMessage={intl.productAreaNotFound}
          href="/team"
          linkText={intl.linkToAllProductAreasText}
        />
      )}

      {productArea && (
        <>
          <div
            className={css`
              display: grid;
              align-items: center;
              grid-template-columns: max-content 1fr max-content;
              gap: 1rem;
            `}
          >
            <Heading level="1" size="large">
              {productArea.name}
            </Heading>
            <StatusField status={productArea.status} />
            {productArea.changeStamp && (
              <BodyShort size="small">
                <b>Sist endret av :</b> <AuditName name={productArea.changeStamp.lastModifiedBy} /> -{" "}
                {dayjs(productArea.changeStamp?.lastModifiedDate).format("D. MMMM, YYYY H:mm ")}
              </BodyShort>
            )}
          </div>

          <div
            className={css`
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 2rem;
            `}
          >
            <div></div>
            {productArea.changeStamp && (
              <div
                className={css`
                  display: flex;
                  align-items: center;
                `}
              >
                {userHasGroup(user, Group.WRITE) && (
                  <Button
                    className={css`
                      margin-right: 1rem;
                    `}
                    disabled
                    icon={<EditFilled aria-hidden />}
                    size="medium"
                    variant="secondary"
                  >
                    {intl.edit}
                  </Button>
                )}
                <Button disabled icon={<SvgBellFilled aria-hidden />} size="medium" variant="secondary">
                  Bli varslet
                </Button>
              </div>
            )}
          </div>
          <ResourceInfoLayout expandFirstSection={productArea.areaType == AreaType.PRODUCT_AREA}>
            <DescriptionSection header="Om oss" text={<Markdown source={productArea.description} />} />
            <ShortAreaSummarySection productArea={productArea} />
            {productArea.areaType == AreaType.PRODUCT_AREA && <OwnerAreaSummary productArea={productArea} />}
          </ResourceInfoLayout>
        </>
      )}
      <LargeDivider />
      <TeamsSection teams={teams} />
      <LargeDivider />
      <div
        className={css`
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        `}
      >
        <Heading
          className={css`
            margin-right: 2rem;
            margin-top: 0;
          `}
          size="medium"
        >
          Klynger ({clusters.length})
        </Heading>
      </div>
      <CardContainer>
        {clusters.map((cluster) => (
          <ClusterCard cluster={cluster} key={cluster.id} />
        ))}
      </CardContainer>
      <LargeDivider />
      <div
        className={css`
          display: flex;
          justify-content: left;
          align-items: center;
          margin-bottom: 2rem;
        `}
      >
        <Heading
          className={css`
            margin-right: 2rem;
            margin-top: 0;
          `}
          size="medium"
        >
          Medlemmer på områdenivå ({productAreaMembers.length})
        </Heading>
        {numberOfExternalMembers > 0 && productAreaMembers.length > 0 && (
          <b>
            Eksterne {numberOfExternalMembers} (
            {((numberOfExternalMembers / productAreaMembers.length) * 100).toFixed(0)}
            %)
          </b>
        )}
      </div>
      {productAreaMembers.length > 0 ? <Members members={productAreaMembers} /> : <></>}
    </div>
  );
};

export default ProductAreaPage;
