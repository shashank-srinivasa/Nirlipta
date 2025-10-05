import { motion } from 'framer-motion';

const About = () => {
  const instructors = [
    {
      name: 'Maya Patel',
      title: 'Lead Instructor',
      image: '👩‍🏫',
      bio: '15+ years of experience in Hatha and Vinyasa yoga. Certified yoga therapist.',
    },
    {
      name: 'James Wilson',
      title: 'Senior Instructor',
      image: '👨‍🏫',
      bio: 'Specializes in Ashtanga and Power yoga. Former athlete turned yogi.',
    },
    {
      name: 'Sophia Lee',
      title: 'Meditation Expert',
      image: '👩‍⚕️',
      bio: 'Focuses on mindfulness and restorative practices. Certified meditation guide.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-heading font-bold text-gray-900 mb-6">
              About Serenity Yoga
            </h1>
            <p className="text-xl text-gray-600">
              Your journey to wellness starts here
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="prose prose-lg text-gray-600">
              <p className="mb-4">
                Founded in 2015, Serenity Yoga has been a sanctuary for those seeking balance, 
                peace, and wellness in their lives. What started as a small studio with a handful 
                of passionate instructors has grown into a thriving community of yoga enthusiasts.
              </p>
              <p className="mb-4">
                Our mission is simple: to make yoga accessible to everyone, regardless of age, 
                fitness level, or experience. We believe that yoga is not just about physical 
                postures—it's a holistic practice that nurtures the mind, body, and spirit.
              </p>
              <p>
                Today, we offer a diverse range of classes, from gentle restorative sessions to 
                challenging power yoga, ensuring there's something for everyone in our community.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Instructors */}
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
              Learn from the best in the practice
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {instructors.map((instructor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="text-7xl mb-4">{instructor.image}</div>
                <h3 className="text-2xl font-heading font-semibold text-gray-900 mb-2">
                  {instructor.name}
                </h3>
                <p className="text-primary-600 font-medium mb-4">{instructor.title}</p>
                <p className="text-gray-600">{instructor.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-8 text-center">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border-l-4 border-primary-600 bg-primary-50">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
                <p className="text-gray-600">
                  Building a supportive and inclusive environment where everyone feels welcome.
                </p>
              </div>
              <div className="p-6 border-l-4 border-secondary-600 bg-secondary-50">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mindfulness</h3>
                <p className="text-gray-600">
                  Encouraging present-moment awareness in every practice and daily life.
                </p>
              </div>
              <div className="p-6 border-l-4 border-primary-600 bg-primary-50">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth</h3>
                <p className="text-gray-600">
                  Supporting personal development and continuous learning for all students.
                </p>
              </div>
              <div className="p-6 border-l-4 border-secondary-600 bg-secondary-50">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Wellness</h3>
                <p className="text-gray-600">
                  Promoting holistic health through physical, mental, and spiritual practices.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;

