import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaCalendarPlus, FaUsers, FaChartLine } from 'react-icons/fa';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
    { id: 'content', label: 'Edit Content', icon: <FaEdit /> },
    { id: 'schedule', label: 'Manage Schedule', icon: <FaCalendarPlus /> },
    { id: 'users', label: 'Users', icon: <FaUsers /> },
  ];

  const stats = [
    { label: 'Total Students', value: '247', change: '+12%' },
    { label: 'Active Classes', value: '15', change: '+3' },
    { label: 'This Week Enrollments', value: '89', change: '+23%' },
    { label: 'Instructors', value: '5', change: '0' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-8">
            Admin Dashboard
          </h1>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="flex border-b overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-heading font-semibold mb-6">
                    Studio Overview
                  </h2>
                  <div className="grid md:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                      <div key={index} className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-6">
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                        <p className="text-sm text-green-600">{stat.change}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <p className="text-gray-600">Analytics charts and graphs will appear here</p>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div>
                  <h2 className="text-2xl font-heading font-semibold mb-6">
                    Edit Website Content
                  </h2>
                  <div className="space-y-6">
                    <div className="border rounded-lg p-6">
                      <h3 className="font-semibold text-lg mb-4">Landing Page - Hero Section</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Main Heading
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            defaultValue="Find Your Inner Peace"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subheading
                          </label>
                          <textarea
                            className="input-field"
                            rows="3"
                            defaultValue="Transform your mind, body, and spirit through the ancient practice of yoga."
                          />
                        </div>
                        <button className="btn-primary">Save Changes</button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-6">
                      <h3 className="font-semibold text-lg mb-4">About Page Content</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Studio Story
                          </label>
                          <textarea
                            className="input-field"
                            rows="5"
                            defaultValue="Founded in 2015, Serenity Yoga has been a sanctuary..."
                          />
                        </div>
                        <button className="btn-primary">Save Changes</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-heading font-semibold">Manage Schedule</h2>
                    <button className="btn-primary">+ Add New Class</button>
                  </div>
                  <div className="space-y-4">
                    {['Morning Vinyasa Flow', 'Power Yoga', 'Gentle Hatha'].map((className, index) => (
                      <div key={index} className="border rounded-lg p-6 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg">{className}</h3>
                          <p className="text-gray-600">Monday, 7:00 AM - 8:00 AM</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn-outline text-sm py-2 px-4">Edit</button>
                          <button className="text-red-600 hover:text-red-700 px-4">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <h2 className="text-2xl font-heading font-semibold mb-6">User Management</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="px-6 py-4">Sarah Johnson</td>
                          <td className="px-6 py-4">sarah@example.com</td>
                          <td className="px-6 py-4">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">CLIENT</span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-primary-600 hover:text-primary-700">Promote to Admin</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;

