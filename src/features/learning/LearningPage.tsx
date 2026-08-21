import {useEffect,useState} from 'react'
import type {Dispatch,SetStateAction} from 'react'
import {BarChart3,BookOpen,ChevronRight,Clock3,Play,Target} from 'lucide-react'
import type {Exam,StudyLog} from '../../domain/types'
import {PageTitle} from '../../components/PageTitle'
import {learningMetrics} from './learningMetrics'

type Props={exams:Exam[];studyLogs:StudyLog[];dailyGoal:number;setDailyGoal:Dispatch<SetStateAction<number>>;onStartFocus:(examId:number,subject:string,minutes:number)=>void;onOpenExams:()=>void}
const today=()=>new Date().toLocaleDateString('en-CA')

export function LearningPage({exams,studyLogs,dailyGoal,setDailyGoal,onStartFocus,onOpenExams}:Props){
  const [examId,setExamId]=useState(exams[0]?.id)
  const exam=exams.find(item=>item.id===examId)
  const [subject,setSubject]=useState(exam?.subjects[0]?.name||'')
  const [minutes,setMinutes]=useState(45)
  // The selected exam and subject form one user action; this effect only repairs legacy selections.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{setSubject(exam?.subjects[0]?.name||'')},[examId,exam])
  const metrics=learningMetrics(studyLogs,today(),dailyGoal)
  const recent=studyLogs.slice(0,6)

  return <>
    <PageTitle name="學習模式"/>
    <section className="learning-start card"><div className="learning-start-copy"><span className="kicker">開始讀書</span><h2>今天要讀什麼？</h2><p>設定這一次就好，完成後時間會自動寫回學習紀錄。</p><div className="learning-fields"><label>考試<select value={examId??''} onChange={event=>setExamId(Number(event.target.value))}>{exams.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>科目<select value={subject} onChange={event=>setSubject(event.target.value)}>{exam?.subjects.map(item=><option key={item.name}>{item.name}</option>)}</select></label></div><div className="study-duration">{[25,45,60,90].map(value=><button className={minutes===value?'active':''} onClick={()=>setMinutes(value)} key={value}>{value}<span>分</span></button>)}</div><button className="primary learning-start-button" disabled={!examId||!subject} onClick={()=>onStartFocus(examId!,subject,minutes)}><Play/>開始學習</button></div><div className="daily-study-progress"><span>今日學習</span><strong>{metrics.minutes}<small> / {dailyGoal} 分</small></strong><div className="study-progress-ring" style={{'--progress':`${metrics.progress*3.6}deg`} as React.CSSProperties}><b>{metrics.progress}%</b></div><label>每日目標<input type="number" min="15" step="15" value={dailyGoal} onChange={event=>setDailyGoal(Math.max(15,Number(event.target.value)||15))}/><span>分鐘</span></label></div></section>
    <section className="learning-kpis"><article className="card"><Clock3/><span>今日累積</span><strong>{metrics.minutes} 分鐘</strong></article><article className="card"><Target/><span>完成進度</span><strong>{metrics.progress}%</strong></article><article className="card"><BookOpen/><span>學習次數</span><strong>{metrics.sessions} 次</strong></article><article className="card"><BarChart3/><span>主要科目</span><strong>{metrics.bySubject[0]?.[0]||'尚未開始'}</strong></article></section>
    <section className="learning-detail-grid"><article className="card"><div className="card-head"><div><span className="kicker">SUBJECTS</span><h2>今日科目分布</h2></div></div>{metrics.bySubject.length?metrics.bySubject.map(([name,value])=><div className="subject-allocation" key={name}><div><b>{name}</b><span>{value} 分鐘</span></div><div className="bar"><i style={{width:`${metrics.minutes?value/metrics.minutes*100:0}%`}}/></div></div>):<p className="learning-empty">完成第一段學習後，科目分布會出現在這裡。</p>}</article><article className="card"><div className="card-head"><div><span className="kicker">STUDY LOG</span><h2>近期學習紀錄</h2></div><button className="text-btn" onClick={onOpenExams}>考試規劃 <ChevronRight/></button></div>{recent.map(log=><div className="learning-log" key={log.id}><div><b>{log.subject}</b><span>{exams.find(item=>item.id===log.examId)?.name||'自由學習'}・{log.date}</span></div><strong>{log.minutes} 分</strong></div>)}{!recent.length&&<p className="learning-empty">還沒有學習紀錄。</p>}</article></section>
  </>
}
