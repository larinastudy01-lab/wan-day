import {describe,expect,it} from 'vitest'
import {analyzeCapture} from './captureEngine'
describe('analyzeCapture',()=>{const now=new Date('2026-08-20T09:00:00+08:00');it('extracts deadline and duration',()=>expect(analyzeCapture('星期五前把研究計畫第三版改完，約 2 小時',now)).toMatchObject({due:'2026-08-21',estimate:120,energy:'高'}));it('recognizes finance',()=>expect(analyzeCapture('明天繳手機費，約 1.5 小時',now)).toMatchObject({kind:'財務',estimate:90,due:'2026-08-21',energy:'低'}));it('keeps ideas out of urgency',()=>expect(analyzeCapture('有空想學陶藝',now)).toMatchObject({kind:'以後再做',quadrant:'Q2',estimate:30}))})
