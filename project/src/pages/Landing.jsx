import { Link } from 'react-router-dom';
import { 
  Car01Icon, 
  Shield01Icon, 
  DollarCircleIcon, 
  Clock01Icon, 
  StarIcon, 
  ArrowRight01Icon,
  Search01Icon,
  Calendar03Icon,
  Location01Icon,
  CheckmarkCircle02Icon,
  ChartLineData01Icon,
  SafeIcon
} from 'hugeicons-react';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-elements">
          <div className="glow-orb glow-orb-1"></div>
          <div className="glow-orb glow-orb-2"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <span className="hero-badge">New Generation of Mobility</span>
              <h1>Find Your Perfect Ride</h1>
              <p>Premium car rentals at unbeatable prices. From luxury sedans for business to rugged SUVs for your weekend adventures, we have it all.</p>
              <div className="hero-buttons">
                <Link to="/home" className="btn-primary">Browse Fleet <ArrowRight01Icon size={20} /></Link>
                <Link to="/register" className="btn-secondary">List Your Car</Link>
              </div>
              <div className="hero-trust">
                <div className="trust-item">
                  <CheckmarkCircle02Icon size={20} />
                  <span>Verified Cars</span>
                </div>
                <div className="trust-item">
                  <CheckmarkCircle02Icon size={20} />
                  <span>No Hidden Fees</span>
                </div>
                <div className="trust-item">
                  <CheckmarkCircle02Icon size={20} />
                  <span>Instant Booking</span>
                </div>
              </div>
            </div>
            <div className="hero-image">
              <div className="car-showcase">
                <div className="car-card car-card-1">
                  <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80" alt="Luxury Porsche" />
                  <span className="price-tag">₹1,500/day</span>
                </div>
                <div className="car-card car-card-2">
                  <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80" alt="SUV" />
                  <span className="price-tag">₹1,800/day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="sub-title">Simple Process</span>
            <h2 className="section-title">How It Works</h2>
            <p>Rent a car in three easy steps. No paperwork, no hassle.</p>
          </div>
          <div className="process-grid">
            <div className="process-item">
              <div className="process-icon"><Search01Icon size={32} /></div>
              <h3>1. Choose & Search</h3>
              <p>Browse our extensive fleet and find the vehicle that perfectly matches your style and requirements.</p>
            </div>
            <div className="process-item">
              <div className="process-icon"><Calendar03Icon size={32} /></div>
              <h3>2. Select Date & Book</h3>
              <p>Choose your pick-up and drop-off dates, confirm your location, and book with a single click.</p>
            </div>
            <div className="process-item">
              <div className="process-icon"><Location01Icon size={32} /></div>
              <h3>3. Pick-Up & Drive</h3>
              <p>Meet your vehicle at the selected location or get it delivered, and enjoy your journey!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="sub-title">Premium Experience</span>
            <h2 className="section-title">Why Choose Us?</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Car01Icon size={32} /></div>
              <h3>Curated Fleet</h3>
              <p>We handpick every vehicle to ensure the highest standards of safety, comfort, and performance.</p>
              <ul className="feature-list">
                <li><CheckmarkCircle02Icon size={16} /> Regular Sanitization</li>
                <li><CheckmarkCircle02Icon size={16} /> Safety Inspection</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Shield01Icon size={32} /></div>
              <h3>Full Insurance</h3>
              <p>Your safety is our priority. Every rental includes comprehensive damage and theft protection.</p>
              <ul className="feature-list">
                <li><CheckmarkCircle02Icon size={16} /> 24/7 Roadside Assist</li>
                <li><CheckmarkCircle02Icon size={16} /> Zero Liability Policy</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><DollarCircleIcon size={32} /></div>
              <h3>Transparent Pricing</h3>
              <p>What you see is what you pay. No security deposit or hidden convenience fees at checkout.</p>
              <ul className="feature-list">
                <li><CheckmarkCircle02Icon size={16} /> Best Price Guarantee</li>
                <li><CheckmarkCircle02Icon size={16} /> Easy Refund Policy</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Clock01Icon size={32} /></div>
              <h3>Flexible Booking</h3>
              <p>Change of plans? No problem. We offer free cancellations and easy extension options.</p>
              <ul className="feature-list">
                <li><CheckmarkCircle02Icon size={16} /> Instant Confirmation</li>
                <li><CheckmarkCircle02Icon size={16} /> 24-Hour Extensions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Vendor Section */}
      <section className="vendor-promo-section">
        <div className="container">
          <div className="vendor-promo-card">
            <div className="promo-content">
              <span className="promo-badge">For Car Owners</span>
              <h2>Earn Up to ₹50,000 Monthly</h2>
              <p>Join our marketplace as a vendor and turn your idle car into a revenue-generating asset.</p>
              <div className="promo-features">
                <div className="p-feature">
                  <ChartLineData01Icon size={24} />
                  <div>
                    <h4>Smart Analytics</h4>
                    <p>Track your earnings and fleet performance with ease.</p>
                  </div>
                </div>
                <div className="p-feature">
                  <SafeIcon size={24} />
                  <div>
                    <h4>Safe & Secure</h4>
                    <p>Complete insurance coverage for your listed vehicles.</p>
                  </div>
                </div>
              </div>
              <Link to="/register" className="btn-vendor-cta">Start Earning Now</Link>
            </div>
            <div className="promo-image">
              <img src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80" alt="Vendor Dashboard" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>25k+</h3>
              <p>Trips Completed</p>
            </div>
            <div className="stat-item">
              <h3>1.2k+</h3>
              <p>Premium Vehicles</p>
            </div>
            <div className="stat-item">
              <h3>120+</h3>
              <p>Pick-up Points</p>
            </div>
            <div className="stat-item">
              <h3>4.9★</h3>
              <p>Customer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="sub-title">User Stories</span>
            <h2 className="section-title">What Our Customers Say</h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">
                {[...Array(5)].map((_, i) => <StarIcon key={i} size={20} />)}
              </div>
              <p>"The best car rental experience I've ever had. The Porsche 911 was in pristine condition. Highly professional service!"</p>
              <div className="customer">
                <strong>Arjun Mehta</strong>
                <span>New Delhi</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">
                {[...Array(5)].map((_, i) => <StarIcon key={i} size={20} />)}
              </div>
              <p>"Listing my SUV here was the best financial decision this year. The platform is secure and the analytics are great."</p>
              <div className="customer">
                <strong>Sonia Varma</strong>
                <span>Bangalore</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">
                {[...Array(5)].map((_, i) => <StarIcon key={i} size={20} />)}
              </div>
              <p>"Found a perfect family car for our coastal trip. Extremely transparent pricing with zero hidden charges."</p>
              <div className="customer">
                <strong>David Wilson</strong>
                <span>Goa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-container">
            <div className="cta-bg"></div>
            <div className="cta-content">
              <h2>Ready to Hit the Road?</h2>
              <p>Join the future of car rental today and experience premium mobility like never before.</p>
              <Link to="/home" className="btn-cta">
                Browse Collection <ArrowRight01Icon size={24} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;