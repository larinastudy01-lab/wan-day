import {Plus} from 'lucide-react'
import {pageTitles} from '../config/navigation'
export function PageTitle({name,onAdd}:{name:string;onAdd?:()=>void}){const copy=pageTitles[name]||[name,'這個模組已納入下一階段開發。'];return <section className="page-title"><div><span className="eyebrow">PERSONAL WORKSPACE</span><h1>{copy[0]}</h1><p>{copy[1]}</p></div>{onAdd&&<button className="primary" onClick={onAdd}><Plus size={17}/>新增項目</button>}</section>}
