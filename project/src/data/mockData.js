export const users = [
  { id: 1, email: 'user@test.com', password: 'user123', role: 'user', name: 'John Doe' },
  { id: 2, email: 'vendor@test.com', password: 'vendor123', role: 'vendor', name: 'Jane Smith' },
  { id: 3, email: 'admin@test.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  { id: 4, email: 'murugan@cars.com', password: 'murugan123', role: 'vendor', name: 'Murugan Cars' }
];

export const vehicles = [
  { id: 1, vendorId: 2, name: 'Toyota Camry', type: 'Sedan', price: 4000, image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=300&h=200&fit=crop', available: true, year: 2023, seats: 5, transmission: 'Automatic' },
  { id: 2, vendorId: 2, name: 'Honda CR-V', type: 'SUV', price: 5600, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop', available: true, year: 2023, seats: 7, transmission: 'Automatic' },
  { id: 3, vendorId: 2, name: 'Tesla Model 3', type: 'Electric', price: 7200, image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=300&h=200&fit=crop', available: true, year: 2024, seats: 5, transmission: 'Automatic' },
  { id: 4, vendorId: 2, name: 'Ford F-150', type: 'Truck', price: 6400, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300&h=200&fit=crop', available: false, year: 2023, seats: 5, transmission: 'Automatic' }
];

export const bookings = [];
