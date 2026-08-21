import {ChevronRight,Lightbulb,ShieldCheck,TriangleAlert} from 'lucide-react'
import type {SmartInsight} from './insightEngine'

export function SmartInsightCard({insight,onAction,compact=false}:{insight:SmartInsight;onAction?:(target:string)=>void;compact?:boolean}){
  return <article className={`smart-insight ${insight.tone}${compact?' compact':''}`}><span>{insight.tone==='warning'?<TriangleAlert/>:insight.tone==='positive'?<ShieldCheck/>:<Lightbulb/>}</span><div><small>智慧建議</small><b>{insight.title}</b><p>{insight.message}</p></div>{insight.actionLabel&&insight.actionTarget&&<button onClick={()=>onAction?.(insight.actionTarget!)}>{insight.actionLabel}<ChevronRight/></button>}</article>
}
