import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaEye } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

const ContentEditor = () => {
  const [activeSection, setActiveSection] = useState('landing-hero');
  const [content, setContent] = useState({
    // Landing page
    'landing-hero-title': 'Find Your Inner Peace',
    'landing-hero-subtitle': 'Transform your mind, body, and spirit through the ancient practice of yoga. Join our community of mindful practitioners.',
    'landing-cta': 'View Schedule',
    // About page
    'about-story': 'Founded in 2015, Serenity Yoga has been a sanctuary for those seeking balance, wellness, and inner peace. Our experienced instructors guide students of all levels through transformative yoga practices.',
    'about-mission': 'Our mission is simple: to make yoga accessible to everyone, regardless of experience level or physical ability. We believe in the healing power of yoga and its ability to transform lives.',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [landing, about] = await Promise.all([
        adminAPI.getContent('landing'),
        adminAPI.getContent('about')
      ]);
      
      // Merge fetched content with defaults
      const fetchedContent = {
        'landing-hero-title': landing.data?.hero_title || content['landing-hero-title'],
        'landing-hero-subtitle': landing.data?.hero_subtitle || content['landing-hero-subtitle'],
        'landing-cta': landing.data?.cta_text || content['landing-cta'],
        'about-story': about.data?.story || content['about-story'],
        'about-mission': about.data?.mission || content['about-mission'],
      };
      setContent(fetchedContent);
    } catch (err) {
      console.error('Failed to load content:', err);
    }
  };

  const sections = [
    {
      id: 'landing-hero',
      page: 'Landing Page',
      title: '🏠 Hero Section',
      description: 'The first thing visitors see',
      fields: [
        { key: 'landing-hero-title', label: 'Main Headline', type: 'text', placeholder: 'Find Your Inner Peace' },
        { key: 'landing-hero-subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Transform your mind...' },
        { key: 'landing-cta', label: 'Button Text', type: 'text', placeholder: 'View Schedule' },
      ]
    },
    {
      id: 'about-content',
      page: 'About Page',
      title: '📖 About Content',
      description: 'Tell your story',
      fields: [
        { key: 'about-story', label: 'Our Story', type: 'textarea', placeholder: 'Founded in 2015...' },
        { key: 'about-mission', label: 'Our Mission', type: 'textarea', placeholder: 'Our mission is...' },
      ]
    }
  ];

  const handleSave = async (sectionId) => {
    setSaving(true);
    setError('');
    setSuccess('');

    const section = sections.find(s => s.id === sectionId);
    
    try {
      // Save each field in the section
      for (const field of section.fields) {
        const [page, key] = field.key.split('-').slice(0, 2);
        const sectionKey = field.key.split('-').slice(1).join('_');
        
        await adminAPI.updateContent({
          page_name: page,
          section_key: sectionKey,
          content: content[field.key]
        });
      }
      
      setSuccess('✅ Saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save. Please try again.');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const activeData = sections.find(s => s.id === activeSection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900">
          Content Editor
        </h1>
        <p className="text-gray-600 mt-1">
          Edit your website content easily
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 text-green-700 p-4 rounded-lg font-medium"
        >
          {success}
        </motion.div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeSection === section.id
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      {/* Editor Card */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Edit Form */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-bold text-gray-900">
              {activeData.title}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {activeData.description}
            </p>
          </div>

          <div className="space-y-6">
            {activeData.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={content[field.key]}
                    onChange={(e) => setContent({...content, [field.key]: e.target.value})}
                    rows="4"
                    className="input-field"
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    type="text"
                    value={content[field.key]}
                    onChange={(e) => setContent({...content, [field.key]: e.target.value})}
                    className="input-field"
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => handleSave(activeSection)}
            disabled={saving}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
          >
            <FaSave />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Live Preview */}
        <div className="card bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="flex items-center gap-2 mb-4">
            <FaEye className="text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
          </div>

          {activeSection === 'landing-hero' && (
            <div className="bg-white rounded-lg p-8 text-center">
              <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">
                {content['landing-hero-title']}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {content['landing-hero-subtitle']}
              </p>
              <button className="btn-primary">
                {content['landing-cta']}
              </button>
            </div>
          )}

          {activeSection === 'about-content' && (
            <div className="bg-white rounded-lg p-8 space-y-6">
              <div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                  Our Story
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {content['about-story']}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                  Our Mission
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {content['about-mission']}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Your changes are saved to the database. 
          The preview shows how it will look on your website.
        </p>
      </div>
    </div>
  );
};

export default ContentEditor;