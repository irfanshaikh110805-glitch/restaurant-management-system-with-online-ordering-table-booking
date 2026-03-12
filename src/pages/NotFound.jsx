import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export default function NotFound() {
  const location = useLocation()

  useEffect(() => {
    // Log 404 errors for debugging
    console.warn('404 Error - Page not found:', location.pathname)
    
    // Send to analytics if available
    if (window.gtag) {
      window.gtag('event', 'page_not_found', {
        page_path: location.pathname,
        page_location: window.location.href
      })
    }
  }, [location])
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-2xl)',
      }}
    >
      <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🍽️</div>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
        404
      </h1>
      <h2 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p className="text-secondary" style={{ maxWidth: '400px', marginBottom: '2rem' }}>
        The page you are looking for doesn't exist or has been moved. Let's get you back on track!
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">
          <span>Go Home</span>
        </Link>
        <Link to="/menu" className="btn btn-secondary">
          <span>Browse Menu</span>
        </Link>
      </div>
    </div>
  )
}
