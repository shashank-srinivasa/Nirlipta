import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaEye, FaEdit } from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import { ToastContainer } from '../../components/Toast';
import useToast from '../../hooks/useToast';

const ContentEditor = () => {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [activeSection, setActiveSection] = useState('landing-hero');
  const [content, setContent] = useState({
    // Landing Page - Hero
    'landing-hero-title': 'Nirlipta Yoga',
    'landing-hero-subtitle': 'Find your inner peace through the ancient practice of yoga',
    'landing-hero-image': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop',
    'landing-hero-button1': 'Explore Classes',
    'landing-hero-button2': 'Our Story',
    
    // About Page - Hero
    'about-hero-title': 'Our Story',
    'about-hero-subtitle': 'A sanctuary for mind, body, and spirit',
    'about-hero-image': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop',
    
    // About Page - Story
    'about-story-title': 'Welcome to Nirlipta',
    'about-story-content': 'Founded in 2015, Nirlipta Yoga has been a sanctuary for those seeking balance, wellness, and inner peace. Our experienced instructors guide students of all levels through transformative yoga practices.',
    'about-story-content2': 'Our mission is simple: to make yoga accessible to everyone, regardless of experience level or physical ability. We believe in the healing power of yoga and its ability to transform lives.',
    'about-story-content3': 'Through mindful movement, breath work, and meditation, we help our students find balance, reduce stress, and cultivate a deeper connection with themselves. Whether you\'re taking your first class or deepening an established practice, you\'ll find a welcoming home here.',
    
    // About Page - CTA
    'about-cta-title': 'Ready to Join Us?',
    'about-cta-subtitle': 'Experience the transformative power of yoga',
    'about-cta-button': 'View Schedule',
    
    // Footer
    'footer-brand-name': 'Nirlipta Yoga',
    'footer-brand-tagline': 'Transform your mind, body, and spirit through yoga.',
    'footer-email': 'hello@nirliptayoga.com',
    'footer-phone': '+1 (555) 123-4567',
    'footer-address': '123 Wellness Street',
    'footer-hours-weekday': 'Mon - Fri: 6am - 9pm',
    'footer-hours-saturday': 'Saturday: 7am - 7pm',
    'footer-hours-sunday': 'Sunday: 8am - 6pm',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [landing, about, footer] = await Promise.all([
        adminAPI.getContent('landing').catch(() => ({ data: {} })),
        adminAPI.getContent('about').catch(() => ({ data: {} })),
        adminAPI.getContent('footer').catch(() => ({ data: {} }))
      ]);
      
      const allContent = {
        ...content,
        ...Object.keys(landing.data || {}).reduce((acc, key) => {
          acc[`landing-${key.replace(/_/g, '-')}`] = landing.data[key];
          return acc;
        }, {}),
        ...Object.keys(about.data || {}).reduce((acc, key) => {
          acc[`about-${key.replace(/_/g, '-')}`] = about.data[key];
          return acc;
        }, {}),
        ...Object.keys(footer.data || {}).reduce((acc, key) => {
          acc[`footer-${key.replace(/_/g, '-')}`] = footer.data[key];
          return acc;
        }, {})
      };
      
      setContent(allContent);
    } catch (err) {
      console.error('Failed to load content:', err);
    }
  };

  const sections = [
    {
      id: 'landing-hero',
      page: 'Landing Page',
      title: 'Hero Section',
      description: 'Main landing page hero with background image',
      fields: [
        { key: 'landing-hero-title', label: 'Main Title', type: 'text', placeholder: 'Nirlipta Yoga' },
        { key: 'landing-hero-subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Find your inner peace...' },
        { key: 'landing-hero-image', label: 'Background Image URL', type: 'url', placeholder: 'https://...' },
        { key: 'landing-hero-button1', label: 'Primary Button Text', type: 'text', placeholder: 'Explore Classes' },
        { key: 'landing-hero-button2', label: 'Secondary Button Text', type: 'text', placeholder: 'Our Story' },
      ]
    },
    {
      id: 'about-hero',
      page: 'About Page',
      title: 'Hero Section',
      description: 'About page hero with background image',
      fields: [
        { key: 'about-hero-title', label: 'Main Title', type: 'text', placeholder: 'Our Story' },
        { key: 'about-hero-subtitle', label: 'Subtitle', type: 'text', placeholder: 'A sanctuary for...' },
        { key: 'about-hero-image', label: 'Background Image URL', type: 'url', placeholder: 'https://...' },
      ]
    },
    {
      id: 'about-story',
      page: 'About Page',
      title: 'Story Section',
      description: 'Main content area on about page',
      fields: [
        { key: 'about-story-title', label: 'Section Title', type: 'text', placeholder: 'Welcome to Nirlipta' },
        { key: 'about-story-content', label: 'Paragraph 1', type: 'textarea', placeholder: 'Founded in 2015...' },
        { key: 'about-story-content2', label: 'Paragraph 2', type: 'textarea', placeholder: 'Our mission is...' },
        { key: 'about-story-content3', label: 'Paragraph 3', type: 'textarea', placeholder: 'Through mindful movement...' },
      ]
    },
    {
      id: 'about-cta',
      page: 'About Page',
      title: 'Call to Action',
      description: 'CTA section at bottom of about page',
      fields: [
        { key: 'about-cta-title', label: 'Title', type: 'text', placeholder: 'Ready to Join Us?' },
        { key: 'about-cta-subtitle', label: 'Subtitle', type: 'text', placeholder: 'Experience the transformative...' },
        { key: 'about-cta-button', label: 'Button Text', type: 'text', placeholder: 'View Schedule' },
      ]
    },
    {
      id: 'footer',
      page: 'Footer',
      title: 'Footer Content',
      description: 'Footer information across all pages',
      fields: [
        { key: 'footer-brand-name', label: 'Brand Name', type: 'text', placeholder: 'Nirlipta Yoga' },
        { key: 'footer-brand-tagline', label: 'Brand Tagline', type: 'textarea', placeholder: 'Transform your mind...' },
        { key: 'footer-email', label: 'Email', type: 'email', placeholder: 'hello@nirliptayoga.com' },
        { key: 'footer-phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 123-4567' },
        { key: 'footer-address', label: 'Address', type: 'text', placeholder: '123 Wellness Street' },
        { key: 'footer-hours-weekday', label: 'Weekday Hours', type: 'text', placeholder: 'Mon - Fri: 6am - 9pm' },
        { key: 'footer-hours-saturday', label: 'Saturday Hours', type: 'text', placeholder: 'Saturday: 7am - 7pm' },
        { key: 'footer-hours-sunday', label: 'Sunday Hours', type: 'text', placeholder: 'Sunday: 8am - 6pm' },
      ]
    }
  ];

  const handleSave = async (sectionId) => {
    setSaving(true);

    const section = sections.find(s => s.id === sectionId);
    
    try {
      for (const field of section.fields) {
        const parts = field.key.split('-');
        const page = parts[0]; // 'landing', 'about', or 'footer'
        const sectionKey = parts.slice(1).join('_');
        
        await adminAPI.updateContent({
          page_name: page,
          section_key: sectionKey,
          content: content[field.key]
        });
      }
      
      success('Changes saved successfully!');
    } catch (err) {
      showError('Failed to save changes. Please try again.');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const activeData = sections.find(s => s.id === activeSection);

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-neutral-900">
            Content Editor
          </h1>
          <p className="text-neutral-600 mt-1">
            Edit all content across your website
          </p>
        </div>

      {/* Section Tabs */}
      <div className="border-b border-neutral-200">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-3 font-medium whitespace-nowrap transition-all text-sm border-b-2 ${
                activeSection === section.id
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <div className="text-left">
                <div className="font-semibold">{section.title}</div>
                <div className="text-xs opacity-75">{section.page}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Edit Form - Takes 2 columns */}
        <div className="lg:col-span-2 card">
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-bold text-neutral-900 flex items-center gap-2">
              <FaEdit className="text-neutral-600" />
              {activeData.title}
            </h2>
            <p className="text-neutral-600 text-sm mt-1">
              {activeData.description}
            </p>
          </div>

          <div className="space-y-5">
            {activeData.fields.map(field => (
              <div key={field.key} className="group">
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={content[field.key]}
                    onChange={(e) => setContent({...content, [field.key]: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={content[field.key]}
                    onChange={(e) => setContent({...content, [field.key]: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => handleSave(activeSection)}
            disabled={saving}
            className="bg-neutral-900 text-white px-8 py-3 rounded-lg hover:bg-neutral-700 transition-colors w-full mt-6 flex items-center justify-center gap-2 font-medium"
          >
            <FaSave />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Live Preview - Takes 1 column */}
        <div className="card bg-neutral-50 border border-neutral-200 sticky top-6 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-neutral-200">
            <FaEye className="text-neutral-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Preview</h3>
          </div>

          {activeSection === 'landing-hero' && (
            <div className="bg-neutral-900 rounded-lg p-8 text-center relative overflow-hidden min-h-[300px] flex items-center justify-center">
              {content['landing-hero-image'] && (
                <img 
                  src={content['landing-hero-image']} 
                  alt="Background" 
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
              )}
              <div className="relative z-10">
                <h1 className="text-4xl font-heading font-bold text-white mb-4">
                  {content['landing-hero-title']}
                </h1>
                <p className="text-lg text-white/90 mb-6">
                  {content['landing-hero-subtitle']}
                </p>
                <div className="flex gap-3 justify-center">
                  <button className="btn-primary text-sm px-6 py-2">
                    {content['landing-hero-button1']}
                  </button>
                  <button className="btn-outline-light text-sm px-6 py-2">
                    {content['landing-hero-button2']}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'about-hero' && (
            <div className="bg-neutral-900 rounded-lg p-8 text-center relative overflow-hidden min-h-[250px] flex items-center justify-center">
              {content['about-hero-image'] && (
                <img 
                  src={content['about-hero-image']} 
                  alt="Background" 
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
              )}
              <div className="relative z-10">
                <h1 className="text-4xl font-heading font-bold text-white mb-3">
                  {content['about-hero-title']}
                </h1>
                <p className="text-lg text-white/90">
                  {content['about-hero-subtitle']}
                </p>
              </div>
            </div>
          )}

          {activeSection === 'about-story' && (
            <div className="bg-white rounded-lg p-6 space-y-4">
              <h2 className="text-2xl font-heading font-bold text-neutral-900">
                {content['about-story-title']}
              </h2>
              <p className="text-neutral-600 leading-relaxed">
                {content['about-story-content']}
              </p>
              <p className="text-neutral-600 leading-relaxed">
                {content['about-story-content2']}
              </p>
              <p className="text-neutral-600 leading-relaxed">
                {content['about-story-content3']}
              </p>
            </div>
          )}

          {activeSection === 'about-cta' && (
            <div className="bg-neutral-900 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-heading font-bold text-white mb-3">
                {content['about-cta-title']}
              </h2>
              <p className="text-white/90 mb-6">
                {content['about-cta-subtitle']}
              </p>
              <button className="btn-outline-light text-sm px-6 py-2">
                {content['about-cta-button']}
              </button>
            </div>
          )}

          {activeSection === 'footer' && (
            <div className="bg-white rounded-lg p-6 space-y-6 text-sm">
              <div>
                <h3 className="font-heading font-bold text-neutral-900 mb-2">
                  {content['footer-brand-name']}
                </h3>
                <p className="text-neutral-600 text-xs">
                  {content['footer-brand-tagline']}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2 text-xs uppercase">Contact</h4>
                  <div className="space-y-1 text-xs text-neutral-600">
                    <p>{content['footer-email']}</p>
                    <p>{content['footer-phone']}</p>
                    <p>{content['footer-address']}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2 text-xs uppercase">Hours</h4>
                  <div className="space-y-1 text-xs text-neutral-600">
                    <p>{content['footer-hours-weekday']}</p>
                    <p>{content['footer-hours-saturday']}</p>
                    <p>{content['footer-hours-sunday']}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Help Text */}
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <p className="text-sm text-neutral-700">
            <strong>Tip:</strong> Changes are saved to the database and will appear on your live site immediately. Use the preview to see how your content will look.
          </p>
        </div>
      </div>
    </>
  );
};

export default ContentEditor;