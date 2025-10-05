import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCalendar, FaUsers, FaHeart, FaStar } from 'react-icons/fa';
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

  const features = [
    {
      icon: <FaCalendar className="text-4xl text-primary-600" />,
      title: 'Flexible Scheduling',
      description: 'Choose from daily, weekly, or monthly classes that fit your lifestyle.',
    },
    {
      icon: <FaUsers className="text-4xl text-primary-600" />,
      title: 'Expert Instructors',
      description: 'Learn from certified yoga professionals with years of experience.',
    },
    {
      icon: <FaHeart className="text-4xl text-primary-600" />,
      title: 'Holistic Approach',
      description: 'Focus on mind, body, and spirit for complete wellness.',
    },
    {
      icon: <FaStar className="text-4xl text-primary-600" />,
      title: 'All Levels Welcome',
      description: 'From beginners to advanced practitioners, everyone is welcome.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-heading font-bold text-gray-900 mb-6">
                Find Your Inner
                <span className="text-primary-600"> Peace</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Transform your mind, body, and spirit through the ancient practice of yoga. 
                Join our community today and start your journey to wellness.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/schedule" className="btn-primary text-center">
                  View Schedule
                </Link>
                <Link to="/about" className="btn-outline text-center">
                  Learn More
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full h-96 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-3xl shadow-2xl flex items-center justify-center">
                <span className="text-9xl">🧘‍♀️</span>
              </div>
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-10 -left-10 bg-white rounded-full p-4 shadow-xl"
              >
                <span className="text-3xl">✨</span>
              </motion.div>
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute bottom-10 -right-10 bg-white rounded-full p-4 shadow-xl"
              >
                <span className="text-3xl">🌟</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600">
              Experience the best yoga practice with our unique approach
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Instructors Section */}
      {instructors.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
                Meet Our Instructors
              </h2>
              <p className="text-xl text-gray-600">
                Learn from experienced and passionate yoga teachers
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {instructors.map((instructor, index) => (
                <motion.div
                  key={instructor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card text-center hover:shadow-xl transition-shadow"
                >
                  {/* Avatar */}
                  <div className="relative inline-block mb-4">
                    <img
                      src={`http://localhost:8080${instructor.avatar_url}`}
                      alt={instructor.name}
                      className="w-32 h-32 rounded-full object-cover mx-auto"
                    />
                    {instructor.is_featured && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                        <FaStar className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    {instructor.name}
                  </h3>

                  {/* Bio */}
                  {instructor.instructor_bio && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {instructor.instructor_bio}
                    </p>
                  )}

                  {/* Specialties */}
                  {instructor.instructor_specialties && instructor.instructor_specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {instructor.instructor_specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-3 py-1 bg-primary-100 text-primary-700 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Experience */}
                  {instructor.years_experience > 0 && (
                    <p className="text-sm text-gray-500">
                      {instructor.years_experience} years of experience
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-heading font-bold mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join our community and discover the transformative power of yoga
            </p>
            <Link to="/schedule" className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              View Class Schedule
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;