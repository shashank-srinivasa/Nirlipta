import { useState } from 'react';
import { motion } from 'framer-motion';
import ClassManagement from './admin/ClassManagement';
import ScheduleManagement from './admin/ScheduleManagement';
import ContentEditor from './admin/ContentEditor';
import UserManagement from './admin/UserManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('classes');

  const tabs = [
    { id: 'classes', label: 'Classes' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'content', label: 'Content' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-heading text-neutral-900 mb-12">
            Admin Dashboard
          </h1>

          {/* Tabs */}
          <div className="border-b border-neutral-200 mb-12">
            <div className="flex gap-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-sm tracking-wider uppercase whitespace-nowrap transition-colors font-medium ${
                    activeTab === tab.id
                      ? 'text-neutral-900 border-b-2 border-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
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