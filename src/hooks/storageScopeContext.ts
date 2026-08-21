import {createContext,useContext} from 'react'

export const StorageScopeContext=createContext<string|null>(null)
export function useStorageScope(){return useContext(StorageScopeContext)}
