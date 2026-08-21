import {describe,expect,it} from 'vitest'
import {createFocusLog,resolveFocus} from './focusEngine'
import {initialExams,initialProjects,initialTasks,initialWorks} from '../../domain/seeds'

const sources={tasks:initialTasks,projects:initialProjects,exams:initialExams,works:initialWorks}

describe('focus engine',()=>{
  it('resolves a learning session with its subject',()=>{
    expect(resolveFocus({kind:'learning',entityId:1,subject:'Reading'},sources)).toMatchObject({title:'TOEIC 公開測驗・Reading',context:'學習',entityId:1})
  })
  it('keeps task references for automatic write-back',()=>{
    expect(createFocusLog({kind:'task',entityId:2},sources,45,4,[],'2026-08-20',99)).toMatchObject({id:99,kind:'task',taskId:2,entityId:2,minutes:45})
  })
  it('uses a useful fallback for blank custom sessions',()=>{
    expect(resolveFocus({kind:'custom',customTitle:'  '},sources).title).toBe('自由專注')
  })
})
