import type {FocusLog,Health,StudyLog,Task} from '../../domain/types'

export type InsightPlacement='today'|'calendar'|'learning'|'report'
export type SmartInsight={id:string;placement:InsightPlacement;tone:'info'|'warning'|'positive';title:string;message:string;actionLabel?:string;actionTarget?:string}
type Input={tasks:Task[];health:Health;focusLogs:FocusLog[];studyLogs:StudyLog[];date:string}

export function buildInsights({tasks,health,focusLogs,studyLogs,date}:Input):SmartInsight[]{
  const insights:SmartInsight[]=[]
  const todayTasks=tasks.filter(task=>!task.done&&(task.due===date||task.due?.includes('今天')))
  const planned=todayTasks.reduce((total,task)=>total+task.estimate,0)
  const capacity=Math.round(300*(.55+health.energy*.09)*Math.min(1,Math.max(.65,health.sleep/8))*(1-(health.stress-1)*.06)/15)*15
  if(planned>capacity)insights.push({id:'overload',placement:'calendar',tone:'warning',title:'今天的安排超出可用容量',message:`已安排 ${planned} 分鐘，比估計可用時間多 ${planned-capacity} 分鐘。建議把最低優先的一件事移到其他天。`,actionLabel:'調整行程',actionTarget:'行程'})
  else insights.push({id:'capacity',placement:'today',tone:'positive',title:'今天還留有緩衝',message:`目前安排 ${planned} 分鐘，約保留 ${Math.max(0,capacity-planned)} 分鐘彈性。先完成 Top 3 就很好。`})
  if(health.sleep<6.5)insights.push({id:'sleep',placement:'today',tone:'warning',title:'今天適合降低任務強度',message:`昨晚睡眠 ${health.sleep} 小時。這是根據今日狀態的推估，建議先做低能量任務，並保留恢復時間。`,actionLabel:'查看健康',actionTarget:'健康'})
  const subjectMinutes=studyLogs.reduce<Record<string,number>>((result,log)=>({...result,[log.subject]:(result[log.subject]||0)+log.minutes}),{})
  const subjects=Object.entries(subjectMinutes).sort((left,right)=>left[1]-right[1])
  if(subjects.length>1)insights.push({id:'study-balance',placement:'learning',tone:'info',title:`${subjects[0][0]} 最近投入較少`,message:`目前累積 ${subjects[0][1]} 分鐘。可以安排一段 25 分鐘 Focus，維持科目之間的平衡。`,actionLabel:'開始學習',actionTarget:'學習模式'})
  const recentFocus=focusLogs.slice(0,10)
  if(recentFocus.length>=3){const total=recentFocus.reduce((sum,log)=>sum+log.minutes,0);const average=Math.round(total/recentFocus.length);insights.push({id:'focus-pattern',placement:'report',tone:'positive',title:'你正在建立穩定的專注節奏',message:`最近 ${recentFocus.length} 次 Focus 平均 ${average} 分鐘。維持可重複的節奏，通常比偶爾超長時間更容易持續。`})}
  const q2=todayTasks.find(task=>task.quadrant==='Q2')
  if(q2)insights.push({id:'next-q2',placement:'today',tone:'info',title:'先推進一件重要但不緊急的事',message:`「${q2.title}」值得在今天被保護一段時間。`,actionLabel:'開始專注',actionTarget:'專注'})
  if(!insights.some(item=>item.placement==='report'))insights.push({id:'report-start',placement:'report',tone:'info',title:'完成幾次 Focus 後，洞察會更貼近你',message:'灣day 會從你的實際紀錄找出可重複的節奏，不需要額外填寫分析表單。'})
  return insights
}
