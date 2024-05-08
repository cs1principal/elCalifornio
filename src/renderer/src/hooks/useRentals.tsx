/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from '@renderer/utils/supabase'
import { useState } from 'react'

interface RentalsMethods {
  rentals: any[] | null
  getAllRentals: () => Promise<any[] | null>
}

export const useRentals = (): RentalsMethods => {
  const [rentals, setRentals] = useState<any[] | null>(null)

  const getAllRentals = async (): Promise<any[] | null> => {
    try {
      const response = await supabase
        .from('rentals')
        .select(
          'id,clients!rentals_client_id_fkey(name,last_name,id),user_id,end_date,equipment(type(type_name),reference)'
        )
        .is('deleted_at', null)

      const rentals = response.data

      if (response.error) {
        throw response.error
      }

      if (rentals) {
        const filteredRentalsPromises = rentals.map(async (rental) => {
          const response = await supabase.auth.admin.getUserById(rental.user_id)
          const user = response.data.user?.user_metadata
          console.log(rental)

          if (user) {
            return {
              id: rental.id,
              client_id: rental.clients?.id,
              cliente: `${rental.clients?.name} ${rental.clients?.last_name}`,
              user_id: rental.user_id,
              fecha_termino: new Date(rental.end_date).toLocaleDateString(),
              usuario: `${user.name} ${user.lastname}`,
              equipos: rental.equipment.map(
                (item: any) => `${item.type.type_name}: ${item.reference}`
              )
            }
          } else {
            return null
          }
        })
        const filteredRentals = await Promise.all(filteredRentalsPromises)
        setRentals(filteredRentals)
        return filteredRentals
      }
    } catch (error) {
      console.error(error)
    }
    return null
  }

  return { getAllRentals, rentals }
}