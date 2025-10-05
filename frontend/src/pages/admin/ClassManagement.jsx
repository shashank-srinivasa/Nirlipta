import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import ClassForm from '../../components/admin/ClassForm';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await adminAPI.getAllClasses();
      setClasses(response.data || []);
    } catch (err) {
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    await adminAPI.createClass(formData);
    setShowForm(false);
    fetchClasses();
  };

  const handleUpdate = async (formData) => {
    await adminAPI.updateClass(editingClass.id, formData);
    setEditingClass(null);
    setShowForm(false);
    fetchClasses();
  };

  const handleDelete = async (classId) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    
    try {
      await adminAPI.deleteClass(classId);
      fetchClasses();
    } catch (err) {
      alert('Failed to delete class');
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClass(null);
  };

  if (showForm) {
    return (
      <ClassForm
        initialData={editingClass}
        onSubmit={editingClass ? handleUpdate : handleCreate}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">
            Class Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage yoga classes
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus />
          Add New Class
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Classes Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🧘</div>
          <p className="text-gray-600">Loading classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12 card">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No classes yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first yoga class to get started
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Create First Class
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem, index) => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-xl transition-shadow"
            >
              {/* Class Info */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-heading font-semibold text-gray-900">
                    {classItem.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    classItem.difficulty_level === 'beginner' ? 'bg-green-100 text-green-700' :
                    classItem.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {classItem.difficulty_level}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {classItem.description}
                </p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>👤 {classItem.instructor_name}</p>
                  <p>⏱️ {classItem.duration} minutes</p>
                  <p>👥 Capacity: {classItem.capacity} students</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(classItem)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <FaEdit />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(classItem.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
