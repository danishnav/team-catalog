import axios from "axios"
import {Cluster, ClusterFormValues, PageResponse} from "../constants"
import {env} from "../util/env"
import {ampli} from '../services/Amplitude'
import {useEffect, useState} from 'react'
import {useSearch} from '../util/hooks'
import {mapToOptions} from './index'

export const getAllClusters = async () => {
  return (await axios.get<PageResponse<Cluster>>(`${env.teamCatalogBaseUrl}/cluster`)).data
}

export const getCluster = async (clusterId: string) => {
  return (await axios.get<Cluster>(`${env.teamCatalogBaseUrl}/cluster/${clusterId}`)).data
}

export const createCluster = async (cluster: ClusterFormValues) => {
  try {
    ampli.logEvent("teamkatalog_create_cluster")
    return (await axios.post<Cluster>(`${env.teamCatalogBaseUrl}/cluster`, cluster)).data
  } catch (error) {
    if (error.response.data.message.includes("alreadyExist")) {
      return "Klyngen eksisterer allerede. Endre i eksisterende klynge ved behov.";
    }
    return error.response.data.message;
  }
}

export const editCluster = async (cluster: ClusterFormValues) => {
  ampli.logEvent("teamkatalog_edit_cluster")
  return (await axios.put<Cluster>(`${env.teamCatalogBaseUrl}/cluster/${cluster.id}`, cluster)).data
}

export const searchClusters = async (term: string) => {
  return (await axios.get<PageResponse<Cluster>>(`${env.teamCatalogBaseUrl}/cluster/search/${term}`)).data;
}

export const mapClusterToFormValues = (cluster?: Cluster) => {
  const clusterForm: ClusterFormValues = {
    name: cluster?.name || '',
    description: cluster?.description || '',
    tags: cluster?.tags || [],
    members: cluster?.members.map((m) => ({
      navIdent: m.navIdent,
      roles: m.roles || [],
      description: m.description || "",
      fullName: m.resource.fullName,
      resourceType: m.resource.resourceType
    })) || []
  }
  return clusterForm
}

export const useAllClusters = () => {
  const [clusters, setClusters] = useState<Cluster[]>([])
  useEffect(() => {
    getAllClusters().then(r => setClusters(r.content))
  }, [])
  return clusters
}

export const useClusters = (ids?: string[]) => {
  const [clusters, setClusters] = useState<Cluster[]>([])
  useEffect(() => {
    if (!ids) {
      setClusters([])
      return
    }
    getAllClusters().then(r => setClusters(r.content.filter(c => ids.indexOf(c.id) >= 0)))
  }, [ids])
  return clusters
}

export const useClusterSearch = () => useSearch(async s => mapToOptions((await searchClusters(s)).content))