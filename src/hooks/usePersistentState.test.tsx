import {act,renderHook,waitFor} from '@testing-library/react'
import {beforeEach,describe,expect,it,vi} from 'vitest'
const cloud=vi.hoisted(()=>({readCloud:vi.fn(),writeCloud:vi.fn()}))
vi.mock('../lib/cloudStorage',()=>cloud)
import {usePersistentState} from './usePersistentState'
import {StorageScopeProvider} from './StorageScope'
describe('usePersistentState',()=>{
  beforeEach(()=>{localStorage.clear();vi.clearAllMocks();cloud.readCloud.mockResolvedValue({found:false});cloud.writeCloud.mockResolvedValue(undefined)})
  it('loads fallback and persists updates',()=>{const {result}=renderHook(()=>usePersistentState('hook-test',{count:1}));expect(result.current[0].count).toBe(1);act(()=>result.current[1]({count:2}));expect(JSON.parse(localStorage.getItem('hook-test')||'{}').count).toBe(2)})
  it('isolates values between account scopes',()=>{const wrapperA=({children}:{children:React.ReactNode})=><StorageScopeProvider scope="user-a">{children}</StorageScopeProvider>;const wrapperB=({children}:{children:React.ReactNode})=><StorageScopeProvider scope="user-b">{children}</StorageScopeProvider>;const first=renderHook(()=>usePersistentState('tasks',['a']),{wrapper:wrapperA});act(()=>first.result.current[1](['private-a']));const second=renderHook(()=>usePersistentState('tasks',[]),{wrapper:wrapperB});expect(second.result.current[0]).toEqual([]);expect(localStorage.getItem('growth-user:user-a:tasks')).toContain('private-a');expect(localStorage.getItem('growth-user:user-b:tasks')).not.toContain('private-a')})
  it('hydrates authenticated users from Supabase',async()=>{cloud.readCloud.mockResolvedValue({found:true,value:['cloud-task']});const wrapper=({children}:{children:React.ReactNode})=><StorageScopeProvider scope="user-1">{children}</StorageScopeProvider>;const {result}=renderHook(()=>usePersistentState('tasks',['local-task']),{wrapper});await waitFor(()=>expect(result.current[0]).toEqual(['cloud-task']));expect(cloud.readCloud).toHaveBeenCalledWith('user-1','tasks')})

  it('moves public trial data into the first authenticated account',()=>{localStorage.setItem('growth-local-data-owner-v1','local-demo');localStorage.setItem('growth-user:local-demo:tasks',JSON.stringify(['trial-task']));const wrapper=({children}:{children:React.ReactNode})=><StorageScopeProvider scope="user-1">{children}</StorageScopeProvider>;const {result}=renderHook(()=>usePersistentState('tasks',['fallback']),{wrapper});expect(result.current[0]).toEqual(['trial-task']);expect(localStorage.getItem('growth-local-data-owner-v1')).toBe('user-1')})
})
