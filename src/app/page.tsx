'use client';

import { useState } from 'react';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setMessages((prev) => [...prev, `👤: ${input}`]);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, `🤖: ${data.response}`]);
    setInput('');
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>AI Chat (Next.js 15)</h1>
      <div style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        style={{ width: '80%', padding: '0.5rem' }}
        placeholder="Введите сообщение..."
      />
      <button onClick={sendMessage} disabled={loading} style={{ marginLeft: '1rem' }}>
        {loading ? '...' : 'Отправить'}
      </button>
    </div>
  );
}
