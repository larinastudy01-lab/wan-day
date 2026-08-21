import type {ReactNode} from 'react'
import {StorageScopeContext} from './storageScopeContext'
export function StorageScopeProvider({scope,children}:{scope:string;children:ReactNode}){return <StorageScopeContext.Provider value={scope}>{children}</StorageScopeContext.Provider>}
