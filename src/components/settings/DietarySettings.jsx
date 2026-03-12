import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const DietarySettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    dietary_preference: [],
    allergen_warnings: [],
    spice_tolerance: 'medium'
  });

  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { value: 'non-vegetarian', label: 'Non-Vegetarian', icon: '🍖' },
    { value: 'vegan', label: 'Vegan', icon: '🌱' },
    { value: 'jain', label: 'Jain', icon: '🪷' }
  ];

  const allergenOptions = [
    { value: 'nuts', label: 'Nuts', icon: '🥜' },
    { value: 'dairy', label: 'Dairy', icon: '🥛' },
    { value: 'eggs', label: 'Eggs', icon: '🥚' },
    { value: 'shellfish', label: 'Shellfish', icon: '🦐' },
    { value: 'soy', label: 'Soy', icon: '🫘' },
    { value: 'gluten', label: 'Gluten', icon: '🌾' }
  ];

  const spiceLevels = [
    { value: 'none', label: 'No Spice', icon: '🥛', color: '#10B981' },
    { value: 'mild', label: 'Mild', icon: '🌶️', color: '#84CC16' },
    { value: 'medium', label: 'Medium', icon: '🌶️🌶️', color: '#F59E0B' },
    { value: 'spicy', label: 'Spicy', icon: '🌶️🌶️🌶️', color: '#EF4444' },
    { value: 'extra_spicy', label: 'Extra Spicy', icon: '🌶️🌶️🌶️🌶️', color: '#991B1B' }
  ];

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences({
          dietary_preference: data.dietary_preference || [],
          allergen_warnings: data.allergen_warnings || [],
          spice_tolerance: data.spice_tolerance || 'medium'
        });
      }
    } catch (_error) {
      // Error fetching dietary preferences
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Dietary preferences updated!');
    } catch (_error) {
      // Error updating dietary preferences
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const toggleDietary = (value) => {
    setPreferences(prev => ({
      ...prev,
      dietary_preference: prev.dietary_preference.includes(value)
        ? prev.dietary_preference.filter(item => item !== value)
        : [...prev.dietary_preference, value]
    }));
  };

  const toggleAllergen = (value) => {
    setPreferences(prev => ({
      ...prev,
      allergen_warnings: prev.allergen_warnings.includes(value)
        ? prev.allergen_warnings.filter(item => item !== value)
        : [...prev.allergen_warnings, value]
    }));
  };

  return (
    <div className="dietary-settings">
      <h2>Dietary Preferences</h2>
      <p className="settings-description">
        Set your dietary preferences to get personalized menu recommendations and allergen warnings
      </p>

      <form onSubmit={handleSave}>
        {/* Food Preferences */}
        <section className="settings-section">
          <h3>Food Preferences</h3>
          <p className="section-description">
            Select your dietary preferences (you can select multiple)
          </p>
          
          <div className="preference-grid">
            {dietaryOptions.map(option => (
              <label key={option.value} className="preference-card">
                <input
                  type="checkbox"
                  checked={preferences.dietary_preference.includes(option.value)}
                  onChange={() => toggleDietary(option.value)}
                />
                <div className="card-content">
                  <span className="card-icon">{option.icon}</span>
                  <span className="card-label">{option.label}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="preference-info">
            ℹ️ Menu items will be filtered and highlighted based on your preferences
          </div>
        </section>

        {/* Allergen Warnings */}
        <section className="settings-section">
          <h3>Allergen Warnings</h3>
          <p className="section-description">
            Select allergens you'd like to be warned about
          </p>
          
          <div className="preference-grid">
            {allergenOptions.map(option => (
              <label key={option.value} className="preference-card allergen-card">
                <input
                  type="checkbox"
                  checked={preferences.allergen_warnings.includes(option.value)}
                  onChange={() => toggleAllergen(option.value)}
                />
                <div className="card-content">
                  <span className="card-icon">{option.icon}</span>
                  <span className="card-label">{option.label}</span>
                </div>
                {preferences.allergen_warnings.includes(option.value) && (
                  <span className="warning-badge">⚠️</span>
                )}
              </label>
            ))}
          </div>

          <div className="preference-info warning">
            ⚠️ You will see clear warnings when menu items contain your selected allergens
          </div>
        </section>

        {/* Spice Tolerance */}
        <section className="settings-section">
          <h3>Spice Tolerance</h3>
          <p className="section-description">
            Let us know your preferred spice level
          </p>
          
          <div className="spice-level-selector">
            {spiceLevels.map(level => (
              <label 
                key={level.value} 
                className={`spice-level-option ${preferences.spice_tolerance === level.value ? 'selected' : ''}`}
                style={{ '--level-color': level.color }}
              >
                <input
                  type="radio"
                  name="spice_tolerance"
                  value={level.value}
                  checked={preferences.spice_tolerance === level.value}
                  onChange={(e) => setPreferences({ ...preferences, spice_tolerance: e.target.value })}
                />
                <div className="level-content">
                  <span className="level-icon">{level.icon}</span>
                  <span className="level-label">{level.label}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="preference-info">
            🌶️ We'll recommend dishes that match your spice preference
          </div>
        </section>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>

      {/* Benefits Section */}
      <section className="settings-section benefits-section">
        <h4>Benefits of Setting Preferences</h4>
        <ul>
          <li>✅ Personalized menu filtering</li>
          <li>✅ Allergen warnings on menu items</li>
          <li>✅ Smart recommendations based on your taste</li>
          <li>✅ Save time browsing the menu</li>
          <li>✅ Safer dining experience</li>
        </ul>
      </section>
    </div>
  );
};

export default DietarySettings;
