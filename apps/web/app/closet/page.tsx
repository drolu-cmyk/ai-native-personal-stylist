'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getLocalClosetItems,
  getLocalImages,
  saveLocalClosetItems,
  saveLocalImage,
  type LocalClosetItem
} from '../localStore';

type Item = LocalClosetItem;

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const userId = 'user_alpha' as const;

const emptyDraft = {
  name: '',
  category: 'top' as Item['category'],
  primaryColor: '#5b6270' as Item['primaryColor'],
  formality: 'smart-casual' as Item['formality'],
  fit: 'true-to-size' as Item['fit']['rating'],
  fabric: 'cotton',
  tags: 'versatile, comfortable',
  imageDataUrl: ''
};

function humanize(value: string) {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function createItemId(name: string): Item['id'] {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 36) || 'garment';
  return `item_local_${slug}_${Date.now()}`;
}

export default function ClosetPage() {
  const [baseItems, setBaseItems] = useState<Item[]>([]);
  const [localItems, setLocalItems] = useState<Item[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('Loading your closet...');
  const [showAddForm, setShowAddForm] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);

  useEffect(() => {
    setLocalItems(getLocalClosetItems());
    setImages(getLocalImages());

    fetch(`${apiBaseUrl}/api/closet?userId=${userId}`)
      .then((response) => {
        if (!response.ok) throw new Error('Closet could not be loaded.');
        return response.json();
      })
      .then((payload) => {
        setBaseItems(payload.closet.items);
        setMessage('');
      })
      .catch(() => setMessage('Your saved demo closet could not be loaded. Locally added pieces remain available on this device.'));
  }, []);

  const items = useMemo(() => {
    const localById = new Map(localItems.map((item) => [item.id, item]));
    const mergedBase = baseItems.map((item) => localById.get(item.id) || item);
    const baseIds = new Set(baseItems.map((item) => item.id));
    return [...mergedBase, ...localItems.filter((item) => !baseIds.has(item.id))];
  }, [baseItems, localItems]);

  const availableCount = useMemo(() => items.filter((item) => item.available).length, [items]);
  const categories = useMemo(() => new Set(items.map((item) => item.category)).size, [items]);

  function persistLocalItems(next: Item[]) {
    setLocalItems(next);
    saveLocalClosetItems(next);
  }

  function toggleAvailability(item: Item) {
    const existingLocal = localItems.find((localItem) => localItem.id === item.id);
    const updated = { ...(existingLocal || item), available: !item.available };
    const next = existingLocal
      ? localItems.map((localItem) => localItem.id === item.id ? updated : localItem)
      : [...localItems, updated];
    persistLocalItems(next);
    setMessage(`${item.name} marked ${updated.available ? 'available' : 'unavailable'}.`);
  }

  function removeLocalItem(itemId: string) {
    persistLocalItems(localItems.filter((item) => item.id !== itemId));
    setMessage('Locally added garment removed from this device.');
  }

  function handleImage(file?: File) {
    if (!file) {
      setDraft((current) => ({ ...current, imageDataUrl: '' }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setMessage('Choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage('For this local beta, garment images must be 2 MB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setDraft((current) => ({ ...current, imageDataUrl: String(reader.result || '') }));
    reader.readAsDataURL(file);
  }

  function addGarment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consentConfirmed) {
      setMessage('Confirm that the garment details and optional image may be stored locally on this device.');
      return;
    }
    if (!draft.name.trim()) {
      setMessage('Add a garment name before saving.');
      return;
    }

    const id = createItemId(draft.name);
    const tags = draft.tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean);
    const item: Item = {
      id,
      userId,
      name: draft.name.trim(),
      category: draft.category,
      primaryColor: draft.primaryColor,
      secondaryColors: [],
      fabric: {
        label: draft.fabric.trim() || 'unknown',
        weight: 'midweight',
        breathability: tags.includes('breathable') ? 'high' : 'medium',
        waterResistance: tags.includes('rainy-day') || tags.includes('water-resistant') ? 'moderate' : 'none'
      },
      fit: { rating: draft.fit, confidence: 0.78, notes: 'User-confirmed local closet entry.' },
      formality: draft.formality,
      warmth: tags.includes('warm') ? 4 : 2,
      tags,
      seasonality: ['all-season'],
      occasionSupport: draft.formality === 'formal'
        ? ['formal', 'religious-service']
        : draft.formality === 'business'
          ? ['corporate', 'date-night', 'religious-service']
          : ['casual', 'travel'],
      available: true
    };

    persistLocalItems([...localItems, item]);
    if (draft.imageDataUrl) {
      saveLocalImage(id, draft.imageDataUrl);
      setImages((current) => ({ ...current, [id]: draft.imageDataUrl }));
    }
    setDraft(emptyDraft);
    setConsentConfirmed(false);
    setShowAddForm(false);
    setMessage(`${item.name} added locally. The stylist can use it in the next recommendation.`);
  }

  return (
    <main className="site-shell closet-page">
      <section className="closet-header">
        <div>
          <p className="eyebrow">Digital closet</p>
          <h1>Everything the stylist can see.</h1>
          <p className="lede">The assistant can only recommend clothes saved here and marked available.</p>
          <div className="actions">
            <button className="button" type="button" onClick={() => setShowAddForm((value) => !value)}>
              {showAddForm ? 'Close garment intake' : 'Add a garment'}
            </button>
          </div>
        </div>
        <div className="closet-stats" aria-label="Closet summary">
          <div><strong>{items.length || '—'}</strong><span>Saved pieces</span></div>
          <div><strong>{items.length ? availableCount : '—'}</strong><span>Available now</span></div>
          <div><strong>{items.length ? categories : '—'}</strong><span>Categories</span></div>
        </div>
      </section>

      {showAddForm ? (
        <section className="garment-intake" aria-labelledby="garment-intake-title">
          <div>
            <p className="eyebrow">Human-confirmed intake</p>
            <h2 id="garment-intake-title">Add one piece without giving the system permission to guess.</h2>
            <p>For this beta, garment details and the optional image stay in this browser’s local storage. The image is not sent to a vision provider.</p>
          </div>
          <form className="garment-form" onSubmit={addGarment}>
            <label>
              Garment name
              <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Navy cotton overshirt" />
            </label>
            <div className="form-grid">
              <label>
                Category
                <select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as Item['category'] }))}>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="dress">Dress or one-piece</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="footwear">Footwear</option>
                  <option value="accessory">Accessory</option>
                  <option value="base-layer">Base layer</option>
                </select>
              </label>
              <label>
                Main color
                <input type="color" value={draft.primaryColor} onChange={(event) => setDraft((current) => ({ ...current, primaryColor: event.target.value as Item['primaryColor'] }))} />
              </label>
              <label>
                Formality
                <select value={draft.formality} onChange={(event) => setDraft((current) => ({ ...current, formality: event.target.value as Item['formality'] }))}>
                  <option value="casual">Casual</option>
                  <option value="smart-casual">Smart casual</option>
                  <option value="business">Business</option>
                  <option value="formal">Formal</option>
                </select>
              </label>
              <label>
                Fit
                <select value={draft.fit} onChange={(event) => setDraft((current) => ({ ...current, fit: event.target.value as Item['fit']['rating'] }))}>
                  <option value="snug">Snug</option>
                  <option value="true-to-size">True to size</option>
                  <option value="relaxed">Relaxed</option>
                  <option value="oversized">Oversized</option>
                </select>
              </label>
            </div>
            <label>
              Fabric
              <input value={draft.fabric} onChange={(event) => setDraft((current) => ({ ...current, fabric: event.target.value }))} placeholder="Cotton" />
            </label>
            <label>
              Useful tags, separated by commas
              <input value={draft.tags} onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))} placeholder="comfortable, office, rainy-day" />
            </label>
            <label>
              Optional garment image
              <input type="file" accept="image/*" onChange={(event) => handleImage(event.target.files?.[0])} />
            </label>
            {draft.imageDataUrl ? <img className="intake-preview" src={draft.imageDataUrl} alt="Local garment preview" /> : null}
            <label className="consent-check">
              <input type="checkbox" checked={consentConfirmed} onChange={(event) => setConsentConfirmed(event.target.checked)} />
              Store this confirmed garment and optional image locally on this device.
            </label>
            <button className="button" type="submit">Confirm and add garment</button>
          </form>
        </section>
      ) : null}

      {message ? <p className="status-text" role="status">{message}</p> : null}

      <section className="closet-grid" aria-label="Saved wardrobe items">
        {items.map((item) => {
          const localOnly = item.id.startsWith('item_local_');
          const image = images[item.id];
          return (
            <article className="closet-card" key={item.id}>
              <div
                className="closet-color"
                style={image
                  ? { backgroundImage: `linear-gradient(180deg, transparent 50%, rgba(0,0,0,.34)), url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: `linear-gradient(145deg, ${item.primaryColor}, color-mix(in srgb, ${item.primaryColor} 58%, black))` }}
              >
                <span className="availability">{item.available ? 'Available' : 'Unavailable'}</span>
              </div>
              <div className="closet-card-copy">
                <p className="card-label">{humanize(item.category)}{localOnly ? ' · Local' : ''}</p>
                <h2>{item.name}</h2>
                <p>{humanize(item.formality)} · {humanize(item.fit.rating)} · {Math.round(item.fit.confidence * 100)}% fit confidence</p>
                <p>{item.tags.slice(0, 3).map(humanize).join(' · ')}</p>
                <div className="closet-actions">
                  <button type="button" onClick={() => toggleAvailability(item)}>{item.available ? 'Mark unavailable' : 'Mark available'}</button>
                  {localOnly ? <button type="button" onClick={() => removeLocalItem(item.id)}>Remove</button> : null}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
