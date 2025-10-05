import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

const ScheduleManagement = () => {
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    class_id: '',
    start_time: '',
    end_time: '',
    recurrence_type: 'once',
    day_of_week: null,
    day_of_month: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, schedulesRes] = await Promise.all([
        adminAPI.getAllClasses(),
        adminAPI.getAllSchedules()
      ]);
      setClasses(classesRes.data || []);
      setSchedules(schedulesRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createSchedule(formData);
      setShowForm(false);
      setFormData({
        class_id: '',
        start_time: '',
        end_time: '',
        recurrence_type: 'once',
        day_of_week: null,
        day_of_month: null,
      });
      fetchData();
    } catch (err) {
      alert('Failed to create schedule');
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await adminAPI.deleteSchedule(scheduleId);
      fetchData();
    } catch (err) {
      alert('Failed to delete schedule');
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card max-w-2xl mx-auto"
      >
        <h2 className="text-2xl font-heading font-bold mb-6">
          Schedule a Class
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class *
            </label>
            <select
              value={formData.class_id}
              onChange={(e) => setFormData({...formData, class_id: e.target.value})}
              required
              className="input-field"
            >
              <option value="">Choose a class...</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.title} - {cls.instructor_name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              required
              className="input-field"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({...formData, end_time: e.target.value})}
              required
              className="input-field"
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repeat *
            </label>
            <select
              value={formData.recurrence_type}
              onChange={(e) => setFormData({...formData, recurrence_type: e.target.value})}
              className="input-field"
            >
              <option value="once">One Time Only</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <button type="submit" className="btn-primary flex-1">
              Create Schedule
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">
            Schedule Management
          </h1>
          <p className="text-gray-600 mt-1">
            Schedule classes for students to enroll
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus />
          Schedule Class
        </button>
      </div>

      {/* Schedules List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-gray-600">Loading schedules...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12 card">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No schedules yet
          </h3>
          <p className="text-gray-600 mb-4">
            Schedule your first class to let students enroll
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Schedule First Class
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule, index) => (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card flex justify-between items-center"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {schedule.class?.title || 'Class'}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt />
                    {formatDateTime(schedule.start_time)}
                  </span>
                  <span>→</span>
                  <span>{formatDateTime(schedule.end_time)}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {schedule.recurrence_type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Instructor: {schedule.class?.instructor_name}
                </p>
              </div>
              <button
                onClick={() => handleDelete(schedule.id)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <FaTrash />
                Delete
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
