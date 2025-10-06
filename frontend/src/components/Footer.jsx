import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentAPI } from '../services/api';

const Footer = () => {
  const [content, setContent] = useState({
    'brand_name': 'Nirlipta Yoga',
    'brand_tagline': 'Transform your mind, body, and spirit through yoga.',
    'email': 'hello@nirliptayoga.com',
    'phone': '+1 (555) 123-4567',
    'address': '123 Wellness Street',
    'hours_weekday': 'Mon - Fri: 6am - 9pm',
    'hours_saturday': 'Saturday: 7am - 7pm',
    'hours_sunday': 'Sunday: 8am - 6pm',
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await contentAPI.getByPage('footer');
        if (response.data) {
          setContent(prev => ({ ...prev, ...response.data }));
        }
      } catch (err) {
        console.error('Failed to fetch footer content:', err);
      }
    };
    fetchContent();
  }, []);

  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-heading text-neutral-900 mb-4">
              {content.brand_name}
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {content.brand_tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm tracking-wider uppercase text-neutral-900 mb-4 font-medium">
              Navigate
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Schedule
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm tracking-wider uppercase text-neutral-900 mb-4 font-medium">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li>{content.email}</li>
              <li>{content.phone}</li>
              <li>{content.address}</li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-sm tracking-wider uppercase text-neutral-900 mb-4 font-medium">
              Hours
            </h4>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li>{content.hours_weekday}</li>
              <li>{content.hours_saturday}</li>
              <li>{content.hours_sunday}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200 mt-12 pt-8 text-center">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} {content.brand_name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;