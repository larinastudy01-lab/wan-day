import {useMemo,useState} from 'react'
import {Check,ChevronRight,Flame,Play,ShieldCheck,Target,Users} from 'lucide-react'
import type {FocusGroup,FocusLog,FriendFocus,SocialChallenge} from '../../domain/types'
import {PageTitle} from '../../components/PageTitle'
import {usePersistentState} from '../../hooks/usePersistentState'
import {mySocialMetrics,rankValue,type RankMetric} from './socialMetrics'

type Tab='自習室'|'好友'|'群組'|'挑戰'|'排行榜'
const initialFriends:FriendFocus[]=[{id:1,name:'Amy',activity:'TOEIC Reading',category:'學習',minutes:42,weeklyMinutes:520,streak:8,online:true,privacy:'detail'},{id:2,name:'小灣',activity:'研究報告',category:'專案',minutes:67,weeklyMinutes:410,streak:5,online:true,privacy:'detail'},{id:3,name:'阿哲',activity:'專注中',category:'工作',minutes:28,weeklyMinutes:365,streak:12,online:true,privacy:'focus'},{id:4,name:'Mina',activity:'離線',category:'學習',minutes:0,weeklyMinutes:295,streak:4,online:false,privacy:'category'}]
const initialGroups:FocusGroup[]=[{id:1,name:'2026 TOEIC 衝刺團',description:'每天至少完成一段英文 Focus',members:86,online:14,weeklyMinutes:18240,joined:true},{id:2,name:'研究所備審衝刺',description:'一起完成備審與讀書計畫',members:42,online:7,weeklyMinutes:9680,joined:false},{id:3,name:'早起深度工作室',description:'平日早上七點一起開始',members:128,online:22,weeklyMinutes:24100,joined:false}]
const initialChallenges:SocialChallenge[]=[{id:1,title:'七天每天讀 60 分鐘',description:'建立穩定的學習節奏',target:420,unit:'分鐘',participants:328,joined:true,progress:180},{id:2,title:'本週完成 10 次 Focus',description:'次數比一次坐很久更重要',target:10,unit:'次',participants:214,joined:false,progress:3},{id:3,title:'連續五天完成 Top 3',description:'先完成真正重要的事',target:5,unit:'天',participants:96,joined:false,progress:1}]

export function TogetherPage({focusLogs,onStartTogether}:{focusLogs:FocusLog[];onStartTogether:(activity:string,minutes:number)=>void}){
  const [tab,setTab]=useState<Tab>('自習室')
  const [groups,setGroups]=usePersistentState<FocusGroup[]>('growth-social-groups-v1',initialGroups)
  const [challenges,setChallenges]=usePersistentState<SocialChallenge[]>('growth-social-challenges-v1',initialChallenges)
  const [metric,setMetric]=useState<RankMetric>('專注時間')
  const mine=mySocialMetrics(focusLogs)
  const online=initialFriends.filter(friend=>friend.online)
  const ranking=useMemo(()=>[
    ...initialFriends.map(friend=>({id:`friend-${friend.id}`,name:friend.name,weeklyMinutes:friend.weeklyMinutes,sessions:Math.max(1,Math.round(friend.weeklyMinutes/42)),streak:friend.streak,mine:false})),
    {id:'me',name:'我',weeklyMinutes:mine.minutes,sessions:mine.sessions,streak:mine.streak,mine:true},
  ].sort((left,right)=>rankValue(metric,right)-rankValue(metric,left)),[metric,mine.minutes,mine.sessions,mine.streak])
  const formatRank=(person:{weeklyMinutes:number;sessions:number;streak:number})=>metric==='專注時間'?`${Math.floor(person.weeklyMinutes/60)}h ${person.weeklyMinutes%60}m`:metric==='Focus 次數'?`${person.sessions} 次`:`${person.streak} 天`

  return <><PageTitle name="一起"/><div className="together-tabs">{(['自習室','好友','群組','挑戰','排行榜'] as Tab[]).map(item=><button className={tab===item?'active':''} onClick={()=>setTab(item)} key={item}>{item}</button>)}</div>
    {tab==='自習室'&&<><section className="study-room-hero card"><div><span className="live-dot"/>LIVE STUDY ROOM<h2>{online.length+325} 人正在努力</h2><p>不用聊天也沒關係，知道有人同時坐在書桌前就好。</p><button className="primary" onClick={()=>onStartTogether('一起自習',45)}><Play/>加入一起 Focus</button></div><div className="room-avatars">{online.map(friend=><span key={friend.id}>{friend.name.slice(0,1)}</span>)}</div></section><section className="focus-friends">{online.map(friend=><FriendCard friend={friend} onStart={()=>onStartTogether(`和 ${friend.name} 一起・${friend.activity}`,friend.minutes<45?45:50)} key={friend.id}/>)}</section></>}
    {tab==='好友'&&<section className="focus-friends">{initialFriends.map(friend=><FriendCard friend={friend} onStart={()=>onStartTogether(`和 ${friend.name} 一起專注`,45)} key={friend.id}/>)}</section>}
    {tab==='群組'&&<section className="social-grid">{groups.map(group=><article className="card group-card" key={group.id}><div className="group-icon"><Users/></div><span>{group.online} 人正在 Focus</span><h2>{group.name}</h2><p>{group.description}</p><div><b>{group.members} 位成員</b><b>本週 {Math.round(group.weeklyMinutes/60)} 小時</b></div><button className={group.joined?'joined':''} onClick={()=>setGroups(items=>items.map(item=>item.id===group.id?{...item,joined:!item.joined,members:item.members+(item.joined?-1:1)}:item))}>{group.joined?<><Check/>已加入</>:<>加入群組<ChevronRight/></>}</button></article>)}</section>}
    {tab==='挑戰'&&<section className="social-grid">{challenges.map(challenge=>{const automatic=challenge.unit==='分鐘'?mine.minutes:challenge.unit==='次'?mine.sessions:mine.streak;const progress=challenge.joined?Math.max(challenge.progress,automatic):challenge.progress;const pct=Math.min(100,Math.round(progress/challenge.target*100));return <article className="card challenge-card" key={challenge.id}><Flame/><span>{challenge.participants} 人參加</span><h2>{challenge.title}</h2><p>{challenge.description}</p><div className="challenge-progress"><div><b>{progress} / {challenge.target} {challenge.unit}</b><strong>{pct}%</strong></div><div className="bar"><i style={{width:`${pct}%`}}/></div></div><button className={challenge.joined?'joined':''} onClick={()=>setChallenges(items=>items.map(item=>item.id===challenge.id?{...item,joined:!item.joined,participants:item.participants+(item.joined?-1:1)}:item))}>{challenge.joined?<><Check/>進行中</>:<>參加挑戰<Target/></>}</button></article>})}</section>}
    {tab==='排行榜'&&<section className="card ranking-card"><div className="ranking-head"><div><span className="kicker">MULTI-DIMENSION RANKING</span><h2>我想比什麼？</h2><p>不只比坐得久，也看穩定度與持續行動。</p></div><div className="ranking-metrics">{(['專注時間','Focus 次數','連續天數'] as RankMetric[]).map(item=><button className={metric===item?'active':''} onClick={()=>setMetric(item)} key={item}>{item}</button>)}</div></div>{ranking.map((person,index)=><div className={person.mine?'rank-row mine':'rank-row'} key={person.id}><strong>{index+1}</strong><span>{person.name.slice(0,1)}</span><div><b>{person.name}</b><small>{person.mine?'只和自己的節奏比，也很好。':'本週穩定前進中'}</small></div><em>{formatRank(person)}</em></div>)}</section>}
    <aside className="privacy-note"><ShieldCheck/><span><b>隱私優先</b>好友只會看到你選擇公開的 Focus 狀態與分類。</span></aside>
  </>
}

function FriendCard({friend,onStart}:{friend:FriendFocus;onStart:()=>void}){return <article className={friend.online?'card friend-card online':'card friend-card'}><div className="friend-avatar">{friend.name.slice(0,1)}{friend.online&&<i/>}</div><div><b>{friend.name}</b><span>{friend.online?(friend.privacy==='focus'?'正在專注':friend.privacy==='category'?friend.category:friend.activity):'目前離線'}</span><small>{friend.online?`已專注 ${friend.minutes} 分鐘`:`本週 ${Math.round(friend.weeklyMinutes/60)} 小時`}</small></div>{friend.online&&<button onClick={onStart}><Play/>一起</button>}</article>}
