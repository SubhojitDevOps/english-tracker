import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

function testNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('English Tracker Reminder', {
      body: "Time for your daily English practice! 📚",
      icon: '/vite.svg',
    });
  }
}

export function GoalsReminders() {
  const { data, goalsActions, remindersActions, stats, studyLogActions } = useData();
  const [activeTab, setActiveTab] = useState('goals');
  const [goals, setGoals] = useState(data.goals);
  const [reminders, setReminders] = useState(data.reminders);
  const [weeklyProgress, setWeeklyProgress] = useState({ minutes: 0, words: 0, reading: 0 });

  useEffect(() => {
    setGoals(data.goals);
  }, [data.goals]);

  useEffect(() => {
    setReminders(data.reminders);
  }, [data.reminders]);

  useEffect(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekLogs = data.studyLogs.filter(log => new Date(log.date) >= weekStart);
    const minutes = weekLogs.reduce((sum, log) => sum + (log.minutes || 0), 0);
    const words = weekLogs.reduce((sum, log) => sum + (log.wordsLearned || 0), 0);
    const reading = weekLogs.filter(log => log.categories?.includes('Reading')).length;

    setWeeklyProgress({ minutes, words, reading });
  }, [data.studyLogs]);

  const handleGoalsChange = (key, value) => {
    const newGoals = { ...goals, [key]: value };
    setGoals(newGoals);
    goalsActions.update(newGoals);
  };

  const handleRemindersChange = (key, value) => {
    const newReminders = { ...reminders, [key]: value };
    setReminders(newReminders);
    remindersActions.update(newReminders);
    
    if (key === 'enabled' && value) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  const minutesProgress = Math.min(100, (weeklyProgress.minutes / (goals.dailyMinutes * 7)) * 100);
  const wordsProgress = Math.min(100, (weeklyProgress.words / goals.weeklyWords) * 100);
  const readingProgress = Math.min(100, (weeklyProgress.reading / goals.weeklyReading) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Goals & Reminders</h1>
      </div>

      <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'goals'}
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'goals'
              ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          🎯 Goals
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'reminders'}
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'reminders'
              ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          ⏰ Reminders
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'progress'}
          onClick={() => setActiveTab('progress')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'progress'
              ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          📈 Weekly Progress
        </button>
      </div>

      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Daily & Weekly Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GoalCard
                title="Daily Study Time"
                icon="⏱️"
                value={goals.dailyMinutes}
                unit="minutes"
                onChange={v => handleGoalsChange('dailyMinutes', v)}
                min={5}
                max={180}
                step={5}
              />
              <GoalCard
                title="Weekly New Words"
                icon="📝"
                value={goals.weeklyWords}
                unit="words"
                onChange={v => handleGoalsChange('weeklyWords', v)}
                min={5}
                max={100}
                step={5}
              />
              <GoalCard
                title="Weekly Reading Sessions"
                icon="📖"
                value={goals.weeklyReading}
                unit="sessions"
                onChange={v => handleGoalsChange('weeklyReading', v)}
                min={1}
                max={14}
                step={1}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Goal Tips</h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2"><span className="text-indigo-500">→</span> Start small: 15-20 minutes daily builds better habits than 2 hours once a week</li>
              <li className="flex items-start gap-2"><span className="text-indigo-500">→</span> Mix categories: vocabulary, grammar, reading, listening, speaking</li>
              <li className="flex items-start gap-2"><span className="text-indigo-500">→</span> Review words daily using spaced repetition in the Vocabulary tab</li>
              <li className="flex items-start gap-2"><span className="text-indigo-500">→</span> Track progress weekly and adjust goals monthly</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Daily Study Reminder</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminders.enabled}
                  onChange={e => handleRemindersChange('enabled', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-gray-900 dark:text-white font-medium">Enable daily study reminder</span>
              </label>
              {reminders.enabled && (
                <div className="ml-8 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reminder Time</label>
                    <input
                      type="time"
                      value={reminders.time}
                      onChange={e => handleRemindersChange('time', e.target.value)}
                      className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">
                    You'll receive a browser notification at this time each day to remind you to study.
                  </p>
                  <button
                    onClick={testNotification}
                    className="ml-8 px-4 py-2 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    Test Notification
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Permission</h2>
            <NotificationStatus />
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">This Week's Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProgressCard
                title="Study Time"
                current={weeklyProgress.minutes}
                target={goals.dailyMinutes * 7}
                unit="minutes"
                progress={minutesProgress}
                color="indigo"
              />
              <ProgressCard
                title="New Words"
                current={weeklyProgress.words}
                target={goals.weeklyWords}
                unit="words"
                progress={wordsProgress}
                color="green"
              />
              <ProgressCard
                title="Reading Sessions"
                current={weeklyProgress.reading}
                target={goals.weeklyReading}
                unit="sessions"
                progress={readingProgress}
                color="amber"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Streak Status</h2>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <span className="text-4xl">🔥</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.currentStreak} day streak</p>
                <p className="text-gray-500 dark:text-gray-400">Longest streak: {stats.longestStreak} days</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stats.currentStreak > 0 
                    ? 'Keep it up! Study today to maintain your streak.'
                    : 'Start a new streak by logging a study session today!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoalCard({ title, icon, value, unit, onChange, min, max, step }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))}
        className="w-24 px-3 py-2 text-center text-xl font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">{unit} per day/week</p>
    </div>
  );
}

function ProgressCard({ title, current, target, unit, progress, color }) {
  const colors = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div className="text-center">
      <h3 className="font-medium text-gray-900 dark:text-white mb-3">{title}</h3>
      <div className="relative w-32 h-32 mx-auto mb-3">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            className="dark:stroke-gray-600"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            stroke={colors[color]}
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(progress)}%</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {current} / {target} {unit}
      </p>
    </div>
  );
}

function NotificationStatus() {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermission(perm);
    }
  };

  if (permission === 'granted') {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-medium text-green-800 dark:text-green-300">Notifications enabled</p>
          <p className="text-sm text-green-600 dark:text-green-400">You'll receive daily study reminders</p>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <span className="text-2xl">❌</span>
        <div>
          <p className="font-medium text-red-800 dark:text-red-300">Notifications blocked</p>
          <p className="text-sm text-red-600 dark:text-red-400">Enable in browser settings to receive reminders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
      <span className="text-2xl">⚠️</span>
      <div>
        <p className="font-medium text-yellow-800 dark:text-yellow-300">Notifications not enabled</p>
        <p className="text-sm text-yellow-600 dark:text-yellow-400">Click below to allow daily reminders</p>
      </div>
      <button
        onClick={requestPermission}
        className="ml-auto px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
      >
        Allow Notifications
      </button>
    </div>
  );
}