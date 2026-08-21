import {Dispatch,SetStateAction,useState} from 'react'
import {ChevronLeft,ChevronRight} from 'lucide-react'
import type {CalendarEvent,Health,Project,Task} from '../../domain/types'
import {CapacityPage} from '../capacity/CapacityPage'
import {occursOn} from '../../lib/calendar'

const dayMs=86_400_000
const isoDate=(date:Date)=>{
  const local=new Date(date.getTime()-date.getTimezoneOffset()*60_000)
  return local.toISOString().slice(0,10)
}
const startOfWeek=(date:Date)=>{
  const result=new Date(date)
  const day=(result.getDay()+6)%7
  result.setDate(result.getDate()-day)
  result.setHours(0,0,0,0)
  return result
}
const sameDay=(left:Date,right:Date)=>isoDate(left)===isoDate(right)
const dateLabel=(date:Date,options:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat('zh-TW',options).format(date)

export function CalendarPage({tasks,setTasks,events,setEvents,onUndo,projects=[],roles=[],health={water:0,sleep:7,energy:3,stress:3,mood:3,exercise:0}}:{tasks:Task[];setTasks:Dispatch<SetStateAction<Task[]>>;events:CalendarEvent[];setEvents:Dispatch<SetStateAction<CalendarEvent[]>>;onUndo:(item:CalendarEvent)=>void;projects?:Project[];roles?:string[];health?:Health}){
  const [view,setView]=useState<'月'|'週'|'日'>('週')
  const [anchor,setAnchor]=useState(()=>new Date())
  const [dragId,setDragId]=useState<number>()
  const today=new Date()
  const weekStart=startOfWeek(anchor)
  const weekDays=Array.from({length:7},(_,index)=>new Date(weekStart.getTime()+index*dayMs))
  const monthDays=(()=>{
    const first=new Date(anchor.getFullYear(),anchor.getMonth(),1)
    const gridStart=startOfWeek(first)
    return Array.from({length:42},(_,index)=>new Date(gridStart.getTime()+index*dayMs))
  })()
  const eventsOn=(date:Date)=>events.filter(event=>occursOn(event.date,event.recurrence,isoDate(date),event.recurrenceEnd))
  const tasksOn=(date:Date)=>tasks.filter(task=>task.due===isoDate(date)||(task.due==='今天'&&sameDay(date,today)))
  const shift=(direction:number)=>setAnchor(current=>{const next=new Date(current);if(view==='月')next.setMonth(next.getMonth()+direction);else next.setDate(next.getDate()+direction*(view==='週'?7:1));return next})
  const drop=(date:Date)=>{if(!dragId)return;setTasks(current=>current.map(task=>task.id===dragId?{...task,due:isoDate(date)}:task));setDragId(undefined)}
  const removeEvent=(item:CalendarEvent)=>{if(!window.confirm(`確定刪除事件「${item.title}」？`))return;setEvents(current=>current.filter(event=>event.id!==item.id));onUndo(item)}
  const eventChip=(event:CalendarEvent)=><span className={`cal-event category-${event.category}`} key={event.id}><strong>{event.start}</strong> {event.title}{event.recurrence!=='無'&&<em>{event.recurrence}{event.recurrenceEnd?`・到 ${event.recurrenceEnd.slice(5)}`:''}</em>}<button aria-label={`刪除 ${event.title}`} onClick={()=>removeEvent(event)}>×</button></span>
  const taskChip=(task:Task)=><span draggable onDragStart={()=>setDragId(task.id)} className="cal-event task-event" key={task.id}>{task.title}</span>
  const title=view==='月'?dateLabel(anchor,{year:'numeric',month:'long'}):view==='日'?dateLabel(anchor,{year:'numeric',month:'long',day:'numeric'}):`${dateLabel(weekDays[0],{month:'numeric',day:'numeric'})}－${dateLabel(weekDays[6],{month:'numeric',day:'numeric'})}`

  return <><section className="card calendar-page" aria-label="行事曆">
    <div className="calendar-top"><button aria-label="上一個期間" onClick={()=>shift(-1)}><ChevronLeft/></button><h2 aria-live="polite">{title}</h2><button aria-label="下一個期間" onClick={()=>shift(1)}><ChevronRight/></button><div className="calendar-views">{(['月','週','日'] as const).map(option=><button className={view===option?'active':''} aria-pressed={view===option} onClick={()=>setView(option)} key={option}>{option}</button>)}</div><button className="today-btn" onClick={()=>setAnchor(new Date())}>今天</button></div>
    {view==='週'&&<div className="week-grid">{weekDays.map(date=><div className={sameDay(date,today)?'day current':'day'} onDragOver={event=>event.preventDefault()} onDrop={()=>drop(date)} key={isoDate(date)}><b>{dateLabel(date,{weekday:'short',day:'numeric'})}</b>{eventsOn(date).map(eventChip)}{tasksOn(date).map(taskChip)}</div>)}</div>}
    {view==='日'&&<div className="day-calendar"><header><b>{dateLabel(anchor,{month:'long',day:'numeric',weekday:'long'})}</b><span>事件與排程任務</span></header>{['08:00','10:00','12:00','14:00','16:00','18:00','20:00'].map(time=><div className="hour-row" key={time}><time>{time}</time><span>{eventsOn(anchor).filter(event=>event.start.slice(0,2)===time.slice(0,2)).map(event=><b key={event.id}>{event.start}–{event.end} {event.title}</b>)}{time==='10:00'&&tasksOn(anchor).map(task=><b key={task.id}>{task.title}</b>)}</span></div>)}</div>}
    {view==='月'&&<div className="month-grid">{monthDays.map(date=><div className={`${date.getMonth()!==anchor.getMonth()?'month-day muted':'month-day'}${sameDay(date,today)?' current':''}`} onDragOver={event=>event.preventDefault()} onDrop={()=>drop(date)} key={isoDate(date)}><b>{date.getDate()}</b>{eventsOn(date).slice(0,3).map(event=><span key={event.id}>{event.start} {event.title}</span>)}{tasksOn(date).slice(0,2).map(task=><span className="task-event" key={task.id}>{task.title}</span>)}</div>)}</div>}
  </section><details className="calendar-capacity"><summary>查看時間容量與超載建議 <ChevronRight/></summary><CapacityPage tasks={tasks.filter(task=>!task.done)} projects={projects} roles={roles} health={health}/></details></>
}
