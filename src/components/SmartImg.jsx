import { useState } from 'react';

/** <img> with graceful failure: shows a tinted placeholder, or hides itself when hideOnError */
export default function SmartImg({ src, alt, hideOnError = false, className = '', ...rest }) {
  const [failed, setFailed] = useState(false);
  if (failed) return hideOnError ? null : <div className={`img-ph ${className}`} role="img" aria-label={alt} />;
  return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" onError={() => setFailed(true)} {...rest} />;
}
