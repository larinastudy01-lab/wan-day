import type { Dispatch, SetStateAction } from 'react'
import { Circle, Clock3, Sparkles, Trash2 } from 'lucide-react'
import { Empty } from '../../components/EmptyState'
import { PageTitle } from '../../components/PageTitle'
import type { WaitingItem } from '../../domain/types'

type GtdPageProps = {
  title: string
  kind: WaitingItem['kind']
  items: WaitingItem[]
  onAdd: () => void
  setItems: Dispatch<SetStateAction<WaitingItem[]>>
}

export function GtdPage({ title, kind, items, onAdd, setItems }: GtdPageProps) {
  const visible = items.filter(item => item.kind === kind && !item.done)
  const isWaiting = kind === 'waiting'

  return <>
    <PageTitle name={title} onAdd={onAdd}/>
    <section className="card gtd-page">
      <div className="gtd-summary">
        <span className={isWaiting ? 'waiting-symbol' : 'someday-symbol'}>{isWaiting ? <Clock3/> : <Sparkles/>}</span>
        <div><h2>{visible.length} 個{isWaiting ? '等待回覆' : '未來可能'}</h2><p>{isWaiting ? '定期跟進，不讓已交付的承諾消失。' : '這些想法現在不需要佔用你的每日注意力。'}</p></div>
      </div>
      {visible.map(item => <article className="gtd-row" key={item.id}>
        <button onClick={() => setItems(current => current.map(record => record.id === item.id ? { ...record, done: true } : record))}><Circle/></button>
        <div><b>{item.title}</b><p>{item.note || '尚無備註'}</p></div>
        {item.followUp && <time>跟進 {item.followUp}</time>}
        <button className="row-action" onClick={() => setItems(current => current.filter(record => record.id !== item.id))}><Trash2/></button>
      </article>)}
      {visible.length === 0 && <Empty/>}
    </section>
  </>
}
