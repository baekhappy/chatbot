import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, type Message } from '../api/chat';
import './Chatbot.css';

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content:
    '안녕하세요! 영어 단어 퀴즈 챗봇입니다.\n어떤 주제와 난이도(초급 / 중급 / 고급)로 시작할까요?',
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function autoResizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    const nextMessages: Message[] = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setError(null);
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const reply = await sendChatMessage(nextMessages);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <div className="chatbot">
      <header className="chatbot-header">
        <h1>영어 단어 퀴즈 챗봇</h1>
        <p>주제와 난이도를 알려주면 단어와 퀴즈를 드려요!</p>
      </header>

      <div className="chatbot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <div className="message-bubble">{msg.content}</div>
          </div>
        ))}

        {isLoading && (
          <div className="message message-assistant">
            <div className="message-bubble loading">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        <div ref={bottomRef} />
      </div>

      <form className="chatbot-form" onSubmit={(e) => void handleSubmit(e)}>
        <textarea
          ref={textareaRef}
          value={input}
          rows={1}
          placeholder="메시지를 입력하세요… (Enter로 전송, Shift+Enter로 줄바꿈)"
          disabled={isLoading}
          onChange={(e) => {
            setInput(e.target.value);
            autoResizeTextarea();
          }}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          전송
        </button>
      </form>
    </div>
  );
}
