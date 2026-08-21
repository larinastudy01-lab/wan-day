import type {Health,Task} from '../../domain/types'

const dueWeight=(due:string|undefined,today:string)=>{
  if(!due)return 0
  if(due.includes('今天')||due===today)return 45
  const days=Math.ceil((new Date(`${due}T00:00:00`).getTime()-new Date(`${today}T00:00:00`).getTime())/86400000)
  return days<0?55:days<=2?35:days<=7?15:0
}

export function suggestedTasks(tasks:Task[],health:Health,today:string,limit=3){
  const energy=health.energy<=2?'低':health.energy>=4?'高':'中'
  return tasks.filter(task=>!task.done).map(task=>{
    const importance=task.quadrant==='Q1'?40:task.quadrant==='Q2'?34:task.quadrant==='Q3'?14:6
    const energyFit=task.energy===energy?18:task.energy==='低'&&health.energy<=3?12:0
    const progress=task.status==='進行中'?20:0
    const score=dueWeight(task.due,today)+importance+energyFit+progress
    const reason=task.status==='進行中'?'先收尾正在進行的事':task.due===today||task.due?.includes('今天')?'今天需要處理':task.quadrant==='Q2'?'值得保護時間推進':task.energy===energy?'符合目前能量':'接下來可推進'
    return {task,score,reason}
  }).sort((a,b)=>b.score-a.score).slice(0,limit)
}

export function suggestedFocusMinutes(task:Task|undefined,health:Health){
  if(!task)return 20
  if(health.energy<=2||health.stress>=4)return 20
  if(task.estimate>=75&&task.energy==='高')return 60
  if(task.estimate>=40)return 40
  return 20
}
