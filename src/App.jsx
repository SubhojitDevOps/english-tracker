import { useState, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { StudyLog } from './components/StudyLog';
import { VocabularyManager } from './components/VocabularyManager';
import { ProgressDashboard } from './components/ProgressDashboard';
import { GoalsReminders } from './components/GoalsReminders';
import { ResourcesLibrary } from './components/ResourcesLibrary';
import { Navigation } from './components/Navigation';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'study-log', label: 'Study Log', icon: '📝' },
  { id: 'vocabulary', label: 'Vocabulary', icon: '📚' },
  { id: 'goals', label: 'Goals', icon: '🎯' },
  { id: 'resources', label: 'Resources', icon: '🔗' },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isLoaded } = useData();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <ProgressDashboard />}
        {activeTab === 'study-log' && <StudyLog />}
        {activeTab === 'vocabulary' && <VocabularyManager />}
        {activeTab === 'goals' && <GoalsReminders />}
        {activeTab === 'resources' && <ResourcesLibrary />}
      </main>
    </div>
  );
}

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;