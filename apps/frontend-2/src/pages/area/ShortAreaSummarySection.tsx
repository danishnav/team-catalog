import { ResourceInfoContainer } from "../../components/common/ResourceInfoContainer";
import { Tags } from "../../components/common/Tags";
import { SlackLink } from "../../components/SlackLink";
import { TextWithLabel } from "../../components/TextWithLabel";
import type { ProductArea } from "../../constants";
import { intl } from "../../util/intl/intl";

const ShortAreaSummarySection = ({ productArea }: { productArea: ProductArea }) => {
  return (
    <ResourceInfoContainer title="Kort fortalt">
      <TextWithLabel
        label="Områdetype"
        text={
          productArea.areaType ? intl.getString(productArea.areaType + "_AREATYPE_DESCRIPTION") : intl.dataIsMissing
        }
      />
      <TextWithLabel label="Tagg" text={<Tags tags={productArea.tags} />} />
      <TextWithLabel
        label="Slack"
        text={productArea.slackChannel ? <SlackLink channel={productArea.slackChannel} /> : "Fant ikke slack kanal"}
      />
    </ResourceInfoContainer>
  );
};

export default ShortAreaSummarySection;
