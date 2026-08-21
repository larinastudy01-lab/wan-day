import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './accessibility.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthGate } from './features/auth/AuthGate'
import { StorageScopeProvider } from './hooks/StorageScope'

createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><AuthGate>{(session,logout)=><StorageScopeProvider scope={session.id}><App key={session.id} onLogout={logout}/></StorageScopeProvider>}</AuthGate></ErrorBoundary></StrictMode>)
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))
