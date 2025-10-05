import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaCalendarPlus, FaUsers, FaChartLine } from 'react-icons/fa';
import ClassManagement from './admin/ClassManagement';
import ScheduleManagement from './admin/ScheduleManagement';
import ContentEditor from './admin/ContentEditor';
import UserManagement from './admin/UserManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
    { id: 'classes', label: 'Classes', icon: <FaEdit /> },
    { id: 'schedule', label: 'Schedule', icon: <FaCalendarPlus /> },
    { id: 'content', label: 'Content', icon: <FaEdit /> },
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

              {activeTab === 'classes' && (
                <ClassManagement />
              )}

              {activeTab === 'schedule' && (
                <ScheduleManagement />
              )}

              {activeTab === 'content' && (
                <ContentEditor />
              )}

              {activeTab === 'users' && (
                <UserManagement />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;