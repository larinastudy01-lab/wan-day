import {useState} from 'react'
import {BarChart3,BookOpen,ChevronRight,ClipboardPlus,Clock3,Play,Plus,Target,Trash2} from 'lucide-react'
import type {Course,Exam,StudyLog} from '../../domain/types'
import {PageTitle} from '../../components/PageTitle'
import {learningMetrics} from './learningMetrics'

type Props={courses:Course[];exams:Exam[];studyLogs:StudyLog[];dailyGoal:number;onStartFocus:(examId:number,subject:string,minutes:number)=>void;onOpenExams:()=>void;onAddCourse:()=>void;onDeleteCourse:(course:Course)=>void;onAddTask:(course:Course,title:string,date:string,start:string,end:string)=>void;onAddExam:(course:Course)=>void}
const today=()=>new Date().toLocaleDateString('en-CA')
const days=[{label:'週一',value:1},{label:'週二',value:2},{label:'週三',value:3},{label:'週四',value:4},{label:'週五',value:5},{label:'週六',value:6},{label:'週日',value:0}]

export function LearningPage({courses,exams,studyLogs,dailyGoal,onStartFocus,onOpenExams,onAddCourse,onDeleteCourse,onAddTask,onAddExam}:Props){
  const [selectedId,setSelectedId]=useState<number>()
  const [taskTitle,setTaskTitle]=useState('')
  const [taskDate,setTaskDate]=useState(today())
  const [taskStart,setTaskStart]=useState('18:00')
  const [taskEnd,setTaskEnd]=useState('18:30')
  const [minutes,setMinutes]=useState(25)
  const metrics=learningMetrics(studyLogs,today(),dailyGoal)
  const selected=courses.find(course=>course.id===selectedId)
  const selectedExam=selected?.examId?exams.find(exam=>exam.id===selected.examId):undefined
  const addTask=()=>{if(!selected||!taskTitle.trim())return;onAddTask(selected,taskTitle.trim(),taskDate,taskStart,taskEnd);setTaskTitle('')}
  return <>
    <PageTitle name="學習"/>
    <section className="card course-schedule"><div className="card-head"><div><span className="kicker">WEEKLY CLASS SCHEDULE</span><h2>我的課表</h2><p>課程、作業、考試和專注時間，都從這裡安排並同步到行程。</p></div><button className="outline-btn" onClick={onAddCourse}><Plus/>新增課程</button></div>
      <div className="course-week seven-days">{days.map(day=><div className="course-day" key={day.value}><b>{day.label}</b>{courses.filter(course=>course.weekday===day.value).map(course=><button className={selectedId===course.id?'course-block active':'course-block'} onClick={()=>setSelectedId(course.id)} key={course.id}><time>{course.start}–{course.end}</time><strong>{course.name}</strong><span>{course.location||'尚未設定教室'}</span></button>)}{!courses.some(course=>course.weekday===day.value)&&<small>這天還沒有課</small>}</div>)}</div>
      {selected&&<div className="course-detail"><div><span className="kicker">COURSE SPACE</span><div className="course-title-line"><h3>{selected.name}</h3><button className="record-delete" aria-label={`刪除${selected.name}`} onClick={()=>{onDeleteCourse(selected);setSelectedId(undefined)}}><Trash2/></button></div><p>{days.find(day=>day.value===selected.weekday)?.label} {selected.start}–{selected.end}<br/>{selected.startDate} 至 {selected.endDate}<br/>{selected.instructor||'尚未設定老師'}・{selected.location||'尚未設定教室'}</p></div><div className="course-actions expanded"><label className="course-task-title">新增作業／任務<input value={taskTitle} onChange={event=>setTaskTitle(event.target.value)} placeholder={`例如：完成${selected.name}作業`}/></label><label>日期<input type="date" value={taskDate} onChange={event=>setTaskDate(event.target.value)}/></label><label>開始<input type="time" value={taskStart} onChange={event=>setTaskStart(event.target.value)}/></label><label>結束<input type="time" value={taskEnd} onChange={event=>setTaskEnd(event.target.value)}/></label><button onClick={addTask} disabled={!taskTitle.trim()}><ClipboardPlus/>新增並排進行程</button><button onClick={()=>onAddExam(selected)}><Target/>新增考試</button><div className="course-focus">{[25,45,60].map(value=><button className={minutes===value?'selected':''} onClick={()=>setMinutes(value)} key={value}>{value} 分</button>)}<button className="primary" onClick={()=>onStartFocus(selected.examId||exams[0]?.id||0,selected.name,minutes)}><Play/>開始番茄鐘</button></div></div></div>}
    </section>
    <section className="learning-kpis"><article className="card"><Clock3/><span>今日累積</span><strong>{metrics.minutes} 分鐘</strong></article><article className="card"><Target/><span>完成進度</span><strong>{metrics.progress}%</strong></article><article className="card"><BookOpen/><span>學習次數</span><strong>{metrics.sessions} 次</strong></article><article className="card"><BarChart3/><span>主要科目</span><strong>{selected?.name||courses[0]?.name||'尚未新增'}</strong></article></section>
    <section className="learning-detail-grid"><article className="card"><div className="card-head"><div><span className="kicker">COURSE INFO</span><h2>科目資訊</h2></div></div>{selected?<><h3>{selected.name}</h3><p>{selectedExam?.name||'尚未連結考試'}</p></>:<p className="learning-empty">點選上方課程查看內容。</p>}</article><article className="card"><div className="card-head"><div><span className="kicker">STUDY LOG</span><h2>近期學習紀錄</h2></div><button className="text-btn" onClick={onOpenExams}>考試管理 <ChevronRight/></button></div>{studyLogs.slice(0,6).map(log=><div className="learning-log" key={log.id}><div><b>{log.subject}</b><span>{exams.find(item=>item.id===log.examId)?.name||'自主學習'}・{log.date}</span></div><strong>{log.minutes} 分</strong></div>)}{!studyLogs.length&&<p className="learning-empty">還沒有學習紀錄。</p>}</article></section>
  </>
}
