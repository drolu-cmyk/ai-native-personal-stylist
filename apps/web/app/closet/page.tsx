'use client';

import { useEffect, useState } from 'react';

type Item = { id: string; name: string; category: string; formality: string; available: boolean };
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function ClosetPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [message, setMessage] = useState('Loading closet...');

  useEffect(() => {
    fetch(apiBaseUrl + '/api/closet?userId=user_alpha')
      .then((response) => response.json())
      .then((payload) => {
        setItems(payload.closet.items);
        setMessage('');
      })
      .catch(() => setMessage('Closet could not be loaded.'));
  }, []);

  return (
    <main className="site-shell">
      <section className="panel">
        <p className="eyebrow">Closet</p>
        <h1>Saved clothes.</h1>
        <p className="lede">The outfit page uses this same list.</p>
        {message ? <p className="status-text">{message}</p> : null}
        <div className="section-grid">
          {items.map((item) => (
            <article key={item.id}>
              <h2>{item.name}</h2>
              <p>{item.category} · {item.formality} · {item.available ? 'available' : 'not available'}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
