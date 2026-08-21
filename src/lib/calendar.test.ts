import {describe,expect,it} from 'vitest'
import {occursOn} from './calendar'

describe('calendar recurrence',()=>{
  it('matches exact and multi-day events',()=>{expect(occursOn('2026-08-13','無','2026-08-13')).toBe(true);expect(occursOn('2026-08-13','無','2026-08-14')).toBe(false);expect(occursOn('2026-08-13','無','2026-08-14',undefined,'2026-08-15')).toBe(true)})
  it('matches daily and weekly recurrence after start',()=>{expect(occursOn('2026-08-13','每天','2026-08-15')).toBe(true);expect(occursOn('2026-08-13','每週','2026-08-20')).toBe(true);expect(occursOn('2026-08-13','每週','2026-08-21')).toBe(false)})
  it('matches monthly recurrence by day',()=>{expect(occursOn('2026-08-13','每月','2026-09-13')).toBe(true);expect(occursOn('2026-08-13','每月','2026-09-14')).toBe(false)})
  it('stops recurring after its end date',()=>{expect(occursOn('2026-08-13','每天','2026-08-20','2026-08-19')).toBe(false);expect(occursOn('2026-08-13','每週','2026-08-20','2026-08-20')).toBe(true)})
})
