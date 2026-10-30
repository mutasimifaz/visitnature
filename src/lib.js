import { useCallback, useEffect, useState } from 'react';

export const money = (n) => `৳${Number(n || 0).toLocaleString('en-US')}`;
export const SITE = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');

/** Run an async loader; returns { data, loading, error, reload, setData } */
export function useAsync(fn, deps = []) {
  const [state, set] = useState({ data: null, loading: true, error: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(() => {
    let live = true;
    set((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => live && set({ data, loading: false, error: null }))
      .catch((error) => { console.error(error); live && set({ data: null, loading: false, error }); });
    return () => { live = false; };
  }, deps);
  useEffect(() => load(), [load]);
  const setData = (d) => set((s) => ({ ...s, data: typeof d === 'function' ? d(s.data) : d }));
  return { ...state, reload: load, setData };
}

function setTag(selector, create, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) { el = document.createElement(create); document.head.appendChild(el); }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
}

/** Per-route SEO: title, description, canonical, Open Graph, robots and optional JSON-LD */
export function useSeo({ title, description, path = '', image = '/img/og.jpg', noindex = false, jsonLd } = {}) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : '';
  useEffect(() => {
    const full = title ? `${title} | visitNature` : 'visitNature – Guided nature trips from Feni, Bangladesh';
    const url = `${SITE}${path}`;
    const img = image.startsWith('http') ? image : `${SITE}${image}`;
    document.title = full;
    if (description) setTag('meta[name="description"]', 'meta', { name: 'description', content: description });
    setTag('link[rel="canonical"]', 'link', { rel: 'canonical', href: url });
    setTag('meta[name="robots"]', 'meta', { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large' });
    setTag('meta[property="og:title"]', 'meta', { property: 'og:title', content: full });
    setTag('meta[property="og:url"]', 'meta', { property: 'og:url', content: url });
    setTag('meta[property="og:image"]', 'meta', { property: 'og:image', content: img });
    if (description) setTag('meta[property="og:description"]', 'meta', { property: 'og:description', content: description });
    document.getElementById('page-ld')?.remove();
    if (ld) {
      const s = document.createElement('script');
      s.type = 'application/ld+json'; s.id = 'page-ld'; s.textContent = ld;
      document.head.appendChild(s);
    }
    return () => document.getElementById('page-ld')?.remove();
  }, [title, description, path, image, noindex, ld]);
}
