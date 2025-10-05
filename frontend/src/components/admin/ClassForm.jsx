import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { instructorAPI } from '../../services/api';

const ClassForm = ({ initialData = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    instructor_name: initialData?.instructor_name || '',
    duration: initialData?.duration || 60,
    capacity: initialData?.capacity || 15,
    difficulty_level: initialData?.difficulty_level || 'beginner',
    image_url: initialData?.image_url || '',
  });

  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await instructorAPI.getAll();
        setInstructors(response.data || []);
      } catch (err) {
        console.error('Failed to fetch instructors:', err);
      }
    };
    fetchInstructors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'capacity' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to save class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card max-w-2xl mx-auto"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-heading font-bold mb-6">
        {initialData ? 'Edit Class' : 'Create New Class'}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="e.g., Morning Vinyasa Flow"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="input-field"
            placeholder="Describe the class, what students will learn, and what to expect..."
          />
        </div>

        {/* Instructor */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            Instructor *
          </label>
          {instructors.length > 0 ? (
            <select
              name="instructor_name"
              value={formData.instructor_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-base"
            >
              <option value="">Select an instructor...</option>
              {instructors.map(instructor => (
                <option key={instructor.id} value={instructor.name}>
                  {instructor.name}
                  {instructor.years_experience > 0 && ` (${instructor.years_experience} yrs exp)`}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>No instructors available.</strong> Please mark at least one user as an instructor in the Users tab first.
              </p>
            </div>
          )}
        </div>

        {/* Duration and Capacity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="15"
              max="180"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (students) *
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
              max="50"
              className="input-field"
            />
          </div>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level *
          </label>
          <select
            name="difficulty_level"
            value={formData.difficulty_level}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Image URL (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL (optional)
          </label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="input-field"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading ? 'Saving...' : initialData ? 'Update Class' : 'Create Class'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline flex-1"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
};

export default ClassForm;
