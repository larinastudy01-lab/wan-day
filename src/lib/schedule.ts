import type {CalendarEvent} from '../domain/types'

const minutes=(time:string)=>{const [hour,minute]=time.split(':').map(Number);return hour*60+minute}
export function scheduleConflicts(candidate:Pick<CalendarEvent,'date'|'start'|'end'>,events:CalendarEvent[],ignoreId?:number){
  return events.filter(event=>event.id!==ignoreId&&event.date===candidate.date&&minutes(candidate.start)<minutes(event.end)&&minutes(candidate.end)>minutes(event.start))
}
export function nearestOpenStart(candidate:Pick<CalendarEvent,'date'|'start'|'end'>,events:CalendarEvent[]){
  const duration=Math.max(15,minutes(candidate.end)-minutes(candidate.start));let start=minutes(candidate.start)
  for(let attempts=0;attempts<24;attempts+=1){const end=start+duration;const conflict=events.some(event=>event.date===candidate.date&&start<minutes(event.end)&&end>minutes(event.start));if(!conflict)return `${String(Math.floor(start/60)).padStart(2,'0')}:${String(start%60).padStart(2,'0')}`;start+=30}
  return undefined
}
