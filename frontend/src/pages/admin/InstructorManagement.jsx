import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaStar, FaExclamationTriangle } from 'react-icons/fa';
import { instructorAPI, adminAPI } from '../../services/api';

const InstructorManagement = () => {
  const [instructors, setInstructors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [formData, setFormData] = useState({
    instructor_bio: '',
    instructor_specialties: [],
    years_experience: 0,
    is_featured: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [instructorsRes, usersRes] = await Promise.all([
        instructorAPI.getAllAdmin(),
        adminAPI.getAllUsers()
      ]);
      setInstructors(instructorsRes.data || []);
      setAllUsers(usersRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      instructor_bio: instructor.instructor_bio || '',
      instructor_specialties: instructor.instructor_specialties || [],
      years_experience: instructor.years_experience || 0,
      is_featured: instructor.is_featured || false,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await instructorAPI.update(editingInstructor.id, formData);
      setEditingInstructor(null);
      fetchData();
    } catch (err) {
      alert('Failed to update instructor');
    }
  };

  const handlePromote = async (userId) => {
    try {
      await instructorAPI.promote(userId);
      setShowPromoteModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to promote user');
    }
  };

  const handleRemove = async (instructorId) => {
    if (!confirm('Remove this instructor? They will no longer appear on the website.')) return;
    
    try {
      await instructorAPI.remove(instructorId);
      fetchData();
    } catch (err) {
      alert('Failed to remove instructor');
    }
  };

  const nonInstructorUsers = allUsers.filter(u => !u.is_instructor);

  if (editingInstructor) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card max-w-2xl mx-auto"
      >
        <h2 className="text-2xl font-heading font-bold mb-6">
          Edit Instructor Profile
        </h2>

        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.instructor_bio}
              onChange={(e) => setFormData({...formData, instructor_bio: e.target.value})}
              rows="4"
              className="input-field"
              placeholder="Tell us about this instructor..."
            />
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialties (comma-separated)
            </label>
            <input
              type="text"
              value={formData.instructor_specialties.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                instructor_specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className="input-field"
              placeholder="Vinyasa, Hatha, Meditation"
            />
          </div>

          {/* Years Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            <input
              type="number"
              value={formData.years_experience}
              onChange={(e) => setFormData({...formData, years_experience: parseInt(e.target.value) || 0})}
              min="0"
              className="input-field"
            />
          </div>

          {/* Featured */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium text-gray-700">
              Featured Instructor (show with star badge)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <button type="submit" className="btn-primary flex-1">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditingInstructor(null)}
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
            Instructor Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage instructor profiles and promote users
          </p>
        </div>
        <button
          onClick={() => setShowPromoteModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus />
          Promote User to Instructor
        </button>
      </div>

      {/* Instructors Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👨‍🏫</div>
          <p className="text-gray-600">Loading instructors...</p>
        </div>
      ) : instructors.length === 0 ? (
        <div className="text-center py-12 card">
          <div className="text-6xl mb-4">👨‍🏫</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No instructors yet
          </h3>
          <p className="text-gray-600 mb-4">
            Promote users to instructors to get started
          </p>
          <button
            onClick={() => setShowPromoteModal(true)}
            className="btn-primary"
          >
            Promote First Instructor
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((instructor, index) => (
            <motion.div
              key={instructor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-xl transition-shadow"
            >
              {/* Avatar */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  {instructor.avatar_url ? (
                    <img
                      src={`http://localhost:8080${instructor.avatar_url}`}
                      alt={instructor.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl">
                      👤
                    </div>
                  )}
                  {instructor.is_featured && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                      <FaStar className="text-white text-xs" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-heading font-semibold text-gray-900">
                    {instructor.name}
                  </h3>
                  <p className="text-sm text-gray-500">{instructor.email}</p>
                  {instructor.years_experience > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {instructor.years_experience} years experience
                    </p>
                  )}
                </div>
              </div>

              {/* Warning if no avatar */}
              {!instructor.avatar_url && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                  <FaExclamationTriangle className="text-yellow-600 mt-0.5" />
                  <p className="text-xs text-yellow-800">
                    No profile picture. Won't appear on website until one is uploaded.
                  </p>
                </div>
              )}

              {/* Bio */}
              {instructor.instructor_bio && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {instructor.instructor_bio}
                </p>
              )}

              {/* Specialties */}
              {instructor.instructor_specialties && instructor.instructor_specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {instructor.instructor_specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(instructor)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <FaEdit />
                  Edit
                </button>
                <button
                  onClick={() => handleRemove(instructor.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <FaTrash />
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Promote User Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-xl font-heading font-bold mb-4">
              Promote User to Instructor
            </h3>

            {nonInstructorUsers.length === 0 ? (
              <p className="text-gray-600 mb-4">
                All users are already instructors!
              </p>
            ) : (
              <div className="space-y-2 mb-4">
                {nonInstructorUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handlePromote(user.id)}
                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img
                          src={`http://localhost:8080${user.avatar_url}`}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          👤
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowPromoteModal(false)}
              className="btn-outline w-full"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InstructorManagement;
