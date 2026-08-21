import { supabase, supabaseConfigured } from './supabase'

export type CloudValue<T>={found:boolean;value?:T}

export async function readCloud<T>(userId:string,key:string):Promise<CloudValue<T>>{
  if(!supabaseConfigured)return {found:false}
  const {data,error}=await supabase
    .from('user_data')
    .select('data_value')
    .eq('user_id',userId)
    .eq('data_key',key)
    .maybeSingle()
  if(error)throw error
  return data?{found:true,value:data.data_value as T}:{found:false}
}

export async function writeCloud<T>(userId:string,key:string,value:T){
  if(!supabaseConfigured)return
  const {error}=await supabase.from('user_data').upsert(
    {user_id:userId,data_key:key,data_value:value},
    {onConflict:'user_id,data_key'},
  )
  if(error)throw error
}
