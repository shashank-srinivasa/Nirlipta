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
        const errorMessage = err.response?.data?.error || 'Failed to cancel enrollment';
        const minutesUntil = err.response?.data?.minutes_until_class;
        
        if (minutesUntil !== undefined) {
          alert(`${errorMessage}\n\nClass starts in ${minutesUntil} minutes. Cancellations must be made at least 1 hour before class.`);
        } else {
          alert(errorMessage);
        }
        console.error('Failed to cancel enrollment:', err);
      }
    }
  };
  
  // Check if enrollment can be cancelled (more than 1 hour before class)
  const canCancelEnrollment = (startTime) => {
    if (!startTime) return true; // Allow if no start time
    try {
      const classStart = parseISO(startTime);
      const now = new Date();
      const hoursUntilClass = (classStart - now) / (1000 * 60 * 60);
      return hoursUntilClass > 1 || hoursUntilClass < 0; // Allow if >1 hour or class passed
    } catch (err) {
      return true; // Allow on error
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md text-center px-8">
          <h2 className="text-4xl font-heading text-neutral-900 mb-6">Sign In Required</h2>
          <p className="text-lg text-neutral-600 mb-8">Please sign in to view your profile.</p>
          <button 
            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/auth/google`} 
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
          <div className="flex flex-col md:flex-row items-start gap-8 pb-12 border-b border-neutral-200">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 relative">
                {user?.avatar_url ? (
                  <img
                    src={`http://localhost:8080${user.avatar_url}`}
                    alt={user?.name || 'User Avatar'}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center">
                    <span className="text-4xl font-heading text-white">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-neutral-900 text-white p-3 rounded-full cursor-pointer hover:bg-neutral-700 transition-colors shadow-lg">
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
                <p className="text-xs text-neutral-600 mt-2">Uploading...</p>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-heading text-neutral-900 mb-3">
                {user?.name || 'Your Name'}
              </h1>
              <p className="text-lg text-neutral-600 mb-4">
                {user?.email || 'email@example.com'}
              </p>
              {user?.is_instructor && (
                <span className="inline-block px-3 py-1 text-xs tracking-wider uppercase text-neutral-900 bg-neutral-100 rounded-full font-medium">
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
              <h2 className="text-3xl font-heading text-neutral-900">
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
                    className="bg-neutral-900 text-white px-6 py-2 text-sm rounded-lg hover:bg-neutral-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {showBioEditor ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs tracking-wider uppercase text-neutral-600 mb-3 font-medium">
                    Biography
                  </label>
                  <textarea
                    value={bioData.instructor_bio}
                    onChange={(e) => setBioData({ ...bioData, instructor_bio: e.target.value })}
                    rows="6"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    placeholder="Share your yoga journey..."
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wider uppercase text-neutral-600 mb-3 font-medium">
                    Specialties (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={bioData.instructor_specialties.join(', ')}
                    onChange={(e) => setBioData({ ...bioData, instructor_specialties: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    placeholder="Vinyasa, Hatha, Meditation"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wider uppercase text-neutral-600 mb-3 font-medium">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={bioData.years_experience}
                    onChange={(e) => setBioData({ ...bioData, years_experience: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-neutral-600">
                <div>
                  <h4 className="text-xs tracking-wider uppercase text-neutral-500 mb-2 font-medium">Biography</h4>
                  <p className="text-base leading-relaxed">{user?.instructor_bio || 'No bio yet.'}</p>
                </div>
                <div>
                  <h4 className="text-xs tracking-wider uppercase text-neutral-500 mb-2 font-medium">Specialties</h4>
                  <p className="text-base">{user?.instructor_specialties?.join(', ') || 'None specified.'}</p>
                </div>
                <div>
                  <h4 className="text-xs tracking-wider uppercase text-neutral-500 mb-2 font-medium">Experience</h4>
                  <p className="text-base">{user?.years_experience || '0'} years</p>
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
          <h2 className="text-3xl font-heading text-neutral-900 mb-8">
            My Enrollments
          </h2>

          {enrollments.length === 0 ? (
            <p className="text-lg text-neutral-600">You haven't enrolled in any classes yet.</p>
          ) : (
            <div className="space-y-4">
                     {enrollments.map((enrollment) => {
                       // Safety checks for nested objects
                       const schedule = enrollment?.schedule || enrollment?.Schedule || {};
                       const classData = schedule?.class || schedule?.Class || {};
                       
                       let formattedDate = 'Date TBD';
                       let formattedTime = 'Time TBD';
                       
                       try {
                         if (schedule.start_time) {
                           const startDate = parseISO(schedule.start_time);
                           if (!isNaN(startDate.getTime())) {
                             formattedDate = format(startDate, 'EEEE, MMMM d');
                             formattedTime = format(startDate, 'h:mm a');
                           }
                         }
                       } catch (err) {
                         console.error('Error formatting enrollment date:', err);
                       }
                       
                       const canCancel = canCancelEnrollment(schedule.start_time);
                       
                       return (
                         <div
                           key={enrollment.id || Math.random()}
                           className="card hover:shadow-lg transition-all"
                         >
                           <div className="flex justify-between items-start">
                             <div className="flex-1">
                               <h3 className="text-xl font-heading text-neutral-900 mb-2">
                                 {classData.title || 'Untitled Class'}
                               </h3>
                               <p className="text-base text-neutral-600 mb-2">
                                 {formattedDate} at {formattedTime}
                               </p>
                               <p className="text-sm text-neutral-500">
                                 Instructor: {classData.instructor_name || 'TBD'}
                               </p>
                               {!canCancel && (
                                 <p className="text-xs text-amber-600 mt-2">
                                   ⚠️ Cannot cancel within 1 hour of class start
                                 </p>
                               )}
                             </div>
                             <button
                               onClick={() => handleCancelEnrollment(enrollment.id)}
                               disabled={!canCancel}
                               className={`text-sm tracking-wider uppercase font-medium ${
                                 canCancel
                                   ? 'text-red-600 hover:text-red-700'
                                   : 'text-neutral-400 cursor-not-allowed'
                               }`}
                             >
                               Cancel
                             </button>
                           </div>
                         </div>
                       );
                     })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;