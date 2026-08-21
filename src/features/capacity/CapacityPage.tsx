import {AlertTriangle,UsersRound,Zap} from 'lucide-react'
import type {Health,Project,Task} from '../../domain/types'
import {chartSeries,uiColors} from '../../config/colors'

export function CapacityPage({tasks,projects,roles,health}:{tasks:Task[];projects:Project[];roles:string[];health:Health}){
  const planned=tasks.reduce((sum,task)=>sum+task.estimate,0)/60
  const stateFactor=(.55+health.energy*.09)*Math.min(1,Math.max(.65,health.sleep/8))*(1-(health.stress-1)*.06)
  const available=Math.round(45*stateFactor*2)/2
  const gap=available-planned
  const rows=[['睡眠',56,uiColors.brandDark],['固定行程',32,uiColors.study],['基本生活',28,uiColors.finance],['狀態調整後容量',available,uiColors.accent],['緩衝',7,uiColors.muted]] as const
  const roleOf=(task:Task)=>task.role||projects.find(project=>project.title===task.project)?.role||roles[0]||'個人成長'
  const roleData=Array.from(new Set([...roles,...tasks.map(roleOf)])).map((role,index)=>({role,hours:tasks.filter(task=>roleOf(task)===role).reduce((sum,task)=>sum+task.estimate,0)/60,color:chartSeries[index%chartSeries.length]})).filter(item=>item.hours>0)
  const largest=[...roleData].sort((a,b)=>b.hours-a.hours)[0]
  return <section className="capacity-layout"><div className={gap<0?'card capacity-hero overloaded':'card capacity-hero'}><span className="kicker">WEEKLY CAPACITY</span><div className="capacity-score"><strong>{planned.toFixed(1)}</strong><span>/ {available} 小時<br/>已安排</span></div><div className="bar large"><i style={{width:`${Math.min(100,planned/available*100)}%`}}/></div><p>{gap>=0?`目前仍有 ${gap.toFixed(1)} 小時可安排。`:`目前超載 ${Math.abs(gap).toFixed(1)} 小時，請延後或取消部分承諾。`}</p></div><div className="card allocation"><h2>一週 168 小時</h2>{rows.map(row=><div className="allocation-row" key={row[0]}><span><i style={{background:row[2]}}/>{row[0]}</span><b>{row[1]} hr</b></div>)}</div><div className="card role-capacity"><div className="card-head"><div><span className="kicker">LIFE ROLES</span><h2>角色投入分布</h2></div><UsersRound/></div>{roleData.map(item=><div className="role-capacity-row" key={item.role}><div><b>{item.role}</b><span>{item.hours.toFixed(1)} hr</span></div><div className="bar"><i style={{width:`${planned?item.hours/planned*100:0}%`,background:item.color}}/></div></div>)}{largest&&planned&&largest.hours/planned>.6&&<p className="role-warning"><AlertTriangle/>「{largest.role}」占本週投入 {Math.round(largest.hours/planned*100)}%，可能擠壓其他人生角色。</p>}</div><div className="card q2-protect"><Zap/><div><span className="kicker">Q2 PROTECTION</span><h2>保護長期成長時間</h2><p>本週已有 {tasks.filter(task=>task.quadrant==='Q2').reduce((sum,task)=>sum+task.estimate,0)/60} 小時投入重要但不緊急事項。</p></div></div></section>
}
