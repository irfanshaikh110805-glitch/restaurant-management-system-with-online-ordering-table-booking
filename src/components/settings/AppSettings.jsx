import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { FiType, FiEye } from 'react-icons/fi';

const AppSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [reduceAnimations, setReduceAnimations] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  useEffect(() => {
    // Apply font size
    document.documentElement.style.setProperty('--base-font-size', 
      fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px'
    );
  }, [fontSize]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        if (data.font_size) setFontSize(data.font_size);
        // Set other preferences if they exist
      }
    } catch (_error) {
      // Error fetching app preferences
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          font_size: fontSize,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('App preferences saved!');
    } catch (_error) {
      // Error saving app preferences
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-settings">
      <h2><FiType /> App Settings</h2>
      <p className="settings-description">
        Customize your app experience
      </p>

      {/* Font Size Settings */}
      <section className="settings-section">
        <h3><FiType /> Font Size</h3>
        <p className="section-description">
          Adjust text size for better readability
        </p>
        
        <div className="font-size-selector">
          <label className={`size-option ${fontSize === 'small' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="fontSize"
              value="small"
              checked={fontSize === 'small'}
              onChange={(e) => setFontSize(e.target.value)}
            />
            <div className="size-preview size-small">
              <span>Aa</span>
              <span className="size-label">Small</span>
            </div>
          </label>

          <label className={`size-option ${fontSize === 'medium' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="fontSize"
              value="medium"
              checked={fontSize === 'medium'}
              onChange={(e) => setFontSize(e.target.value)}
            />
            <div className="size-preview size-medium">
              <span>Aa</span>
              <span className="size-label">Medium</span>
            </div>
          </label>

          <label className={`size-option ${fontSize === 'large' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="fontSize"
              value="large"
              checked={fontSize === 'large'}
              onChange={(e) => setFontSize(e.target.value)}
            />
            <div className="size-preview size-large">
              <span>Aa</span>
              <span className="size-label">Large</span>
            </div>
          </label>
        </div>
        
        <div className="preference-info">
          📏 Font size:{' '}
          {fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px'}
        </div>
      </section>

      {/* Accessibility */}
      <section className="settings-section">
        <h3><FiEye /> Accessibility</h3>
        <p className="section-description">
          Enhance your experience with accessibility features
        </p>
        
        <div className="accessibility-options">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={reduceAnimations}
              onChange={(e) => setReduceAnimations(e.target.checked)}
            />
            <div>
              <span className="option-title">Reduce animations</span>
              <span className="option-description">Minimize motion effects throughout the app</span>
            </div>
          </label>
          
          <label className="checkbox-label">
            <input 
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
            />
            <div>
              <span className="option-title">High contrast mode</span>
              <span className="option-description">Increase contrast for better visibility</span>
            </div>
          </label>
          
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked disabled />
            <div>
              <span className="option-title">Screen reader support</span>
              <span className="option-description">Enhanced for screen reader users</span>
            </div>
          </label>
        </div>
      </section>

      <button onClick={handleSave} className="btn-primary" disabled={loading}>
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
};

export default AppSettings;
