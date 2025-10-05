import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI, instructorAPI } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'CLIENT' : 'ADMIN';
    const action = newRole === 'ADMIN' ? 'promote to Admin' : 'demote to Client';
    
    if (!confirm(`Are you sure you want to ${action}?`)) return;

    try {
      await adminAPI.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const handleToggleInstructor = async (userId, isCurrentlyInstructor) => {
    const action = isCurrentlyInstructor ? 'remove instructor status from' : 'mark as instructor';
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      if (isCurrentlyInstructor) {
        await instructorAPI.remove(userId);
      } else {
        await instructorAPI.promote(userId);
      }
      fetchUsers();
      alert(`User ${action} successfully!`);
    } catch (err) {
      alert(`Failed to ${action} user`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-h3 font-heading text-primary-900 mb-2">
          User Management
        </h2>
        <p className="text-body text-primary-600">
          Manage user accounts, roles, and instructor status
        </p>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-600 p-4">
          {error}
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-primary-600">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 border border-primary-200 p-12">
          <h3 className="text-xl font-heading text-primary-900 mb-2">
            No users yet
          </h3>
          <p className="text-primary-600">
            Users will appear here when they sign up
          </p>
        </div>
      ) : (
        <div className="border border-primary-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-primary-700">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-primary-700">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-primary-700">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-primary-700">
                    Instructor
                  </th>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-primary-700">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs tracking-wider uppercase text-primary-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-primary-200">
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-primary-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img 
                              src={`http://localhost:8080${user.avatar_url}`} 
                              alt={user.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <span className="text-primary-400 text-xs">No Image</span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-primary-900">
                            {user.name}
                          </div>
                          <div className="text-xs text-primary-500">
                            via {user.auth_provider}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 text-xs tracking-wider uppercase ${
                        user.role === 'ADMIN' 
                          ? 'bg-primary-900 text-white' 
                          : 'bg-primary-100 text-primary-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_instructor ? (
                        <span className="inline-block px-3 py-1 text-xs tracking-wider uppercase bg-accent-500 text-white">
                          Instructor
                        </span>
                      ) : (
                        <span className="text-xs text-primary-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRoleChange(user.id, user.role)}
                          className="px-3 py-1 text-xs tracking-wider uppercase border border-primary-300 text-primary-700 hover:bg-primary-900 hover:text-white hover:border-primary-900 transition-all"
                        >
                          {user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => handleToggleInstructor(user.id, user.is_instructor)}
                          className={`px-3 py-1 text-xs tracking-wider uppercase transition-all ${
                            user.is_instructor
                              ? 'border border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600'
                              : 'border border-accent-400 text-accent-700 hover:bg-accent-500 hover:text-white hover:border-accent-500'
                          }`}
                        >
                          {user.is_instructor ? 'Remove Instructor' : 'Make Instructor'}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="bg-primary-50 px-6 py-4 border-t border-primary-200">
            <div className="flex gap-6 text-sm text-primary-600">
              <span>
                <strong className="text-primary-900">{users.length}</strong> total users
              </span>
              <span>
                <strong className="text-primary-900">
                  {users.filter(u => u.role === 'ADMIN').length}
                </strong> admins
              </span>
              <span>
                <strong className="text-primary-900">
                  {users.filter(u => u.is_instructor).length}
                </strong> instructors
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;