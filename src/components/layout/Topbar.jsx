import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './Topbar.module.css'

const titleMap = {
  '/': 'Dashboard',
  '/log': 'Log symptom',
  '/insights': 'AI insights',
  '/history': 'History',
  '/profile': 'Profile',
}

function formatToday() {
  const d = new Date()
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export default function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const title = useMemo(() => {
    return titleMap[location.pathname] || 'SymptomIQ'
  }, [location.pathname])

  return (
    <header className={`${styles.topbar} surface glassBorder`}>
      <div className={styles.left}>
        <div className={styles.titleWrap}>
          <div className={styles.title}>{title}</div>
          <div className={`${styles.date} mono`}>{formatToday()}</div>
        </div>
      </div>

      <div className={styles.right}>
        <button className="btn btnPrimary" onClick={() => navigate('/log')}>
          + Quick log
        </button>
      </div>
    </header>
  )
}

