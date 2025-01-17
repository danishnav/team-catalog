import { css } from "@emotion/css";
import { BodyShort, Heading } from "@navikt/ds-react";
import { Link } from "react-router-dom";

import teamCardBackground from "../../assets/teamCardBackground.svg";
import teamCardResource from "../../assets/teamCardResource.svg";
import type { ProductTeam, TeamRole } from "../../constants";
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
const imageDivStyles = css`
  right: 12px;
  top: 35px;
  position: absolute;
  text-align: right;
`;

const CardTeam = (properties: { team: ProductTeam; navIdent: string }) => {
  const { team, navIdent } = properties;

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
          to={`/resource/${team.id}`}
        >
          <Heading className={headingStyles} size="medium">
            {team.name}
          </Heading>
        </Link>

        {/* <div className={css` margin-top: 0.8rem; display: flex;`}>
                    <BodyShort className={css`margin-right: 1rem;`}>Medlemmer: </BodyShort>
                    <BodyShort className={css`font-size: 16px;`}><b>{props.team.members.length}</b></BodyShort>
                </div>  --  Finne ut av om det er behov for dette*/}

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
              {team.members
                .find((tm) => tm.navIdent === navIdent)
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
        <div className={imageDivStyles}>
          <img src={teamCardResource} />
        </div>
      </div>
    </div>
  );
};

export default CardTeam;
