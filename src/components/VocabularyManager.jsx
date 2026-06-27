import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

export function VocabularyManager() {
  const { vocabulary, vocabularyActions } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [formData, setFormData] = useState({
    word: '',
    definition: '',
    example: '',
    category: '',
    pronunciation: '',
    synonyms: '',
    antonyms: '',
  });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const vocabList = Array.isArray(vocabulary) ? vocabulary : [];
  const categories = [...new Set(vocabList.map(w => w.category).filter(Boolean))];

  useEffect(() => {
    if (reviewMode) {
      const dueWords = vocabularyActions.getForReview();
      setReviewQueue(dueWords);
      setCurrentReviewIndex(0);
      setShowAnswer(false);
    }
  }, [reviewMode, vocabList]);

  const resetForm = () => {
    setFormData({
      word: '',
      definition: '',
      example: '',
      category: '',
      pronunciation: '',
      synonyms: '',
      antonyms: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.word.trim() || !formData.definition.trim()) return;

    if (editingWord) {
      vocabularyActions.update(editingWord.id, formData);
    } else {
      vocabularyActions.add(formData);
    }
    setShowForm(false);
    setEditingWord(null);
    resetForm();
  };

  const handleEdit = (word) => {
    setEditingWord(word);
    setFormData({
      word: word.word,
      definition: word.definition,
      example: word.example || '',
      category: word.category || '',
      pronunciation: word.pronunciation || '',
      synonyms: word.synonyms || '',
      antonyms: word.antonyms || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this word?')) {
      vocabularyActions.delete(id);
    }
  };

  const filteredWords = vocabList
    .filter(w => {
      if (filter === 'learning') return w.mastery < 100;
      if (filter === 'mastered') return w.mastery === 100;
      return true;
    })
    .filter(w => 
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.definition.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const currentReview = reviewQueue[currentReviewIndex];

  const handleReviewAnswer = (correct) => {
    if (currentReview) {
      vocabularyActions.markReviewed(currentReview.id, correct);
      setShowAnswer(false);
      if (currentReviewIndex < reviewQueue.length - 1) {
        setCurrentReviewIndex(i => i + 1);
      } else {
        setReviewMode(false);
      }
    }
  };

  const masteryColor = (mastery) => {
    if (mastery === 100) return 'bg-green-500';
    if (mastery >= 70) return 'bg-yellow-500';
    if (mastery >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vocabulary Manager</h1>
          <p className="text-gray-600 dark:text-gray-400">Build and review your English vocabulary</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setReviewMode(true); setShowForm(false); }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            🎯 Start Review ({vocabularyActions.getForReview().length})
          </button>
          <button
            onClick={() => { setEditingWord(null); resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            + Add Word
          </button>
        </div>
      </div>

      {reviewMode && currentReview && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Word {currentReviewIndex + 1} of {reviewQueue.length}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentReviewIndex + 1) / reviewQueue.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {currentReview.word}
            </div>
            {currentReview.pronunciation && (
              <div className="text-lg text-gray-500 dark:text-gray-400 mb-4">
                /{currentReview.pronunciation}/
              </div>
            )}
          </div>

          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full py-4 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              Show Answer
            </button>
          ) : (
            <div className="space-y-4">
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">{currentReview.definition}</div>
                {currentReview.example && (
                  <div className="text-gray-600 dark:text-gray-400 italic mt-2">"{currentReview.example}"</div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReviewAnswer(false)}
                  className="flex-1 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Again
                </button>
                <button
                  onClick={() => handleReviewAnswer(true)}
                  className="flex-1 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setReviewMode(false)}
            className="mt-4 w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Exit Review
          </button>
        </div>
      )}

      {showForm && !reviewMode && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingWord ? 'Edit Word' : 'Add New Word'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Word *</label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={e => setFormData({ ...formData, word: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pronunciation (IPA)</label>
                <input
                  type="text"
                  value={formData.pronunciation}
                  onChange={e => setFormData({ ...formData, pronunciation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="/wɜːrd/"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Definition *</label>
              <textarea
                value={formData.definition}
                onChange={e => setFormData({ ...formData, definition: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Example Sentence</label>
              <textarea
                value={formData.example}
                onChange={e => setFormData({ ...formData, example: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map(cat => <option key={cat} value={cat} />)}
                  <option value="Vocabulary" />
                  <option value="Idioms" />
                  <option value="Phrasal Verbs" />
                  <option value="Academic" />
                  <option value="Business" />
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Synonyms (comma separated)</label>
                <input
                  type="text"
                  value={formData.synonyms}
                  onChange={e => setFormData({ ...formData, synonyms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Antonyms (comma separated)</label>
              <input
                type="text"
                value={formData.antonyms}
                onChange={e => setFormData({ ...formData, antonyms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingWord(null); resetForm(); }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                {editingWord ? 'Update' : 'Add Word'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!reviewMode && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search words..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'learning', 'mastered'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    filter === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filteredWords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {search ? 'No words found' : 'No vocabulary yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {search ? 'Try a different search term' : 'Add your first word to start building vocabulary!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredWords.map(word => (
                <div key={word.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="font-semibold text-lg text-gray-900 dark:text-white">
                          {word.word}
                        </div>
                        {word.pronunciation && (
                          <span className="text-gray-500 dark:text-gray-400 text-sm">/{word.pronunciation}/</span>
                        )}
                        <div className={`w-2 h-2 rounded-full ${masteryColor(word.mastery)}`} title={`${word.mastery}% mastered`} />
                        {word.category && (
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs">
                            {word.category}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          word.mastery === 100 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          word.mastery >= 70 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                          'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                        }`}>
                          {word.mastery === 100 ? 'Mastered' : word.mastery >= 70 ? 'Learning' : 'New'}
                        </span>
                      </div>
                      <div className="mt-2 text-gray-700 dark:text-gray-300">
                        <p className="font-medium">{word.definition}</p>
                        {word.example && (
                          <p className="text-sm italic text-gray-500 dark:text-gray-400 mt-1">"{word.example}"</p>
                        )}
                        {(word.synonyms || word.antonyms) && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            {word.synonyms && <p><strong>Synonyms:</strong> {word.synonyms}</p>}
                            {word.antonyms && <p><strong>Antonyms:</strong> {word.antonyms}</p>}
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-4">
                        <span>Reviews: {word.reviewCount}</span>
                        {word.lastReviewed && (
                          <span>Last: {new Date(word.lastReviewed).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(word)}
                        className="px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(word.id)}
                        className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}