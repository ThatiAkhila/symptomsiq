import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/log', label: 'Log Symptom', icon: '✍️' },
  { to: '/insights', label: 'AI Insights', icon: '🧠' },
  { to: '/history', label: 'History', icon: '🗓️' },
  { to: '/profile', label: 'Profile', icon: '🧬' },
]

export default function Sidebar() {
  return (
    <aside className={`${styles.sidebar} surface glassBorder`}>
      <div className={styles.brand}>
        <div className={styles.logoMark} aria-hidden="true">
          🩺
        </div>
        <div className={styles.brandText}>
          <div className={styles.brandName}>SymptomIQ</div>
          <div className={`${styles.brandTag} muted`}>Daily symptom journal</div>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon} aria-hidden="true">
              {item.icon}
            </span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.userCard}>
        <div className={styles.avatar} aria-hidden="true">
          A
        </div>
        <div className={styles.userMeta}>
          <div className={styles.userName}>Akhila</div>
          <div className={`${styles.userPlan} mono`}>Premium Trial</div>
        </div>
      </div>
    </aside>
  )
}

