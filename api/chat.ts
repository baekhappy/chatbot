import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '../src/constants/systemPrompt';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body as { messages?: ChatMessage[] };

  if (!body.messages || !Array.isArray(body.messages)) {
    res.status(400).json({ error: '유효하지 않은 요청입니다.' });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...body.messages,
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const message = completion.choices[0]?.message?.content ?? '응답을 생성할 수 없습니다.';
    res.status(200).json({ message });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
  }
}
