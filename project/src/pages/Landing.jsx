import { Link } from 'react-router-dom';
import { Car01Icon, Shield01Icon, DollarCircleIcon, Clock01Icon, StarIcon, ArrowRight01Icon } from 'hugeicons-react';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find Your Perfect Ride</h1>
          <p>Premium car rentals at unbeatable prices. Book instantly and drive away with confidence.</p>
          <div className="hero-buttons">
            <Link to="/home" className="btn-primary">Browse Cars</Link>
            <Link to="/register" className="btn-secondary">Join as Vendor</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="car-showcase">
            <div className="car-card">
              <img src="https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop" alt="Luxury Car" />
              <span className="price-tag">₹2,500/day</span>
            </div>
            <div className="car-card">
              <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&h=200&fit=crop" alt="SUV" />
              <span className="price-tag">₹3,200/day</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Car01Icon size={48} />
              <h3>Premium Fleet</h3>
              <p>Wide selection of well-maintained vehicles from economy to luxury</p>
            </div>
            <div className="feature-card">
              <Shield01Icon size={48} />
              <h3>Fully Insured</h3>
              <p>All vehicles come with comprehensive insurance coverage</p>
            </div>
            <div className="feature-card">
              <DollarCircleIcon size={48} />
              <h3>Best Prices</h3>
              <p>Competitive rates with no hidden fees or charges</p>
            </div>
            <div className="feature-card">
              <Clock01Icon size={48} />
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support for your peace of mind</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>10,000+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Vehicles Available</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <p>Cities Covered</p>
            </div>
            <div className="stat-item">
              <h3>4.8★</h3>
              <p>Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <h2>What Our Customers Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">
                {[...Array(5)].map((_, i) => <StarIcon key={i} size={20} />)}
              </div>
              <p>"Amazing service! The car was clean, well-maintained, and the booking process was seamless."</p>
              <div className="customer">
                <strong>Rajesh Kumar</strong>
                <span>Mumbai</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">
                {[...Array(5)].map((_, i) => <StarIcon key={i} size={20} />)}
              </div>
              <p>"Great prices and excellent customer support. Highly recommend for anyone looking to rent a car."</p>
              <div className="customer">
                <strong>Priya Sharma</strong>
                <span>Delhi</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">
                {[...Array(5)].map((_, i) => <StarIcon key={i} size={20} />)}
              </div>
              <p>"The variety of cars available is impressive. Found the perfect vehicle for my family trip."</p>
              <div className="customer">
                <strong>Amit Patel</strong>
                <span>Bangalore</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Hit the Road?</h2>
          <p>Join thousands of satisfied customers and book your perfect ride today</p>
          <Link to="/home" className="btn-cta">
            Start Booking <ArrowRight01Icon size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;