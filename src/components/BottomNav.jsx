import { NavLink } from 'react-router-dom'

const items = [
  { to: '/lists', label: 'Listas', icon: '📝' },
  { to: '/scan', label: 'Escanear', icon: '📷' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/suppliers', label: 'Fornecedores', icon: '🏬' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
