import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../../lib/supabase'

export type AuthSession = { id:string; name:string; email:string }
export type RegistrationResult = { session:AuthSession|null; confirmationRequired:boolean }

function toAuthSession(user:User):AuthSession {
  return {id:user.id,name:String(user.user_metadata?.name||user.email?.split('@')[0]||'使用者'),email:user.email||''}
}

function sessionUser(session:Session|null){return session?.user?toAuthSession(session.user):null}

const demoSession:AuthSession={id:'local-demo',name:'試用者',email:'demo@wanday.local'}
export async function getSession(){if(!supabaseConfigured)return demoSession;const {data,error}=await supabase.auth.getSession();if(error)throw error;return sessionUser(data.session)}
export function onAuthStateChange(callback:(session:AuthSession|null,event:AuthChangeEvent)=>void){if(!supabaseConfigured)return()=>{};const {data}=supabase.auth.onAuthStateChange((event,session)=>callback(sessionUser(session),event));return ()=>data.subscription.unsubscribe()}
export async function registerUser(name:string,email:string,password:string):Promise<RegistrationResult>{if(!supabaseConfigured)return{session:{...demoSession,name:name.trim()||demoSession.name,email:email.trim()},confirmationRequired:false};const {data,error}=await supabase.auth.signUp({email:email.trim().toLowerCase(),password,options:{data:{name:name.trim()}}});if(error)throw error;return {session:sessionUser(data.session),confirmationRequired:!data.session}}
export async function loginUser(email:string,password:string){if(!supabaseConfigured)return demoSession;const {data,error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password});if(error)throw error;return sessionUser(data.session)}
export async function logoutUser(){if(!supabaseConfigured)return;const {error}=await supabase.auth.signOut();if(error)throw error}
