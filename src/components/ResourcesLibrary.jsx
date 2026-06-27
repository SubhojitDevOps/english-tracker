import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

const resourceTypes = [
  { value: 'article', label: '📄 Article', color: 'blue' },
  { value: 'video', label: '🎥 Video', color: 'red' },
  { value: 'course', label: '📚 Course', color: 'purple' },
  { value: 'podcast', label: '🎧 Podcast', color: 'green' },
  { value: 'book', label: '📖 Book', color: 'amber' },
  { value: 'app', label: '📱 App', color: 'indigo' },
  { value: 'website', label: '🌐 Website', color: 'pink' },
  { value: 'other', label: '📌 Other', color: 'gray' },
];

const statuses = [
  { value: 'to-study', label: 'To Study', color: 'gray' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'reference', label: 'Reference', color: 'amber' },
];

export function ResourcesLibrary() {
  const { data, resourcesActions } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    type: 'article',
    status: 'to-study',
    tags: '',
    notes: '',
    rating: 0,
  });
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      type: 'article',
      status: 'to-study',
      tags: '',
      notes: '',
      rating: 0,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const resource = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      rating: parseInt(formData.rating) || 0,
    };

    if (editingResource) {
      resourcesActions.update(editingResource.id, resource);
    } else {
      resourcesActions.add(resource);
    }
    setShowForm(false);
    setEditingResource(null);
    resetForm();
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      ...resource,
      tags: resource.tags.join(', '),
      rating: resource.rating || 0,
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this resource?')) {
      resourcesActions.delete(id);
    }
  };

  const filteredResources = data.resources
    .filter(r => {
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && 
          !r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const typeColors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  };

  const statusColors = {
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resources Library</h1>
          <p className="text-gray-600 dark:text-gray-400">Save and organize your English learning resources</p>
        </div>
        <button
          onClick={() => { setEditingResource(null); resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          + Add Resource
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingResource ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {resourceTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {statuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="vocabulary, intermediate, phrasal verbs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                <select
                  value={formData.rating}
                  onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {[0, 1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n === 0 ? 'No rating' : '★'.repeat(n) + '☆'.repeat(5 - n)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Key takeaways, why you saved this, difficulty level..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingResource(null); resetForm(); }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                {editingResource ? 'Update' : 'Save Resource'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search resources..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="all">All Types</option>
                {resourceTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="all">All Statuses</option>
                {statuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📌</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {data.resources.length === 0 ? 'No resources saved yet' : 'No resources match your filters'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {data.resources.length === 0 
                ? 'Add articles, videos, courses, and more to build your learning library!' 
                : 'Try adjusting your filters or search terms'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredResources.map(resource => (
              <div key={resource.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: getTypeColor(resource.type) }}>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {resource.url ? (
                              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                {resource.title}
                              </a>
                            ) : (
                              resource.title
                            )}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[getTypeColorClass(resource.type)]}`}>
                            {resourceTypes.find(t => t.value === resource.type)?.label || resource.type}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[getStatusColorClass(resource.status)]}`}>
                            {statuses.find(s => s.value === resource.status)?.label || resource.status}
                          </span>
                          {resource.rating > 0 && (
                            <span className="text-yellow-600 dark:text-yellow-400">
                              {'★'.repeat(resource.rating)}{'☆'.repeat(5 - resource.rating)}
                            </span>
                          )}
                        </div>
                        
                        {resource.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {resource.tags.slice(0, 5).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                            {resource.tags.length > 5 && (
                              <span className="px-2 py-0.5 text-gray-500 dark:text-gray-400 text-xs">
                                +{resource.tags.length - 5} more
                              </span>
                            )}
                          </div>
                        )}

                        {resource.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{resource.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Added: {new Date(resource.createdAt).toLocaleDateString()}</span>
                      {resource.url && (
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                          Open →
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 sm:ml-auto">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
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
    </div>
  );
}

function getTypeColor(type) {
  const colors = {
    article: '#3b82f6',
    video: '#ef4444',
    course: '#a855f7',
    podcast: '#10b981',
    book: '#f59e0b',
    app: '#6366f1',
    website: '#ec4899',
    other: '#6b7280',
  };
  return colors[type] || colors.other;
}

function getTypeColorClass(type) {
  const classes = {
    article: 'blue',
    video: 'red',
    course: 'purple',
    podcast: 'green',
    book: 'amber',
    app: 'indigo',
    website: 'pink',
    other: 'gray',
  };
  return classes[type] || classes.other;
}

function getStatusColorClass(status) {
  const classes = {
    'to-study': 'gray',
    'in-progress': 'blue',
    'completed': 'green',
    'reference': 'amber',
  };
  return classes[status] || classes['to-study'];
}