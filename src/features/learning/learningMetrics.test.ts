import {describe,expect,it} from 'vitest'
import {learningMetrics} from './learningMetrics'

describe('learning metrics',()=>{
  it('calculates daily progress and subject allocation',()=>{
    const result=learningMetrics([
      {id:1,examId:1,subject:'Reading',minutes:45,questions:0,correct:0,date:'2026-08-20'},
      {id:2,examId:1,subject:'Listening',minutes:30,questions:0,correct:0,date:'2026-08-20'},
      {id:3,examId:1,subject:'Reading',minutes:20,questions:0,correct:0,date:'2026-08-19'},
    ],'2026-08-20',120)
    expect(result).toMatchObject({minutes:75,progress:63,sessions:2,bySubject:[['Reading',45],['Listening',30]]})
  })
  it('caps progress at one hundred percent',()=>expect(learningMetrics([{id:1,examId:1,subject:'英文',minutes:90,questions:0,correct:0,date:'2026-08-20'}],'2026-08-20',60).progress).toBe(100))
})
