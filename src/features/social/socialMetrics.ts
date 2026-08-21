import type {FocusLog} from '../../domain/types'

export type RankMetric='專注時間'|'Focus 次數'|'連續天數'
export function mySocialMetrics(logs:FocusLog[]){
  const uniqueDays=new Set(logs.map(log=>log.date)).size
  return {minutes:logs.reduce((total,log)=>total+log.minutes,0),sessions:logs.length,streak:uniqueDays}
}
export function rankValue(metric:RankMetric,person:{weeklyMinutes:number;sessions:number;streak:number}){
  return metric==='專注時間'?person.weeklyMinutes:metric==='Focus 次數'?person.sessions:person.streak
}
