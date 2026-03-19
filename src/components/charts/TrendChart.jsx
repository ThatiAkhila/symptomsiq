import { useMemo } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import styles from './TrendChart.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
)

/**
 * @param {{
 *  data: { labels: string[], mild: number[], moderate: number[], severe: number[] },
 *  title?: string
 * }} props
 */
export default function TrendChart({ data, title = '30-day symptom trend' }) {
  const chartData = useMemo(() => {
    const labels = data?.labels || []
    return {
      labels,
      datasets: [
        {
          label: 'Mild',
          data: data?.mild || [],
          borderColor: '#6ee7b7',
          backgroundColor: 'rgba(110,231,183,0.12)',
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Moderate',
          data: data?.moderate || [],
          borderColor: '#fb923c',
          backgroundColor: 'rgba(251,146,60,0.11)',
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Severe',
          data: data?.severe || [],
          borderColor: '#f87171',
          backgroundColor: 'rgba(248,113,113,0.10)',
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    }
  }, [data])

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(238,240,246,0.75)',
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { family: 'DM Sans', size: 12 },
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(13,15,20,0.96)',
          borderColor: 'rgba(255,255,255,0.10)',
          borderWidth: 1,
          titleColor: 'rgba(238,240,246,0.92)',
          bodyColor: 'rgba(238,240,246,0.82)',
          padding: 12,
          displayColors: true,
          bodyFont: { family: 'DM Mono' },
          titleFont: { family: 'DM Mono' },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: 'rgba(139,144,167,0.55)',
            font: { family: 'DM Mono', size: 11 },
            callback(value, index) {
              return index % 5 === 0 ? this.getLabelForValue(value) : ''
            },
            maxRotation: 0,
            autoSkip: false,
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
        <div className={`${styles.sub} mono`}>last 30 days</div>
      </div>
      <div className={styles.canvas}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}

