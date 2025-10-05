import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { adminAPI, enrollmentAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await adminAPI.getAllSchedules();
      setSchedules(response.data || []);
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (scheduleId) => {
    if (!isAuthenticated) {
      alert('Please sign in to enroll in classes');
      return;
    }

    setEnrolling(scheduleId);
    try {
      await enrollmentAPI.enroll(scheduleId);
      alert('✅ Successfully enrolled!');
      fetchSchedules(); // Refresh to update spots
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to enroll');
    } finally {
      setEnrolling(null);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'long' }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getAvailableSpots = (schedule) => {
    const capacity = schedule.class?.capacity || 0;
    const enrolled = schedule.enrollments?.length || 0;
    return capacity - enrolled;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Class Schedule
            </h1>
            <p className="text-xl text-gray-600">
              Find the perfect class for your schedule
            </p>
          </motion.div>
        </div>
      </section>

      {/* Classes Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🧘</div>
              <p className="text-gray-600">Loading classes...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 card max-w-md mx-auto">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No classes scheduled yet
              </h3>
              <p className="text-gray-600">
                Check back soon for upcoming classes!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schedules.map((schedule, index) => {
                const startTime = formatDateTime(schedule.start_time);
                const endTime = formatDateTime(schedule.end_time);
                const availableSpots = getAvailableSpots(schedule);
                const isFull = availableSpots <= 0;

                return (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="card hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-heading font-semibold text-gray-900 mb-1">
                          {schedule.class?.title || 'Class'}
                        </h3>
                        <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                          schedule.class?.difficulty_level === 'beginner' ? 'bg-green-100 text-green-700' :
                          schedule.class?.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {schedule.class?.difficulty_level || 'All Levels'}
                        </span>
                      </div>
                      <span className="text-2xl">🧘</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {schedule.class?.description}
                    </p>

                    <div className="space-y-2 mb-4 text-gray-600 text-sm">
                      <div className="flex items-center">
                        <FaUser className="mr-2 text-primary-600" />
                        <span>{schedule.class?.instructor_name}</span>
                      </div>
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-primary-600" />
                        <span>{startTime.day}, {startTime.date}</span>
                      </div>
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-primary-600" />
                        <span>{startTime.time} - {endTime.time}</span>
                      </div>
                      {schedule.recurrence_type !== 'once' && (
                        <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block">
                          Repeats {schedule.recurrence_type}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className={`text-sm font-medium ${
                        isFull ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {isFull ? 'Class Full' : `${availableSpots} spots left`}
                      </span>
                      <button
                        onClick={() => handleEnroll(schedule.id)}
                        disabled={isFull || enrolling === schedule.id}
                        className={`text-sm py-2 px-4 rounded-lg font-medium transition-colors ${
                          isFull
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'btn-primary'
                        }`}
                      >
                        {enrolling === schedule.id ? 'Enrolling...' : isFull ? 'Full' : 'Enroll'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Schedule;