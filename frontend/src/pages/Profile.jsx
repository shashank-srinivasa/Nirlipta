import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaCalendarCheck, FaHistory, FaCamera, FaEdit } from 'react-icons/fa';
import useAuthStore from '../store/authStore';
import { userAPI, enrollmentAPI } from '../services/api';

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
      alert('✅ Profile picture updated!');
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleBioUpdate = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateInstructorBio(bioData);
      updateUser({
        instructor_bio: bioData.instructor_bio,
        instructor_specialties: bioData.instructor_specialties,
        years_experience: bioData.years_experience,
      });
      setShowBioEditor(false);
      alert('✅ Bio updated!');
    } catch (err) {
      alert('Failed to update bio');
    }
  };

  const handleCancelEnrollment = async (enrollmentId) => {
    if (!confirm('Cancel this enrollment?')) return;
    
    try {
      await enrollmentAPI.cancel(enrollmentId);
      fetchEnrollments();
      alert('✅ Enrollment cancelled');
    } catch (err) {
      alert('Failed to cancel enrollment');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md text-center">
          <h2 className="text-2xl font-heading font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const upcomingEnrollments = enrollments.filter(e => 
    new Date(e.schedule?.start_time) > new Date()
  );

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
            <div className="flex items-center gap-6">
              {/* Avatar with Upload */}
              <div className="relative">
                {user?.avatar_url ? (
                  <img
                    src={`http://localhost:8080${user.avatar_url}`}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl">
                    👤
                  </div>
                )}

                {/* Upload Button */}
                <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                  <FaCamera />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="text-white text-xs">Uploading...</div>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                  {user?.name}
                </h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <FaEnvelope className="mr-2" />
                  <span>{user?.email}</span>
                </div>
                {user?.is_instructor && (
                  <span className="inline-block bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                    Instructor
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Instructor Bio Editor */}
          {user?.is_instructor && (
            <div className="card mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-heading font-bold text-gray-900">
                  Instructor Profile
                </h2>
                <button
                  onClick={() => setShowBioEditor(!showBioEditor)}
                  className="btn-outline text-sm flex items-center gap-2"
                >
                  <FaEdit />
                  {showBioEditor ? 'Cancel' : 'Edit Bio'}
                </button>
              </div>

              {showBioEditor ? (
                <form onSubmit={handleBioUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bioData.instructor_bio}
                      onChange={(e) => setBioData({...bioData, instructor_bio: e.target.value})}
                      rows="4"
                      className="input-field"
                      placeholder="Tell students about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialties (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={bioData.instructor_specialties.join(', ')}
                      onChange={(e) => setBioData({
                        ...bioData,
                        instructor_specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      className="input-field"
                      placeholder="Vinyasa, Hatha, Meditation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={bioData.years_experience}
                      onChange={(e) => setBioData({...bioData, years_experience: parseInt(e.target.value) || 0})}
                      min="0"
                      className="input-field"
                    />
                  </div>

                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </form>
              ) : (
                <div>
                  {user.instructor_bio ? (
                    <p className="text-gray-700 mb-4">{user.instructor_bio}</p>
                  ) : (
                    <p className="text-gray-500 italic mb-4">No bio added yet</p>
                  )}

                  {user.instructor_specialties && user.instructor_specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {user.instructor_specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="text-sm px-3 py-1 bg-primary-100 text-primary-700 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}

                  {user.years_experience > 0 && (
                    <p className="text-sm text-gray-600">
                      {user.years_experience} years of experience
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

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
                {upcomingEnrollments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No upcoming classes. Enroll in a class from the schedule!
                  </p>
                ) : (
                  upcomingEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {enrollment.schedule?.class?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(enrollment.schedule?.start_time).toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleCancelEnrollment(enrollment.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Cancel Enrollment
                      </button>
                    </div>
                  ))
                )}
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
                {enrollments.filter(e => new Date(e.schedule?.start_time) <= new Date()).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No completed classes yet
                  </p>
                ) : (
                  enrollments
                    .filter(e => new Date(e.schedule?.start_time) <= new Date())
                    .map((enrollment) => (
                      <div key={enrollment.id} className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {enrollment.schedule?.class?.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Completed on {new Date(enrollment.schedule?.start_time).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;