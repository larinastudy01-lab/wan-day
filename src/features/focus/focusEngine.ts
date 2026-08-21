import type {Exam,FocusKind,FocusLog,Project,Task,WorkProfile} from '../../domain/types'

export type FocusSelection={kind:FocusKind;entityId?:number;subject?:string;customTitle?:string}
export type FocusSources={tasks:Task[];projects:Project[];exams:Exam[];works:WorkProfile[]}
export type ResolvedFocus={title:string;context:string;taskId?:number;entityId?:number}

export function resolveFocus(selection:FocusSelection,sources:FocusSources):ResolvedFocus{
  if(selection.kind==='task'){
    const item=sources.tasks.find(entry=>entry.id===selection.entityId)
    return {title:item?.title||'任務專注',context:item?.project||'任務',taskId:item?.id,entityId:item?.id}
  }
  if(selection.kind==='project'){
    const item=sources.projects.find(entry=>entry.id===selection.entityId)
    return {title:item?.title||'專案專注',context:'專案',entityId:item?.id}
  }
  if(selection.kind==='learning'){
    const item=sources.exams.find(entry=>entry.id===selection.entityId)
    const subject=selection.subject||item?.subjects[0]?.name||'自由學習'
    return {title:`${item?.name||'學習'}・${subject}`,context:'學習',entityId:item?.id}
  }
  if(selection.kind==='work'){
    const item=sources.works.find(entry=>entry.id===selection.entityId)
    return {title:item?.name||'工作專注',context:item?.organization||'工作',entityId:item?.id}
  }
  return {title:selection.customTitle?.trim()||'自由專注',context:'自訂'}
}

export function createFocusLog(selection:FocusSelection,sources:FocusSources,minutes:number,quality:number,interruptions:string[],date:string,id=Date.now()):FocusLog{
  const resolved=resolveFocus(selection,sources)
  return {id,kind:selection.kind,entityId:resolved.entityId,taskId:resolved.taskId,title:resolved.title,context:resolved.context,minutes,quality,interruptions,date}
}
