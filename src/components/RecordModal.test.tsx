import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RecordModal } from './RecordModal'

describe('RecordModal',()=>{
  it('validates required fields before submitting',()=>{const submit=vi.fn();render(<RecordModal title="新增目標" subtitle="測試" fields={[{name:'title',label:'名稱',required:true}]} onClose={()=>{}} onSubmit={submit}/>);fireEvent.click(screen.getByRole('button',{name:'儲存'}));expect(screen.getByText('請填寫「名稱」')).toBeInTheDocument();expect(submit).not.toHaveBeenCalled()})
  it('submits entered values',()=>{const submit=vi.fn();render(<RecordModal title="新增目標" subtitle="測試" fields={[{name:'title',label:'名稱',required:true}]} onClose={()=>{}} onSubmit={submit}/>);fireEvent.change(screen.getByLabelText(/名稱/),{target:{value:'TOEIC 900'}});fireEvent.click(screen.getByRole('button',{name:'儲存'}));expect(submit).toHaveBeenCalledWith({title:'TOEIC 900'})})
  it('loads initial values for editing',()=>{render(<RecordModal title="編輯目標" subtitle="測試" fields={[{name:'title',label:'名稱',defaultValue:'原本的目標'}]} onClose={()=>{}} onSubmit={()=>{}}/>);expect(screen.getByLabelText(/名稱/)).toHaveValue('原本的目標')})
  it('closes with Escape',()=>{const close=vi.fn();render(<RecordModal title="編輯目標" subtitle="測試" fields={[]} onClose={close} onSubmit={()=>{}}/>);fireEvent.keyDown(window,{key:'Escape'});expect(close).toHaveBeenCalledOnce()})
})
