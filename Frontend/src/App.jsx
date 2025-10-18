import React, { useState } from 'react';
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';

export default function App() {
  const [messages, setMessages] = useState([]); // {role: 'user'|'assistant', text, payload}
  const [loading, setLoading] = useState(false);

  async function sendQuery(text) {
    if (!text) return;
    const userMsg = { role: 'user', text };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });
      const data = await res.json();
      const assistantText = data.summary || data.groundedSummary || 'No summary.';
      const assistantMsg = { role: 'assistant', text: assistantText, payload: data.results || [] };
      setMessages(m => [...m, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages(m => [...m, { role: 'assistant', text: 'Error fetching results. See console.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-root">
      <header className="topbar">
        <h1>NoBrokerage — Chat Search</h1>
      </header>

      <main className="main">
        <MessageList messages={messages} />
      </main>

      <footer className="footer">
        <ChatInput onSend={sendQuery} loading={loading} />
      </footer>
    </div>
  );
}
