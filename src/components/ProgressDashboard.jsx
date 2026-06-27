import { useEffect, useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function ProgressDashboard() {
  const { data, stats, studyLogActions } = useData();
  const [timeRange, setTimeRange] = useState(30);
  const [chartData, setChartData] = useState(null);
  const [categoryChartData, setCategoryChartData] = useState(null);
  const [wordsChartData, setWordsChartData] = useState(null);

  useEffect(() => {
    const lastLogs = studyLogActions.getLastDays(timeRange);
    const dates = Array.from({ length: timeRange }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (timeRange - 1 - i));
      return d.toISOString().split('T')[0];
    });

    const minutesData = dates.map(date => {
      const log = lastLogs.find(l => l.date === date);
      return log ? log.minutes : 0;
    });

    const wordsData = dates.map(date => {
      const log = lastLogs.find(l => l.date === date);
      return log ? (log.wordsLearned || 0) : 0;
    });

    setChartData({
      labels: dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Minutes Studied',
          data: minutesData,
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    });

    setWordsChartData({
      labels: dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Words Learned',
          data: wordsData,
          fill: true,
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgb(16, 185, 129)',
          tension: 0.4,
          pointBackgroundColor: 'rgb(16, 185, 129)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    });

    const categoryData = stats.studyByCategory;
    const categories = Object.keys(categoryData);
    setCategoryChartData({
      labels: categories.length > 0 ? categories : ['No data'],
      datasets: [{
        data: categories.length > 0 ? Object.values(categoryData) : [1],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 0,
      }],
    });
  }, [data.studyLogs, timeRange, stats.studyByCategory, studyLogActions]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#6b7280', font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 11 }, maxRotation: 45, minRotation: 45 },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#6b7280', font: { size: 12 }, padding: 16, usePointStyle: true, pointStyle: 'circle' } },
      tooltip: { backgroundColor: 'rgba(17, 24, 39, 0.9)', padding: 12 },
    },
    cutout: '65%',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your English learning journey</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Current Streak" value={`${stats.currentStreak} days`} icon="🔥" color="orange" />
        <StatCard title="Longest Streak" value={`${stats.longestStreak} days`} icon="🏆" color="amber" />
        <StatCard title="Total Study Time" value={`${Math.round(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`} icon="⏱️" color="indigo" />
        <StatCard title="Words Mastered" value={stats.totalWordsLearned} icon="📚" color="green" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[7, 14, 30, 60, 90].map(days => (
          <button
            key={days}
            onClick={() => setTimeRange(days)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              timeRange === days
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {days} Days
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Daily Study Time" subtitle={`Last ${timeRange} days`}>
          <div className="h-72">
            {chartData && <Bar data={chartData} options={chartOptions} />}
          </div>
        </Card>

        <Card title="Words Learned Daily" subtitle={`Last ${timeRange} days`}>
          <div className="h-72">
            {wordsChartData && <Line data={wordsChartData} options={chartOptions} />}
          </div>
        </Card>

        <Card title="Study Time by Category" subtitle="All time">
          <div className="h-72 flex items-center justify-center">
            {categoryChartData && <Doughnut data={categoryChartData} options={doughnutOptions} />}
          </div>
        </Card>

        <Card title="Vocabulary Mastery" subtitle="Overall progress">
          <VocabularyProgress words={data.vocabulary} />
        </Card>
      </div>

      <Card title="Recent Activity">
        <RecentActivity logs={data.studyLogs.slice(0, 10)} />
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function VocabularyProgress({ words }) {
  const total = words.length;
  const mastered = words.filter(w => w.mastery === 100).length;
  const learning = words.filter(w => w.mastery > 0 && w.mastery < 100).length;
  const newWords = words.filter(w => w.mastery === 0).length;

  if (total === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">📚</div>
        <p className="text-gray-500 dark:text-gray-400">No vocabulary added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{mastered}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Mastered</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{learning}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Learning</p>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{newWords}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">New</p>
        </div>
      </div>
      
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${total > 0 ? (mastered / total) * 100 : 0}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {total > 0 ? Math.round((mastered / total) * 100) : 0}% mastered overall
      </p>
    </div>
  );
}

function RecentActivity({ logs }) {
  if (logs.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>;
  }

  return (
    <div className="space-y-3">
      {logs.map(log => (
        <div key={log.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">
              {new Date(log.date).getDate()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {log.categories.join(', ')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-3">
              <span>⏱ {log.minutes} min</span>
              {log.wordsLearned > 0 && <span>📝 {log.wordsLearned} words</span>}
              <span>{new Date(log.date).toLocaleDateString()}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}