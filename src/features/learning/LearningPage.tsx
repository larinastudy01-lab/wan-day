import {useMemo,useState} from 'react'
import type {Dispatch,SetStateAction} from 'react'
import {BarChart3,BookOpen,CalendarDays,ChevronRight,ClipboardPlus,Clock3,Play,Target,TimerReset} from 'lucide-react'
import type {Exam,StudyLog} from '../../domain/types'
import {PageTitle} from '../../components/PageTitle'
import {learningMetrics} from './learningMetrics'

type Props={exams:Exam[];studyLogs:StudyLog[];dailyGoal:number;setDailyGoal:Dispatch<SetStateAction<number>>;onStartFocus:(examId:number,subject:string,minutes:number)=>void;onOpenExams:()=>void;onAddTask:(course:string,title:string)=>void;onAddExam:(course:string)=>void}
type Course={key:string;examId:number;name:string;examName:string;weekday:number;start:string;end:string;location:string}
const today=()=>new Date().toLocaleDateString('en-CA')
const weekdays=['週一','週二','週三','週四','週五']
const slots=[['08:10','09:00'],['09:10','10:00'],['10:20','11:10'],['13:10','14:00'],['14:10','15:00'],['15:20','16:10']]

export function LearningPage({exams,studyLogs,dailyGoal,setDailyGoal,onStartFocus,onOpenExams,onAddTask,onAddExam}:Props){
  const [examId,setExamId]=useState(exams[0]?.id)
  const exam=exams.find(item=>item.id===examId)
  const [subject,setSubject]=useState(exam?.subjects[0]?.name||'')
  const [minutes,setMinutes]=useState(45)
  const [selectedKey,setSelectedKey]=useState('')
  const [taskTitle,setTaskTitle]=useState('')
  const metrics=learningMetrics(studyLogs,today(),dailyGoal)
  const recent=studyLogs.slice(0,6)
  const courses=useMemo<Course[]>(()=>exams.flatMap((item,examIndex)=>item.subjects.map((course,index)=>{const slot=slots[(examIndex*2+index)%slots.length];return{key:`${item.id}-${course.name}`,examId:item.id,name:course.name,examName:item.name,weekday:(examIndex+index)%5,start:slot[0],end:slot[1],location:index%2?'線上':'教室待確認'}})),[exams])
  const selected=courses.find(course=>course.key===selectedKey)
  const selectCourse=(course:Course)=>{setSelectedKey(course.key);setExamId(course.examId);setSubject(course.name);setTaskTitle('')}
  const addTask=()=>{if(!selected||!taskTitle.trim())return;onAddTask(selected.name,taskTitle.trim());setTaskTitle('')}

  return <>
    <PageTitle name="學習模式"/>
    <section className="card course-schedule"><div className="card-head"><div><span className="kicker">WEEKLY CLASS SCHEDULE</span><h2>我的課表</h2><p>點一下課程，就能安排任務、考試或直接開始專注。</p></div><CalendarDays/></div>
      <div className="course-week">{weekdays.map((day,dayIndex)=><div className="course-day" key={day}><b>{day}</b>{courses.filter(course=>course.weekday===dayIndex).map(course=><button className={selectedKey===course.key?'course-block active':'course-block'} onClick={()=>selectCourse(course)} key={course.key}><time>{course.start}–{course.end}</time><strong>{course.name}</strong><span>{course.examName}</span></button>)}{!courses.some(course=>course.weekday===dayIndex)&&<small>這天還沒有課</small>}</div>)}</div>
      {selected&&<div className="course-detail"><div><span className="kicker">COURSE SPACE</span><h3>{selected.name}</h3><p>{weekdays[selected.weekday]} {selected.start}–{selected.end}・{selected.location}<br/>{selected.examName}</p></div><div className="course-actions"><label>替這堂課新增一件事<input value={taskTitle} onChange={event=>setTaskTitle(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();addTask()}}} placeholder={`例如：整理${selected.name}筆記`}/></label><button onClick={addTask} disabled={!taskTitle.trim()}><ClipboardPlus/>新增任務</button><button onClick={()=>onAddExam(selected.name)}><Target/>新增考試</button><button className="primary" onClick={()=>onStartFocus(selected.examId,selected.name,25)}><TimerReset/>番茄鐘 25 分</button></div></div>}
    </section>
    <section className="learning-start card"><div className="learning-start-copy"><span className="kicker">開始讀書</span><h2>今天要讀什麼？</h2><p>設定這一次就好，完成後時間會自動寫回學習紀錄。</p><div className="learning-fields"><label>考試<select value={examId??''} onChange={event=>{const nextId=Number(event.target.value);const nextExam=exams.find(item=>item.id===nextId);setExamId(nextId);setSubject(nextExam?.subjects[0]?.name||'')}}>{exams.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>科目<select value={subject} onChange={event=>setSubject(event.target.value)}>{exam?.subjects.map(item=><option key={item.name}>{item.name}</option>)}</select></label></div><div className="study-duration">{[25,45,60,90].map(value=><button className={minutes===value?'active':''} onClick={()=>setMinutes(value)} key={value}>{value}<span>分</span></button>)}</div><button className="primary learning-start-button" disabled={!examId||!subject} onClick={()=>onStartFocus(examId!,subject,minutes)}><Play/>開始學習</button></div><div className="daily-study-progress"><span>今日學習</span><strong>{metrics.minutes}<small> / {dailyGoal} 分</small></strong><div className="study-progress-ring" style={{'--progress':`${metrics.progress*3.6}deg`} as React.CSSProperties}><b>{metrics.progress}%</b></div><label>每日目標<input type="number" min="15" step="15" value={dailyGoal} onChange={event=>setDailyGoal(Math.max(15,Number(event.target.value)||15))}/><span>分鐘</span></label></div></section>
    <section className="learning-kpis"><article className="card"><Clock3/><span>今日累積</span><strong>{metrics.minutes} 分鐘</strong></article><article className="card"><Target/><span>完成進度</span><strong>{metrics.progress}%</strong></article><article className="card"><BookOpen/><span>學習次數</span><strong>{metrics.sessions} 次</strong></article><article className="card"><BarChart3/><span>主要科目</span><strong>{metrics.bySubject[0]?.[0]||'尚未開始'}</strong></article></section>
    <section className="learning-detail-grid"><article className="card"><div className="card-head"><div><span className="kicker">SUBJECTS</span><h2>今日科目分布</h2></div></div>{metrics.bySubject.length?metrics.bySubject.map(([name,value])=><div className="subject-allocation" key={name}><div><b>{name}</b><span>{value} 分鐘</span></div><div className="bar"><i style={{width:`${metrics.minutes?value/metrics.minutes*100:0}%`}}/></div></div>):<p className="learning-empty">完成第一段學習後，科目分布會出現在這裡。</p>}</article><article className="card"><div className="card-head"><div><span className="kicker">STUDY LOG</span><h2>近期學習紀錄</h2></div><button className="text-btn" onClick={onOpenExams}>考試規劃 <ChevronRight/></button></div>{recent.map(log=><div className="learning-log" key={log.id}><div><b>{log.subject}</b><span>{exams.find(item=>item.id===log.examId)?.name||'自由學習'}・{log.date}</span></div><strong>{log.minutes} 分</strong></div>)}{!recent.length&&<p className="learning-empty">還沒有學習紀錄。</p>}</article></section>
  </>
}
