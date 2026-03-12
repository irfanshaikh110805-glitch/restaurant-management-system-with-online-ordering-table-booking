import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { FiUpload, FiTrash2 } from 'react-icons/fi';

const AccountSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    anniversary_date: '',
    profile_image_url: ''
  });
  const [passwords, setPasswords] = useState({
    current: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone || '',
        date_of_birth: data.date_of_birth || '',
        anniversary_date: data.anniversary_date || '',
        profile_image_url: data.profile_image_url || ''
      });
    } catch (_error) {
      // Error fetching user profile
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = profile.profile_image_url;

      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          date_of_birth: profile.date_of_birth || null,
          anniversary_date: profile.anniversary_date || null,
          profile_image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setImageFile(null);
    } catch (_error) {
      // Error updating user profile
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      toast.success('Password changed successfully!');
      setPasswords({ current: '', newPassword: '', confirmPassword: '' });
    } catch (_error) {
      // Error changing password
      toast.error(_error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }

    setLoading(true);

    try {
      // Delete user data (cascade will handle related records)
      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) throw error;

      toast.success('Account deleted successfully');
      // User will be automatically logged out
    } catch (_error) {
      // Error deleting user account
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profile_image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="account-settings">
      <h2>Account Settings</h2>

      {/* Profile Information */}
      <section className="settings-section">
        <h3>Edit Profile</h3>
        <form onSubmit={handleProfileUpdate}>
          {/* Profile Image */}
          <div className="profile-image-upload">
            <div className="image-preview">
              {profile.profile_image_url ? (
                <img src={profile.profile_image_url} alt="Profile" />
              ) : (
                <div className="image-placeholder">
                  {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="image-actions">
              <label htmlFor="profile-image" className="upload-btn">
                <FiUpload /> Upload Photo
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
              </label>
              {imageFile && (
                <span className="file-name">{imageFile.name}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="full_name">Full Name *</label>
              <input
                type="text"
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                type="date"
                id="dob"
                value={profile.date_of_birth}
                onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
              />
              <small>We'll send you a special birthday treat!</small>
            </div>

            <div className="form-group">
              <label htmlFor="anniversary">Anniversary Date</label>
              <input
                type="date"
                id="anniversary"
                value={profile.anniversary_date}
                onChange={(e) => setProfile({ ...profile, anniversary_date: e.target.value })}
              />
              <small>Celebrate with exclusive offers!</small>
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="disabled-input"
            />
            <small>Email cannot be changed. Contact support if needed.</small>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </section>

      {/* Change Password */}
      <section className="settings-section">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label htmlFor="new-password">New Password *</label>
            <input
              type="password"
              id="new-password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm New Password *</label>
            <input
              type="password"
              id="confirm-password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </section>

      {/* Delete Account */}
      <section className="settings-section danger-zone">
        <h3>Delete Account</h3>
        <p className="warning-text">
          Once you delete your account, there is no going back. All your data including orders,
          bookings, and loyalty points will be permanently deleted.
        </p>
        <button 
          onClick={handleDeleteAccount} 
          className="btn-danger"
          disabled={loading}
        >
          <FiTrash2 /> Delete My Account
        </button>
      </section>
    </div>
  );
};

export default AccountSettings;
