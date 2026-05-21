export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatApiResponse {
  message?: string;
  error?: string;
}

export async function sendChatMessage(messages: Message[]): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  let data: ChatApiResponse = {};
  try {
    data = (await response.json()) as ChatApiResponse;
  } catch {
    throw new Error(`서버 응답을 파싱할 수 없습니다. (HTTP ${response.status})`);
  }

  if (!response.ok) {
    throw new Error(data.error ?? 'API 호출에 실패했습니다.');
  }

  if (!data.message) {
    throw new Error('서버 응답에 메시지가 없습니다.');
  }

  return data.message;
}
