import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

const ContentEditor = () => {
  const [landingContent, setLandingContent] = useState({
    hero_title: '',
    hero_subtitle: '',
    cta_text: '',
  });
  
  const [aboutContent, setAboutContent] = useState({
    story: '',
    mission: '',
  });

  const [loading, setLoading] = useState(false);
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
      
      setLandingContent(landing.data || {});
      setAboutContent(about.data || {});
    } catch (err) {
      console.error('Failed to load content:', err);
    }
  };

  const handleSave = async (pageName, sectionKey, content) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminAPI.updateContent({
        page_name: pageName,
        section_key: sectionKey,
        content: content
      });
      setSuccess('Content saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900">
          Content Editor
        </h1>
        <p className="text-gray-600 mt-1">
          Edit your website content - changes appear immediately
        </p>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 text-green-600 p-4 rounded-lg"
        >
          ✅ {success}
        </motion.div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Landing Page Content */}
      <div className="card">
        <h2 className="text-2xl font-heading font-semibold mb-6">
          🏠 Landing Page
        </h2>

        <div className="space-y-6">
          {/* Hero Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Title (Main Heading)
            </label>
            <input
              type="text"
              value={landingContent.hero_title || 'Find Your Inner Peace'}
              onChange={(e) => setLandingContent({...landingContent, hero_title: e.target.value})}
              className="input-field"
              placeholder="Find Your Inner Peace"
            />
            <button
              onClick={() => handleSave('landing', 'hero_title', landingContent.hero_title)}
              disabled={loading}
              className="mt-2 btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <FaSave /> Save Title
            </button>
          </div>

          {/* Hero Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Subtitle (Description)
            </label>
            <textarea
              value={landingContent.hero_subtitle || 'Transform your mind, body, and spirit through the ancient practice of yoga.'}
              onChange={(e) => setLandingContent({...landingContent, hero_subtitle: e.target.value})}
              rows="3"
              className="input-field"
              placeholder="Transform your mind, body, and spirit..."
            />
            <button
              onClick={() => handleSave('landing', 'hero_subtitle', landingContent.hero_subtitle)}
              disabled={loading}
              className="mt-2 btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <FaSave /> Save Subtitle
            </button>
          </div>

          {/* CTA Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Call-to-Action Button Text
            </label>
            <input
              type="text"
              value={landingContent.cta_text || 'View Schedule'}
              onChange={(e) => setLandingContent({...landingContent, cta_text: e.target.value})}
              className="input-field"
              placeholder="View Schedule"
            />
            <button
              onClick={() => handleSave('landing', 'cta_text', landingContent.cta_text)}
              disabled={loading}
              className="mt-2 btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <FaSave /> Save Button Text
            </button>
          </div>
        </div>
      </div>

      {/* About Page Content */}
      <div className="card">
        <h2 className="text-2xl font-heading font-semibold mb-6">
          📖 About Page
        </h2>

        <div className="space-y-6">
          {/* Our Story */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Our Story
            </label>
            <textarea
              value={aboutContent.story || 'Founded in 2015, Serenity Yoga has been a sanctuary for those seeking balance...'}
              onChange={(e) => setAboutContent({...aboutContent, story: e.target.value})}
              rows="6"
              className="input-field"
              placeholder="Tell your studio's story..."
            />
            <button
              onClick={() => handleSave('about', 'story', aboutContent.story)}
              disabled={loading}
              className="mt-2 btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <FaSave /> Save Story
            </button>
          </div>

          {/* Mission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Our Mission
            </label>
            <textarea
              value={aboutContent.mission || 'Our mission is simple: to make yoga accessible to everyone...'}
              onChange={(e) => setAboutContent({...aboutContent, mission: e.target.value})}
              rows="4"
              className="input-field"
              placeholder="Describe your mission..."
            />
            <button
              onClick={() => handleSave('about', 'mission', aboutContent.mission)}
              disabled={loading}
              className="mt-2 btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <FaSave /> Save Mission
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Changes you make here will be saved to the database. 
          To see them on the website, you'll need to update the frontend pages to fetch this content.
        </p>
      </div>
    </div>
  );
};

export default ContentEditor;
