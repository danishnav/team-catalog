import { Block } from 'baseui/block'
import { Spinner } from 'baseui/spinner'
import { LabelMedium, ParagraphMedium, ParagraphSmall } from 'baseui/typography'
import { Cluster, ProductArea, Status } from '../../constants'
import { Markdown } from '../common/Markdown'
import RouteLink from '../common/RouteLink'
import { TextWithLabel } from '../common/TextWithLabel'
import { AuditName } from '../common/User'
import moment from 'moment'
import { theme } from '../../util'
import { ReactNode } from 'react'
import { intl } from '../../util/intl/intl'
import { SlackLink } from '../common/SlackLink'
import { DotTags } from '../common/DotTag'
import { ClusterSummary2 } from '../dash/Dashboard'
import { faUserCircle, faUserNinja } from '@fortawesome/free-solid-svg-icons'
import { TextBox } from '../dash/TextBox'
import { areaCardIcon } from '../Images'

interface ClusterMetadataProps {
  cluster: Cluster
  clusterSummaryMap?: ClusterSummary2
  productArea?: ProductArea
  children?: ReactNode
}

function Loading({ t }: { t: boolean }) {
  return t ? (
    <Block display="inline-block">
      <Spinner $size="8px" />
    </Block>
  ) : null
}

function BulletPointsList(props: { label: string; baseUrl?: string; list?: string[]; children?: ReactNode[] }) {
  const len = (props.list || props.children || []).length
  return (
    <Block>
      <LabelMedium>{props.label}</LabelMedium>
      <Block>{len > 0 ? <DotTags items={props.list} children={props.children} baseUrl={props.baseUrl} /> : <ParagraphMedium>{intl.dataIsMissing}</ParagraphMedium>}</Block>
    </Block>
  )
}

function SummaryCards(props: { clusterId: string; clustersummaryMap: ClusterSummary2 }) {
  const queryParam = `?clusterId=${props.clusterId}`

  return (
    <Block display="flex" flexWrap width="100%" justifyContent="space-between">
      <Block marginTop={0}>
        <RouteLink href={`/dashboard/members/all${queryParam}`} hideUnderline>
          <TextBox
            title="Personer"
            icon={areaCardIcon}
            value={props.clustersummaryMap.totalUniqueResourcesCount}
            subtext={`Medlemskap: ${props.clustersummaryMap.totalMembershipCount}`}
          />
        </RouteLink>
      </Block>
      <Block marginTop={0}>
        <TextBox
          title="Eksterne"
          icon={areaCardIcon}
          value={props.clustersummaryMap.uniqueResourcesExternal}
          subtext={`Andel: ${((props.clustersummaryMap.uniqueResourcesExternal * 100) / props.clustersummaryMap.totalUniqueResourcesCount).toFixed(0)}%`}
        />
      </Block>
    </Block>
  )
}

export default function ClusterMetadata(props: ClusterMetadataProps) {
  const { description, productAreaId, slackChannel, changeStamp, tags, id: clusterId, name: clusterName, status } = props.cluster

  const InactiveStatus = (currentStatus: string) => {
    if (currentStatus === 'INACTIVE') {
      return true
    }
    return false
  }

  const leftWidth = props.children ? '55%' : '100%'

  return (
    <>
      <Block width="100%" display="flex" justifyContent="space-between">
        <Block width={leftWidth}>
          <Block width="100%">
            <TextWithLabel label="Beskrivelse" text={<Markdown source={description} />} />
          </Block>

          <Block display="flex" width="100%">
            <Block maxWidth="400px" marginRight={theme.sizing.scale800}>
              <TextWithLabel label="Område" text={<RouteLink href={`/area/${productAreaId}`}>{props.productArea?.name}</RouteLink>} />
              <TextWithLabel label="Slack" text={!slackChannel ? 'Fant ikke slack kanal' : <SlackLink channel={slackChannel} />} />
              <BulletPointsList label="Tagg" list={!tags ? [] : tags} baseUrl={'/tag/'} />
              <TextWithLabel color={InactiveStatus(status) ? 'red' : 'black'} label="Status" text={intl[status]} />
            </Block>
          </Block>
        </Block>
        {props.children && (
          <Block width="45%" marginLeft={theme.sizing.scale400} maxWidth="415px">
            {props.clusterSummaryMap && <SummaryCards clusterId={props.cluster.id} clustersummaryMap={props.clusterSummaryMap} />}
          </Block>
        )}
      </Block>
      <Block display="flex" flexDirection="row-reverse">
        {changeStamp && (
          <Block>
            <ParagraphSmall>
              <i>
                Sist endret av : <AuditName name={changeStamp.lastModifiedBy} /> - {moment(changeStamp?.lastModifiedDate).format('lll')}
              </i>
            </ParagraphSmall>
          </Block>
        )}
      </Block>
    </>
  )
}
