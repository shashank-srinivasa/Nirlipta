import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaEye } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

const ContentEditor = () => {
  const [activeSection, setActiveSection] = useState('landing-hero');
  const [content, setContent] = useState({
    // Landing page - Hero
    'landing-hero-title': 'Find Your Inner Peace',
    'landing-hero-subtitle': 'Transform your mind, body, and spirit through the ancient practice of yoga. Join our community of mindful practitioners.',
    'landing-cta': 'View Schedule',
    
    // Landing page - Features
    'landing-feature1-title': 'Expert Instructors',
    'landing-feature1-desc': 'Learn from certified yoga teachers with years of experience',
    'landing-feature2-title': 'Flexible Schedule',
    'landing-feature2-desc': 'Classes throughout the day to fit your busy lifestyle',
    'landing-feature3-title': 'All Levels Welcome',
    'landing-feature3-desc': 'From beginners to advanced practitioners',
    
    // Landing page - Testimonials
    'landing-testimonial1-text': 'This studio has transformed my life. The instructors are amazing!',
    'landing-testimonial1-author': 'Sarah M.',
    'landing-testimonial2-text': 'Best yoga studio in town. Welcoming atmosphere and great classes.',
    'landing-testimonial2-author': 'Michael R.',
    'landing-testimonial3-text': 'I love the variety of classes and the supportive community.',
    'landing-testimonial3-author': 'Emily K.',
    
    // About page
    'about-story': 'Founded in 2015, Serenity Yoga has been a sanctuary for those seeking balance, wellness, and inner peace. Our experienced instructors guide students of all levels through transformative yoga practices.',
    'about-mission': 'Our mission is simple: to make yoga accessible to everyone, regardless of experience level or physical ability. We believe in the healing power of yoga and its ability to transform lives.',
    'about-values': 'We value authenticity, compassion, and community. Every class is designed to honor the ancient traditions of yoga while making it relevant for modern life.',
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
      if (landing.data || about.data) {
        setContent(prev => ({
          ...prev,
          ...Object.keys(landing.data || {}).reduce((acc, key) => {
            acc[`landing-${key.replace(/_/g, '-')}`] = landing.data[key];
            return acc;
          }, {}),
          ...Object.keys(about.data || {}).reduce((acc, key) => {
            acc[`about-${key.replace(/_/g, '-')}`] = about.data[key];
            return acc;
          }, {})
        }));
      }
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
      id: 'landing-features',
      page: 'Landing Page',
      title: '⭐ Features Section',
      description: 'Highlight your studio benefits',
      fields: [
        { key: 'landing-feature1-title', label: 'Feature 1 - Title', type: 'text', placeholder: 'Expert Instructors' },
        { key: 'landing-feature1-desc', label: 'Feature 1 - Description', type: 'textarea', placeholder: 'Learn from certified...' },
        { key: 'landing-feature2-title', label: 'Feature 2 - Title', type: 'text', placeholder: 'Flexible Schedule' },
        { key: 'landing-feature2-desc', label: 'Feature 2 - Description', type: 'textarea', placeholder: 'Classes throughout...' },
        { key: 'landing-feature3-title', label: 'Feature 3 - Title', type: 'text', placeholder: 'All Levels Welcome' },
        { key: 'landing-feature3-desc', label: 'Feature 3 - Description', type: 'textarea', placeholder: 'From beginners...' },
      ]
    },
    {
      id: 'landing-testimonials',
      page: 'Landing Page',
      title: '💬 Testimonials',
      description: 'Client reviews and feedback',
      fields: [
        { key: 'landing-testimonial1-text', label: 'Testimonial 1 - Quote', type: 'textarea', placeholder: 'This studio has transformed...' },
        { key: 'landing-testimonial1-author', label: 'Testimonial 1 - Author', type: 'text', placeholder: 'Sarah M.' },
        { key: 'landing-testimonial2-text', label: 'Testimonial 2 - Quote', type: 'textarea', placeholder: 'Best yoga studio...' },
        { key: 'landing-testimonial2-author', label: 'Testimonial 2 - Author', type: 'text', placeholder: 'Michael R.' },
        { key: 'landing-testimonial3-text', label: 'Testimonial 3 - Quote', type: 'textarea', placeholder: 'I love the variety...' },
        { key: 'landing-testimonial3-author', label: 'Testimonial 3 - Author', type: 'text', placeholder: 'Emily K.' },
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
        { key: 'about-values', label: 'Our Values', type: 'textarea', placeholder: 'We value authenticity...' },
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
        const parts = field.key.split('-');
        const page = parts[0]; // 'landing' or 'about'
        const sectionKey = parts.slice(1).join('_'); // rest joined with underscore
        
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
          Edit every section of your website
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
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${
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

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {activeData.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={content[field.key]}
                    onChange={(e) => setContent({...content, [field.key]: e.target.value})}
                    rows="3"
                    className="input-field text-sm"
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
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        {/* Live Preview */}
        <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 max-h-[700px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 sticky top-0 bg-gradient-to-br from-primary-50 to-secondary-50 pb-2">
            <FaEye className="text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
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

          {activeSection === 'landing-features' && (
            <div className="bg-white rounded-lg p-6 space-y-6">
              {[1, 2, 3].map(num => (
                <div key={num} className="border-b pb-4 last:border-0">
                  <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">
                    {content[`landing-feature${num}-title`]}
                  </h3>
                  <p className="text-gray-600">
                    {content[`landing-feature${num}-desc`]}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'landing-testimonials' && (
            <div className="bg-white rounded-lg p-6 space-y-4">
              {[1, 2, 3].map(num => (
                <div key={num} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 italic mb-2">
                    "{content[`landing-testimonial${num}-text`]}"
                  </p>
                  <p className="text-sm font-semibold text-primary-600">
                    — {content[`landing-testimonial${num}-author`]}
                  </p>
                </div>
              ))}
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
              <div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                  Our Values
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {content['about-values']}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> All sections are now editable! Changes are saved to the database and will appear on your website.
        </p>
      </div>
    </div>
  );
};

export default ContentEditor;