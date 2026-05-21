export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatApiResponse {
  message: string;
  error?: string;
}

export async function sendChatMessage(messages: Message[]): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  const data: ChatApiResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'API 호출에 실패했습니다.');
  }

  return data.message;
}
