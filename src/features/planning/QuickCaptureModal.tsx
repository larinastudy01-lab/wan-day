import {FormEvent,useMemo,useState} from 'react'
import {X} from 'lucide-react'
import {useDialog} from '../../hooks/useDialog'
import {analyzeCapture,type CaptureSuggestion} from './captureEngine'

export function QuickCaptureModal({onSubmit,onClose}:{onSubmit:(capture:CaptureSuggestion)=>void;onClose:()=>void}){
  const [title,setTitle]=useState('')
  const suggestion=useMemo(()=>title.trim()?analyzeCapture(title):undefined,[title])
  const handleDialogKey=useDialog(onClose)
  const submit=(event:FormEvent)=>{event.preventDefault();if(suggestion)onSubmit(suggestion)}
  return <div className="modal-back" role="presentation" onMouseDown={onClose}><form className="modal quick-capture-modal" role="dialog" aria-modal="true" aria-labelledby="quick-capture-title" aria-describedby="quick-capture-description" onKeyDown={handleDialogKey} onSubmit={submit} onMouseDown={event=>event.stopPropagation()}><div className="modal-head"><div><span className="kicker">QUICK CAPTURE</span><h2 id="quick-capture-title">腦中有什麼？</h2><p id="quick-capture-description">先丟進來就好，分類和時間交給灣day先猜。</p></div><button type="button" aria-label="關閉快速新增" onClick={onClose}><X/></button></div><label className="capture-title">一件事、一個想法，都可以<input autoFocus value={title} onChange={event=>setTitle(event.target.value)} placeholder="例如：星期五前改完研究計畫，約 2 小時"/></label>{suggestion&&<div className="capture-suggestion" aria-live="polite"><span>灣day 先整理成</span><b>{suggestion.kind}・{suggestion.estimate} 分鐘・{suggestion.energy}精力</b>{suggestion.due&&<small>預計期限 {suggestion.due}</small>}<small>猜錯沒關係，之後都能改。</small></div>}<div className="modal-actions"><span>會先放進收集匣，不用現在想完。</span><button className="primary" type="submit">先收下</button></div></form></div>
}
