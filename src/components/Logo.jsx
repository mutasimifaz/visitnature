/** Symbol logo: a leaf holding a rising sun over two waves */
export default function Logo({ size = 36, title }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs><clipPath id="vn-leaf"><path d="M32 4C49 15 55 38 32 60 9 38 15 15 32 4Z" /></clipPath></defs>
      <path d="M32 4C49 15 55 38 32 60 9 38 15 15 32 4Z" fill="#0B2E3A" />
      <g clipPath="url(#vn-leaf)">
        <circle cx="32" cy="31" r="10" fill="#F5A524" />
        <path d="M0 38Q8 32 16 38T32 38T48 38T64 38V64H0Z" fill="#1F8A8A" />
        <path d="M0 48Q8 42 16 48T32 48T48 48T64 48V64H0Z" fill="#DDEFEA" />
      </g>
    </svg>
  );
}
