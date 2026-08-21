import type {StudyLog} from '../../domain/types'

export function learningMetrics(logs:StudyLog[],date:string,goalMinutes:number){
  const today=logs.filter(log=>log.date===date)
  const minutes=today.reduce((total,log)=>total+log.minutes,0)
  const bySubject=Object.entries(today.reduce<Record<string,number>>((result,log)=>({...result,[log.subject]:(result[log.subject]||0)+log.minutes}),{})).sort((left,right)=>right[1]-left[1])
  return {minutes,goalMinutes,progress:goalMinutes?Math.min(100,Math.round(minutes/goalMinutes*100)):0,sessions:today.length,bySubject}
}
