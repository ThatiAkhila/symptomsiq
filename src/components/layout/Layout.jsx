import { NavLink, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import styles from './Layout.module.css'

const bottomNav = [
  { to: '/', label: 'Home', icon: '📊' },
  { to: '/log', label: 'Log', icon: '✍️' },
  { to: '/insights', label: 'AI', icon: '🧠' },
  { to: '/history', label: 'History', icon: '🗓️' },
  { to: '/profile', label: 'Profile', icon: '🧬' },
]

export default function Layout() {
  return (
    <div className={styles.shell}>
      <div className="container">
        <div className={styles.grid}>
          <Sidebar />

          <div className={styles.main}>
            <Topbar />

            <main className={`${styles.content} pageEnter`}>
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      <nav className={`${styles.bottomNav} surface glassBorder`} aria-label="Bottom">
        {bottomNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `${styles.bottomItem} ${isActive ? styles.bottomActive : ''}`
            }
          >
            <div className={styles.bottomIcon} aria-hidden="true">
              {item.icon}
            </div>
            <div className={styles.bottomLabel}>{item.label}</div>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

