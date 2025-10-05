import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCamera } from 'react-icons/fa';
import useAuthStore from '../store/authStore';
import { userAPI, enrollmentAPI } from '../services/api';
import { format, parseISO } from 'date-fns';

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [showBioEditor, setShowBioEditor] = useState(false);
  const [bioData, setBioData] = useState({
    instructor_bio: '',
    instructor_specialties: [],
    years_experience: 0,
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchEnrollments();
      if (user?.is_instructor) {
        setBioData({
          instructor_bio: user.instructor_bio || '',
          instructor_specialties: user.instructor_specialties || [],
          years_experience: user.years_experience || 0,
        });
      }
    }
  }, [isAuthenticated, user]);

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentAPI.getMyEnrollments();
      setEnrollments(response.data || []);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large (max 5MB)');
      return;
    }

    setUploading(true);

    try {
      const response = await userAPI.uploadAvatar(file);
      updateUser({ avatar_url: response.data.avatar_url });
      alert('Profile picture updated!');
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBio = async () => {
    try {
      const response = await userAPI.updateInstructorBio(bioData);
      updateUser(response.data);
      setShowBioEditor(false);
      alert('Bio updated successfully!');
    } catch (err) {
      alert('Failed to update bio');
    }
  };

  const handleCancelEnrollment = async (enrollmentId) => {
    if (window.confirm('Are you sure you want to cancel this enrollment?')) {
      try {
        await enrollmentAPI.cancel(enrollmentId);
        alert('Enrollment cancelled successfully!');
        fetchEnrollments();
      } catch (err) {
        alert('Failed to cancel enrollment');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md text-center px-8">
          <h2 className="text-h2 font-heading text-primary-900 mb-6">Sign In Required</h2>
          <p className="text-body text-primary-600 mb-8">Please sign in to view your profile.</p>
          <button 
            onClick={() => window.location.href = '/api/v1/auth/google'} 
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-6xl mx-auto px-8 lg:px-16">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row items-start gap-8 pb-12 border-b border-primary-200">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 relative">
                <img
                  src={user?.avatar_url ? `http://localhost:8080${user.avatar_url}` : '/default-avatar.png'}
                  alt={user?.name || 'User Avatar'}
                  className="w-full h-full object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-primary-900 text-white p-3 cursor-pointer hover:bg-primary-800 transition-colors">
                  <FaCamera className="text-sm" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {uploading && (
                <p className="text-xs text-primary-600 mt-2">Uploading...</p>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-h2 font-heading text-primary-900 mb-3">
                {user?.name || 'Your Name'}
              </h1>
              <p className="text-body text-primary-600 mb-4">
                {user?.email || 'email@example.com'}
              </p>
              {user?.is_instructor && (
                <span className="inline-block text-xs tracking-wider uppercase text-primary-700 border-b border-primary-300">
                  Instructor
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Instructor Bio Editor */}
        {user?.is_instructor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-h3 font-heading text-primary-900">
                Instructor Profile
              </h2>
              {!showBioEditor ? (
                <button
                  onClick={() => setShowBioEditor(true)}
                  className="btn-outline text-sm py-2 px-6"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowBioEditor(false)}
                    className="btn-outline text-sm py-2 px-6"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBio}
                    className="btn-primary text-sm py-2 px-6"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {showBioEditor ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm tracking-wider uppercase text-primary-700 mb-3">
                    Biography
                  </label>
                  <textarea
                    value={bioData.instructor_bio}
                    onChange={(e) => setBioData({ ...bioData, instructor_bio: e.target.value })}
                    rows="6"
                    className="input-field"
                    placeholder="Share your yoga journey..."
                  />
                </div>
                <div>
                  <label className="block text-sm tracking-wider uppercase text-primary-700 mb-3">
                    Specialties (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={bioData.instructor_specialties.join(', ')}
                    onChange={(e) => setBioData({ ...bioData, instructor_specialties: e.target.value.split(',').map(s => s.trim()) })}
                    className="input-field"
                    placeholder="Vinyasa, Hatha, Meditation"
                  />
                </div>
                <div>
                  <label className="block text-sm tracking-wider uppercase text-primary-700 mb-3">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={bioData.years_experience}
                    onChange={(e) => setBioData({ ...bioData, years_experience: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-primary-600">
                <div>
                  <h4 className="text-sm tracking-wider uppercase text-primary-700 mb-2">Biography</h4>
                  <p className="text-body leading-relaxed">{user?.instructor_bio || 'No bio yet.'}</p>
                </div>
                <div>
                  <h4 className="text-sm tracking-wider uppercase text-primary-700 mb-2">Specialties</h4>
                  <p className="text-body">{user?.instructor_specialties?.join(', ') || 'None specified.'}</p>
                </div>
                <div>
                  <h4 className="text-sm tracking-wider uppercase text-primary-700 mb-2">Experience</h4>
                  <p className="text-body">{user?.years_experience || '0'} years</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Enrollments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-h3 font-heading text-primary-900 mb-8">
            My Enrollments
          </h2>

          {enrollments.length === 0 ? (
            <p className="text-body text-primary-600">You haven't enrolled in any classes yet.</p>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="border border-primary-200 p-6 hover:border-primary-400 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-heading text-primary-900 mb-2">
                        {enrollment.Schedule.Class.title}
                      </h3>
                      <p className="text-body text-primary-600 mb-2">
                        {format(parseISO(enrollment.Schedule.start_time), 'EEEE, MMMM d')} at{' '}
                        {format(parseISO(enrollment.Schedule.start_time), 'h:mm a')}
                      </p>
                      <p className="text-sm text-primary-500">
                        Instructor: {enrollment.Schedule.Class.instructor_name}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCancelEnrollment(enrollment.id)}
                      className="text-sm text-red-600 hover:text-red-700 tracking-wider uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;