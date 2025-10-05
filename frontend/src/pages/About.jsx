import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { contentAPI } from '../services/api';

const About = () => {
  const [content, setContent] = useState({
    'about-story': 'Founded in 2015, Serenity Yoga has been a sanctuary for those seeking balance, wellness, and inner peace. Our experienced instructors guide students of all levels through transformative yoga practices.',
    'about-mission': 'Our mission is simple: to make yoga accessible to everyone, regardless of experience level or physical ability. We believe in the healing power of yoga and its ability to transform lives.',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await contentAPI.getByPage('about');
        if (response.data) {
          setContent(prev => ({ ...prev, ...response.data }));
        }
      } catch (err) {
        console.error('Failed to fetch about page content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-primary-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-32 bg-primary-50">
        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-h1 font-heading text-primary-900 mb-8">
              About Serenity
            </h1>
            <p className="text-body-lg text-primary-600 leading-relaxed">
              A sanctuary for mind, body, and spirit
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-h2 font-heading text-primary-900 mb-8">
                Our Story
              </h2>
              <p className="text-body text-primary-600 leading-relaxed mb-6">
                {content['about-story']}
              </p>
              <p className="text-body text-primary-600 leading-relaxed">
                We've created a space where everyone feels welcome, supported, and inspired 
                to explore their practice. Whether you're taking your first class or you've 
                been practicing for years, you'll find a home here.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative h-[500px] bg-gradient-to-br from-primary-100 to-accent-100"
            >
              {/* Placeholder for image */}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 bg-primary-50">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative h-[500px] bg-gradient-to-br from-accent-100 to-primary-100 order-2 lg:order-1"
            >
              {/* Placeholder for image */}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-h2 font-heading text-primary-900 mb-8">
                Our Mission
              </h2>
              <p className="text-body text-primary-600 leading-relaxed mb-6">
                {content['about-mission']}
              </p>
              <p className="text-body text-primary-600 leading-relaxed">
                Through mindful movement, breath work, and meditation, we help our students 
                find balance, reduce stress, and cultivate a deeper connection with themselves.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-h2 font-heading text-primary-900 mb-6">
              Our Values
            </h2>
            <p className="text-body-lg text-primary-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: 'Inclusivity',
                description: 'Everyone is welcome here, regardless of age, ability, or experience level.',
              },
              {
                title: 'Mindfulness',
                description: 'We practice presence and awareness in every moment, on and off the mat.',
              },
              {
                title: 'Community',
                description: 'We believe in the power of connection and supporting each other's growth.',
              },
              {
                title: 'Authenticity',
                description: 'We encourage you to honor your unique journey and practice without judgment.',
              },
              {
                title: 'Growth',
                description: 'We're committed to continuous learning and evolution, both personally and collectively.',
              },
              {
                title: 'Balance',
                description: 'We strive for harmony between effort and ease, strength and flexibility.',
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h3 className="text-2xl font-heading text-primary-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-body text-primary-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-h2 font-heading mb-8">
              Ready to Join Us?
            </h2>
            <p className="text-body-lg mb-12 opacity-90 max-w-2xl mx-auto">
              Experience the transformative power of yoga in our welcoming community
            </p>
            <a
              href="/schedule"
              className="inline-block bg-white text-primary-900 px-12 py-4 text-sm tracking-wider uppercase hover:bg-primary-100 transition-all duration-300"
            >
              View Schedule
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;