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
import LoadingSpinner from "./components/LoadingSpinner";
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
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import('./utils/registerServiceWorker').then(m => m.register());
    }, { timeout: 3000 });
  } else {
    setTimeout(() => {
      import('./utils/registerServiceWorker').then(m => m.register());
    }, 2000);
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
                            border: '3px solid rgba(212,168,83,0.15)',
                            borderTopColor: '#d4a853',
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
              <Route path="/menu/:itemId/reviews" element={<ReviewsPage />} />
              <Route path="/loyalty" element={<LoyaltyProgram />} />
              <Route path="/promotions" element={<PromotionsPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/booking"
                element={
                  <ProtectedRoute>
                    <Booking />
                  </ProtectedRoute>
                }
              />
              <Route path="/cart" element={<Cart />} />
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
              <Route
                path="/order-confirmation/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-tracking/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderTracking />
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
                    position="top-right"
                    toastOptions={{
                      duration: 3000,
                      style: {
                        background: "#374151",
                        color: "#F9FAFB",
                        border: "1px solid rgba(217, 119, 6, 0.3)",
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
