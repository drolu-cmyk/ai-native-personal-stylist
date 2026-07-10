import './styles.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'AI Native Stylist',
    template: '%s | AI Native Stylist'
  },
  description: 'A private wardrobe assistant that recommends outfits from clothes you already own.'
};

const navigation = [
  { href: '/voice', label: 'Dress me' },
  { href: '/closet', label: 'Closet' },
  { href: '/intelligence', label: 'Intelligence' },
  { href: '/how-it-works', label: 'How it works' }
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-frame">
          <header className="site-header">
            <Link className="brand" href="/" aria-label="AI Native Stylist home">
              <span className="brand-mark" aria-hidden="true">A</span>
              <span>
                <strong>AI Native Stylist</strong>
                <small>Private wardrobe intelligence</small>
              </span>
            </Link>
            <nav className="site-nav" aria-label="Primary navigation">
              {navigation.map((item) => (
                <Link href={item.href} key={item.href}>{item.label}</Link>
              ))}
            </nav>
            <span className="beta-pill">Private preview</span>
          </header>
          {children}
          <footer className="site-footer">
            <p>Built around your closet, not a shopping feed.</p>
            <p>Voice, images, location, and sizing remain permission-based.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
