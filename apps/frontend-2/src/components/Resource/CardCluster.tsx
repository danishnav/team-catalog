import { css } from "@emotion/css";
import { BodyShort, Heading } from "@navikt/ds-react";
import { Link } from "react-router-dom";

import teamCardBackground from "../../assets/teamCardBackground.svg";
import type { Cluster, TeamRole } from "../../constants";
import { intl } from "../../util/intl/intl";

const cardStyles = css`
  height: 135px;
  width: 100%;
  border: 1px solid #005077;
  border-radius: 4px;
  display: grid;
  grid-template-columns: 1fr 0.3fr;
  margin-bottom: 1rem;
`;
const headingStyles = css`
  font-weight: 600;
  font-size: 22px;
  line-height: 24px;
  color: #005077;
  margin-top: 1rem;
`;
// const imageDivStyles = css`
//     right: 12px;
//     top: 35px;
//     position: absolute;
//     text-align: right;
// `

const CardCluster = (properties: { cluster: Cluster; navIdent: string }) => {
  const { cluster, navIdent } = properties;

  return (
    <div className={cardStyles}>
      <div
        className={css`
          height: 100%;
          padding-left: 20px;
        `}
      >
        <Link
          className={css`
            text-decoration: none;
          `}
          to={`/resource/${cluster.id}`}
        >
          <Heading className={headingStyles} size="medium">
            {cluster.name}
          </Heading>
        </Link>

        <div
          className={css`
            margin-top: 1.1rem;
            display: flex;
          `}
        >
          <BodyShort
            className={css`
              margin-bottom: 3px;
              margin-right: 0.5rem;
            `}
          >
            Roller:{" "}
          </BodyShort>
          <BodyShort
            className={css`
              font-size: 16px;
            `}
          >
            <b>
              {cluster.members
                .find((am) => am.navIdent === navIdent)
                ?.roles.map((r: TeamRole) => intl[r])
                .join(", ")}
            </b>
          </BodyShort>
        </div>
      </div>

      <div
        className={css`
          position: relative;
        `}
      >
        <img
          className={css`
            z-index: -1;
            min-height: 132px;
          `}
          src={teamCardBackground}
        />
      </div>
    </div>
  );
};

export default CardCluster;
