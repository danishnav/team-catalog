import * as React from 'react'
import { user } from '../services/User'
import { createProductArea, getAllProductAreas, mapProductAreaToFormValues } from '../api'
import { ProductArea, ProductAreaFormValues } from '../constants'
import Button from '../components/common/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { Block } from 'baseui/block'
import ModalProductArea from '../components/ProductArea/ModalProductArea'
import ProductAreaCardList from '../components/ProductArea/View'
import PageTitle from '../components/common/PageTitle'
import { RadioGroup, Radio } from 'baseui/radio'
import { useDash } from '../components/dash/Dashboard'

const ProductAreaListPage = () => {
  const [productAreaList, setProductAreaList] = React.useState<ProductArea[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<String>()
  const [status, setStatus] = React.useState<string>('active')
  const dash = useDash()

  const handleSubmit = async (values: ProductAreaFormValues) => {
    const res = await createProductArea(values)
    if (res.id) {
      setProductAreaList([...productAreaList, res])
      setShowModal(false)
      setErrorMessage('')
    } else {
      setErrorMessage(res)
    }
  }

  const prefixFilters = ['område', 'produktområde']
  const sortName = (name: string) => {
    let sortable = name.toUpperCase()
    let fLen = -1
    prefixFilters.forEach((f, i) => {
      if (sortable?.indexOf(f) === 0 && f.length > fLen) fLen = f.length
    })
    if (fLen > 0) {
      sortable = sortable.substring(fLen).trim()
    }
    return sortable
  }

  React.useEffect(() => {
    ;(async () => {
      const res = await getAllProductAreas(status)
      if (res.content) setProductAreaList(res.content.sort((a1, a2) => sortName(a1.name).localeCompare(sortName(a2.name))))
    })()
  }, [status])

  return (
    <React.Fragment>
      <Block display="flex" alignItems="baseline" justifyContent="space-between">
        <PageTitle title="Områder" />
        <RadioGroup align="horizontal" name="horizontal" onChange={(e) => setStatus(e.target.value)} value={status}>
          <Radio value="active">Aktive ({dash?.productAreasCount})</Radio>
          <Radio value="planned">Fremtidige ({dash?.productAreasCountPlanned})</Radio>
          <Radio value="inactive">Inaktive ({dash?.productAreasCountInactive})</Radio>
        </RadioGroup>
        {user.canWrite() && (
          <Block>
            <Button kind="outline" marginLeft onClick={() => setShowModal(true)}>
              <FontAwesomeIcon icon={faPlusCircle} />
              &nbsp;Opprett nytt område
            </Button>
          </Block>
        )}
      </Block>

      {productAreaList.length > 0 && <ProductAreaCardList areaList={productAreaList} />}

      <ModalProductArea
        title="Opprett nytt område"
        isOpen={showModal}
        initialValues={mapProductAreaToFormValues()}
        errorOnCreate={errorMessage}
        submit={handleSubmit}
        onClose={() => setShowModal(false)}
      />
    </React.Fragment>
  )
}

export default ProductAreaListPage
