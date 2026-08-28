import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";
import { LoyaltyProvider } from "./context/LoyaltyContext";
import { DeliveryProvider } from "./context/DeliveryContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import ScrollToTop from "./components/ScrollToTop";
import usePageTracking from "./hooks/usePageTracking";

// Security initialization (development only)
if (import.meta.env.DEV) {
  import('./utils/securityTest').then(() => {
    // Security features initialized
  });
}

// Lazy load utilities with requestIdleCallback
const initAnalytics = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import('./utils/analytics').then(m => m.initAnalytics());
    }, { timeout: 2000 });
  } else {
    setTimeout(() => {
      import('./utils/analytics').then(m => m.initAnalytics());
    }, 1000);
  }
};

const registerServiceWorker = () => {
  // Register service worker earlier for better offline support
  if ('serviceWorker' in navigator) {
    // Use load event to ensure DOM is ready but don't delay too much
    window.addEventListener('load', () => {
      import('./utils/registerServiceWorker').then(m => m.register());
    });
  }
};

const initErrorMonitoring = () => {
  // Defer to not block first paint on mobile
  setTimeout(() => {
    import('./utils/errorMonitoring').then(m => {
      m.initErrorMonitoring();
      m.setupGlobalErrorHandlers();
    });
  }, 1500);
};

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/HomeOptimized")); // Use optimized version
const Menu = lazy(() => import("./pages/Menu"));
const Booking = lazy(() => import("./pages/Booking"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Settings = lazy(() => import("./pages/Settings"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const LoyaltyProgram = lazy(() => import("./pages/LoyaltyProgram"));
const PromotionsPage = lazy(() => import("./pages/PromotionsPage"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Pages - Lazy loaded
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const MenuManagement = lazy(() => import("./pages/admin/MenuManagement"));
const BookingManagement = lazy(() => import("./pages/admin/BookingManagement"));
const OrderManagement = lazy(() => import("./pages/admin/OrderManagement"));
const ReviewModeration = lazy(() => import("./pages/admin/ReviewModeration"));
const PromotionManager = lazy(() => import("./pages/admin/PromotionManager"));
const InventoryManager = lazy(() => import("./pages/admin/InventoryManager"));

function App() {
  // Initialize analytics and service worker
  useEffect(() => {
    // Initialize error monitoring first (critical)
    initErrorMonitoring();
    
    // Defer non-critical initialization
    initAnalytics();
    
    // Register service worker for offline support (lowest priority)
    if (import.meta.env.VITE_ENABLE_PWA === 'true' || import.meta.env.PROD) {
      registerServiceWorker();
    }
  }, []);

  // Track page views
  usePageTracking();

  return (
    <ThemeProvider>
      <AuthProvider>
        <LoyaltyProvider>
          <DeliveryProvider>
            <CartProvider>
              <NotificationProvider>
                <div className="app">
                  <ScrollToTop />
                  <Navbar />
                  <MobileBottomNav />
                  <main style={{ minHeight: "calc(100vh - 80px)" }}>
                    <ErrorBoundary>
                      <Suspense fallback={
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          minHeight: '60vh',
                          gap: '1rem'
                        }}>
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            border: '3px solid rgba(28,25,23,0.15)',
                            borderTopColor: '#1C1917',
                            animation: 'spin 0.8s linear infinite'
                          }} />
                          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                        </div>
                      }>
                        <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/about" element={<About />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/menu/:itemId/reviews" element={<ReviewsPage />} />
              <Route path="/loyalty" element={<LoyaltyProgram />} />
              <Route path="/promotions" element={<PromotionsPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />

              {/* Public & Customer Experience Routes */}
              <Route path="/booking" element={<Booking />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/order-tracking/:orderId" element={<OrderTracking />} />

              {/* User Account Protected Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="bookings" element={<BookingManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="reviews" element={<ReviewModeration />} />
                <Route path="promotions" element={<PromotionManager />} />
                <Route path="inventory" element={<InventoryManager />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
                      </Suspense>
                    </ErrorBoundary>
          </main>
                  <Footer />
                  <Toaster
                    position="top-center"
                    containerStyle={{
                      top: 72,
                      zIndex: 99999,
                    }}
                    toastOptions={{
                      duration: 3800,
                      style: {
                        background: '#1C1917',
                        color: '#FAF7F2',
                        border: '1px solid rgba(223, 191, 119, 0.35)',
                        borderRadius: '16px',
                        padding: '12px 18px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        fontFamily: 'var(--font-body), "Plus Jakarta Sans", -apple-system, sans-serif',
                        boxShadow: '0 16px 36px -4px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(223, 191, 119, 0.15)',
                        maxWidth: '460px',
                        lineHeight: '1.45',
                      },
                      success: {
                        iconTheme: {
                          primary: '#DFBF77',
                          secondary: '#1C1917',
                        },
                        style: {
                          border: '1px solid rgba(223, 191, 119, 0.5)',
                        },
                      },
                      error: {
                        iconTheme: {
                          primary: '#EF4444',
                          secondary: '#FAF7F2',
                        },
                        style: {
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                        },
                      },
                    }}
                  />
                </div>
              </NotificationProvider>
            </CartProvider>
          </DeliveryProvider>
        </LoyaltyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
