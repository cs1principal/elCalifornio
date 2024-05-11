/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from '@renderer/utils/supabase'
import { useState } from 'react'

interface Clients {
  clientList: object[] | null
  localsClients: any[] | null
  getAllClients: () => Promise<object[] | null>
  getClientById: (id: string | number) => Promise<object | null>
  createClient: (values: any) => Promise<void>
  deleteClient: (id: string | number) => Promise<void>
  updateClient: (id: string | number, values: any) => Promise<void>
  getAllLocalClients: () => Promise<object[] | null>
}

export const useClients = (): Clients => {
  const [clientList, setClientList] = useState<object[] | null>(null)
  const [localsClients, setLocalsClients] = useState<object[] | null>(null)

  const updateClient = async (id: string | number, values: any): Promise<void> => {
    try {
      const { error } = await supabase.from('clients').update(values).eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error(error)
    }
  }

  const deleteClient = async (id: string | number): Promise<void> => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      console.log(error)
    }
  }

  const createClient = async (values: any): Promise<void> => {
    try {
      const { error } = await supabase.from('clients').insert(values)
      if (error) throw error
    } catch (error) {
      console.error(error)
    }
  }

  const getClientById = async (id: string | number): Promise<object | null> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*,client_type(type_name)')
        .eq('id', id)
      if (error) throw error
      return data
    } catch (error) {
      console.error(error)
    }
    return null
  }

  const getAllClients = async (): Promise<object[] | null> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id,name,last_name,phone,isForeign,client_type(type_name)')
        .is('deleted_at', null)
      if (error) throw error
      const filteredClients = data.map((client) => {
        return {
          id: client.id,
          'nombre(s)': client.name,
          'apellido(s)': client.last_name,
          teléfono: client.phone,
          foráneo: client.isForeign ? 'Si' : 'No',
          tipo_cliente: client.client_type[0].type_name
        }
      })
      setClientList(filteredClients)
      return filteredClients
    } catch (error) {
      console.error(error)
    }
    return null
  }

  const getAllLocalClients = async (): Promise<object[] | null> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id,name,last_name,email,phone,isForeign,client_type(type_name)')
        .is('isForeign', false)
        .is('deleted_at', null)
      if (error) throw error
      const filteredClients = data.map((client) => {
        return {
          id: client.id,
          'nombre(s)': client.name,
          'apellido(s)': client.last_name,
          correo: client.email,
          teléfono: client.phone,
          foráneo: client.isForeign ? 'Si' : 'No',
          tipo_cliente: client.client_type[0].type_name
        }
      })
      setLocalsClients(filteredClients)
      return filteredClients
    } catch (error) {
      console.error(error)
    }
    return null
  }

  return {
    getAllClients,
    clientList,
    getClientById,
    createClient,
    deleteClient,
    updateClient,
    getAllLocalClients,
    localsClients
  }
}
