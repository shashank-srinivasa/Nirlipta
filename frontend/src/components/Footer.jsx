import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-primary-200">
      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-heading text-neutral-900 mb-4">
              Nirlipta Yoga
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Transform your mind, body, and spirit through yoga.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm tracking-wider uppercase text-primary-900 mb-4">
              Navigate
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-primary-600 hover:text-primary-900 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-sm text-primary-600 hover:text-primary-900 transition-colors">
                  Schedule
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-primary-600 hover:text-primary-900 transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm tracking-wider uppercase text-primary-900 mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-primary-600">
              <li>hello@serenity.yoga</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Wellness Street</li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-sm tracking-wider uppercase text-primary-900 mb-4">
              Hours
            </h4>
            <ul className="space-y-3 text-sm text-primary-600">
              <li>Mon - Fri: 6am - 9pm</li>
              <li>Saturday: 7am - 7pm</li>
              <li>Sunday: 8am - 6pm</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200 mt-12 pt-8 text-center">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Nirlipta Yoga. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;