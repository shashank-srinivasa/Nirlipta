import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { contentAPI, instructorAPI } from '../services/api';

const About = () => {
  const [content, setContent] = useState({
    'hero_title': 'Our Story',
    'hero_subtitle': 'A sanctuary for mind, body, and spirit',
    'hero_image': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop',
    'story_title': 'Welcome to Nirlipta',
    'story_content': 'Founded in 2015, Nirlipta Yoga has been a sanctuary for those seeking balance, wellness, and inner peace. Our experienced instructors guide students of all levels through transformative yoga practices.',
    'story_content2': 'Our mission is simple: to make yoga accessible to everyone, regardless of experience level or physical ability. We believe in the healing power of yoga and its ability to transform lives.',
    'story_content3': 'Through mindful movement, breath work, and meditation, we help our students find balance, reduce stress, and cultivate a deeper connection with themselves. Whether you\'re taking your first class or deepening an established practice, you\'ll find a welcoming home here.',
    'cta_title': 'Ready to Join Us?',
    'cta_subtitle': 'Experience the transformative power of yoga',
    'cta_button': 'View Schedule',
  });
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentResponse, instructorsResponse] = await Promise.all([
          contentAPI.getByPage('about'),
          instructorAPI.getAll()
        ]);
        
        if (contentResponse.data) {
          setContent(prev => ({ ...prev, ...contentResponse.data }));
        }
        
        setInstructors(instructorsResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={content.hero_image}
            alt="About Us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 via-neutral-900/70 to-neutral-900/50"></div>
          <div className="absolute inset-0 bg-gradient-radial from-neutral-900/40 via-transparent to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-heading text-white mb-6 leading-tight">
              {content.hero_title}
            </h1>
            <p className="text-lg sm:text-xl text-white/95 max-w-2xl mx-auto leading-relaxed">
              {content.hero_subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-heading text-neutral-900 mb-8">
              {content.story_title}
            </h2>
            <div className="space-y-6 text-lg text-neutral-600 leading-relaxed">
              <p>{content.story_content}</p>
              <p>{content.story_content2}</p>
              <p>{content.story_content3}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Instructors Section - Only show if there are instructors */}
      {instructors.length > 0 && (
        <section className="py-20 md:py-32 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-heading text-neutral-900 mb-4">
                Meet Our Instructors
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Experienced guides on your yoga journey
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {instructors.map((instructor, index) => (
                <motion.div
                  key={instructor.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card text-center hover:shadow-lg transition-all"
                >
                  {/* Avatar */}
                  <div className="mb-6 flex justify-center">
                    {instructor.avatar_url ? (
                      <img
                        src={`http://localhost:8080${instructor.avatar_url}`}
                        alt={instructor.name}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-neutral-900 flex items-center justify-center">
                        <span className="text-4xl font-heading text-white">
                          {getInitials(instructor.name)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="text-2xl font-heading text-neutral-900 mb-2">
                    {instructor.name}
                  </h3>
                  
                  {instructor.years_experience > 0 && (
                    <p className="text-sm text-neutral-500 mb-4">
                      {instructor.years_experience} {instructor.years_experience === 1 ? 'year' : 'years'} of experience
                    </p>
                  )}

                  {instructor.instructor_bio && (
                    <p className="text-neutral-600 mb-4 leading-relaxed">
                      {instructor.instructor_bio}
                    </p>
                  )}

                  {instructor.instructor_specialties && instructor.instructor_specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {instructor.instructor_specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Smaller */}
      <section className="py-16 bg-neutral-900 text-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading mb-6">
              {content.cta_title}
            </h2>
            <p className="text-base md:text-lg mb-8 opacity-90 leading-relaxed">
              {content.cta_subtitle}
            </p>
            <Link to="/schedule" className="btn-outline-light text-base px-8 py-3">
              {content.cta_button}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;