import * as React from 'react'
import { useEffect, useState } from 'react'
import { ContactAddress, Process, ProductArea, ProductTeam, ProductTeamFormValues, Resource } from '../constants'
import { deleteTeam, editTeam, getProductArea, getResourceById, getTeam, mapProductTeamToFormValue } from '../api'
import { Block, BlockProps } from 'baseui/block'
import {useNavigate, useParams} from 'react-router-dom'
import ModalTeam from '../components/Team/ModalTeam'
import { user } from '../services/User'
import Button from '../components/common/Button'
import { intl } from '../util/intl/intl'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { ampli } from '../services/Amplitude'
import { AuditButton } from '../components/admin/audit/AuditButton'
import { ErrorMessageWithLink } from '../components/common/ErrorBlock'
import { Members } from '../components/Members/Members'
import { getProcessesForTeam } from '../api/integrationApi'
import { ProcessList } from '../components/common/ProcessList'
import { ObjectType } from '../components/admin/audit/AuditTypes'
import { theme } from '../util'
import { NotificationBell, NotificationType } from '../services/Notifications'
import PageTitle from '../components/common/PageTitle'
import { useClusters } from '../api/clusterApi'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import { getContactAddressesByTeamId } from '../api/ContactAddressApi'
import TeamMetadata from '../components/Team/TeamMetadata'
import ModalContactTeam from '../components/Team/ModalContactTeam'

export type PathParams = { id: string }

const blockProps: BlockProps = {
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const TeamPage = () => {
  const params = useParams<PathParams>()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState<boolean>(false)
  const [team, setTeam] = React.useState<ProductTeam>()
  const [productArea, setProductArea] = React.useState<ProductArea>()
  const [showEditModal, setShowEditModal] = React.useState<boolean>(false)
  const [showDelete, setShowDelete] = useState(false)
  const [processes, setProcesses] = React.useState<Process[]>([])
  const [errorMessage, setErrorMessage] = React.useState<string>()
  const clusters = useClusters(team?.clusterIds)
  const [contactPersonResource, setContactPersonResource] = React.useState<Resource>()
  const [contactAddresses, setContactAddresses] = React.useState<ContactAddress[]>()
  const [teamOwnerResource, setTeamOwnerResource] = React.useState<Resource>()

  const handleSubmit = async (values: ProductTeamFormValues) => {
    const editResponse = await editTeam(values)
    if (editResponse.id) {
      await updateTeam(editResponse)
      setShowEditModal(false)
      setErrorMessage('')
    } else {
      setErrorMessage(editResponse)
    }
  }

  const updateTeam = async (teamUpdate: ProductTeam) => {
    setTeam(teamUpdate)

    if (user.isMemberOf(teamUpdate)) setContactAddresses(teamUpdate.contactAddresses)

    if (teamUpdate.productAreaId) {
      const productAreaResponse = await getProductArea(teamUpdate.productAreaId)
      setProductArea(productAreaResponse)
    } else {
      setProductArea(undefined)
    }
  }

  useEffect(() => {
    ;(async () => {
      if (params.id) {
        setLoading(true)
        try {
          const teamResponse = await getTeam(params.id)
          ampli.logEvent('teamkat_view_team', { team: teamResponse.name })
          await updateTeam(teamResponse)
          getProcessesForTeam(params.id).then(setProcesses)
        } catch (err) {
          let errorMessage = 'Failed to do something exceptional'
          if (err instanceof Error) {
            errorMessage = err.message
          }
          console.log(errorMessage)
        }
        setLoading(false)
      }
    })()
  }, [params])

  useEffect(() => {
    ;(async () => {
      if (team) {
        if (team.contactPersonIdent) {
          const contactPersonRes = await getResourceById(team.contactPersonIdent)
          setContactPersonResource(contactPersonRes)
        } else {
          setContactPersonResource(undefined)
        }
        if (team.teamOwnerIdent) {
          setTeamOwnerResource(await getResourceById(team.teamOwnerIdent))
        } else {
          setTeamOwnerResource(undefined)
        }
      }
    })()
  }, [team, loading, showEditModal])

  useEffect(() => {
    if (team && user.isMemberOf(team) && contactAddresses?.length) getContactAddressesByTeamId(team.id).then(setContactAddresses)
    else setContactAddresses([])
  }, [team?.contactAddresses])

  return (
    <>
      {!loading && !team && <ErrorMessageWithLink errorMessage={intl.teamNotFound} href="/team" linkText={intl.linkToAllTeamsText} />}

      {team && (
        <>
          <Block {...blockProps}>
            <Block>
              <PageTitle title={team.name} />
            </Block>
            <Block display="flex">
              <NotificationBell targetId={team.id} type={NotificationType.TEAM} />
              {user.isAdmin() && <AuditButton id={team.id} marginRight />}
              {user.canWrite() && (
                <Button size="compact" kind="outline" tooltip={intl.edit} icon={faEdit} marginRight onClick={() => setShowEditModal(true)}>
                  {intl.edit}
                </Button>
              )}
              <ModalContactTeam team={team} contactPersonResource={contactPersonResource} />
            </Block>
          </Block>
          <Block>
            <TeamMetadata
              team={{ ...team, teamOwnerResource: teamOwnerResource, contactPersonResource: contactPersonResource }}
              productArea={productArea}
              clusters={clusters}
              contactAddresses={user.isMemberOf(team) ? contactAddresses : undefined}
            />
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <Members
              members={team.members.sort((a, b) => (a.resource.fullName || '').localeCompare(b.resource.fullName || ''))}
              title="Medlemmer"
              teamId={team.id}
              team={team}
              contactPersonResource={contactPersonResource}
            />
          </Block>

          <Block marginTop={theme.sizing.scale2400}>
            <ProcessList processes={processes} parentType={ObjectType.Team} />
          </Block>
          <ModalTeam
            title={'Rediger team'}
            isOpen={showEditModal}
            initialValues={mapProductTeamToFormValue(team)}
            errorMessage={errorMessage}
            submit={handleSubmit}
            onClose={() => {
              setShowEditModal(false)
              setErrorMessage('')
            }}
          />

          <Modal onClose={() => setShowDelete(false)} isOpen={showDelete} animate size="default">
            <ModalHeader>Slett team</ModalHeader>
            <ModalBody>Bekreft sletting av team: {team.name}</ModalBody>

            <ModalFooter>
              <Block display="flex" justifyContent="flex-end">
                <Block display="inline" marginLeft={theme.sizing.scale400} />
                <Button kind="secondary" onClick={() => setShowDelete(false)}>
                  Avbryt
                </Button>
                <Block display="inline" marginLeft={theme.sizing.scale400} />
                <Button
                  onClick={() =>
                    deleteTeam(team?.id).then(() => {
                      setShowDelete(false)
                      navigate('/team')
                    })
                  }
                >
                  Slett
                </Button>
              </Block>
            </ModalFooter>
          </Modal>
        </>
      )}
    </>
  )
}

export default TeamPage
