import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LocationPicker.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, setAddress, onLocationSelect }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      fetchAddress(e.latlng.lat, e.latlng.lng);
    },
  });

  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.address) {
        const addressData = {
          full: data.display_name,
          city: data.address.city || data.address.town || data.address.village || '',
          state: data.address.state || '',
        };
        setAddress(addressData);
        
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          location: addressData.full,
          city: addressData.city,
          state: addressData.state,
        });
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  return position ? <Marker position={position} /> : null;
}

const LocationPicker = ({ onLocationSelect, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition || [20.5937, 78.9629]);
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState({ full: '', city: '', state: '' });

  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!searchQuery) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setPosition([lat, lng]);
        
        const addressData = {
          full: data[0].display_name,
          city: data[0].address?.city || data[0].address?.town || data[0].address?.village || '',
          state: data[0].address?.state || '',
        };
        setAddress(addressData);
        
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          location: addressData.full,
          city: addressData.city,
          state: addressData.state,
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  return (
    <div className="location-picker">
      <div className="search-form">
        <input
          type="text"
          placeholder="Search for a location (e.g., Chennai, Tamil Nadu)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
          className="search-input"
        />
        <button type="button" onClick={handleSearch} className="search-btn">Search</button>
      </div>
      
      <div className="map-container">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
          key={position.join(',')}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} onLocationSelect={onLocationSelect} />
        </MapContainer>
      </div>

      {address.full && (
        <div className="selected-address">
          <strong>Selected Location:</strong>
          <p>{address.full}</p>
          <p><strong>City:</strong> {address.city} | <strong>State:</strong> {address.state}</p>
          <p><strong>Coordinates:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}</p>
        </div>
      )}
      
      <p className="map-hint">💡 Click on the map to select a location or search above</p>
    </div>
  );
};

export default LocationPicker;