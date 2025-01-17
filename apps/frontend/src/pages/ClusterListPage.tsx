import * as React from 'react'
import { useEffect } from 'react'
import { Cluster, ClusterFormValues } from '../constants'
import { Block } from 'baseui/block'
import Button from '../components/common/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { user } from '../services/User'
import PageTitle from '../components/common/PageTitle'
import { createCluster, getAllClusters, mapClusterToFormValues } from '../api/clusterApi'
import ModalCluster from '../components/cluster/ModalCluster'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { ClusterCard } from '../components/cluster/ClusterCard'
import { useDash } from '../components/dash/Dashboard'
import { RadioGroup, Radio } from 'baseui/radio'

const ClusterListPage = () => {
  const [clusters, setClusters] = React.useState<Cluster[]>([])
  const dash = useDash()
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<String>()
  const [status, setStatus] = React.useState<string>('active')

  const handleSubmit = async (values: ClusterFormValues) => {
    const res = await createCluster(values)
    if (res.id) {
      setClusters([...clusters, res])
      setShowModal(false)
      setErrorMessage('')
    } else {
      setErrorMessage(res)
    }
  }

  useEffect(() => {
    ;(async () => {
      const res = await getAllClusters(status)
      if (res.content) {
        setClusters(res.content.sort((a, b) => a.name.localeCompare(b.name)))
      }
    })()
  }, [status])

  return (
    <React.Fragment>
      <Block display="flex" alignItems="baseline" justifyContent="space-between">
        <PageTitle title="Klynger" />
        <Block display="flex">
          <RadioGroup align="horizontal" name="horizontal" onChange={(e) => setStatus(e.target.value)} value={status}>
            <Radio value="active">Aktive ({dash?.clusterCount})</Radio>
            <Radio value="planned">Fremtidige ({dash?.clusterCountPlanned})</Radio>
            <Radio value="inactive">Inaktive ({dash?.clusterCountInactive})</Radio>
          </RadioGroup>
          {user.canWrite() && (
            <Block>
              <Button kind="outline" marginLeft size="compact" onClick={() => setShowModal(true)}>
                <FontAwesomeIcon icon={faPlusCircle} />
                &nbsp;Opprett ny klynge
              </Button>
            </Block>
          )}
        </Block>
      </Block>

      {clusters.length > 0 && (
        <FlexGrid flexGridColumnCount={2}>
          {clusters.map((cluster) => (
            <FlexGridItem key={cluster.id}>
              <ClusterCard clusterSummary={dash?.clusterSummaryMap[cluster.id]} cluster={cluster} />
            </FlexGridItem>
          ))}
        </FlexGrid>
      )}

      {showModal && (
        <ModalCluster
          title="Opprett ny klynge"
          isOpen={showModal}
          initialValues={mapClusterToFormValues()}
          errorOnCreate={errorMessage}
          submit={handleSubmit}
          onClose={() => {
            setShowModal(false)
            setErrorMessage('')
          }}
        />
      )}
    </React.Fragment>
  )
}

export default ClusterListPage
