import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { schedulesAPI, enrollmentAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { format, parseISO } from 'date-fns';

const Schedule = () => {
  const [view, setView] = useState('weekly');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await schedulesAPI.getAll();
      setSchedules(response.data || []);
    } catch (err) {
      setError('Failed to fetch schedules. Please try again later.');
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (scheduleId) => {
    if (!isAuthenticated) {
      alert('Please sign in to enroll in a class.');
      return;
    }
    try {
      await enrollmentAPI.enroll(scheduleId);
      alert('Enrolled successfully!');
      fetchSchedules();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to enroll in class.';
      alert(errorMessage);
      console.error('Error enrolling:', err);
    }
  };

  const getFormattedTime = (startTime, endTime) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  const getFormattedDate = (startTime) => {
    const date = parseISO(startTime);
    return format(date, 'EEEE, MMMM d');
  };

  const viewOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-primary-600">Loading schedules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-32 bg-primary-50">
        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-h1 font-heading text-primary-900 mb-8">
              Class Schedule
            </h1>
            <p className="text-body-lg text-primary-600">
              Find the perfect class for your journey
            </p>
          </motion.div>
        </div>
      </section>

      {/* View Toggle */}
      <section className="py-8 border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex justify-center gap-8">
            {viewOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setView(option.value)}
                className={`text-sm tracking-wider uppercase transition-colors pb-2 ${
                  view === option.value
                    ? 'text-primary-900 border-b-2 border-primary-900'
                    : 'text-primary-600 hover:text-primary-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Classes List */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          {schedules.length === 0 ? (
            <div className="text-center text-primary-600 py-20">
              <p className="text-body-lg">No classes scheduled yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {schedules.map((scheduleItem, index) => (
                <motion.div
                  key={scheduleItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="border border-primary-200 hover:border-primary-400 transition-all duration-300"
                >
                  <div className="grid lg:grid-cols-12 gap-8 p-8">
                    {/* Date/Time */}
                    <div className="lg:col-span-3">
                      <p className="text-sm tracking-wider uppercase text-primary-500 mb-2">
                        {getFormattedDate(scheduleItem.start_time)}
                      </p>
                      <p className="text-body text-primary-900">
                        {getFormattedTime(scheduleItem.start_time, scheduleItem.end_time)}
                      </p>
                    </div>

                    {/* Class Info */}
                    <div className="lg:col-span-6">
                      <h3 className="text-2xl font-heading text-primary-900 mb-3">
                        {scheduleItem.Class.title}
                      </h3>
                      <p className="text-body text-primary-600 mb-3">
                        {scheduleItem.Class.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-primary-600">
                        <span>Instructor: {scheduleItem.Class.instructor_name}</span>
                        <span>•</span>
                        <span className="uppercase tracking-wider">{scheduleItem.Class.difficulty_level}</span>
                        <span>•</span>
                        <span>{scheduleItem.Class.duration} min</span>
                      </div>
                    </div>

                    {/* Enrollment */}
                    <div className="lg:col-span-3 flex flex-col justify-between items-end">
                      <div className="text-right mb-4">
                        {scheduleItem.Class.capacity - scheduleItem.Enrollments.length > 0 ? (
                          <p className="text-sm text-primary-600">
                            {scheduleItem.Class.capacity - scheduleItem.Enrollments.length} spots available
                          </p>
                        ) : (
                          <p className="text-sm text-red-600">Class Full</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleEnroll(scheduleItem.id)}
                        disabled={scheduleItem.Class.capacity - scheduleItem.Enrollments.length <= 0}
                        className={`px-8 py-3 text-sm tracking-wider uppercase transition-all duration-300 ${
                          scheduleItem.Class.capacity - scheduleItem.Enrollments.length <= 0
                            ? 'bg-primary-200 text-primary-500 cursor-not-allowed'
                            : 'bg-primary-900 text-white hover:bg-transparent hover:text-primary-900 border border-primary-900'
                        }`}
                      >
                        {scheduleItem.Class.capacity - scheduleItem.Enrollments.length <= 0 ? 'Full' : 'Enroll'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Schedule;