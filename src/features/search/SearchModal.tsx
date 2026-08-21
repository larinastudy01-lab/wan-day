import { useMemo, useState } from 'react'
import { ChevronRight, Command, Search } from 'lucide-react'
import type { Exam, Goal, JournalEntry, Note, Project, Task, WorkProfile } from '../../domain/types'
import {useDialog} from '../../hooks/useDialog'

type SearchModalProps = {
  tasks: Task[]
  goals: Goal[]
  projects: Project[]
  notes: Note[]
  journal: JournalEntry[]
  works: WorkProfile[]
  exams: Exam[]
  close: () => void
  navigate: (page: string) => void
}

export function SearchModal({ tasks, goals, projects, notes, journal, works, exams, close, navigate }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const handleDialogKey = useDialog(close)
  const results = useMemo(() => {
    const records = [
      ...tasks.map(item => ({ name: item.title, detail: item.project, page: '今天', type: '任務' })),
      ...goals.map(item => ({ name: item.title, detail: item.reason, page: '目標', type: '目標' })),
      ...projects.map(item => ({ name: item.title, detail: item.area, page: '專案', type: '專案' })),
      ...notes.map(item => ({ name: item.title, detail: item.content, page: '筆記', type: '筆記' })),
      ...journal.map(item => ({ name: item.title, detail: item.content, page: '日記', type: '日記' })),
      ...works.map(item => ({ name: item.name, detail: `${item.organization} ${item.role}`, page: '工作', type: '工作' })),
      ...exams.map(item => ({ name: item.name, detail: item.type, page: '考試', type: '考試' })),
    ]
    const term = query.trim().toLowerCase()
    return (term ? records.filter(item => `${item.name} ${item.detail}`.toLowerCase().includes(term)) : records).slice(0, 9)
  }, [query, tasks, goals, projects, notes, journal, works, exams])

  return <div className="modal-back search-back" onMouseDown={close}>
    <div className="command" role="dialog" aria-modal="true" aria-label="搜尋所有內容" onKeyDown={handleDialogKey} onMouseDown={event => event.stopPropagation()}>
      <div><Search/><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="搜尋任務、目標、專案、筆記、工作、考試…"/><kbd>ESC</kbd></div>
      <p>{query ? `${results.length} 個搜尋結果` : '最近項目'}</p>
      {results.map((item, index) => <button key={item.name + index} onClick={() => { navigate(item.page); close() }}><Command size={16}/><span>{item.name}<small>{item.type}・{item.detail}</small></span><ChevronRight size={15}/></button>)}
      {results.length === 0 && <div className="search-empty">找不到符合「{query}」的內容</div>}
    </div>
  </div>
}
