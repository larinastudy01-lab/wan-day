import {describe,expect,it} from 'vitest'
import {buildInsights} from './insightEngine'
import type {Health,Task} from '../../domain/types'

const health:Health={water:1000,sleep:7.5,energy:4,stress:2,mood:4,exercise:20}
const task=(estimate:number):Task=>({id:estimate,title:`任務 ${estimate}`,done:false,quadrant:'Q2',estimate,project:'測試',energy:'中',due:'今天'})

describe('insight engine',()=>{
  it('warns when planned work exceeds estimated capacity',()=>{const insights=buildInsights({tasks:[task(500)],health,focusLogs:[],studyLogs:[],date:'2026-08-20'});expect(insights.some(item=>item.id==='overload'&&item.placement==='calendar')).toBe(true)})
  it('marks sleep advice as an estimate instead of a causal claim',()=>{const insights=buildInsights({tasks:[],health:{...health,sleep:5.5},focusLogs:[],studyLogs:[],date:'2026-08-20'});expect(insights.find(item=>item.id==='sleep')?.message).toContain('推估')})
  it('derives a focus pattern after enough sessions',()=>{const focusLogs=[1,2,3].map(id=>({id,title:'專注',minutes:30,quality:4,interruptions:[],date:'2026-08-20'}));expect(buildInsights({tasks:[],health,focusLogs,studyLogs:[],date:'2026-08-20'}).find(item=>item.id==='focus-pattern')?.message).toContain('平均 30 分鐘')})
})
