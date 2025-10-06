import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

const ScheduleManagement = () => {
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Get tomorrow's date as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    class_id: '',
    date: defaultDate,
    start_time: '09:00',
    end_time: '10:00',
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
      // Combine date and time into ISO 8601 format
      const startDateTime = new Date(`${formData.date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.date}T${formData.end_time}`);
      
      const payload = {
        class_id: formData.class_id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        recurrence_type: formData.recurrence_type,
        day_of_week: formData.day_of_week,
        day_of_month: formData.day_of_month,
      };

      console.log('Creating schedule with payload:', payload);
      
      await adminAPI.createSchedule(payload);
      
      alert('Schedule created successfully!');
      setShowForm(false);
      
      // Reset with smart defaults
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        class_id: '',
        date: tomorrow.toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        recurrence_type: 'once',
        day_of_week: null,
        day_of_month: null,
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create schedule:', err);
      const errorMessage = err.response?.data?.error || 'Failed to create schedule. Please try again.';
      alert(errorMessage);
    }
  };
  
  // Auto-calculate end time based on class duration
  const handleClassChange = (classId) => {
    setFormData({...formData, class_id: classId});
    
    const selectedClass = classes.find(c => c.id === classId);
    if (selectedClass && formData.start_time) {
      // Calculate end time based on duration
      const [hours, minutes] = formData.start_time.split(':');
      const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
      const endMinutes = startMinutes + selectedClass.duration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      setFormData(prev => ({
        ...prev,
        class_id: classId,
        end_time: `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
      }));
    }
  };
  
  // Auto-update end time when start time changes
  const handleStartTimeChange = (time) => {
    setFormData(prev => ({...prev, start_time: time}));
    
    const selectedClass = classes.find(c => c.id === formData.class_id);
    if (selectedClass) {
      const [hours, minutes] = time.split(':');
      const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
      const endMinutes = startMinutes + selectedClass.duration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      setFormData(prev => ({
        ...prev,
        start_time: time,
        end_time: `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
      }));
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
    const selectedClass = classes.find(c => c.id === formData.class_id);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-6">
          <h2 className="text-3xl font-heading font-bold text-neutral-900 mb-2">
            Schedule a Class
          </h2>
          <p className="text-neutral-600">
            Create a new class session for students to enroll
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Class - Enhanced */}
          <div className="card">
            <label className="block text-sm font-medium text-neutral-900 mb-3">
              Select Class *
            </label>
            <select
              value={formData.class_id}
              onChange={(e) => handleClassChange(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-base"
            >
              <option value="">Choose a class...</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.title} • {cls.instructor_name} • {cls.duration} min
                </option>
              ))}
            </select>
            {selectedClass && (
              <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-sm text-neutral-600">
                <p><span className="font-medium">Duration:</span> {selectedClass.duration} minutes</p>
                <p><span className="font-medium">Level:</span> {selectedClass.difficulty_level}</p>
                <p><span className="font-medium">Capacity:</span> {selectedClass.capacity} students</p>
                <p className="mt-2 text-xs text-neutral-500">💡 End time will be auto-calculated based on duration</p>
              </div>
            )}
          </div>

          {/* Date & Time Section */}
          <div className="card">
            <h3 className="text-sm font-medium text-neutral-900 mb-4">Date & Time</h3>
            
            {/* Date */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-600 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-base"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Start Time */}
              <div>
                <label className="block text-sm text-neutral-600 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-base"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm text-neutral-600 mb-2">
                  End Time * {selectedClass && <span className="text-xs text-neutral-500">(auto-calculated)</span>}
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  required
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-base"
                />
              </div>
            </div>
          </div>

          {/* Recurrence Section */}
          <div className="card">
            <label className="block text-sm font-medium text-neutral-900 mb-3">
              Recurrence
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'once', label: 'One Time' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({...formData, recurrence_type: option.value})}
                  className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                    formData.recurrence_type === option.value
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button 
              type="submit" 
              className="bg-neutral-900 text-white px-8 py-3 rounded-lg hover:bg-neutral-700 transition-colors flex-1 font-medium text-base"
            >
              Create Schedule
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border-2 border-neutral-300 text-neutral-700 px-8 py-3 rounded-lg hover:bg-neutral-50 transition-colors flex-1 font-medium text-base"
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
          <h1 className="text-3xl font-heading font-bold text-neutral-900">
            Schedule Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Schedule classes for students to enroll
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-neutral-900 text-white px-6 py-3 rounded-lg hover:bg-neutral-700 transition-colors flex items-center gap-2 font-medium"
        >
          <FaPlus />
          Schedule Class
        </button>
      </div>

      {/* Schedules List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg text-neutral-600">Loading schedules...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-16 card">
          <h3 className="text-2xl font-heading font-semibold text-neutral-900 mb-3">
            No schedules yet
          </h3>
          <p className="text-neutral-600 mb-6">
            Schedule your first class to let students enroll
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-neutral-900 text-white px-6 py-3 rounded-lg hover:bg-neutral-700 transition-colors font-medium"
          >
            Schedule Class
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
              className="card flex justify-between items-center hover:shadow-lg transition-all"
            >
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-2">
                  {schedule.class?.title || 'Class'}
                </h3>
                <div className="flex items-center gap-4 text-sm text-neutral-600">
                  <span className="flex items-center gap-2">
                    <FaCalendarAlt />
                    {formatDateTime(schedule.start_time)}
                  </span>
                  <span>→</span>
                  <span>{formatDateTime(schedule.end_time)}</span>
                  <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs uppercase tracking-wider font-medium">
                    {schedule.recurrence_type}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-2">
                  <span className="font-medium">Instructor:</span> {schedule.class?.instructor_name}
                </p>
              </div>
              <button
                onClick={() => handleDelete(schedule.id)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 font-medium"
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
