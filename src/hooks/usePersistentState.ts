import {Dispatch,SetStateAction,useEffect,useRef,useState} from 'react'
import {readCloud,writeCloud} from '../lib/cloudStorage'
import {readLocal,writeLocal} from '../lib/storage'
import {useStorageScope} from './storageScopeContext'

const LEGACY_OWNER_KEY='growth-local-data-owner-v1'
function scopedKey(scope:string|null,key:string){return scope?`growth-user:${scope}:${key}`:key}
function initialValue<T>(scope:string|null,key:string,fallback:T){if(!scope)return readLocal(key,fallback);const target=scopedKey(scope,key);if(localStorage.getItem(target)!==null)return readLocal(target,fallback);const owner=localStorage.getItem(LEGACY_OWNER_KEY);if(!owner)localStorage.setItem(LEGACY_OWNER_KEY,scope);if(!owner||owner===scope){const legacy=readLocal(key,fallback);writeLocal(target,legacy);return legacy}return fallback}

export function usePersistentState<T>(key:string,fallback:T):[T,Dispatch<SetStateAction<T>>]{
  const scope=useStorageScope()
  const storageKey=scopedKey(scope,key)
  const [value,setValue]=useState<T>(()=>initialValue(scope,key,fallback))
  const cloudReady=useRef(!scope)
  const initialLocalValue=useRef(value)

  useEffect(()=>writeLocal(storageKey,value),[storageKey,value])

  useEffect(()=>{
    if(!scope){cloudReady.current=true;return}
    let cancelled=false
    cloudReady.current=false
    readCloud<T>(scope,key)
      .then(remote=>{
        if(cancelled)return
        if(remote.found)setValue(remote.value as T)
        else return writeCloud(scope,key,initialLocalValue.current)
      })
      .catch(error=>console.error(`Unable to load ${key} from Supabase`,error))
      .finally(()=>{if(!cancelled)cloudReady.current=true})
    return()=>{cancelled=true}
  },[scope,key])

  useEffect(()=>{
    if(!scope||!cloudReady.current)return
    const timer=window.setTimeout(()=>{
      writeCloud(scope,key,value).catch(error=>console.error(`Unable to persist ${key} to Supabase`,error))
    },300)
    return()=>window.clearTimeout(timer)
  },[scope,key,value])

  return [value,setValue]
}
