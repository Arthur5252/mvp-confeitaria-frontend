import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">🧁 Confeitaria</span>
        <button className="link-button" onClick={logout}>
          Sair
        </button>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
