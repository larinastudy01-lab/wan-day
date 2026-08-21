import {describe,expect,it} from 'vitest'
import {mySocialMetrics,rankValue} from './socialMetrics'

describe('social metrics',()=>{
  const logs=[{id:1,title:'A',minutes:30,quality:4,interruptions:[],date:'2026-08-20'},{id:2,title:'B',minutes:45,quality:4,interruptions:[],date:'2026-08-20'},{id:3,title:'C',minutes:25,quality:4,interruptions:[],date:'2026-08-19'}]
  it('summarizes personal focus without rewarding idle time',()=>expect(mySocialMetrics(logs)).toEqual({minutes:100,sessions:3,streak:2}))
  it('switches ranking dimensions',()=>{const person={weeklyMinutes:300,sessions:8,streak:5};expect(rankValue('專注時間',person)).toBe(300);expect(rankValue('Focus 次數',person)).toBe(8);expect(rankValue('連續天數',person)).toBe(5)})
})
