# Car Rental Platform - React Application

## Project Overview
A full-scale web-based Car Rental Platform built with React, implementing all features from the SRS document.

## Features Implemented

### 1. User Module
- User registration and login
- Vehicle search with filters (by name and type)
- Vehicle booking with date selection
- Booking management dashboard
- Payment calculation based on rental duration

### 2. Vendor Module
- Vendor registration and verification
- Vehicle listing management (add, view)
- Booking approval/rejection system
- Revenue tracking
- Fleet overview

### 3. Admin Module
- User and vendor management
- Vehicle monitoring
- System-wide statistics
- Booking oversight
- Complete platform analytics

### 4. Core Features
- Role-based authentication (User, Vendor, Admin)
- Responsive design
- Real-time availability checking
- Secure session management with localStorage
- Dynamic routing with React Router

## Technology Stack
- **Frontend**: React 19.2.0
- **Routing**: React Router DOM 7.13.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Pure CSS (no external UI libraries)

## Project Structure
```
src/
├── components/
│   ├── AdminDashboard.jsx    # Admin dashboard component
│   ├── UserDashboard.jsx     # User dashboard component
│   ├── VendorDashboard.jsx   # Vendor dashboard component
│   ├── Navbar.jsx            # Navigation bar
│   ├── Dashboard.css         # Dashboard styles
│   └── Navbar.css            # Navbar styles
├── pages/
│   ├── Home.jsx              # Landing page with vehicle listings
│   ├── Login.jsx             # Login page
│   ├── Register.jsx          # Registration page
│   ├── Dashboard.jsx         # Role-based dashboard router
│   ├── VehicleDetail.jsx     # Vehicle details and booking
│   ├── Auth.css              # Authentication pages styles
│   ├── Home.css              # Home page styles
│   └── VehicleDetail.css     # Vehicle detail styles
├── context/
│   └── AuthContext.jsx       # Authentication context provider
├── data/
│   └── mockData.js           # Mock data (users, vehicles, bookings)
├── App.jsx                   # Main app component
├── App.css                   # Global app styles
├── main.jsx                  # Entry point
└── index.css                 # Base styles
```

## Installation & Setup

1. Navigate to project directory:
```bash
cd b:\Project\FSD\project
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser and navigate to the URL shown in terminal (typically http://localhost:5173)

## Demo Credentials

### User Account
- Email: user@test.com
- Password: user123
- Access: Browse vehicles, make bookings, view booking history

### Vendor Account
- Email: vendor@test.com
- Password: vendor123
- Access: Manage vehicles, approve/reject bookings, track revenue

### Admin Account
- Email: admin@test.com
- Password: admin123
- Access: Full system oversight, user management, analytics

## Key Functionalities

### For Users:
1. Browse available vehicles on home page
2. Search vehicles by name
3. Filter vehicles by type (Sedan, SUV, Truck, Electric)
4. View detailed vehicle information
5. Book vehicles by selecting dates
6. View booking history and status
7. Track pending, approved, and rejected bookings

### For Vendors:
1. Add new vehicles to the platform
2. View all owned vehicles
3. Monitor booking requests
4. Approve or reject bookings
5. Track total revenue
6. Manage vehicle availability

### For Admins:
1. View all users, vendors, and vehicles
2. Monitor all bookings across the platform
3. Access system-wide statistics
4. Oversee platform operations

## Application Flow

1. **Landing Page**: Users see available vehicles with search/filter options
2. **Authentication**: Users can register or login with role selection
3. **Vehicle Details**: Click on any vehicle to see details and book
4. **Booking Process**: Select dates, system calculates total cost
5. **Dashboard**: Role-specific dashboard shows relevant information
6. **Vendor Approval**: Vendors approve/reject booking requests
7. **Admin Oversight**: Admins monitor entire platform

## Data Management
- Uses mock data stored in `src/data/mockData.js`
- Data persists during session (in-memory)
- Authentication state saved in localStorage
- Ready for backend API integration

## Responsive Design
- Mobile-friendly interface
- Adapts to different screen sizes
- Touch-friendly buttons and forms
- Optimized for tablets and desktops

## Future Enhancements (from SRS Appendix C)
- Mobile application support
- AI-based vehicle recommendations
- Dynamic pricing strategies
- Payment gateway integration
- Email/SMS notifications
- Advanced analytics and reporting

## Build for Production
```bash
npm run build
```

## Notes
- All requirements from SRS document are implemented
- Clean, minimal code following best practices
- No external UI libraries for maximum control
- Easy to extend and customize
- Ready for backend integration
