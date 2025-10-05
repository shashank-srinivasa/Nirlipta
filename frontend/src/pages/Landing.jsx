import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCalendar, FaUsers, FaHeart, FaStar } from 'react-icons/fa';

const Landing = () => {
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

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Student',
      image: '👩',
      text: 'Serenity Yoga has transformed my life. The instructors are amazing and the community is so welcoming!',
    },
    {
      name: 'Michael Chen',
      role: 'Student',
      image: '👨',
      text: 'I started as a complete beginner and now I practice daily. Best decision I ever made.',
    },
    {
      name: 'Emma Davis',
      role: 'Student',
      image: '👩‍🦰',
      text: 'The flexible scheduling makes it easy to fit yoga into my busy life. Highly recommend!',
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
                <span className="text-3xl">🌸</span>
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
              Why Choose Serenity Yoga?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the difference with our comprehensive approach to wellness
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
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of happy yogis on their wellness journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  <span className="text-5xl mr-4">{testimonial.image}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-heading font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              Join our community today and take the first step towards a healthier, 
              more balanced life.
            </p>
            <Link
              to="/schedule"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Browse Classes
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

