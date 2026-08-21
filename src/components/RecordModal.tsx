import { FormEvent, useId, useState } from 'react'
import { Trash2, X } from 'lucide-react'
import {useDialog} from '../hooks/useDialog'

export type FieldOption={label:string;value:string}
export type FormField={name:string;label:string;type?:'text'|'number'|'date'|'textarea'|'select';required?:boolean;placeholder?:string;defaultValue?:string|number;options?:FieldOption[];min?:number;max?:number}

export function RecordModal({title,subtitle,fields,submitLabel='儲存',onClose,onSubmit,onDelete}:{title:string;subtitle:string;fields:FormField[];submitLabel?:string;onClose:()=>void;onSubmit:(values:Record<string,string>)=>void;onDelete?:()=>void}){
  const [values,setValues]=useState<Record<string,string>>(()=>Object.fromEntries(fields.map(x=>[x.name,String(x.type==='date'&&x.defaultValue==='2026-08-13'?new Date().toLocaleDateString('en-CA'):x.defaultValue??'')])))
  const [error,setError]=useState('')
  const prefix=useId()
  const handleDialogKey=useDialog(onClose)
  const submit=(event:FormEvent)=>{event.preventDefault();const missing=fields.find(x=>x.required&&!values[x.name]?.trim());if(missing){setError(`請填寫「${missing.label}」`);return}onSubmit(values)}
  return <div className="modal-back" role="presentation" onMouseDown={onClose}><form className="modal record-modal" role="dialog" aria-modal="true" aria-labelledby={`${prefix}-dialog-title`} aria-describedby={`${prefix}-dialog-subtitle`} onKeyDown={handleDialogKey} onSubmit={submit} onMouseDown={e=>e.stopPropagation()}>
    <div className="modal-head"><div><span className="kicker">RECORD EDITOR</span><h2 id={`${prefix}-dialog-title`}>{title}</h2><p id={`${prefix}-dialog-subtitle`}>{subtitle}</p></div><button type="button" aria-label="關閉表單" onClick={onClose}><X/></button></div>
    <div className="record-fields">{fields.map((field,index)=>{const id=`${prefix}-field-${field.name}`;return <label htmlFor={id} className={field.type==='textarea'?'full-field':''} key={field.name}><span>{field.label}{field.required&&<b>*</b>}</span>{field.type==='textarea'?<textarea id={id} autoFocus={index===0} value={values[field.name]} placeholder={field.placeholder} onChange={e=>setValues(v=>({...v,[field.name]:e.target.value}))}/>:field.type==='select'?<select id={id} autoFocus={index===0} value={values[field.name]} onChange={e=>setValues(v=>({...v,[field.name]:e.target.value}))}>{field.options?.map(x=><option value={x.value} key={x.value}>{x.label}</option>)}</select>:<input id={id} autoFocus={index===0} type={field.type||'text'} min={field.min} max={field.max} value={values[field.name]} placeholder={field.placeholder} onChange={e=>setValues(v=>({...v,[field.name]:e.target.value}))}/>}</label>})}</div>
    {error&&<div className="form-error" role="alert" aria-live="assertive">{error}</div>}<div className="modal-actions">{onDelete?<button className="danger-btn modal-delete" type="button" onClick={onDelete}><Trash2/>刪除</button>:<span>* 為必填欄位</span>}<button className="primary" type="submit">{submitLabel}</button></div>
  </form></div>
}
