import {useState} from 'react'
import {ArrowLeft,ArrowRight,Briefcase,Check,Flame,GraduationCap,HeartPulse,Layers3,Sparkles,Wallet} from 'lucide-react'

export type OnboardingSetup={completed:boolean;focus:string;identity:string;enabledModules:string[]}
const focuses=[['學習與考試',GraduationCap],['工作與職涯',Briefcase],['生活管理',Sparkles],['健康習慣',HeartPulse],['財務管理',Wallet],['全方位管理',Layers3]] as const
const identities=['學生','上班族','自由工作者','多職工作者','研究者','創作者']
const modules:Record<string,string[]>={'學習與考試':['今天','任務','考試','專注','健康'],'工作與職涯':['今天','專案','工作','專注','容量'],生活管理:['今天','任務','行事曆','習慣','日記'],'健康習慣':['今天','健康','習慣','容量','日記'],'財務管理':['今天','目標','財務','容量','回顧'],'全方位管理':['今天','任務','專案','容量','回顧']}

export function OnboardingPage({name,onComplete}:{name:string;onComplete:(setup:OnboardingSetup)=>void}){
  const [step,setStep]=useState(1)
  const [focus,setFocus]=useState('')
  const [identity,setIdentity]=useState('')
  const finish=()=>onComplete({completed:true,focus,identity,enabledModules:modules[focus]||modules['全方位管理']})
  return <main className="onboarding-page"><header><div><Flame/>Growth <b>OS</b></div><span>{step} / 2</span></header><section className="onboarding-card"><span className="kicker">WELCOME, {name.toUpperCase()}</span>{step===1?<><h1>你現在最想改善什麼？</h1><p>先聚焦最重要的方向，其他功能之後仍可使用。</p><div className="onboarding-grid">{focuses.map(([label,Icon])=><button className={focus===label?'selected':''} onClick={()=>setFocus(label)} key={label}><Icon/><span>{label}</span>{focus===label&&<Check/>}</button>)}</div><footer><span/><button disabled={!focus} onClick={()=>setStep(2)}>下一步 <ArrowRight/></button></footer></>:<><h1>哪個身份最接近現在的你？</h1><p>系統會用角色分配時間與容量，不會限制你的使用方式。</p><div className="identity-grid">{identities.map(label=><button className={identity===label?'selected':''} onClick={()=>setIdentity(label)} key={label}>{label}{identity===label&&<Check/>}</button>)}</div><div className="onboarding-preview"><b>建議首頁模組</b><span>{(modules[focus]||[]).join('・')}</span></div><footer><button className="back" onClick={()=>setStep(1)}><ArrowLeft/>返回</button><button disabled={!identity} onClick={finish}>開始使用 <ArrowRight/></button></footer></>}</section></main>
}
