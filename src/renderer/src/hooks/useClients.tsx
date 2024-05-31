/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from '@renderer/utils/supabase'
import { useState } from 'react'

interface Clients {
  clientList: object[] | null
  localsClients: any[] | null
  getAllClients: () => Promise<object[] | null>
  getClientById: (id: string | number) => Promise<object | null>
  createClient: (values: any, fileList: FileList) => Promise<void>
  deleteClient: (id: string | number) => Promise<void>
  updateClient: (id: string | number, values: any, fileList: FileList) => Promise<void>
  getAllLocalClients: () => Promise<object[] | null>
  getAllFiles: (id: any) => Promise<FileList[]>
  download: (id: any, name: string) => Promise<Blob | MediaSource>
  removeFile: (id: any, name: string) => Promise<void>
  getBannedClients: () => Promise<any[]>
  unBanClientById: (id: string | number) => Promise<void>
}

export const useClients = (): Clients => {
  const [clientList, setClientList] = useState<object[] | null>(null)
  const [localsClients, setLocalsClients] = useState<object[] | null>(null)

  const unBanClientById = async (id: string | number): Promise<void> => {
    const { error } = await supabase.from('clients').update({ strikes: 2 }).eq('id', id)
    if (error) throw error
  }

  const getBannedClients = async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('clients')
      .select('id,name,last_name,phone,strikes')
      .gt('strikes', 2)
    if (error) throw error
    const filteredData = data.map((r) => {
      return {
        id: r.id,
        nombre: r.name,
        apellido: r.last_name,
        teléfono: r.phone,
        strikes: r.strikes
      }
    })
    setClientList(filteredData)
    return filteredData
  }

  const removeFile = async (id: any, name: string): Promise<void> => {
    const { data, error } = await supabase.storage
      .from('clients_storage')
      .remove([`clients/${id}/${name}`])
    if (error) throw error
    console.log(data)
  }

  const download = async (id: any, name: string): Promise<Blob | MediaSource> => {
    const BLOB = await supabase.storage
      .from('clients_storage')
      .download(`clients/${id}/${name}`)
      .then(async (res) => {
        if (res.error) throw res.error
        const blob: any = res.data
        return blob
      })
    return BLOB
  }

  const getAllFiles = async (id: any): Promise<any[]> => {
    try {
      const response = await supabase.storage
        .from('clients_storage')
        .list(`clients/${id}`, { limit: 100 })
      if (response.error) throw response.error
      return response.data
    } catch (error) {
      console.error(error)
    }
    return []
  }

  const updateClient = async (
    id: string | number,
    values: any,
    filesList: FileList
  ): Promise<void> => {
    try {
      const files = Array.from(filesList)

      const urls = await Promise.all(
        files.map(async (file: any) => {
          const { data, error } = await supabase.storage
            .from('clients_storage')
            .upload(`clients/${id}/${file.name}`, file)
          if (error) throw error
          console.log(data)
          return data.path
        })
      )

      const { error } = await supabase
        .from('clients')
        .update({ ...values, urls })
        .eq('id', id)
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

  const createClient = async (values: any, filesList: FileList): Promise<void> => {
    try {
      const files = Array.from(filesList)

      const { data } = await supabase.from('clients').select('id', { count: 'exact' })

      const count = data?.length

      const urls = await Promise.all(
        files.map(async (file: any) => {
          const filePath = `clients/${count}/${file.name}`
          const { data, error } = await supabase.storage
            .from('clients_storage')
            .upload(filePath, file)
          if (error) throw error
          console.log(data)
          return data.path
        })
      )

      const { error } = await supabase.from('clients').insert({ ...values, urls })
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
        .select('id,name,last_name,phone,isForeign,client_type(type_name),strikes')
        .is('deleted_at', null)
        .lt('strikes', 3)
      if (error) throw error
      const filteredClients = data.map((client) => {
        return {
          id: client.id,
          'nombre(s)': client.name,
          'apellido(s)': client.last_name,
          teléfono: client.phone,
          strikes: client.strikes,
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
    localsClients,
    getAllFiles,
    download,
    removeFile,
    getBannedClients,
    unBanClientById
  }
}
