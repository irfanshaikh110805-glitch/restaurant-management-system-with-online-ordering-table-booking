import { motion } from 'framer-motion';
import { pageTransition } from '../utils/animations';
import SEO from '../components/SEO';
import './LegalPages.css';

export default function TermsOfService() {
  return (
    <>
      <SEO 
        title="Terms of Service — Hotel Everest Family Restaurant"
        description="Read the terms and conditions for using Hotel Everest Family Restaurant's services."
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
            <h1>Terms of Service</h1>
            <p className="legal-meta">Last Updated: February 22, 2026</p>
          </div>

          <div className="legal-content">
            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>
                Welcome to Hotel Everest Family Restaurant. By accessing or using our website, mobile application, or services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2>2. Description of Services</h2>
              <p>Hotel Everest Family Restaurant provides:</p>
              <ul>
                <li>Online food ordering and delivery services</li>
                <li>Table reservation and booking services</li>
                <li>Loyalty program and rewards</li>
                <li>Event catering services</li>
                <li>Customer reviews and ratings</li>
                <li>Promotional offers and discounts</li>
              </ul>
            </section>

            <section>
              <h2>3. User Accounts</h2>
              
              <h3>3.1 Account Creation</h3>
              <p>To use certain features, you must create an account. You agree to:</p>
              <ul>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Update your information as needed</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of unauthorized access</li>
              </ul>

              <h3>3.2 Account Eligibility</h3>
              <p>You must be at least 18 years old to create an account and place orders.</p>

              <h3>3.3 Account Termination</h3>
              <p>We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.</p>
            </section>

            <section>
              <h2>4. Orders and Payments</h2>
              
              <h3>4.1 Order Placement</h3>
              <ul>
                <li>All orders are subject to acceptance and availability</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Prices are subject to change without notice</li>
                <li>Menu items and availability may vary</li>
              </ul>

              <h3>4.2 Payment</h3>
              <ul>
                <li>Payment is required at the time of order placement</li>
                <li>We accept credit/debit cards, UPI, wallets, and cash on delivery</li>
                <li>All payments are processed securely through third-party providers</li>
                <li>You are responsible for any fees charged by your payment provider</li>
              </ul>

              <h3>4.3 Pricing</h3>
              <ul>
                <li>All prices are in Indian Rupees (INR)</li>
                <li>Prices include applicable taxes unless stated otherwise</li>
                <li>Delivery fees are calculated based on distance and order value</li>
                <li>We reserve the right to correct pricing errors</li>
              </ul>
            </section>

            <section>
              <h2>5. Delivery Services</h2>
              
              <h3>5.1 Delivery Areas</h3>
              <p>Delivery is available within our designated service areas. Delivery fees and minimum order amounts may apply.</p>

              <h3>5.2 Delivery Times</h3>
              <p>Estimated delivery times are approximate and not guaranteed. Delays may occur due to weather, traffic, or high demand.</p>

              <h3>5.3 Delivery Instructions</h3>
              <p>You must provide accurate delivery information. We are not responsible for orders delivered to incorrect addresses provided by you.</p>

              <h3>5.4 Failed Deliveries</h3>
              <p>If delivery cannot be completed due to incorrect information or unavailability, you may be charged for the order.</p>
            </section>

            <section>
              <h2>6. Table Reservations</h2>
              <ul>
                <li>Reservations are subject to availability</li>
                <li>We reserve the right to cancel reservations if necessary</li>
                <li>Please arrive within 15 minutes of your reservation time</li>
                <li>Late arrivals may result in table reassignment</li>
                <li>Cancellations should be made at least 2 hours in advance</li>
              </ul>
            </section>

            <section>
              <h2>7. Loyalty Program</h2>
              
              <h3>7.1 Earning Points</h3>
              <p>Points are earned on eligible purchases and activities as specified in the program terms.</p>

              <h3>7.2 Redeeming Points</h3>
              <p>Points can be redeemed for rewards as outlined in the loyalty program. Points have no cash value.</p>

              <h3>7.3 Program Changes</h3>
              <p>We reserve the right to modify or discontinue the loyalty program at any time with notice.</p>

              <h3>7.4 Point Expiration</h3>
              <p>Points may expire after a period of inactivity as specified in the program terms.</p>
            </section>

            <section>
              <h2>8. Reviews and User Content</h2>
              
              <h3>8.1 User-Generated Content</h3>
              <p>By submitting reviews, photos, or other content, you grant us a non-exclusive, royalty-free license to use, display, and distribute your content.</p>

              <h3>8.2 Content Guidelines</h3>
              <p>You agree not to post content that is:</p>
              <ul>
                <li>False, misleading, or defamatory</li>
                <li>Offensive, abusive, or harassing</li>
                <li>Infringing on intellectual property rights</li>
                <li>Containing personal information of others</li>
                <li>Spam or promotional material</li>
              </ul>

              <h3>8.3 Content Moderation</h3>
              <p>We reserve the right to remove or modify any content that violates these Terms.</p>
            </section>

            <section>
              <h2>9. Cancellations and Refunds</h2>
              <p>Please refer to our <a href="/refund-policy">Refund Policy</a> for detailed information about cancellations and refunds.</p>
            </section>

            <section>
              <h2>10. Prohibited Activities</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use our services for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of our services</li>
                <li>Use automated systems (bots) without permission</li>
                <li>Impersonate others or provide false information</li>
                <li>Engage in fraudulent activities</li>
                <li>Harass or abuse our staff or other users</li>
                <li>Scrape or copy content without permission</li>
              </ul>
            </section>

            <section>
              <h2>11. Intellectual Property</h2>
              <p>
                All content on our website, including text, graphics, logos, images, and software, is the property of Hotel Everest Family Restaurant or its licensors and is protected by copyright and trademark laws.
              </p>
              <p>You may not:</p>
              <ul>
                <li>Copy, modify, or distribute our content without permission</li>
                <li>Use our trademarks or branding without authorization</li>
                <li>Reverse engineer or decompile our software</li>
              </ul>
            </section>

            <section>
              <h2>12. Disclaimers and Limitations of Liability</h2>
              
              <h3>12.1 Service "As Is"</h3>
              <p>
                Our services are provided "as is" without warranties of any kind, either express or implied. We do not guarantee uninterrupted or error-free service.
              </p>

              <h3>12.2 Food Allergies and Dietary Restrictions</h3>
              <p>
                While we make efforts to accommodate dietary restrictions, we cannot guarantee that our food is free from allergens. Please inform us of any allergies or dietary requirements.
              </p>

              <h3>12.3 Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, Hotel Everest Family Restaurant shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.
              </p>
            </section>

            <section>
              <h2>13. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Hotel Everest Family Restaurant, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your violation of these Terms or misuse of our services.
              </p>
            </section>

            <section>
              <h2>14. Privacy</h2>
              <p>
                Your use of our services is also governed by our <a href="/privacy-policy">Privacy Policy</a>. Please review it to understand how we collect and use your information.
              </p>
            </section>

            <section>
              <h2>15. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of significant changes by email or through a notice on our website. Your continued use of our services after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2>16. Governing Law and Dispute Resolution</h2>
              
              <h3>16.1 Governing Law</h3>
              <p>These Terms are governed by the laws of India and the State of Karnataka.</p>

              <h3>16.2 Dispute Resolution</h3>
              <p>
                Any disputes arising from these Terms or our services shall be resolved through:
              </p>
              <ol>
                <li>Good faith negotiation between the parties</li>
                <li>Mediation, if negotiation fails</li>
                <li>Arbitration in Vijayapura, Karnataka, if mediation fails</li>
              </ol>

              <h3>16.3 Jurisdiction</h3>
              <p>The courts of Vijayapura, Karnataka shall have exclusive jurisdiction over any disputes.</p>
            </section>

            <section>
              <h2>17. Severability</h2>
              <p>
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
              </p>
            </section>

            <section>
              <h2>18. Contact Information</h2>
              <p>For questions about these Terms, please contact us:</p>
              <div className="contact-info">
                <p><strong>Hotel Everest Family Restaurant</strong></p>
                <p>MG Road, Vijayapura, Karnataka 586101</p>
                <p>Email: <a href="mailto:legal@hoteleverestfamilyrestaurant.com">legal@hoteleverestfamilyrestaurant.com</a></p>
                <p>Phone: <a href="tel:+919876543210">+91 98765 43210</a></p>
              </div>
            </section>

            <section className="legal-footer">
              <p>
                By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </div>
      </motion.div>
    </>
  );
}
