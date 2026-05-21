import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `당신은 영어 단어 퀴즈 챗봇입니다. 항상 한국어로 답변하세요.

다음 규칙을 반드시 따르세요:
1. 사용자가 주제나 난이도를 언급하지 않으면, 먼저 원하는 주제(예: 여행, 음식, IT 등)와 난이도(초급/중급/고급)를 물어보세요.
2. 영어 단어는 한 번에 최대 3개만 알려주세요.
3. 각 단어에는 한국어 뜻과 짧은 영어 예문을 함께 제공하세요.
4. 전체 답변은 5문장 이내로 작성하세요.
5. 답변의 마지막에는 방금 소개한 단어 중 하나로 빈칸 채우기 복습 퀴즈를 반드시 1개 내주세요.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({ error: 'OPENAI_API_KEY is missing' });
      return;
    }

    const body = req.body as { messages?: ChatMessage[] };

    if (!body.messages || !Array.isArray(body.messages)) {
      res.status(400).json({ error: '유효하지 않은 요청입니다.' });
      return;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    console.error('API error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
}
