import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export class ErrorBoundary extends Component<{children:ReactNode},{hasError:boolean}> {
  state={hasError:false}
  static getDerivedStateFromError(){return {hasError:true}}
  componentDidCatch(error:Error,info:ErrorInfo){console.error('Growth OS render error',error,info)}
  render(){if(this.state.hasError)return <main className="fatal-error"><div><AlertTriangle/><h1>畫面暫時無法顯示</h1><p>你的本機資料仍然安全。重新載入通常可以恢復。</p><button onClick={()=>window.location.reload()}><RefreshCw/>重新載入</button></div></main>;return this.props.children}
}
