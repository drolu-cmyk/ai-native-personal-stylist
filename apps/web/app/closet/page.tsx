'use client';

import { useEffect, useMemo, useState } from 'react';

type Item = {
  id: string;
  name: string;
  category: string;
  formality: string;
  available: boolean;
  primaryColor: string;
  tags: string[];
  seasonality: string[];
  fit: { rating: string; confidence: number };
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

function humanize(value: string) {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function ClosetPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [message, setMessage] = useState('Loading your closet...');

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/closet?userId=user_alpha`)
      .then((response) => {
        if (!response.ok) throw new Error('Closet could not be loaded.');
        return response.json();
      })
      .then((payload) => {
        setItems(payload.closet.items);
        setMessage('');
      })
      .catch(() => setMessage('Your closet could not be loaded.'));
  }, []);

  const availableCount = useMemo(() => items.filter((item) => item.available).length, [items]);
  const categories = useMemo(() => new Set(items.map((item) => item.category)).size, [items]);

  return (
    <main className="site-shell closet-page">
      <section className="closet-header">
        <div>
          <p className="eyebrow">Digital closet</p>
          <h1>Everything the stylist can see.</h1>
          <p className="lede">The assistant can only recommend clothes saved here and marked available.</p>
        </div>
        <div className="closet-stats" aria-label="Closet summary">
          <div><strong>{items.length || '—'}</strong><span>Saved pieces</span></div>
          <div><strong>{items.length ? availableCount : '—'}</strong><span>Available now</span></div>
          <div><strong>{items.length ? categories : '—'}</strong><span>Categories</span></div>
        </div>
      </section>

      {message ? <p className="status-text" role="status">{message}</p> : null}

      <section className="closet-grid" aria-label="Saved wardrobe items">
        {items.map((item) => (
          <article className="closet-card" key={item.id}>
            <div className="closet-color" style={{ background: `linear-gradient(145deg, ${item.primaryColor}, color-mix(in srgb, ${item.primaryColor} 58%, black))` }}>
              <span className="availability">{item.available ? 'Available' : 'Unavailable'}</span>
            </div>
            <div className="closet-card-copy">
              <p className="card-label">{humanize(item.category)}</p>
              <h2>{item.name}</h2>
              <p>{humanize(item.formality)} · {humanize(item.fit.rating)} · {Math.round(item.fit.confidence * 100)}% fit confidence</p>
              <p>{item.tags.slice(0, 3).map(humanize).join(' · ')}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
