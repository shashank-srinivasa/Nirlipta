import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { schedulesAPI, enrollmentAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

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
      // If it's a 404 or empty response, just show empty state
      if (err.response?.status === 404 || !err.response) {
        setSchedules([]);
      } else {
        setError('Failed to fetch schedules. Please try again later.');
      }
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
    try {
      if (!startTime || !endTime) return 'Time TBD';
      const start = parseISO(startTime);
      const end = parseISO(endTime);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 'Time TBD';
      }
      return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
    } catch (err) {
      console.error('Error formatting time:', err);
      return 'Time TBD';
    }
  };

  const getFormattedDate = (startTime) => {
    try {
      if (!startTime) return 'Date TBD';
      const date = parseISO(startTime);
      if (isNaN(date.getTime())) {
        return 'Date TBD';
      }
      return format(date, 'EEEE, MMMM d');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Date TBD';
    }
  };

  const viewOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  // Filter schedules based on selected view
  const getFilteredSchedules = () => {
    const now = new Date();
    
    return schedules.filter(schedule => {
      try {
        if (!schedule.start_time) return false;
        const scheduleDate = parseISO(schedule.start_time);
        
        switch (view) {
          case 'daily':
            return isWithinInterval(scheduleDate, {
              start: startOfDay(now),
              end: endOfDay(now)
            });
          case 'weekly':
            return isWithinInterval(scheduleDate, {
              start: startOfWeek(now, { weekStartsOn: 0 }), // Sunday
              end: endOfWeek(now, { weekStartsOn: 0 })
            });
          case 'monthly':
            return isWithinInterval(scheduleDate, {
              start: startOfMonth(now),
              end: endOfMonth(now)
            });
          default:
            return true;
        }
      } catch (err) {
        console.error('Error filtering schedule:', err);
        return false;
      }
    });
  };

  const filteredSchedules = getFilteredSchedules();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-lg text-neutral-600">Loading schedules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-24 bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-heading text-neutral-900 mb-6">
              Class Schedule
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
              Find the perfect class for your journey
            </p>
          </motion.div>
        </div>
      </section>

      {/* View Toggle */}
      <section className="py-6 border-b border-neutral-200 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-center gap-8">
            {viewOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setView(option.value)}
                className={`text-sm tracking-wider uppercase transition-colors pb-2 font-medium ${
                  view === option.value
                    ? 'text-neutral-900 border-b-2 border-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

          {/* Classes List */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              {filteredSchedules.length === 0 ? (
            <div className="text-center py-20 card max-w-2xl mx-auto">
              <h3 className="text-3xl font-heading text-neutral-900 mb-4">
                No Classes Scheduled Yet
              </h3>
              <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto leading-relaxed">
                We're currently setting up our class schedule. Please check back soon or contact us for more information.
              </p>
              {isAuthenticated && (
                <p className="text-sm text-neutral-500">
                  Admins can add classes and schedules from the Admin Dashboard.
                </p>
              )}
            </div>
                 ) : (
                   <div className="space-y-4">
                     {filteredSchedules.map((scheduleItem, index) => {
                       // Safety checks for nested objects
                       const classData = scheduleItem?.class || scheduleItem?.Class || {};
                       const enrollments = scheduleItem?.enrollments || scheduleItem?.Enrollments || [];
                       const spotsAvailable = (classData.capacity || 0) - enrollments.length;

                       // Check if class has already started or passed
                       let hasStarted = false;
                       try {
                         if (scheduleItem.start_time) {
                           const startTime = parseISO(scheduleItem.start_time);
                           hasStarted = startTime <= new Date();
                         }
                       } catch (err) {
                         console.error('Error checking class start time:', err);
                       }

                       const canEnroll = spotsAvailable > 0 && !hasStarted;

                       return (
                         <motion.div
                           key={scheduleItem.id || index}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ duration: 0.4, delay: index * 0.05 }}
                           className="card hover:shadow-lg transition-all duration-300"
                         >
                           <div className="grid lg:grid-cols-12 gap-6">
                             {/* Date/Time */}
                             <div className="lg:col-span-3">
                               <p className="text-xs tracking-wider uppercase text-neutral-500 mb-2 font-medium">
                                 {getFormattedDate(scheduleItem.start_time)}
                               </p>
                               <p className="text-lg text-neutral-900 font-medium">
                                 {getFormattedTime(scheduleItem.start_time, scheduleItem.end_time)}
                               </p>
                             </div>

                             {/* Class Info */}
                             <div className="lg:col-span-6">
                               <h3 className="text-2xl font-heading text-neutral-900 mb-2">
                                 {classData.title || 'Untitled Class'}
                               </h3>
                               <p className="text-base text-neutral-600 mb-3 leading-relaxed">
                                 {classData.description || 'No description available'}
                               </p>
                               <div className="flex items-center gap-3 text-sm text-neutral-600">
                                 <span className="font-medium">
                                   Instructor: {classData.instructor_name || 'TBD'}
                                 </span>
                                 <span>•</span>
                                 <span className="uppercase tracking-wider text-xs">
                                   {classData.difficulty_level || 'All Levels'}
                                 </span>
                                 <span>•</span>
                                 <span>{classData.duration || 60} min</span>
                               </div>
                             </div>

                             {/* Enrollment */}
                             <div className="lg:col-span-3 flex flex-col justify-between items-end">
                               <div className="text-right mb-4">
                                 {hasStarted ? (
                                   <p className="text-sm text-neutral-500 font-medium">Class Started</p>
                                 ) : spotsAvailable > 0 ? (
                                   <p className="text-sm text-neutral-600">
                                     {spotsAvailable} spots available
                                   </p>
                                 ) : (
                                   <p className="text-sm text-red-600 font-medium">Class Full</p>
                                 )}
                               </div>
                               <button
                                 onClick={() => handleEnroll(scheduleItem.id)}
                                 disabled={!canEnroll}
                                 className={`px-6 py-2.5 text-sm tracking-wider uppercase transition-all duration-300 font-medium ${
                                   !canEnroll
                                     ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed rounded-lg'
                                     : 'btn-outline'
                                 }`}
                               >
                                 {hasStarted ? 'Started' : spotsAvailable <= 0 ? 'Full' : 'Enroll'}
                               </button>
                             </div>
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