import type {Dispatch,SetStateAction} from 'react'
import {Archive,Inbox,RefreshCw,Sparkles} from 'lucide-react'
import type {Task,WaitingItem} from '../../domain/types'

export function RestartPanel({tasks,setTasks,setWaiting,notify}:{tasks:Task[];setTasks:Dispatch<SetStateAction<Task[]>>;setWaiting:Dispatch<SetStateAction<WaitingItem[]>>;notify:(message:string)=>void}){
  const unfinished=tasks.filter(task=>!task.done)
  const completed=tasks.filter(task=>task.done)
  const moveToLater=()=>{if(!unfinished.length||!window.confirm(`將 ${unfinished.length} 個未完成任務移到「以後再做」？`))return;const now=Date.now();setWaiting(current=>[...unfinished.map((task,index)=>({id:now+index,title:task.title,kind:'someday' as const,note:`原任務類別：${task.category||'一般'}`,done:false})),...current]);setTasks(current=>current.filter(task=>task.done));notify('未完成任務已移到以後再做')}
  const freshStart=()=>{if(!unfinished.length||!window.confirm('從今天重新開始？未完成任務會回到收集匣，期限與排程會清除，但內容不會刪除。'))return;setTasks(current=>current.map(task=>task.done?task:{...task,inbox:true,due:undefined,scheduledDay:undefined,status:'待辦',progress:0}));notify('已建立新的起點')}
  const archiveCompleted=()=>{if(!completed.length||!window.confirm(`封存 ${completed.length} 個已完成任務？它們會從目前清單移除。`))return;setTasks(current=>current.filter(task=>!task.done));notify('已完成任務已封存')}
  return <details className="card restart-panel"><summary><span><RefreshCw/>需要重新整理嗎？</span><small>忙了一段時間，也可以從今天重新開始</small></summary><div className="restart-content"><div><strong>{unfinished.length}</strong><span>未完成</span></div><div><strong>{completed.length}</strong><span>已完成</span></div><section><button onClick={freshStart}><Inbox/><b>重新整理到收集匣</b><span>保留內容，重新決定下一步</span></button><button onClick={moveToLater}><Sparkles/><b>全部移到以後再做</b><span>暫時卸下目前承諾</span></button><button onClick={archiveCompleted}><Archive/><b>清理已完成任務</b><span>讓目前清單恢復乾淨</span></button></section></div></details>
}
