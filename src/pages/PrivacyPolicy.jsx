import { motion } from 'framer-motion';
import { pageTransition } from '../utils/animations';
import SEO from '../components/SEO';
import './LegalPages.css';

export default function PrivacyPolicy() {
  return (
    <>
      <SEO 
        title="Privacy Policy — Hotel Everest Family Restaurant"
        description="Learn how Hotel Everest Family Restaurant collects, uses, and protects your personal information."
      />
      <motion.div 
        className="legal-page"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
      >
        <div className="container container-narrow">
          <div className="legal-header">
            <h1>Privacy Policy</h1>
            <p className="legal-meta">Last Updated: February 22, 2026</p>
          </div>

          <div className="legal-content">
            <section>
              <h2>1. Introduction</h2>
              <p>
                Welcome to Hotel Everest Family Restaurant ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
            </section>

            <section>
              <h2>2. Information We Collect</h2>
              
              <h3>2.1 Personal Information</h3>
              <p>We may collect the following personal information:</p>
              <ul>
                <li>Name and contact information (email, phone number)</li>
                <li>Delivery address and location data</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Order history and preferences</li>
                <li>Account credentials (username, password - encrypted)</li>
                <li>Profile information (dietary preferences, allergens)</li>
              </ul>

              <h3>2.2 Automatically Collected Information</h3>
              <ul>
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on site</li>
                <li>Referring website addresses</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3>2.3 Location Information</h3>
              <p>
                With your permission, we collect location data to provide delivery services, calculate delivery fees, and show nearby restaurant locations.
              </p>
            </section>

            <section>
              <h2>3. How We Use Your Information</h2>
              <p>We use your information for the following purposes:</p>
              <ul>
                <li>Processing and fulfilling your orders</li>
                <li>Managing your account and preferences</li>
                <li>Providing customer support</li>
                <li>Sending order confirmations and updates</li>
                <li>Processing payments securely</li>
                <li>Improving our services and user experience</li>
                <li>Sending promotional offers (with your consent)</li>
                <li>Analyzing usage patterns and trends</li>
                <li>Preventing fraud and ensuring security</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2>4. Information Sharing and Disclosure</h2>
              
              <h3>4.1 We Do NOT Sell Your Information</h3>
              <p>We do not sell, rent, or trade your personal information to third parties.</p>

              <h3>4.2 Service Providers</h3>
              <p>We may share information with trusted service providers who assist us in:</p>
              <ul>
                <li>Payment processing (Stripe, Razorpay)</li>
                <li>Delivery services</li>
                <li>Email communications</li>
                <li>Analytics and performance monitoring</li>
                <li>Cloud hosting (Supabase)</li>
              </ul>

              <h3>4.3 Legal Requirements</h3>
              <p>We may disclose information when required by law or to:</p>
              <ul>
                <li>Comply with legal processes</li>
                <li>Protect our rights and property</li>
                <li>Prevent fraud or security issues</li>
                <li>Protect user safety</li>
              </ul>
            </section>

            <section>
              <h2>5. Data Security</h2>
              <p>We implement industry-standard security measures to protect your information:</p>
              <ul>
                <li>SSL/TLS encryption for data transmission</li>
                <li>Encrypted password storage</li>
                <li>Secure payment processing (PCI DSS compliant)</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Row Level Security (RLS) in our database</li>
              </ul>
              <p>
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2>6. Cookies and Tracking Technologies</h2>
              <p>We use cookies and similar technologies to:</p>
              <ul>
                <li>Remember your preferences and settings</li>
                <li>Analyze site traffic and usage patterns</li>
                <li>Personalize content and advertisements</li>
                <li>Improve site functionality</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Note that disabling cookies may affect site functionality.
              </p>
            </section>

            <section>
              <h2>7. Your Rights and Choices</h2>
              
              <h3>7.1 Access and Update</h3>
              <p>You can access and update your personal information through your account settings.</p>

              <h3>7.2 Data Portability</h3>
              <p>You can request a copy of your data in a machine-readable format.</p>

              <h3>7.3 Deletion</h3>
              <p>You can request deletion of your account and personal data. Some information may be retained for legal or business purposes.</p>

              <h3>7.4 Marketing Communications</h3>
              <p>You can opt-out of promotional emails by clicking "unsubscribe" or updating your notification preferences.</p>

              <h3>7.5 Location Data</h3>
              <p>You can disable location services in your device settings, though this may limit certain features.</p>
            </section>

            <section>
              <h2>8. Children's Privacy</h2>
              <p>
                Our services are not intended for children under 13. We do not knowingly collect information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2>9. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of these sites. Please review their privacy policies.
              </p>
            </section>

            <section>
              <h2>10. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data.
              </p>
            </section>

            <section>
              <h2>11. Data Retention</h2>
              <p>We retain your information for as long as necessary to:</p>
              <ul>
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p>Order history is typically retained for 7 years for accounting purposes.</p>
            </section>

            <section>
              <h2>12. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on our website. The "Last Updated" date at the top indicates when the policy was last revised.
              </p>
            </section>

            <section>
              <h2>13. Contact Us</h2>
              <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
              <div className="contact-info">
                <p><strong>Hotel Everest Family Restaurant</strong></p>
                <p>MG Road, Vijayapura, Karnataka 586101</p>
                <p>Email: <a href="mailto:privacy@hoteleverestfamilyrestaurant.com">privacy@hoteleverestfamilyrestaurant.com</a></p>
                <p>Phone: <a href="tel:+919876543210">+91 98765 43210</a></p>
              </div>
            </section>

            <section>
              <h2>14. GDPR Compliance (For EU Users)</h2>
              <p>If you are in the European Union, you have additional rights under GDPR:</p>
              <ul>
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
              </ul>
              <p>To exercise these rights, please contact us at the email above.</p>
            </section>

            <section className="legal-footer">
              <p>
                By using our services, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
              </p>
            </section>
          </div>
        </div>
      </motion.div>
    </>
  );
}
