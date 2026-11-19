
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Fish,
  Waves,
  ArrowUpRight,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'

import './Navbar.css'

const navigation = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Our Fishery', path: '/fishery' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact', path: '/contact' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {/* Top Information Bar */}
      <div className="fishery-topbar">
        <div className="fishery-container fishery-topbar-inner">
          <div className="fishery-topbar-message">
            <Waves size={14} />
            <span>Responsible Farming. Sustainable Future.</span>
          </div>

          <div className="fishery-topbar-right">
            <span>Freshwater Aquaculture</span>
            <span className="topbar-dot">•</span>
            <span>Fish Production & Supply</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="fishery-header">
        <nav className="fishery-container fishery-navbar">

          {/* Brand Identity */}
          <Link
            to="/"
            onClick={closeMenu}
            className="fishery-brand"
            aria-label="Fishery Home"
          >
            <div className="fishery-brand-mark">
              <Fish size={26} strokeWidth={1.8} />
              <span className="brand-mark-dot" />
            </div>

            <div className="fishery-brand-copy">
              <span className="fishery-brand-name">
                Fishery<span>.</span>
              </span>

              <span className="fishery-brand-tagline">
                AQUACULTURE & BEYOND
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="fishery-desktop-nav">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `fishery-nav-link ${isActive ? 'active' : ''}`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Management Portal Button */}
          <div className="fishery-header-action">
            <Link to="/login" className="fishery-portal-button">
              <span>Admin Portal </span>
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className={`fishery-menu-toggle ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="fishery-mobile-navigation"
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div
          id="fishery-mobile-navigation"
          className={`fishery-mobile-nav ${menuOpen ? 'is-open' : ''}`}
          aria-hidden={!menuOpen}
        >
          <div className="fishery-mobile-nav-inner">
            <div className="mobile-nav-heading">
              <span>Explore Fishery</span>
              <span className="mobile-nav-heading-line" />
            </div>

            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={closeMenu}
                tabIndex={menuOpen ? 0 : -1}
                className={({ isActive }) =>
                  `fishery-mobile-link ${isActive ? 'active' : ''}`
                }
              >
                <span>{item.name}</span>
                <ChevronRight size={17} />
              </NavLink>
            ))}

            <Link
              to="/login"
              onClick={closeMenu}
              tabIndex={menuOpen ? 0 : -1}
              className="fishery-mobile-portal"
            >
              Admin Portal
              <ArrowUpRight size={17} />
            </Link>

            <div className="mobile-nav-footer">
              <Waves size={16} />
              <span>
                Responsible Aquaculture & Sustainable Growth
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar
