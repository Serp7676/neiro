// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { readFile } from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Чтение .txt файлов
async function loadTxt(filename: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'public', 'docs', filename);
  return await readFile(filePath, 'utf-8');
}

// Извлечение текста из URL
async function extractTextFromUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    return text.slice(0, 3000); // Ограничение токенов
  } catch (err) {
    console.error('Ошибка при извлечении URL:', err);
    return '[Ошибка: не удалось получить данные по ссылке]';
  }
}

// Главный обработчик
export async function POST(req: NextRequest) {
  const { message } = await req.json();

  try {
    const instructions = await loadTxt('instructions.txt');
    const knowledge = await loadTxt('knowledge.txt');

    // Проверка на наличие URL в сообщении
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    // const urls = message.match(urlRegex) || [];
    const urls = ['https://academy-polymer.ru/kursy']

    let extractedContent = '';
    for (const url of urls) {
      const content = await extractTextFromUrl(url);
      extractedContent += `\n🔗 Содержание с ${url}:\n${content}\n`;
    }

    const systemPrompt = `
Вы — персональный GPT-агент, работающий на основе следующих инструкций и знаний:

📌 Инструкции:
${instructions}

📚 Знания:
${knowledge}

${extractedContent ? 'Дополнительные данные из интернета:' + extractedContent : ''}

Отвечай строго по этим данным. Не выдумывай, если данных недостаточно.
`;

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
    console.error('Ошибка в /api/chat:', error);
    return NextResponse.json({ error: 'Что-то пошло не так', details: String(error) }, { status: 500 });
  }
}
