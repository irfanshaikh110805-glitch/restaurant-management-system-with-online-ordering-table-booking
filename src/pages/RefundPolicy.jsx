import { motion } from 'framer-motion';
import { pageTransition } from '../utils/animations';
import SEO from '../components/SEO';
import './LegalPages.css';

export default function RefundPolicy() {
  return (
    <>
      <SEO 
        title="Refund Policy — Hotel Everest Family Restaurant"
        description="Learn about our cancellation and refund policy for orders and reservations."
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
            <h1>Refund & Cancellation Policy</h1>
            <p className="legal-meta">Last Updated: February 22, 2026</p>
          </div>

          <div className="legal-content">
            <section>
              <h2>1. Overview</h2>
              <p>
                At Hotel Everest Family Restaurant, we strive to provide excellent service and quality food. This policy outlines our refund and cancellation procedures for orders, reservations, and other services.
              </p>
            </section>

            <section>
              <h2>2. Order Cancellations</h2>
              
              <h3>2.1 Before Order Preparation</h3>
              <ul>
                <li><strong>Timeframe:</strong> Within 2 minutes of order placement</li>
                <li><strong>Refund:</strong> 100% refund to original payment method</li>
                <li><strong>Processing Time:</strong> 5-7 business days</li>
                <li><strong>How to Cancel:</strong> Contact us immediately via phone or app</li>
              </ul>

              <h3>2.2 After Order Preparation Begins</h3>
              <ul>
                <li><strong>Status:</strong> Order cannot be cancelled</li>
                <li><strong>Reason:</strong> Food preparation has started</li>
                <li><strong>Alternative:</strong> You may refuse delivery (see section 3)</li>
              </ul>

              <h3>2.3 During Delivery</h3>
              <ul>
                <li><strong>Status:</strong> Order cannot be cancelled</li>
                <li><strong>Reason:</strong> Order is en route</li>
                <li><strong>Alternative:</strong> Contact support for assistance</li>
              </ul>
            </section>

            <section>
              <h2>3. Refund Eligibility</h2>
              
              <h3>3.1 Full Refund Scenarios</h3>
              <p>You are eligible for a 100% refund if:</p>
              <ul>
                <li>Order was not delivered within 60 minutes of estimated time</li>
                <li>Wrong items were delivered</li>
                <li>Food quality is significantly below standards</li>
                <li>Food is spoiled or contaminated</li>
                <li>Missing items from your order</li>
                <li>We cancelled your order</li>
              </ul>

              <h3>3.2 Partial Refund Scenarios</h3>
              <p>You may receive a partial refund if:</p>
              <ul>
                <li>Some items are missing (refund for missing items only)</li>
                <li>Food temperature is not as expected</li>
                <li>Minor quality issues</li>
                <li>Packaging issues (food still consumable)</li>
              </ul>

              <h3>3.3 No Refund Scenarios</h3>
              <p>Refunds will NOT be provided for:</p>
              <ul>
                <li>Change of mind after order preparation</li>
                <li>Incorrect address provided by customer</li>
                <li>Customer unavailable at delivery location</li>
                <li>Taste preferences (unless quality issue)</li>
                <li>Spice level (if not specified in order)</li>
                <li>Delivery delays due to weather or traffic</li>
              </ul>
            </section>

            <section>
              <h2>4. Table Reservation Cancellations</h2>
              
              <h3>4.1 Cancellation Policy</h3>
              <ul>
                <li><strong>More than 2 hours before:</strong> Free cancellation</li>
                <li><strong>Less than 2 hours before:</strong> May incur cancellation fee</li>
                <li><strong>No-show:</strong> May affect future booking privileges</li>
              </ul>

              <h3>4.2 How to Cancel Reservations</h3>
              <ul>
                <li>Through your account on our website/app</li>
                <li>Call us at +91 98765 43210</li>
                <li>Email: bookings@hoteleverestfamilyrestaurant.com</li>
              </ul>
            </section>

            <section>
              <h2>5. Refund Process</h2>
              
              <h3>5.1 How to Request a Refund</h3>
              <ol>
                <li>Contact customer support within 24 hours of delivery</li>
                <li>Provide order number and reason for refund</li>
                <li>Provide photos if applicable (quality issues)</li>
                <li>Our team will review your request</li>
                <li>Decision will be communicated within 24-48 hours</li>
              </ol>

              <h3>5.2 Refund Methods</h3>
              <ul>
                <li><strong>Online Payments:</strong> Refunded to original payment method</li>
                <li><strong>Cash on Delivery:</strong> Bank transfer or store credit</li>
                <li><strong>Wallet Payments:</strong> Refunded to wallet</li>
              </ul>

              <h3>5.3 Refund Timeline</h3>
              <ul>
                <li><strong>Wallet/Store Credit:</strong> Instant</li>
                <li><strong>UPI/Debit Card:</strong> 3-5 business days</li>
                <li><strong>Credit Card:</strong> 5-7 business days</li>
                <li><strong>Net Banking:</strong> 5-7 business days</li>
              </ul>
              <p><em>Note: Timeline depends on your bank's processing time</em></p>
            </section>

            <section>
              <h2>6. Quality Guarantee</h2>
              <p>We guarantee:</p>
              <ul>
                <li>Fresh ingredients in all dishes</li>
                <li>Proper food handling and hygiene</li>
                <li>Accurate order fulfillment</li>
                <li>Timely delivery within estimated time</li>
                <li>Proper packaging and temperature maintenance</li>
              </ul>
            </section>

            <section>
              <h2>7. Loyalty Points and Refunds</h2>
              <ul>
                <li>Points earned on refunded orders will be deducted</li>
                <li>Points used for discounts will be refunded</li>
                <li>Promotional points may not be refunded</li>
              </ul>
            </section>

            <section>
              <h2>8. Promotional Offers and Refunds</h2>
              <ul>
                <li>Discount codes remain valid if order is cancelled</li>
                <li>One-time use codes may be restored upon refund</li>
                <li>Cashback offers follow partner terms and conditions</li>
              </ul>
            </section>

            <section>
              <h2>9. Dispute Resolution</h2>
              <p>If you're not satisfied with our refund decision:</p>
              <ol>
                <li>Contact our customer support manager</li>
                <li>Provide additional information if needed</li>
                <li>We will review your case within 48 hours</li>
                <li>Final decision will be communicated via email</li>
              </ol>
            </section>

            <section>
              <h2>10. Contact Information</h2>
              <p>For refund requests or questions:</p>
              <div className="contact-info">
                <p><strong>Customer Support</strong></p>
                <p>Phone: <a href="tel:+919876543210">+91 98765 43210</a></p>
                <p>Email: <a href="mailto:support@hoteleverestfamilyrestaurant.com">support@hoteleverestfamilyrestaurant.com</a></p>
                <p>Hours: 10:00 AM - 11:00 PM (Daily)</p>
              </div>
            </section>

            <section>
              <h2>11. Policy Updates</h2>
              <p>
                We reserve the right to modify this policy at any time. Changes will be effective immediately upon posting. Continued use of our services constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="legal-footer">
              <p>
                We value your satisfaction and will work to resolve any issues promptly and fairly.
              </p>
            </section>
          </div>
        </div>
      </motion.div>
    </>
  );
}
