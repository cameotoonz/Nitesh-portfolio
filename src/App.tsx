import { lazy, Suspense, useEffect, useState } from 'react'
import Portfolio from './pages/Portfolio'
import { initialProfile, initialProjects } from './lib/data'
import { fetchPortfolio, supabase } from './lib/supabase'

const Admin = lazy(() => import('./pages/Admin'))

export default function App() {
  const [data, setData] = useState({ profile: initialProfile, projects: supabase ? [] : initialProjects })
  const admin = window.location.pathname.startsWith('/admin')

  useEffect(() => {
    if (!supabase || admin) return
    const refresh = () => { fetchPortfolio().then(setData).catch(error => console.warn('Portfolio refresh unavailable:', error.message)) }
    refresh()
    const channel = supabase.channel('public-portfolio')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio_profile' }, refresh)
      .subscribe()
    const interval = window.setInterval(refresh, 60000)
    window.addEventListener('focus', refresh)
    return () => { void supabase?.removeChannel(channel); clearInterval(interval); window.removeEventListener('focus', refresh) }
  }, [admin])

  if (admin) return <Suspense fallback={<div className="loading-screen"><span className="brand">nk<span>.</span></span><p>Opening the studio…</p></div>}><Admin /></Suspense>
  return <Portfolio profile={data.profile} projects={data.projects} />
}
