import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { instructorAPI } from '../services/api';

const Landing = () => {
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await instructorAPI.getAll();
      setInstructors(response.data || []);
    } catch (err) {
      console.error('Failed to load instructors:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Full height, minimal */}
      <section className="relative h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-6xl lg:text-7xl font-heading text-primary-900 mb-8 leading-tight">
                Find Your
                <br />
                Inner Peace
              </h1>
              <p className="text-body-lg text-primary-600 mb-12 max-w-lg leading-relaxed">
                Transform your mind, body, and spirit through the ancient practice of yoga. 
                Join our community and discover a path to wellness.
              </p>
              <div className="flex gap-6">
                <Link to="/schedule" className="btn-primary">
                  View Schedule
                </Link>
                <Link to="/about" className="btn-outline">
                  Learn More
                </Link>
              </div>
            </motion.div>

            {/* Right: Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="relative h-[600px] hidden lg:block"
            >
              <div className="absolute inset-0 bg-primary-100 flex items-center justify-center">
                <span className="text-9xl opacity-20">🧘‍♀️</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Minimal grid */}
      <section className="py-32 bg-primary-50">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-h2 font-heading text-primary-900 mb-6">
              Why Choose Us
            </h2>
            <p className="text-body-lg text-primary-600 max-w-2xl mx-auto">
              Experience the transformative power of yoga in a welcoming environment
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16">
            {[
              {
                title: 'Flexible Scheduling',
                description: 'Choose from daily, weekly, or monthly classes that fit seamlessly into your lifestyle.',
              },
              {
                title: 'Expert Instructors',
                description: 'Learn from certified yoga professionals with years of experience and deep knowledge.',
              },
              {
                title: 'Holistic Approach',
                description: 'Focus on mind, body, and spirit for complete wellness and personal growth.',
              },
              {
                title: 'All Levels Welcome',
                description: 'From beginners to advanced practitioners, everyone finds their place here.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <h3 className="text-h3 font-heading text-primary-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-body text-primary-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors Section - Clean, image-focused */}
      {instructors.length > 0 && (
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-h2 font-heading text-primary-900 mb-6">
                Meet Our Instructors
              </h2>
              <p className="text-body-lg text-primary-600 max-w-2xl mx-auto">
                Learn from experienced and passionate teachers dedicated to your journey
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {instructors.map((instructor, index) => (
                <motion.div
                  key={instructor.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-primary-100">
                    <img
                      src={`http://localhost:8080${instructor.avatar_url}`}
                      alt={instructor.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {instructor.is_featured && (
                      <div className="absolute top-4 right-4 bg-white px-3 py-1 text-xs tracking-wider">
                        FEATURED
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="text-2xl font-heading text-primary-900 mb-2">
                    {instructor.name}
                  </h3>
                  
                  {instructor.instructor_bio && (
                    <p className="text-body text-primary-600 mb-4 line-clamp-3">
                      {instructor.instructor_bio}
                    </p>
                  )}

                  {instructor.instructor_specialties && instructor.instructor_specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {instructor.instructor_specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="text-xs tracking-wider text-primary-700 border-b border-primary-300"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}

                  {instructor.years_experience > 0 && (
                    <p className="text-sm text-primary-500">
                      {instructor.years_experience} years experience
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Bold, minimal */}
      <section className="py-32 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-h1 font-heading mb-8">
              Begin Your Journey
            </h2>
            <p className="text-body-lg mb-12 opacity-90 max-w-2xl mx-auto">
              Join our community and discover the transformative power of yoga
            </p>
            <Link 
              to="/schedule" 
              className="inline-block bg-white text-primary-900 px-12 py-4 text-sm tracking-wider uppercase hover:bg-primary-100 transition-all duration-300"
            >
              View Class Schedule
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;