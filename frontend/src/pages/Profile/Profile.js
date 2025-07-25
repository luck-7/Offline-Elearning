import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNetwork } from '../../hooks/useNetwork';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { isOnline } = useNetwork();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!isOnline) {
      alert('Profile updates require an internet connection.');
      return;
    }

    try {
      setSaving(true);
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser(formData);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      username: user?.username || ''
    });
    setEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Profile Header */}
            <div className="profile-header mb-4">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="profile-avatar">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                </div>
                <div className="col">
                  <h1 className="display-6 fw-bold mb-1">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="text-muted mb-0">
                    <i className="bi bi-shield-check me-2"></i>
                    {user?.roles?.includes('ROLE_TEACHER') ? 'Teacher' : 'Student'}
                  </p>
                </div>
                <div className="col-auto">
                  {!editing && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setEditing(true)}
                      disabled={!isOnline}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-person me-2"></i>
                  Profile Information
                </h5>
              </div>
              <div className="card-body">
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="firstName" className="form-label">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="lastName" className="form-label">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>

                  {editing && (
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <LoadingSpinner size="small" />
                            <span className="ms-2">Saving...</span>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check me-2"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <i className="bi bi-x me-2"></i>
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Network Status */}
            {!isOnline && (
              <div className="alert alert-warning mt-4">
                <i className="bi bi-wifi-off me-2"></i>
                You're offline. Profile editing requires an internet connection.
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-header {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          color: white;
          padding: 2rem;
          border-radius: 15px;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          color: white;
        }

        .card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          border-radius: 15px 15px 0 0 !important;
        }

        .form-control {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .form-control:disabled {
          background-color: #f8f9fa;
          border-color: #e9ecef;
        }

        @media (max-width: 768px) {
          .profile-header {
            text-align: center;
          }
          
          .profile-header .row {
            justify-content: center;
          }
          
          .profile-header .col-auto:last-child {
            margin-top: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
