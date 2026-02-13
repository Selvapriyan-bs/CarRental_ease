# Car Rental Backend API

## Setup Instructions

1. **Install MongoDB**
   - Download and install MongoDB Community Server
   - Start MongoDB service: `mongod`

2. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Setup**
   - Update `.env` file with your MongoDB URI
   - Default: `mongodb://localhost:27017/carrental`

4. **Start Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Add vehicle (vendor only)

### Bookings
- `GET /api/bookings` - Get user/vendor bookings
- `POST /api/bookings` - Create booking (user only)
- `PUT /api/bookings/:id` - Update booking status

## Database Schema

### User
- name, email, password (hashed), role, createdAt

### Vehicle
- vendorId, name, type, price (₹), image, available, year, seats, transmission

### Booking
- userId, vehicleId, startDate, endDate, total (₹), status, createdAt

## Features
- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- MongoDB with Mongoose ODM
- CORS enabled for frontend integration