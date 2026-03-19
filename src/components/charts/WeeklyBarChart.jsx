import { useMemo } from 'react'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import styles from './WeeklyBarChart.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

/**
 * @param {{
 *  data: { labels: string[], data: number[] },
 *  title?: string
 * }} props
 */
export default function WeeklyBarChart({ data, title = 'Weekly frequency' }) {
  const chartData = useMemo(() => {
    const labels = data?.labels || []
    return {
      labels,
      datasets: [
        {
          label: 'Logs',
          data: data?.data || [],
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.10)',
          borderRadius: 6,
          backgroundColor: (ctx) => {
            const { chart } = ctx
            const { ctx: canvasCtx, chartArea } = chart
            if (!chartArea) return 'rgba(110,231,183,0.8)'
            const g = canvasCtx.createLinearGradient(
              chartArea.left,
              chartArea.top,
              chartArea.right,
              chartArea.bottom,
            )
            g.addColorStop(0, 'rgba(110,231,183,0.95)')
            g.addColorStop(1, 'rgba(96,165,250,0.85)')
            return g
          },
        },
      ],
    }
  }, [data])

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13,15,20,0.96)',
          borderColor: 'rgba(255,255,255,0.10)',
          borderWidth: 1,
          titleColor: 'rgba(238,240,246,0.92)',
          bodyColor: 'rgba(238,240,246,0.82)',
          padding: 12,
          bodyFont: { family: 'DM Mono' },
          titleFont: { family: 'DM Mono' },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: 'rgba(139,144,167,0.65)',
            font: { family: 'DM Mono', size: 11 },
          },
          border: { color: 'rgba(255,255,255,0.06)' },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: 'rgba(139,144,167,0.60)',
            font: { family: 'DM Mono', size: 11 },
            precision: 0,
          },
          border: { color: 'rgba(255,255,255,0.06)' },
        },
      },
    }
  }, [])

  return (
    <div className={`${styles.wrap} surface glassBorder`}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={`${styles.sub} mono`}>last 7 days</div>
      </div>
      <div className={styles.canvas}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}

