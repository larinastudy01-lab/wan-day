import {describe,expect,it} from 'vitest'
import {nearestOpenStart,scheduleConflicts} from './schedule'
import type {CalendarEvent} from '../domain/types'
const event:CalendarEvent={id:1,title:'課程',date:'2026-08-21',start:'09:00',end:'10:00',category:'課程',recurrence:'無',note:''}
describe('schedule',()=>{it('detects overlap but allows adjacent events',()=>{expect(scheduleConflicts({date:event.date,start:'09:30',end:'10:30'},[event])).toHaveLength(1);expect(scheduleConflicts({date:event.date,start:'10:00',end:'11:00'},[event])).toHaveLength(0)});it('suggests a nearby opening',()=>expect(nearestOpenStart({date:event.date,start:'09:00',end:'10:00'},[event])).toBe('10:00'))})
