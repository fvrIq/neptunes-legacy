import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { mdaNodes } from '../mdaData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DataChart({ isDark = false }) {
  const textColor    = isDark ? '#8DA5B8' : '#9C8B7B';
  const gridColor    = isDark ? 'rgba(30, 58, 82, 0.6)' : 'rgba(232, 223, 211, 0.6)';
  const tooltipBg    = isDark ? '#142838' : '#FFFFFF';
  const tooltipTitle = isDark ? '#E8F0F8' : '#3D2B1F';
  const tooltipBody  = isDark ? '#8DA5B8' : '#9C8B7B';
  const tooltipBorder= isDark ? '#1E3A52' : '#E8DFD3';

  const statusColor = (status) => {
    if (status === 'dark')  return isDark ? 'rgba(224, 96, 93, 0.85)' : 'rgba(192, 80, 77, 0.85)';
    if (status === 'spoof') return isDark ? 'rgba(240, 184, 72, 0.85)' : 'rgba(232, 168, 56, 0.85)';
    return isDark ? 'rgba(91, 155, 213, 0.85)' : 'rgba(74, 123, 168, 0.85)';
  };
  const statusBorder = (status) => {
    if (status === 'dark')  return '#E0605D';
    if (status === 'spoof') return '#F0B848';
    return '#5B9BD5';
  };

  const data = {
    labels: mdaNodes.map(n => n.name),
    datasets: [{
      label: 'Speed (Knots)',
      data: mdaNodes.map(n => n.speed),
      backgroundColor: mdaNodes.map(n => statusColor(n.status)),
      borderColor: mdaNodes.map(n => statusBorder(n.status)),
      borderWidth: 1.5, borderRadius: 6, borderSkipped: false,
      barThickness: 'flex', maxBarThickness: 38,
    }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg, titleColor: tooltipTitle, bodyColor: tooltipBody,
        borderColor: tooltipBorder, borderWidth: 1, cornerRadius: 8, padding: 12,
        titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: '700' },
        bodyFont:  { family: 'Plus Jakarta Sans', size: 12 },
        displayColors: false,
        callbacks: { label: (ctx) => ` ${ctx.parsed.y} knots` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 }, callback: (v) => v + ' kn' },
        grid: { color: gridColor, drawBorder: false },
        border: { display: false },
      },
      x: {
        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10 }, maxRotation: 45, minRotation: 45 },
        grid: { display: false }, border: { display: false },
      },
    },
    animation: { duration: 800, easing: 'easeOutQuart' },
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <Bar data={data} options={options} />
    </div>
  );
}