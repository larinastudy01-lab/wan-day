import type {Dispatch,SetStateAction} from 'react'
import {PenLine,Plus,Tags,Trash2} from 'lucide-react'
import type {Task} from '../../domain/types'

export function CategoryManager({categories,setCategories,setTasks}:{categories:string[];setCategories:Dispatch<SetStateAction<string[]>>;setTasks:Dispatch<SetStateAction<Task[]>>}){
  const add=()=>{const name=window.prompt('新類別名稱')?.trim();if(name&&!categories.some(item=>item.toLowerCase()===name.toLowerCase()))setCategories(current=>[...current,name])}
  const rename=(category:string)=>{const name=window.prompt('重新命名類別',category)?.trim();if(!name||name===category||categories.some(item=>item.toLowerCase()===name.toLowerCase()))return;setCategories(current=>current.map(item=>item===category?name:item));setTasks(current=>current.map(task=>(task.category||'一般')===category?{...task,category:name}:task))}
  const remove=(category:string)=>{if(category==='一般'||!window.confirm(`刪除「${category}」？使用此類別的任務將移到「一般」。`))return;setCategories(current=>current.filter(item=>item!==category));setTasks(current=>current.map(task=>task.category===category?{...task,category:'一般'}:task))}
  return <details className="card category-manager"><summary><span><Tags/>類別管理</span><small>新增、重新命名或刪除類別</small></summary><div>{categories.map(category=><div key={category}><b>{category}</b><button onClick={()=>rename(category)} aria-label={`重新命名 ${category}`}><PenLine/></button>{category!=='一般'&&<button onClick={()=>remove(category)} aria-label={`刪除 ${category}`}><Trash2/></button>}</div>)}<button className="add-category" onClick={add}><Plus/>新增類別</button></div></details>
}
