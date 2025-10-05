import { motion } from 'framer-motion';
import { FaEnvelope, FaCalendarCheck, FaHistory } from 'react-icons/fa';
import useAuthStore from '../store/authStore';

const Profile = () => {
  const { user, isAuthenticated } = useAuthStore();

  // Mock upcoming classes
  const upcomingClasses = [
    { id: 1, title: 'Morning Vinyasa Flow', date: 'Mon, Oct 7', time: '7:00 AM' },
    { id: 2, title: 'Power Yoga', date: 'Mon, Oct 7', time: '6:00 PM' },
    { id: 3, title: 'Meditation & Mindfulness', date: 'Wed, Oct 9', time: '7:30 AM' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md text-center">
          <h2 className="text-2xl font-heading font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
          <button className="btn-primary">Sign In with Google</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Header */}
          <div className="card mb-8">
            <div className="flex items-center">
              <div className="text-6xl mr-6">👤</div>
              <div className="flex-1">
                <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                  {user?.name || 'Your Name'}
                </h1>
                <div className="flex items-center text-gray-600">
                  <FaEnvelope className="mr-2" />
                  <span>{user?.email || 'email@example.com'}</span>
                </div>
              </div>
              <button className="btn-outline">Edit Profile</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upcoming Classes */}
            <div className="card">
              <div className="flex items-center mb-6">
                <FaCalendarCheck className="text-2xl text-primary-600 mr-3" />
                <h2 className="text-2xl font-heading font-bold text-gray-900">
                  Upcoming Classes
                </h2>
              </div>
              <div className="space-y-4">
                {upcomingClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">{classItem.title}</h3>
                    <p className="text-sm text-gray-600">
                      {classItem.date} at {classItem.time}
                    </p>
                    <button className="mt-2 text-sm text-red-600 hover:text-red-700">
                      Cancel Enrollment
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Class History */}
            <div className="card">
              <div className="flex items-center mb-6">
                <FaHistory className="text-2xl text-secondary-600 mr-3" />
                <h2 className="text-2xl font-heading font-bold text-gray-900">
                  Class History
                </h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-1">Gentle Hatha</h3>
                  <p className="text-sm text-gray-600">Completed on Oct 3, 2025</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-1">Power Yoga</h3>
                  <p className="text-sm text-gray-600">Completed on Oct 2, 2025</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-1">Morning Vinyasa Flow</h3>
                  <p className="text-sm text-gray-600">Completed on Sep 30, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;

