import { useState } from 'react';
import { motion } from 'framer-motion';
import ClassManagement from './admin/ClassManagement';
import ScheduleManagement from './admin/ScheduleManagement';
import ContentEditor from './admin/ContentEditor';
import UserManagement from './admin/UserManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'classes', label: 'Classes' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'content', label: 'Content' },
    { id: 'users', label: 'Users' },
  ];

  const stats = [
    { label: 'Total Students', value: '247', change: '+12%' },
    { label: 'Active Classes', value: '15', change: '+3' },
    { label: 'This Week', value: '89', change: '+23%' },
    { label: 'Instructors', value: '5', change: '0' },
  ];

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-h1 font-heading text-primary-900 mb-12">
            Admin Dashboard
          </h1>

          {/* Tabs */}
          <div className="border-b border-primary-200 mb-12">
            <div className="flex gap-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-sm tracking-wider uppercase whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary-900 border-b-2 border-primary-900'
                      : 'text-primary-600 hover:text-primary-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-h3 font-heading text-primary-900 mb-8">
                  Studio Overview
                </h2>
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                  {stats.map((stat, index) => (
                    <div key={index} className="border border-primary-200 p-6">
                      <p className="text-sm tracking-wider uppercase text-primary-600 mb-2">
                        {stat.label}
                      </p>
                      <p className="text-4xl font-heading text-primary-900 mb-2">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600">{stat.change}</p>
                    </div>
                  ))}
                </div>
                <div className="border border-primary-200 p-12 text-center">
                  <p className="text-primary-600">Analytics charts will appear here</p>
                </div>
              </div>
            )}

            {activeTab === 'classes' && <ClassManagement />}
            {activeTab === 'schedule' && <ScheduleManagement />}
            {activeTab === 'content' && <ContentEditor />}
            {activeTab === 'users' && <UserManagement />}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;