// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: message }],
    });

    const response = chat.choices[0].message.content;
    return NextResponse.json({ response });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Something went wrong', details: error }, { status: 500 });
  }
}
