"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Clock,
  Star,
  Calendar,
  Trash2,
  Square,
  CheckSquare,
} from 'lucide-react';

const isToday = (dateString) => {
  if (!dateString) return false;
  const today = new Date();
  const date = new Date(dateString);
  return date.toDateString() === today.toDateString();
};

const isOverdue = (dateString, completed) => {
  if (!dateString || completed) return false;
  const today = new Date();
  const date = new Date(dateString);
  return date < today;
};

const formatDate = (dateString) => {
  if (!dateString) return 'No due date';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'medium':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export default function StudyManager() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  useEffect(() => {
    const savedItems = localStorage.getItem('tasks');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  const addItem = () => {
    if (newItem.title.trim()) {
      const item = {
        id: Date.now(),
        ...newItem,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedItems = [item, ...items];
      setItems(updatedItems);
      localStorage.setItem("tasks", JSON.stringify(updatedItems));
      setNewItem({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
      });
      setShowNewItemForm(false);
    }
  };

  const updateItem = (id, updates) => {
    const updatedItems = items.map(item => 
      item.id === id 
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    );
    setItems(updatedItems);
    localStorage.setItem("tasks", JSON.stringify(updatedItems));
  };

  const deleteItem = (id) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    localStorage.setItem("tasks", JSON.stringify(updatedItems));
  };

  const toggleComplete = (id) => {
    updateItem(id, { completed: !items.find(t => t.id === id)?.completed });
  };

  const toggleStar = (id) => {
    updateItem(id, { starred: !items.find(t => t.id === id)?.starred });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      activeFilter === 'all' ||
      (activeFilter === 'completed' && item.completed) ||
      (activeFilter === 'pending' && !item.completed) ||
      (activeFilter === 'starred' && item.starred) ||
      (activeFilter === 'today' && isToday(item.dueDate)) ||
      (activeFilter === 'overdue' && isOverdue(item.dueDate, item.completed))
    return matchesSearch && matchesFilter;
  });

  const completedItems = items.filter(t => t.completed).length;
  const pendingItems = items.filter(t => !t.completed).length;
  const starredItems = items.filter(t => t.starred).length;
  const todayItems = items.filter(t => isToday(t.dueDate)).length;
  const overdueItems = items.filter(t => isOverdue(t.dueDate, t.completed)).length;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search assignments, classes, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowNewItemForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-white border-r shadow-sm flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Filter & Categories</h2>
            <div className="space-y-2">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveFilter('all')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                All Items ({items.length})
              </Button>
              <Button
                variant={activeFilter === 'pending' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveFilter('pending')}
              >
                <Square className="h-4 w-4 mr-2" />
                Pending ({pendingItems})
              </Button>
              <Button
                variant={activeFilter === 'completed' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveFilter('completed')}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Completed ({completedItems})
              </Button>
              <Button
                variant={activeFilter === 'starred' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveFilter('starred')}
              >
                <Star className="h-4 w-4 mr-2" />
                Important ({starredItems})
              </Button>
              <Button
                variant={activeFilter === 'today' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveFilter('today')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Due Today ({todayItems})
              </Button>
              <Button
                variant={activeFilter === 'overdue' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveFilter('overdue')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Overdue ({overdueItems})
              </Button>
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Study Stats</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Completion Rate:</span>
                <span className="font-medium">
                  {items.length > 0 ? Math.round((completedItems / items.length) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>This Week:</span>
                <span className="font-medium">
                  {items.filter(t => new Date(t.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {showNewItemForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add New Study Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Title (e.g., Learn React)..."
                      value={newItem.title}
                      onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Description or notes (optional)..."
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={newItem.priority}
                        onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={newItem.dueDate}
                        onChange={(e) => setNewItem(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowNewItemForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={addItem}>
                      Add Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeFilter === 'all' && 'All Study Items'}
                  {activeFilter === 'completed' && 'Completed Items'}
                  {activeFilter === 'pending' && 'Pending Items'}
                  {activeFilter === 'starred' && 'Important Items'}
                  {activeFilter === 'today' && 'Due Today'}
                  {activeFilter === 'overdue' && 'Overdue Items'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className={`hover:shadow-lg transition-all ${item.completed ? 'opacity-75' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <button
                        onClick={() => toggleComplete(item.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {item.completed ? (
                          <CheckSquare className="h-5 w-5 text-green-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`text-lg font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className={`text-sm mt-1 ${item.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => toggleStar(item.id)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Star className={`h-4 w-4 ${item.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                            </button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-3">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(item.priority)}`}>
                            {item.priority} priority
                          </span>
                          <span className={`text-xs ${isOverdue(item.dueDate, item.completed) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            Due: {formatDate(item.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No study items found</h3>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}