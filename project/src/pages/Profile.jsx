import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserIcon, Mail01Icon, Call02Icon, Location01Icon, Building01Icon, BankIcon, Edit02Icon } from 'hugeicons-react';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bankAccount: '',
    ifscCode: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setProfileData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        bankAccount: data.bankAccount || '',
        ifscCode: data.ifscCode || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        setEditing(false);
        fetchProfile();
      } else {
        const error = await response.json();
        alert('Failed to update profile: ' + error.message);
      }
    } catch (error) {
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>My Profile</h1>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-edit">
              <Edit02Icon size={20} /> Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="profile-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-field">
                <label><UserIcon size={20} /> Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  disabled={!editing}
                  required
                />
              </div>
              <div className="form-field">
                <label><Mail01Icon size={20} /> Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                />
              </div>
              <div className="form-field">
                <label><Call02Icon size={20} /> Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  disabled={!editing}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Address Details</h3>
            <div className="form-grid">
              <div className="form-field full-width">
                <label><Location01Icon size={20} /> Address</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  disabled={!editing}
                  placeholder="Street address"
                />
              </div>
              <div className="form-field">
                <label>City</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                  disabled={!editing}
                  placeholder="City"
                />
              </div>
              <div className="form-field">
                <label>State</label>
                <input
                  type="text"
                  value={profileData.state}
                  onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                  disabled={!editing}
                  placeholder="State"
                />
              </div>
              <div className="form-field">
                <label>Pincode</label>
                <input
                  type="text"
                  value={profileData.pincode}
                  onChange={(e) => setProfileData({...profileData, pincode: e.target.value})}
                  disabled={!editing}
                  placeholder="Pincode"
                  maxLength="6"
                />
              </div>
            </div>
          </div>

          {user && user.role === 'vendor' && (
            <div className="profile-section">
              <h3>Bank Details</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label><BankIcon size={20} /> Bank Account Number</label>
                  <input
                    type="text"
                    value={profileData.bankAccount}
                    onChange={(e) => setProfileData({...profileData, bankAccount: e.target.value})}
                    disabled={!editing}
                    placeholder="Account number"
                  />
                </div>
                <div className="form-field">
                  <label><Building01Icon size={20} /> IFSC Code</label>
                  <input
                    type="text"
                    value={profileData.ifscCode}
                    onChange={(e) => setProfileData({...profileData, ifscCode: e.target.value.toUpperCase()})}
                    disabled={!editing}
                    placeholder="IFSC Code"
                    maxLength="11"
                  />
                </div>
              </div>
            </div>
          )}

          {editing && (
            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => {setEditing(false); fetchProfile();}} className="btn-cancel">
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;