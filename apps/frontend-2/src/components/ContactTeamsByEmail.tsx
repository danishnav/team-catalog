import { css } from "@emotion/css";
import { EmailFilled } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";
import { useQuery } from "react-query";

import { getResourceById } from "../api";
import type { ProductTeam } from "../constants";
import { TeamRole } from "../constants";

export function ContactTeamsByEmail({ productTeams }: { productTeams: ProductTeam[] }) {
  const generateMailToStringQuery = useQuery({
    queryKey: ["generateEmailAddressesString", productTeams.length],
    queryFn: () => generateEmailAddressesString(productTeams),
  });

  const emailButton = (
    <Button
      disabled={generateMailToStringQuery.data?.length === 0}
      icon={<EmailFilled />}
      size="medium"
      variant="secondary"
    >
      Kontakt {productTeams.length > 1 ? "alle" : ""} team
    </Button>
  );

  if (generateMailToStringQuery.data?.length === 0) {
    return emailButton;
  }

  return (
    <a
      className={css`
        color: var(--navds-global-color-white);
      `}
      href={`mailto:${generateMailToStringQuery.data}`}
    >
      {emailButton}
    </a>
  );
}

async function generateEmailAddressesString(productTeams: ProductTeam[]) {
  return (await Promise.all(productTeams.map((productTeam) => getContactAddress(productTeam))))
    .filter((email) => (email?.length ?? 0) > 0)
    .join("; ");
}

async function getContactAddress(productTeam: ProductTeam) {
  const teamLeader = productTeam.members.find((tLeader) => tLeader.roles.includes(TeamRole.LEAD));
  const productOwner = productTeam.members.find((po) => po.roles.includes(TeamRole.PRODUCT_OWNER));

  if (productTeam.contactPersonIdent) {
    const { email } = await getResourceById(productTeam.contactPersonIdent);
    return email;
  }

  if (teamLeader) {
    return teamLeader.resource.email;
  }

  if (productOwner) {
    return productOwner.resource.email;
  }

  return productTeam.contactAddresses.find((address) => address.type === "EPOST")?.address;
}
