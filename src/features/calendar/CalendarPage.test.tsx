import {fireEvent,render,screen} from '@testing-library/react'
import {describe,expect,it,vi} from 'vitest'
import {CalendarPage} from './CalendarPage'
import type {Task} from '../../domain/types'

const task:Task={id:1,title:'今天的任務',done:false,quadrant:'Q2',estimate:30,project:'收集匣',energy:'中',due:'今天'}
const renderCalendar=()=>render(<CalendarPage tasks={[task]} setTasks={vi.fn()} events={[]} setEvents={vi.fn()} onUndo={vi.fn()}/>)

describe('CalendarPage',()=>{
  it('uses the current date and returns to today after navigation',()=>{
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-14T10:00:00'))
    renderCalendar()
    expect(screen.getByText('今天的任務')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'下一個期間'}))
    expect(screen.queryByText('今天的任務')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'今天'}))
    expect(screen.getByText('今天的任務')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('switches between calendar views with accessible state',()=>{
    renderCalendar()
    const month=screen.getByRole('button',{name:'月'})
    fireEvent.click(month)
    expect(month).toHaveAttribute('aria-pressed','true')
    expect(screen.getAllByText(new Date().getDate().toString()).length).toBeGreaterThan(0)
  })
})
