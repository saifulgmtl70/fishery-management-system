
import { Link } from 'react-router-dom'
import {
  Fish,
  Waves,
  ArrowUpRight,
} from 'lucide-react'

import './Footer.css'

const navigation = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Our Fishery', path: '/fishery' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact', path: '/contact' },
]

const Footer = () => {
  return (
    <footer className="fishery-footer">

      {/* Background Image */}
      <div className="fishery-footer-background" />

      <div className="fishery-container fishery-footer-content">

        <div className="fishery-footer-main">

          {/* Brand Information */}
          <div className="fishery-footer-brand">

            <Link to="/" className="fishery-footer-logo">
              <span className="footer-logo-icon">
                <Fish size={23} />
              </span>

              <span>
                Fishery<span>.</span>
              </span>
            </Link>

            <p>
              Dedicated to responsible aquaculture, sustainable
              fish production and better fishery management.
              From our ponds to the market, we focus on quality
              and responsible growth.
            </p>

            <div className="fishery-footer-note">
              <Waves size={17} />

              <span>
                Growing with Nature. Harvesting with Care.
              </span>
            </div>

          </div>

          {/* Explore Links */}
          <div className="fishery-footer-column">

            <h3>Explore</h3>

            <div className="fishery-footer-links">
              {navigation.map((item) => (
                <Link key={item.path} to={item.path}>
                  {item.name}
                </Link>
              ))}
            </div>

          </div>

          {/* Operations Links */}
          <div className="fishery-footer-column">

            <h3>Our Operations</h3>

            <div className="fishery-footer-links">

              <Link to="/fishery">
                Pond Management
              </Link>

              <Link to="/fishery">
                Fish Production
              </Link>

              <Link to="/fishery">
                Harvesting & Supply
              </Link>

              <Link to="/gallery">
                Pond & Lake Gallery
              </Link>

              <Link to="/contact">
                Business Inquiry
              </Link>

            </div>

          </div>

          {/* Contact Section */}
          <div className="fishery-footer-column">

            <h3>Get in Touch</h3>

            <p className="fishery-footer-contact-text">
              Interested in our fishery operations or wholesale
              supply? We would love to hear from you.
            </p>

            <Link
              to="/contact"
              className="fishery-footer-contact-button"
            >
              Contact Our Team
              <ArrowUpRight size={16} />
            </Link>

            <Link
              to="/login"
              className="fishery-footer-login"
            >
              Management Portal
              <ArrowUpRight size={14} />
            </Link>

          </div>

        </div>

        {/* Footer Bottom */}
        <div className="fishery-footer-bottom">

          <p>
            © {new Date().getFullYear()} Fishery Management System.
            All rights reserved.
          </p>

          <p className="fishery-footer-bottom-tagline">
            <Waves size={15} />
            Aquaculture & Beyond
          </p>

        </div>

      </div>

    </footer>
  )
}

export default Footer
