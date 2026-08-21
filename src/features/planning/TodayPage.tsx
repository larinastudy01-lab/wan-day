import type {Dispatch,SetStateAction} from 'react'
import {AlertTriangle,CalendarClock,ChevronRight,Play,Plus,Zap} from 'lucide-react'
import {TaskRow} from '../../components/TaskRow'
import type {Health,Profile,Task} from '../../domain/types'
import {suggestedFocusMinutes,suggestedTasks} from './adaptiveFlow'

type TodayPageProps={tasks:Task[];health:Health;profile:Profile;setHealth:Dispatch<SetStateAction<Health>>;onToggle:(id:number)=>void;onAdd:()=>void;onOpenTasks:()=>void;onOpenCapacity:()=>void;onFocus:(taskId:number|undefined,minutes:number)=>void}

function dateLabel(){return new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date())}

export function TodayPage({tasks,health,profile,setHealth,onToggle,onAdd,onOpenTasks,onOpenCapacity,onFocus}:TodayPageProps){
  const open=tasks.filter(task=>!task.done)
  const today=open.filter(task=>task.due?.includes('今天'))
  const recommendations=suggestedTasks(today.length?today:open,health,new Date().toLocaleDateString('en-CA'))
  const top=recommendations.map(item=>item.task)
  const focusMinutes=suggestedFocusMinutes(top[0],health)
  const plannedMinutes=today.reduce((total,task)=>total+task.estimate,0)
  const baseCapacity=300
  const energyFactor=.55+health.energy*.09
  const sleepFactor=Math.min(1,Math.max(.65,health.sleep/8))
  const stressFactor=1-(health.stress-1)*.06
  const availableMinutes=Math.round(baseCapacity*energyFactor*sleepFactor*stressFactor/15)*15
  const gap=availableMinutes-plannedMinutes
  const overloaded=gap<0

  return <>
    <section className="welcome today-welcome"><div><p className="eyebrow">{dateLabel()}・{profile.roles[0]||'個人成長'}</p><h1>今天要推進什麼，{profile.name||'夥伴'}？</h1><p>先確認重要的事，也確認今天是否真的做得完。</p></div><button className="primary" onClick={onAdd}><Plus size={18}/>新增任務</button></section>
    <section className={overloaded?'today-capacity overloaded':'today-capacity'}>
      <div className="capacity-signal"><span>{overloaded?<AlertTriangle/>:<Zap/>}</span><div><small>TODAY CAPACITY</small><h2>{overloaded?'今天已超出可用容量':'今天的安排在可用容量內'}</h2><p>可用約 {Math.round(availableMinutes/30)/2} 小時・已安排 {Math.round(plannedMinutes/30)/2} 小時</p></div></div>
      <div className="capacity-gap"><strong>{overloaded?`超載 ${Math.round(-gap/30)/2} hr`:`尚有 ${Math.round(gap/30)/2} hr`}</strong><button onClick={onOpenCapacity}>檢查負荷 <ChevronRight/></button></div>
    </section>
    <section className="card now-card"><div><span className="kicker">現在</span><h2>{top[0]?.title||'先選一件最重要的事'}</h2><p>{top[0]?`${recommendations[0].reason}・建議先專注 ${focusMinutes} 分鐘`:'不用把全部做完，先讓一件事往前。'}</p></div><button className="primary" onClick={()=>onFocus(top[0]?.id,focusMinutes)}><Play size={17}/>開始 {focusMinutes} 分鐘</button></section>
    <section className="today-layout">
      <article className="card today-priorities"><div className="card-head"><div><span className="kicker">TODAY TOP 3</span><h2>今天最值得完成</h2></div><span className="count">{top.length} / 3</span></div>{top.map((task,index)=><TaskRow key={task.id} task={task} number={index+1} onToggle={onToggle}/>)}{top.length===0&&<p className="today-empty">今天還沒有重點任務，先從收集一件事開始。</p>}<button className="text-btn" onClick={onOpenTasks}>查看所有任務 <ChevronRight size={16}/></button></article>
      <aside className="card today-checkin"><span className="kicker">READINESS CHECK-IN</span><h2>今天能用多少力氣？</h2><p>狀態會直接調整今天的可用容量。</p>{[['能量','energy'],['壓力','stress'],['心情','mood']].map(([label,key])=><label key={key}><span>{label}</span><input type="range" min="1" max="5" value={health[key as 'energy'|'stress'|'mood']} onChange={event=>setHealth(value=>({...value,[key]:Number(event.target.value)}))}/><b>{health[key as 'energy'|'stress'|'mood']}</b></label>)}<div className="sleep-readiness"><CalendarClock/><span>昨晚睡眠</span><b>{health.sleep} 小時</b></div></aside>
    </section>
  </>
}
