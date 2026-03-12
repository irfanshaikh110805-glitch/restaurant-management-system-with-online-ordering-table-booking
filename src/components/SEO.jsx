import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function SEO({ 
  title = 'Hotel Everest Family Restaurant — Authentic Indian Restaurant',
  description = 'Experience authentic Indian cuisine at Hotel Everest Family Restaurant on MG Road, Vijayapura. Reserve a table, browse our menu, and order your favorites.',
  keywords = 'Hotel Everest Family Restaurant, Indian restaurant, Vijayapura, MG Road, biryani, kebabs, table booking',
  ogImage = '/og-image.jpg'
}) {
  const location = useLocation();

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const metaTags = {
      description,
      keywords,
      'og:title': title,
      'og:description': description,
      'og:url': `${window.location.origin}${location.pathname}`,
      'og:image': ogImage,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': ogImage
    };

    Object.entries(metaTags).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });
  }, [title, description, keywords, ogImage, location]);

  return null;
}
