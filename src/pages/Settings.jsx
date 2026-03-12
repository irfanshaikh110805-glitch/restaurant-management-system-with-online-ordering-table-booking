import { useState } from 'react';
import { FiUser, FiBell, FiMapPin, FiCreditCard, FiHeart, FiSettings as FiSettingsIcon, FiShield } from 'react-icons/fi';
import AccountSettings from '../components/settings/AccountSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import DeliverySettings from '../components/settings/DeliverySettings';
import PaymentSettings from '../components/settings/PaymentSettings';
import DietarySettings from '../components/settings/DietarySettings';
import AppSettings from '../components/settings/AppSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import '../styles/Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account', icon: FiUser },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'delivery', label: 'Delivery', icon: FiMapPin },
    { id: 'payment', label: 'Payment', icon: FiCreditCard },
    { id: 'dietary', label: 'Dietary Preferences', icon: FiHeart },
    { id: 'app', label: 'App Settings', icon: FiSettingsIcon },
    { id: 'privacy', label: 'Privacy', icon: FiShield }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'delivery':
        return <DeliverySettings />;
      case 'payment':
        return <PaymentSettings />;
      case 'dietary':
        return <DietarySettings />;
      case 'app':
        return <AppSettings />;
      case 'privacy':
        return <PrivacySettings />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and settings</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="settings-nav-icon" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="settings-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
