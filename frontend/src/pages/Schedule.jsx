import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaUser, FaCalendarAlt } from 'react-icons/fa';

const Schedule = () => {
  const [view, setView] = useState('weekly'); // daily, weekly, monthly

  // Mock data - will be replaced with API data
  const classes = [
    {
      id: 1,
      title: 'Morning Vinyasa Flow',
      instructor: 'Maya Patel',
      time: '7:00 AM - 8:00 AM',
      day: 'Monday',
      duration: 60,
      level: 'All Levels',
      spots: 12,
    },
    {
      id: 2,
      title: 'Power Yoga',
      instructor: 'James Wilson',
      time: '6:00 PM - 7:30 PM',
      day: 'Monday',
      duration: 90,
      level: 'Intermediate',
      spots: 8,
    },
    {
      id: 3,
      title: 'Gentle Hatha',
      instructor: 'Sophia Lee',
      time: '9:00 AM - 10:00 AM',
      day: 'Tuesday',
      duration: 60,
      level: 'Beginner',
      spots: 15,
    },
    {
      id: 4,
      title: 'Meditation & Mindfulness',
      instructor: 'Sophia Lee',
      time: '7:30 AM - 8:30 AM',
      day: 'Wednesday',
      duration: 60,
      level: 'All Levels',
      spots: 20,
    },
  ];

  const viewOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

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

      {/* Schedule Controls */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {viewOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setView(option.value)}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    view === option.value
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select className="input-field py-2">
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <select className="input-field py-2">
                <option value="">All Instructors</option>
                <option value="maya">Maya Patel</option>
                <option value="james">James Wilson</option>
                <option value="sophia">Sophia Lee</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Classes Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="card hover:scale-105 transition-transform duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-heading font-semibold text-gray-900 mb-1">
                      {classItem.title}
                    </h3>
                    <span className="inline-block bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
                      {classItem.level}
                    </span>
                  </div>
                  <span className="text-2xl">🧘</span>
                </div>

                <div className="space-y-2 mb-4 text-gray-600">
                  <div className="flex items-center">
                    <FaUser className="mr-2 text-primary-600" />
                    <span>{classItem.instructor}</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-primary-600" />
                    <span>{classItem.day}</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2 text-primary-600" />
                    <span>{classItem.time}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    {classItem.spots} spots available
                  </span>
                  <button className="btn-primary text-sm py-2 px-4">
                    Enroll
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Schedule;

