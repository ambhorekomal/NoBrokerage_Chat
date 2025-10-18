import React from 'react';

export default function PropertyCard({ p }) {
  const img = (p.images && p.images.length) ? p.images[0] : null;
  return (
    <div className="card">
      {img ? <img src={img} alt={p.title} className="card-img" /> : <div className="card-img placeholder">No Image</div>}
      <div className="card-body">
        <h3 className="card-title">{p.title}</h3>
        <div className="meta">
          <span>{p.bhk}</span>
          <span>{p.price}</span>
        </div>
        <div className="meta small">{p.city_locality}</div>
        <div className="meta small">Status: {p.possessionStatus}</div>
        <div className="amenities">
          {p.topAmenities && p.topAmenities.length ? p.topAmenities.map((a,i)=><span key={i} className="amenity">{a}</span>) : <span className="amenity">—</span>}
        </div>
        <a className="cta" href={p.cta} target="_blank" rel="noreferrer">View</a>
      </div>
    </div>
  );
}
