import {beforeEach,describe,expect,it,vi} from 'vitest'

const {auth}=vi.hoisted(()=>({auth:{
  getSession:vi.fn(),
  onAuthStateChange:vi.fn(),
  signUp:vi.fn(),
  signInWithPassword:vi.fn(),
  signOut:vi.fn(),
}}))

vi.mock('../../lib/supabase',()=>({supabase:{auth},supabaseConfigured:true}))

import {getSession,loginUser,logoutUser,registerUser} from './authStorage'

const user={id:'user-1',email:'larin@example.com',user_metadata:{name:'Larin'}}

describe('Supabase authentication',()=>{
  beforeEach(()=>vi.clearAllMocks())

  it('maps the current Supabase session',async()=>{
    auth.getSession.mockResolvedValue({data:{session:{user}},error:null})
    await expect(getSession()).resolves.toEqual({id:'user-1',name:'Larin',email:'larin@example.com'})
  })

  it('registers with normalized email and profile name',async()=>{
    auth.signUp.mockResolvedValue({data:{session:null,user},error:null})
    await expect(registerUser(' Larin ',' LARIN@example.com ','secure-pass')).resolves.toEqual({session:null,confirmationRequired:true})
    expect(auth.signUp).toHaveBeenCalledWith({email:'larin@example.com',password:'secure-pass',options:{data:{name:'Larin'}}})
  })

  it('logs in and logs out through Supabase',async()=>{
    auth.signInWithPassword.mockResolvedValue({data:{session:{user}},error:null})
    auth.signOut.mockResolvedValue({error:null})
    await expect(loginUser(' LARIN@example.com ','secure-pass')).resolves.toMatchObject({id:'user-1'})
    expect(auth.signInWithPassword).toHaveBeenCalledWith({email:'larin@example.com',password:'secure-pass'})
    await expect(logoutUser()).resolves.toBeUndefined()
  })
})
