import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for session history and session/user IDs (for demo; use a DB or cache for production)
const sessionHistories: Record<string, any[]> = {};
let globalUserId: string | null = null;
let globalSessionId: string | null = null;
let sessionActivated = false;

function generateRandomId(prefix: string) {
    return (
        prefix +
        '_' +
        Math.random().toString(36).substring(2, 10) +
        Math.random().toString(36).substring(2, 10)
    );
}

async function ensureSessionActivated() {
    if (sessionActivated && globalUserId && globalSessionId) return;
    // Generate random user and session IDs
    globalUserId = generateRandomId('u');
    globalSessionId = generateRandomId('s');
    // Activate the session
    const url = `http://localhost:8000/apps/multi-tool-agent/users/${globalUserId}/sessions/${globalSessionId}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
        throw new Error('Failed to activate session');
    }
    sessionActivated = true;
}

export async function POST(req: Request) {
    try {
        await ensureSessionActivated();
        const { messages } = await req.json();
        const userId = globalUserId!;
        const sessionId = globalSessionId!;

        // Find the latest user message
        const lastUserMessage = [...messages].reverse().find((msg: any) => msg.isUser);
        const userText = lastUserMessage ? lastUserMessage.text : '';

        // Retrieve previous history for this session
        const prevHistory = sessionHistories[sessionId] || [];

        // Prepare the request body for the new backend
        const requestBody = {
            appName: "multi-tool-agent",
            userId,
            sessionId,
            newMessage: {
                role: "user",
                parts: [
                    {
                        text: userText
                    }
                ]
            },
            history: prevHistory
        };

        // Helper function to call backend
        async function callBackend() {
            const backendRes = await fetch('http://localhost:8000/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            return backendRes;
        }

        let backendRes = await callBackend();
        if (backendRes.status === 404) {
            // Try to activate session again and retry
            sessionActivated = false; // force re-activation
            await ensureSessionActivated();
            // Update userId and sessionId in requestBody
            requestBody.userId = globalUserId!;
            requestBody.sessionId = globalSessionId!;
            backendRes = await callBackend();
        }

        if (!backendRes.ok) {
            throw new Error(`Backend error: ${backendRes.status}`);
        }

        const backendData = await backendRes.json();
        // backendData is expected to be an array of message objects

        // Filter only user and model/agent responses for next request
        const filteredHistory = Array.isArray(backendData)
            ? backendData.filter((msg: any) => {
                const role = msg?.content?.role;
                return role === 'user' || role === 'model';
            })
            : [];

        // Store filtered history for this session
        sessionHistories[requestBody.sessionId] = filteredHistory;

        // Find the latest model/agent response to send to the frontend
        let latestModelMsg = null;
        if (filteredHistory.length > 0) {
            // Find the last message with role 'model'
            for (let i = filteredHistory.length - 1; i >= 0; i--) {
                if (filteredHistory[i]?.content?.role === 'model') {
                    latestModelMsg = filteredHistory[i];
                    break;
                }
            }
        }

        // Extract the text from the latest model message
        let reply = 'Sorry, I could not get a response from the backend.';
        if (latestModelMsg && latestModelMsg.content?.parts?.length > 0) {
            // Find the first part with a 'text' field
            const textPart = latestModelMsg.content.parts.find((p: any) => typeof p.text === 'string');
            if (textPart) {
                reply = textPart.text;
            }
        }

        return Response.json({ reply });
    } catch (error) {
        console.error('Error in chat API:', error);
        return Response.json({ error: 'Something went wrong' }, { status: 500 });
    }
} 