/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppLayout, Form, submitObject } from '@renderer/components'
import { Loading } from '@renderer/components/Loading'
import { useInventory } from '@renderer/hooks/useInventory'
import { ReactElement, useEffect, useState } from 'react'
import { SubmitHandler } from 'react-hook-form'
import { useLocation, useParams } from 'wouter'
import * as Yup from 'yup'

type selectType = { value: string | number | boolean; label: string }

const inventoryPage = Yup.object().shape({
  type: Yup.number().required(''),
  status: Yup.number(),
  reference: Yup.string()
})

export const CreateEditInventoryPage = (): ReactElement => {
  const [, setLocation] = useLocation()
  const [equipmentTypes, setEquipmentTypes] = useState<selectType[] | null>(null)
  const [equipmentStatus, setEquipmentStatus] = useState<selectType[] | null>(null)
  const { getEquipmentTypes, getEquipmentStatus, createEquipment } = useInventory()
  const { id } = useParams()

  useEffect(() => {
    getEquipmentTypes().then((res: any) => {
      setEquipmentTypes(
        res.map((equipment: any) => {
          return {
            value: equipment.id,
            label: equipment.type_name
          }
        })
      )
    })

    getEquipmentStatus().then((res: any) => {
      setEquipmentStatus(
        res.map((equipment: any) => {
          return {
            value: equipment.id,
            label: equipment.status_name
          }
        })
      )
    })
  }, [])

  const onSubmit: SubmitHandler<submitObject> = (data) => {
    if (id) {
      console.log(data)
    } else {
      createEquipment(data).then(() => setLocation('/inventory'))
    }
  }

  return (
    <AppLayout>
      <AppLayout.Content>
        <AppLayout.PageOptions pageTitle="Agregar Equipo" hasAddButton={false} />
        {equipmentTypes && equipmentStatus ? (
          <Form
            className="grid auto-cols-max w-2/4 auto-rows-max mx-auto gap-4"
            onSubmit={onSubmit}
            validationSchema={inventoryPage}
            formDirection="col"
            fields={[
              {
                name: 'type',
                label: 'Tipo del Equipo y/o Herramienta',
                as: 'select',
                isRequired: true,
                options: equipmentTypes
              },
              {
                name: 'status',
                label: 'Estado del Equipo y/o Herramienta',
                as: 'select',
                isRequired: true,
                options: equipmentStatus,
                isVisible: false
              },
              {
                name: 'reference',
                label: 'Referencia y/o Descripción del Estado del Equipo y/o Herramienta',
                as: 'textarea',
                isRequired: true,
                className: ''
              }
            ]}
          />
        ) : (
          <Loading />
        )}
      </AppLayout.Content>
    </AppLayout>
  )
}
