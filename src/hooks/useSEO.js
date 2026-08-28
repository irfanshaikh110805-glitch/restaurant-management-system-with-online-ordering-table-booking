/**
 * useSEO — Sets page-level title and meta description for each route.
 * This replaces react-helmet without adding a heavy dependency.
 * Works with SSG/pre-rendering if deployed via Netlify with prerender.
 */
import { useEffect } from 'react'

const SITE_NAME = 'Hotel Everest Family Restaurant'

export default function useSEO({ title, description, canonical }) {
  useEffect(() => {
    // Title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Authentic Indian Restaurant in Vijayapura`
    document.title = fullTitle

    // Meta description
    if (description) {
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', description)
    }

    // OG title
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', document.title)

    // OG description
    if (description) {
      const ogDesc = document.querySelector('meta[property="og:description"]')
      if (ogDesc) ogDesc.setAttribute('content', description)
    }

    // Canonical
    if (canonical) {
      const link = document.querySelector('link[rel="canonical"]')
      if (link) link.setAttribute('href', canonical)
    }
  }, [title, description, canonical])
}
