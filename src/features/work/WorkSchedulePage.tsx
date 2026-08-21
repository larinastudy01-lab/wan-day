import {useState} from 'react'
import {BriefcaseBusiness,CalendarClock,CheckCircle2,ClipboardPlus,Clock3,PenLine,Plus,Trash2} from 'lucide-react'
import {PageTitle} from '../../components/PageTitle'
import type {CalendarEvent,Task,WorkProfile} from '../../domain/types'

const today=()=>new Date().toLocaleDateString('en-CA')
type Shift={workId:number;date:string;start:string;end:string;location:string}
type WorkTask={workId:number;title:string;date:string;start:string;end:string}
type Props={works:WorkProfile[];tasks:Task[];events:CalendarEvent[];onAdd:()=>void;onEdit:(id:number)=>void;onDelete:(work:WorkProfile)=>void;onAddShift:(shift:Shift)=>void;onDeleteShift:(event:CalendarEvent)=>void;onAddTask:(task:WorkTask)=>void;onToggleTask:(id:number)=>void;onDeleteTask:(task:Task)=>void}

export function WorkSchedulePage({works,tasks,events,onAdd,onEdit,onDelete,onAddShift,onDeleteShift,onAddTask,onToggleTask,onDeleteTask}:Props){
  const [workId,setWorkId]=useState(works[0]?.id||0)
  const [date,setDate]=useState(today())
  const [start,setStart]=useState('09:00')
  const [end,setEnd]=useState('17:00')
  const [location,setLocation]=useState('')
  const [title,setTitle]=useState('')
  const workTasks=tasks.filter(task=>task.category==='工作')
  const shifts=events.filter(event=>event.sourceType==='work'&&event.recurrence==='無')
  const submitShift=()=>{if(!workId||!date||!start||!end)return;onAddShift({workId,date,start,end,location})}
  const submitTask=()=>{if(!workId||!title.trim()||!date||!start||!end)return;onAddTask({workId,title:title.trim(),date,start,end});setTitle('')}
  return <><PageTitle name="工作" onAdd={onAdd}/>
    <section className="work-summary"><article className="card work-stat"><Clock3/><div><span>已安排班次</span><strong>{shifts.length} 個</strong><small>每週都能自由新增</small></div></article><article className="card work-stat"><BriefcaseBusiness/><div><span>工作身分</span><strong>{works.length} 個</strong><small>只管理角色與時間</small></div></article><article className="card work-stat"><CalendarClock/><div><span>工作待辦</span><strong>{workTasks.filter(task=>!task.done).length} 項</strong><small>同步顯示於行程</small></div></article></section>
    <section><div className="section-heading"><div><span className="kicker">WORK PROFILES</span><h2>我的工作身分</h2></div></div><div className="work-profiles">{works.map(work=><article className="card work-profile" key={work.id}><header><span>{work.type}</span><em>{work.status}</em></header><h2 className="editable-title">{work.name}<button aria-label={`編輯 ${work.name}`} onClick={()=>onEdit(work.id)}><PenLine/></button><button aria-label={`刪除 ${work.name}`} onClick={()=>onDelete(work)}><Trash2/></button></h2><p>{work.organization}・{work.role}</p></article>)}</div></section>
    <section className="work-planner-grid"><article className="card"><div className="card-head"><div><span className="kicker">FLEXIBLE SHIFTS</span><h2>新增工作時間</h2></div><CalendarClock/></div><div className="planner-form"><label>工作身分<select value={workId} onChange={e=>setWorkId(Number(e.target.value))}>{works.map(work=><option value={work.id} key={work.id}>{work.name}</option>)}</select></label><label>日期<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>開始<input type="time" value={start} onChange={e=>setStart(e.target.value)}/></label><label>結束<input type="time" value={end} onChange={e=>setEnd(e.target.value)}/></label><label className="span-all">地點／備註<input value={location} onChange={e=>setLocation(e.target.value)}/></label><button className="primary span-all" disabled={!works.length} onClick={submitShift}><Plus/>新增並同步行程</button></div>{shifts.map(shift=><div className="work-task" key={shift.id}><CalendarClock/><div><strong>{shift.title}</strong><span>{shift.date}・{shift.start}–{shift.end}</span></div><button className="record-delete" onClick={()=>onDeleteShift(shift)}><Trash2/></button></div>)}</article>
      <article className="card"><div className="card-head"><div><span className="kicker">WORK TASKS</span><h2>工作待辦</h2></div><ClipboardPlus/></div><div className="planner-form"><label className="span-all">待辦內容<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="例如：完成客戶提案"/></label><label>工作身分<select value={workId} onChange={e=>setWorkId(Number(e.target.value))}>{works.map(work=><option value={work.id} key={work.id}>{work.name}</option>)}</select></label><label>日期<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>開始<input type="time" value={start} onChange={e=>setStart(e.target.value)}/></label><label>結束<input type="time" value={end} onChange={e=>setEnd(e.target.value)}/></label><button className="primary span-all" disabled={!works.length||!title.trim()} onClick={submitTask}><ClipboardPlus/>新增待辦並同步行程</button></div>{workTasks.map(task=><div className={task.done?'work-task done':'work-task'} key={task.id}><button onClick={()=>onToggleTask(task.id)}><CheckCircle2/></button><div><strong>{task.title}</strong><span>{task.project}・{task.due}</span></div><button className="record-delete" onClick={()=>onDeleteTask(task)}><Trash2/></button></div>)}</article></section>
  </>
}
