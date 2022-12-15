import { css } from "@emotion/css";
import { AddCircleFilled, EmailFilled } from "@navikt/ds-icons";
import { Button, ToggleGroup } from "@navikt/ds-react";
import * as React from "react";
import { useState } from "react";

import { createTeam, mapProductTeamToFormValue } from "../../api";
import { getSlackUserByEmail } from "../../api/ContactAddressApi";
import { PageHeader } from "../../components/PageHeader";
import ListView from "../../components/team/ListView";
import ModalTeam from "../../components/team/ModalTeam";
import { TeamExport } from "../../components/team/TeamExport";
import type { ContactAddress, ProductTeamSubmitValues } from "../../constants";
import { AddressType } from "../../constants";
import { Status } from "../../constants";
import { useAllTeams } from "../../hooks";
import { useDashboard } from "../../hooks";
import { Group, userHasGroup, useUser } from "../../hooks";
import { TeamsTable } from "./TeamsTable";
import { ContactTeamsByEmail } from "../../components/ContactTeamsByEmail";

const TeamListPage = () => {
  const user = useUser();
  const [status, setStatus] = useState<Status>(Status.ACTIVE);
  const [showTable, setShowTable] = useState(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const teamQuery = useAllTeams({ status });

  const teams = teamQuery.data ?? [];

  const dash = useDashboard();

  const handleSubmit = async (values: ProductTeamSubmitValues) => {
    let mappedContactUsers: ContactAddress[] = [];
    const contactAddressesWithoutMail = values.contactAddresses.filter((ca) => !ca.email);

    const filteredUsersWithAddressId = values.contactAddresses
      .filter((ca) => ca.type === AddressType.SLACK_USER)
      .filter((ca) => ca.email)
      .map(async (contactUser) => await getSlackUserByEmail(contactUser.email || ""));
    try {
      const resolvedSlackUsersByEmail = await Promise.all(filteredUsersWithAddressId);
      mappedContactUsers = resolvedSlackUsersByEmail.map((user) => ({
        address: user.id,
        type: AddressType.SLACK_USER,
        slackChannel: { id: user.id, name: user.name },
      }));
    } catch {
      mappedContactUsers = [];
    }

    const response = await createTeam({
      ...values,
      contactAddresses: [...contactAddressesWithoutMail, ...mappedContactUsers],
    });
    if (response.id) {
      setShowModal(false);
      setErrorMessage("");
    } else {
      setErrorMessage(response);
    }
  };

  return (
    <React.Fragment>
      <div
        className={css`
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        `}
      >
        <PageHeader title="Team" />

        <div
          className={css`
            display: flex;
            align-items: end;
            flex-wrap: wrap;
          `}
        >
          <ToggleGroup
            className={css`
              margin-right: 1rem;
            `}
            onChange={(value) => setStatus(value as Status)}
            size="small"
            value={status}
          >
            <ToggleGroup.Item value={Status.ACTIVE}>Aktive ({dash?.teamsCount})</ToggleGroup.Item>
            <ToggleGroup.Item value={Status.PLANNED}>Fremtidige ({dash?.teamsCountPlanned})</ToggleGroup.Item>
            <ToggleGroup.Item value={Status.INACTIVE}>Inaktive ({dash?.teamsCountInactive})</ToggleGroup.Item>
          </ToggleGroup>

          <div
            className={css`
              display: flex;
              gap: 1rem;
            `}
          >
            <Button onClick={() => setShowTable((previousValue) => !previousValue)} size="medium" variant="secondary">
              {showTable ? "Listevisning" : "Tabellvisning"}
            </Button>
            <TeamExport />
            <ContactTeamsByEmail productTeams={teams} />

            {userHasGroup(user, Group.ADMIN) && (
              <Button icon={<AddCircleFilled />} onClick={() => setShowModal(true)} size="medium" variant="secondary">
                Opprett nytt team
              </Button>
            )}
          </div>
        </div>
      </div>

      {teams.length > 0 && !showTable && <ListView list={teams} prefixFilter="team" />}
      <ModalTeam
        initialValues={mapProductTeamToFormValue()}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmitForm={(values: ProductTeamSubmitValues) => handleSubmit(values)}
        title="Opprett nytt team"
      />

      {showTable && <TeamsTable teams={teams} />}
    </React.Fragment>
  );
};

export default TeamListPage;
