import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { uiColors } from '../config/colors'

const focusTrend=[{d:'一',v:110},{d:'二',v:185},{d:'三',v:145},{d:'四',v:220},{d:'五',v:170},{d:'六',v:250},{d:'日',v:195}]

export function FocusTrendChart(){
  return <ResponsiveContainer width="100%" height="100%"><AreaChart data={focusTrend}>
    <defs><linearGradient id="focus-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={uiColors.accent} stopOpacity=".3"/><stop offset="1" stopColor={uiColors.accent} stopOpacity="0"/></linearGradient></defs>
    <XAxis dataKey="d" axisLine={false} tickLine={false}/><Tooltip/><Area type="monotone" dataKey="v" stroke={uiColors.accent} strokeWidth={3} fill="url(#focus-fill)"/>
  </AreaChart></ResponsiveContainer>
}

export function AllocationPieChart({data}:{data:{name:string;value:number;color:string}[]}){
  return <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" innerRadius={48} outerRadius={70} paddingAngle={3}>{data.map(x=><Cell key={x.name} fill={x.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
}

export function MetricBarChart({data,keys}:{data:Record<string,string|number>[];keys:{key:string;label:string;color:string}[]}){
  return <ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{top:10,right:8,left:-22,bottom:0}}>
    <CartesianGrid stroke={uiColors.chartGrid} vertical={false}/><XAxis dataKey="name" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip/><Legend iconType="circle" iconSize={7}/>
    {keys.map(x=><Bar key={x.key} dataKey={x.key} name={x.label} fill={x.color} radius={[4,4,0,0]}/>)}</BarChart></ResponsiveContainer>
}
