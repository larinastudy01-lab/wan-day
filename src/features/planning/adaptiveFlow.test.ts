import {describe,expect,it} from 'vitest'
import {suggestedFocusMinutes,suggestedTasks} from './adaptiveFlow'
import type {Health,Task} from '../../domain/types'

const health:Health={water:1000,sleep:7,energy:3,stress:2,mood:3,exercise:0}
const task=(patch:Partial<Task>):Task=>({id:1,title:'任務',done:false,quadrant:'Q3',estimate:30,project:'一般',energy:'中',...patch})

describe('adaptive flow',()=>{
  it('prioritizes due and already-started work without asking for a matrix',()=>{
    const result=suggestedTasks([task({id:1}),task({id:2,due:'2026-08-21'}),task({id:3,status:'進行中'})],health,'2026-08-21')
    expect(result[0].task.id).toBe(2)
  })
  it('shortens focus when readiness is low',()=>{
    expect(suggestedFocusMinutes(task({estimate:90,energy:'高'}),{...health,energy:1})).toBe(20)
    expect(suggestedFocusMinutes(task({estimate:90,energy:'高'}),{...health,energy:5})).toBe(60)
  })
})
