'use client';

import type { ClothingItem } from '@stylist/shared';

interface ClosetItemCardProps {
  item: ClothingItem;
  isBusy: boolean;
  onToggle: (item: ClothingItem, available: boolean) => void;
}

export function ClosetItemCard({ item, isBusy, onToggle }: ClosetItemCardProps) {
  return (
    <article className={`closet-card ${item.available ? 'is-available' : 'is-unavailable'}`}>
      <div className="closet-card__topline">
        <span className="closet-card__slot">{item.category}</span>
        <span className="closet-card__status">{item.available ? 'Available' : 'Unavailable'}</span>
      </div>

      <div className="closet-card__identity">
        <span
          aria-label={`${item.name} primary color ${item.primaryColor}`}
          className="closet-card__swatch"
          style={{ backgroundColor: item.primaryColor }}
        />
        <div>
          <h2>{item.name}</h2>
          <p>{item.fabric.weight} {item.fabric.label}</p>
        </div>
      </div>

      <dl className="closet-card__meta">
        <div>
          <dt>Fit</dt>
          <dd>{item.fit.rating}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{Math.round(item.fit.confidence * 100)}%</dd>
        </div>
      </dl>

      <div className="tag-row" aria-label={`${item.name} tags`}>
        {item.tags.map((tag) => (
          <span className="tag" key={tag}>{tag}</span>
        ))}
      </div>

      <label className="switch">
        <input
          checked={item.available}
          disabled={isBusy}
          onChange={(event) => onToggle(item, event.target.checked)}
          type="checkbox"
        />
        <span className="switch__track">
          <span className="switch__thumb" />
        </span>
        <span>{isBusy ? 'Updating' : 'Use in recommendations'}</span>
      </label>
    </article>
  );
}
