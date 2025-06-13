// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { readFile } from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';
import { convertToHtml } from 'mammoth'; // npm install mammoth

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Асинхронная функция для загрузки и конвертации .docx в текст
async function loadTxt(filename: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'public', 'docs', filename);
  return await readFile(filePath, 'utf-8');
}

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  try {
    // Загрузка инструкций и знаний
    const instructions = await loadTxt('instructions.txt');
    const knowledge = await loadTxt('knowledge.txt');

    // Сбор system-промта с инструкциями и знаниями
    const systemPrompt = `
Вы — персональный GPT-агент, работающий на основе следующих инструкций и знаний:

📌 Инструкции:
${instructions}

📚 Знания:
${knowledge}

Отвечай строго по этим данным, избегай домыслов.
`;

    // Отправка запроса в OpenAI
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });

    const response = chat.choices[0].message.content;
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ error: 'Something went wrong', details: String(error) }, { status: 500 });
  }
}
