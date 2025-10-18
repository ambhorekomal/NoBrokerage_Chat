import React from 'react';
import PropertyCard from './PropertyCard';

export default function MessageList({ messages }) {
  return (
    <div className="messages">
      {messages.map((m, i) => (
        <div key={i} className={`message ${m.role}`}>
          <div className="bubble">
            <div className="text">{m.text}</div>
            {m.payload && Array.isArray(m.payload) && m.payload.length > 0 && (
              <div className="cards-grid">
                {m.payload.map((p, idx) => (
                  <PropertyCard key={idx} p={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
