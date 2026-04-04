# 🍽️ Spice Haven - Restaurant Management System

A modern, production-ready restaurant management web application built with React 18, Vite, and Supabase. This comprehensive system provides end-to-end functionality for online food ordering, table reservations, order tracking, loyalty programs, and complete restaurant administration.

## 🌐 Live Demo

**[View Live Application](https://hoteleverestfamilyrestaurant.netlify.app/)**

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/hoteleverestfamilyrestaurant/deploys)

---

## ✨ Features Overview

### 🛍️ Customer Features

#### Core Functionality
- **🍽️ Dynamic Menu Browsing** - Browse categorized menu with real-time availability, advanced filtering (vegetarian, vegan, spicy levels), and intelligent search
- **🛒 Smart Shopping Cart** - Persistent cart with local storage, quantity management, and real-time price calculations
- **📱 Real-time Order Tracking** - Live order status updates with visual progress indicators (pending → confirmed → preparing → ready → delivered)
- **🪑 Table Booking System** - Reserve tables with date/time selection, party size management, special requests, and occasion types
- **⭐ Reviews & Ratings** - Rate menu items and restaurant experience with moderation system
- **👤 User Profile Management** - Comprehensive account settings, order history, saved addresses, and dietary preferences

#### Advanced Features
- **🎁 Loyalty Program** - Multi-tier rewards system (Bronze → Silver → Gold → Platinum) with points earning and redemption
- **🎯 Referral System** - Generate referral codes, earn bonus points for successful referrals
- **🎉 Promotions & Offers** - View active promotions, apply discount codes, seasonal campaigns
- **🔔 Smart Notifications** - Real-time updates for orders, bookings, promotions, and loyalty milestones
- **💳 Multiple Payment Options** - Razorpay integration, Cash on Delivery, Pay at Restaurant, UPI, Cards, Wallets
- **📍 Delivery Tracking** - Interactive maps with Leaflet, real-time delivery location updates
- **🌙 Theme Switching** - Dark mode support with system preference detection
- **📱 Progressive Web App** - Installable, offline-capable with service worker

### � Admin Features

#### Dashboard & Analytics
- **📊 Comprehensive Dashboard** - Real-time statistics (revenue, orders, bookings), visual charts with Recharts
- **📈 Business Intelligence** - Order trends, revenue analytics, customer insights, peak hours analysis

#### Management Modules
- **🍕 Menu Management** - CRUD operations for menu items, categories, pricing, availability, featured items
- **📦 Order Management** - Process orders, update status, manage payments, refunds, order history
- **📅 Booking Management** - Approve/reject reservations, table allocation, capacity management
- **📈 Inventory Manager** - Track stock levels, low stock alerts, ingredient management
- **🎯 Promotion Manager** - Create campaigns, discount codes, validity periods, usage limits
- **💬 Review Moderation** - Approve/reject reviews, feature testimonials, manage ratings
- **👥 User Management** - View customer profiles, order history, loyalty status

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.2 with Hooks and Context API
- **Build Tool**: Vite 7.3 (Lightning-fast HMR, optimized production builds)
- **Routing**: React Router DOM v6 with lazy loading
- **State Management**: Context API + Custom Hooks (useLocalStorage, useCustomHooks)
- **Styling**: CSS3 with CSS Variables, Mobile-first responsive design
- **Animations**: Framer Motion 12 for smooth transitions
- **UI Components**: Custom component library with accessibility support

### Backend & Database
- **Backend as a Service**: Supabase
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication & Authorization
  - Storage for images
- **Database Schema**: 
  - 12+ tables with proper relationships
  - Triggers for auto-updates
  - Comprehensive RLS policies
  - Migration system

### Integrations & Libraries
- **Payment Gateway**: Razorpay (with Stripe support ready)
- **Maps**: Leaflet + React Leaflet for location services
- **Charts**: Recharts for analytics visualization
- **Icons**: React Icons (5000+ icons)
- **Image Gallery**: Swiper for touch-friendly carousels
- **Notifications**: React Hot Toast with custom styling
- **Date Handling**: date-fns with timezone support
- **QR Codes**: react-qr-code for order/booking codes
- **Social Sharing**: react-share for promotions

### Performance & Optimization
- **Code Splitting**: Route-based and vendor chunking
- **Image Optimization**: WebP format, lazy loading, responsive images
- **Compression**: Gzip + Brotli compression
- **Caching**: Service Worker with offline support
- **Bundle Analysis**: Optimized chunk sizes (<250KB warning limit)
- **Web Vitals Monitoring**: Real-time performance tracking

### Security Features
- **OWASP Top 10 Coverage**: Comprehensive security implementation
- **Input Sanitization**: XSS, SQL injection, path traversal protection
- **Rate Limiting**: Tiered rate limits (critical, sensitive, standard, read)
- **Content Security Policy**: Strict CSP headers
- **Password Policy**: Strong password requirements with validation
- **Session Management**: Secure session handling with timeouts
- **Error Monitoring**: Centralized error tracking and logging
- **Security Middleware**: Request validation, suspicious activity detection

### Development Tools
- **Linting**: ESLint with React plugins
- **Formatting**: Prettier with custom config
- **Version Control**: Git with GitHub Actions CI/CD
- **Containerization**: Docker + Docker Compose support
- **Testing Scripts**: Performance audits, mobile testing, deployment verification

---

## 📋 Prerequisites

- **Node.js**: v18 or higher (LTS recommended)
- **npm**: v9+ or **yarn**: v1.22+
- **Supabase Account**: [Sign up free](https://supabase.com)
- **Razorpay Account**: [Get API keys](https://razorpay.com) (optional for payments)
- **Git**: For version control

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/irfanshaikh110805-glitch/restaurant-management-system-with-online-ordering-table-booking.git
cd restaurant-management-system-with-online-ordering-table-booking
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Payment Gateway (Optional)
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# Google Maps (Optional)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Analytics (Optional)
VITE_ENABLE_ANALYTICS=false
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Application Settings
VITE_APP_URL=http://localhost:5173
VITE_ENABLE_PWA=true
```

### 4. Database Setup

#### Option A: Using Supabase Dashboard
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Navigate to SQL Editor
4. Run the following scripts in order:
   - `supabase/schema.sql` - Base schema with tables and RLS policies
   - `supabase/migration_add_item_reviews.sql` - Review system
   - `supabase/migration_add_payment_fields.sql` - Payment enhancements
   - `supabase/schema_improvements.sql` - Additional features
   - `supabase/enhanced_schema.sql` - Loyalty and promotions

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 📦 Available Scripts

### Development
```bash
npm run dev              # Start development server with HMR
npm run preview          # Preview production build locally
```

### Building
```bash
npm run build            # Create optimized production build
npm run analyze          # Analyze bundle size
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

### Testing & Auditing
```bash
npm run test             # Run full-stack tests
npm run test:mobile      # Mobile-specific tests
npm run audit            # Performance audit
npm run audit:prod       # Production performance audit
npm run security:audit   # Security vulnerability scan
```

### Optimization
```bash
npm run optimize:images  # Optimize images (WebP conversion)
npm run perf:boost       # Performance optimization
npm run perf:100         # Target 100% performance score
```

### Deployment
```bash
npm run check-deployment # Verify deployment readiness
npm run verify:deployment # Post-deployment verification
```

### Docker
```bash
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
npm run docker:compose   # Start with Docker Compose
npm run docker:down      # Stop Docker containers
```

---

## 🏗️ Project Structure

```
spice-haven/
├── .github/
│   └── workflows/           # CI/CD pipelines
├── .netlify/
│   └── plugins/             # Netlify build plugins
├── public/
│   ├── *.png, *.webp        # Optimized images
│   ├── sw.js                # Service Worker
│   ├── site.webmanifest     # PWA manifest
│   ├── sitemap.xml          # SEO sitemap
│   └── _headers, _redirects # Netlify config
├── scripts/
│   ├── optimize-images.js   # Image optimization
│   ├── performance-audit.js # Performance testing
│   └── fix-eslint.js        # Code quality tools
├── src/
│   ├── assets/              # Static assets
│   ├── components/          # Reusable UI components
│   │   ├── settings/        # Settings sub-components
│   │   ├── Badge.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Footer.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── MenuFilters.jsx
│   │   ├── MobileBottomNav.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── OptimizedImage.jsx
│   │   ├── Pagination.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── RatingStars.jsx
│   │   ├── ResponsiveImage.jsx
│   │   ├── ScrollToTop.jsx
│   │   ├── SearchBar.jsx
│   │   └── SEO.jsx
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx  # Authentication state
│   │   ├── CartContext.jsx  # Shopping cart state
│   │   ├── DeliveryContext.jsx # Delivery tracking
│   │   ├── LoyaltyContext.jsx # Loyalty program
│   │   ├── NotificationContext.jsx # Notifications
│   │   └── ThemeContext.jsx # Theme switching
│   ├── hooks/               # Custom React hooks
│   │   ├── useCustomHooks.js # useLocalStorage, useDebounce
│   │   ├── usePageTracking.js # Analytics tracking
│   │   └── useSEO.js        # SEO meta tags
│   ├── lib/                 # Third-party integrations
│   │   └── supabase.js      # Supabase client
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin panel pages
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MenuManagement.jsx
│   │   │   ├── OrderManagement.jsx
│   │   │   ├── BookingManagement.jsx
│   │   │   ├── InventoryManager.jsx
│   │   │   ├── PromotionManager.jsx
│   │   │   └── ReviewModeration.jsx
│   │   ├── Home.jsx, HomeOptimized.jsx
│   │   ├── Menu.jsx
│   │   ├── Cart.jsx
│   │   ├── Booking.jsx
│   │   ├── Profile.jsx
│   │   ├── Settings.jsx
│   │   ├── OrderConfirmation.jsx
│   │   ├── OrderTracking.jsx
│   │   ├── LoyaltyProgram.jsx
│   │   ├── PromotionsPage.jsx
│   │   ├── ReviewsPage.jsx
│   │   ├── EventsPage.jsx
│   │   ├── Gallery.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Login.jsx, Register.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   ├── TermsOfService.jsx
│   │   ├── RefundPolicy.jsx
│   │   └── NotFound.jsx
│   ├── styles/              # Global styles
│   │   ├── mobile-fixes.css
│   │   ├── mobile-optimizations.css
│   │   ├── responsive.css
│   │   └── Settings.css
│   ├── utils/               # Utility functions
│   │   ├── analytics.js     # Analytics integration
│   │   ├── animations.js    # Animation helpers
│   │   ├── backendHelpers.js # API helpers
│   │   ├── constants.js     # App constants
│   │   ├── errorMonitoring.js # Error tracking
│   │   ├── helpers.js       # General utilities
│   │   ├── imageLoader.js   # Image optimization
│   │   ├── inputSanitizer.js # XSS protection
│   │   ├── logger.js        # Logging utility
│   │   ├── paymentGateway.js # Payment integration
│   │   ├── performanceMonitor.js # Performance tracking
│   │   ├── rateLimiter.js   # Rate limiting
│   │   ├── registerServiceWorker.js # PWA
│   │   ├── securityConfig.js # Security settings
│   │   ├── securityMiddleware.js # Security checks
│   │   ├── securityTest.js  # Security testing
│   │   ├── validators.js    # Input validation
│   │   └── webVitals.js     # Web Vitals monitoring
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── supabase/
│   ├── migrations/          # Database migrations
│   ├── schema.sql           # Base schema
│   ├── enhanced_schema.sql  # Enhanced features
│   └── *.sql                # Migration files
├── .env.example             # Environment template
├── .gitignore
├── docker-compose.yml       # Docker Compose config
├── Dockerfile               # Docker image
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML entry point
├── netlify.toml             # Netlify deployment config
├── nginx.conf               # Nginx configuration
├── package.json             # Dependencies
├── README.md                # This file
├── robots.txt               # SEO robots file
├── vercel.json              # Vercel deployment config
└── vite.config.js           # Vite configuration
```

---

## 🔐 Security Features

### OWASP Top 10 Protection
- **A01: Broken Access Control** - RLS policies, role-based access
- **A02: Cryptographic Failures** - Secure password hashing, HTTPS enforcement
- **A03: Injection** - Input sanitization, parameterized queries
- **A04: Insecure Design** - Security-first architecture
- **A05: Security Misconfiguration** - Strict CSP, security headers
- **A07: Authentication Failures** - Strong password policy, rate limiting
- **A08: Data Integrity Failures** - Input validation, integrity checks
- **A09: Logging & Monitoring** - Comprehensive error tracking
- **A10: SSRF** - URL validation, whitelist approach

### Implementation Details
- **Input Sanitization**: XSS, SQL injection, path traversal protection
- **Rate Limiting**: Tiered limits (3-100 requests based on operation)
- **Password Policy**: Min 8 chars, uppercase, lowercase, numbers, special chars
- **Session Management**: 24-hour sessions with renewal, 7-day absolute max
- **CSP Headers**: Strict Content Security Policy
- **Error Handling**: Generic error messages to prevent information disclosure
- **Suspicious Activity Detection**: Pattern matching for attacks
- **File Upload Security**: Type validation, size limits (5MB max)

---

## 🌍 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_RAZORPAY_KEY_ID` | Razorpay API key | - |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | - |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key | - |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | `false` |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics ID | - |
| `VITE_FB_PIXEL_ID` | Facebook Pixel ID | - |
| `VITE_APP_URL` | Application URL | `http://localhost:5173` |
| `VITE_ENABLE_PWA` | Enable PWA features | `true` |
| `VITE_SENTRY_DSN` | Sentry error tracking DSN | - |

---

## 🚢 Deployment

### Netlify (Recommended)

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add all required `VITE_*` variables

4. **Deploy**
   - Netlify will automatically deploy on push to main branch
   - Configuration is in `netlify.toml`

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

Configuration is in `vercel.json`

### Docker

```bash
# Build image
docker build -t spice-haven .

# Run container
docker run -p 80:80 spice-haven

# Or use Docker Compose
docker-compose up -d
```

### Manual Deployment

```bash
# Build for production
npm run build

# The dist/ folder contains the production build
# Upload to any static hosting service
```

---

## 📱 Progressive Web App (PWA)

The application is a fully functional PWA with:

- **Offline Support**: Service Worker caches assets and API responses
- **Installable**: Add to home screen on mobile devices
- **App-like Experience**: Full-screen mode, splash screen
- **Background Sync**: Queue orders when offline
- **Push Notifications**: Order updates, promotions (when enabled)
- **Responsive**: Optimized for all screen sizes

### PWA Features
- Manifest file (`site.webmanifest`)
- Service Worker (`public/sw.js`)
- Offline fallback page
- App icons (192x192, 512x512)
- Theme color and background color
- Start URL and display mode

---

## 🎨 Customization

### Branding
Update the following files:
- `public/logo.jpg` - Restaurant logo
- `public/og-image.jpg` - Social media preview
- `public/site.webmanifest` - App name and colors
- `src/index.css` - CSS variables for colors

### Theme Colors
Edit CSS variables in `src/index.css`:
```css
:root {
  --primary: #d4a853;      /* Gold */
  --secondary: #2c3e50;    /* Dark blue */
  --success: #10b981;      /* Green */
  --error: #ef4444;        /* Red */
  --warning: #f59e0b;      /* Orange */
  /* ... more variables */
}
```

### Menu Categories
Update in Supabase dashboard or via SQL:
```sql
INSERT INTO menu_categories (name, display_order) VALUES
  ('Your Category', 1);
```

---

## 🧪 Testing

### Performance Testing
```bash
# Run Lighthouse audit
npm run audit

# Production performance test
npm run audit:prod

# Mobile-specific tests
npm run test:mobile
```

### Security Testing
```bash
# Security vulnerability scan
npm run security:audit

# Check for outdated dependencies
npm outdated
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Menu browsing and filtering
- [ ] Add to cart and checkout
- [ ] Order placement and tracking
- [ ] Table booking
- [ ] Loyalty program enrollment
- [ ] Admin dashboard access
- [ ] Mobile responsiveness
- [ ] Offline functionality
- [ ] Payment gateway integration

---

## 📊 Performance Metrics

### Target Metrics (Lighthouse)
- **Performance**: 95+ (Mobile), 98+ (Desktop)
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100

### Optimization Techniques
- Code splitting (route-based + vendor)
- Image optimization (WebP, lazy loading)
- Gzip + Brotli compression
- Service Worker caching
- Critical CSS inlining
- Preconnect to external domains
- Resource hints (preload, prefetch)
- Bundle size optimization (<250KB chunks)

### Current Bundle Sizes
- React core: ~45KB (gzipped)
- Vendor libraries: ~120KB (gzipped)
- Application code: ~80KB (gzipped)
- Total initial load: ~245KB (gzipped)

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Supabase Connection Error
```
Error: Invalid Supabase credentials
```
**Solution**: Check `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

#### 2. Build Fails
```
Error: Cannot find module 'xyz'
```
**Solution**: Delete `node_modules` and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 3. Payment Gateway Not Working
**Solution**: Ensure Razorpay script is loaded in `index.html` and API keys are correct

#### 4. Images Not Loading
**Solution**: Check image paths and ensure images are in `public/` folder

#### 5. Service Worker Issues
**Solution**: Clear browser cache and unregister old service workers
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister())
})
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines
- Follow existing code style (ESLint + Prettier)
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors & Contributors

- **Irfan Shaikh** - Initial work - [@irfanshaikh110805-glitch](https://github.com/irfanshaikh110805-glitch)

---

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Supabase** - For the backend infrastructure
- **Vite Team** - For the blazing-fast build tool
- **Open Source Community** - For all the incredible libraries
- **Contributors** - For making this project better

---

## 📞 Support

- **Email**: support@spicehaven.com
- **Issues**: [GitHub Issues](https://github.com/irfanshaikh110805-glitch/restaurant-management-system-with-online-ordering-table-booking/issues)
- **Discussions**: [GitHub Discussions](https://github.com/irfanshaikh110805-glitch/restaurant-management-system-with-online-ordering-table-booking/discussions)

---

## 🗺️ Roadmap

### Upcoming Features
- [ ] Multi-language support (i18n)
- [ ] Voice ordering integration
- [ ] AI-powered menu recommendations
- [ ] Kitchen display system (KDS)
- [ ] Inventory auto-reordering
- [ ] Customer feedback surveys
- [ ] Social media integration
- [ ] Advanced analytics dashboard
- [ ] Mobile apps (React Native)
- [ ] WhatsApp order notifications

---

## 📸 Screenshots

### Customer Interface
![Home Page](screenshots/home.png.jpeg)
![Menu Page](screenshots/menu.png.jpeg)
![Cart Page](screenshots/cart.png.jpeg)
![Booking Page](screenshots/booking.png.jpeg)
![Order Tracking](screenshots/order-tracking.png.jpeg)

### Admin Panel
![Admin Dashboard](screenshots/admin-dashboard.png.jpeg)
![Menu Management](screenshots/admin-menu.png.jpeg)

### Mobile Views
![Mobile Home](screenshots/mobile-home.png)
![Mobile Menu](screenshots/mobile-menu.png)

---

## 🔗 Related Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Razorpay Integration Guide](https://razorpay.com/docs)
- [Netlify Deployment Guide](https://docs.netlify.com)

---

**Built with ❤️ by the Spice Haven Team**

⭐ Star this repo if you find it helpful!
