import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
        }

        // Add a system prompt for better agent behavior
        const systemPrompt = {
            role: 'system',
            content: 'You are a helpful, friendly, and concise AI assistant for utility dashboard users. Answer clearly and helpfully.'
        };

        // Map local messages to OpenAI's expected format
        const openaiMessages = [
            systemPrompt,
            ...messages.map((msg: any) => ({
                role: msg.isUser ? 'user' : 'assistant',
                content: msg.text,
            })),
        ];

        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: openaiMessages,
                max_tokens: 1024,
                temperature: 0.7,
            }),
        });

        const openaiData = await openaiRes.json();
        console.log('OpenAI API response:', openaiData);

        let reply = 'Sorry, I could not get a response from OpenAI.';
        if (openaiData?.choices?.[0]?.message?.content) {
            reply = openaiData.choices[0].message.content;
        } else if (openaiData?.error?.message) {
            reply = `OpenAI error: ${openaiData.error.message}`;
        }

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
} 