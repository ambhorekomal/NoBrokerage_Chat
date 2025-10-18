import React, { useState } from 'react';

export default function ChatInput({ onSend, loading }) {
  const [text, setText] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  }

  return (
    <form onSubmit={submit} className="chat-input">
      <input
        type="text"
        placeholder='Try: "3BHK flat in Pune under ₹1.2 Cr"'
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !text.trim()}>
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
