import * as yup from "yup";
import {Member, ProductAreaFormValues, ProductTeamFormValues, TeamType} from "../../constants";

const errorMessage = "Feltet er påkrevd";

export const productAreaSchema = () =>
  yup.object<ProductAreaFormValues>({
    name: yup.string().required(errorMessage),
    description: yup.string().required(errorMessage)
  });

export const memberSchema = () =>
  yup.object<Member>({
    navIdent: yup.string(),
    name: yup.string(),
    role: yup.string().required(errorMessage),
    email: yup.string(),
    resourceType: yup.string()
  });

export const teamSchema = () =>
  yup.object<ProductTeamFormValues>({
    id: yup.string(),
    name: yup.string().required(errorMessage),
    productAreaId: yup.string(),
    description: yup.string().required(errorMessage),
    slackChannel: yup.string(),
    naisTeams: yup.array(yup.string()),
    members: yup.array(memberSchema()),
    teamLeader: yup.string(),
    teamLeadQA: yup.boolean(),
    teamType: yup.mixed().oneOf(Object.values(TeamType), errorMessage).required(errorMessage)
  });
