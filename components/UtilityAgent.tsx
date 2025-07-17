"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, X, Minimize2, BarChart3, AlertTriangle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import rehypeRaw from 'rehype-raw';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  charts?: ChartData[];
  isLoading?: boolean;
  type?: string;
  transformerData?: any;
}

interface ChartData {
  id: string;
  title: string;
  value: number;
  color: string;
  data: Array<{ name: string; value: number; color: string }>;
}

interface UtilityAgentProps {
  onClose?: () => void;
  initialMessage?: string;
}

const UtilityAgent: React.FC<UtilityAgentProps> = ({
  onClose,
  initialMessage,
}) => {
  const initialMessageId = useRef(`initial-${Math.random().toString(36).substring(2, 11)}`).current;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: initialMessageId,
      text:
        initialMessage ||
        "Hi! How can I help you today?",
      isUser: false,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastCritical, setLastCritical] = useState<string | null>(null);
  const [dfpAction, setDfpAction] = useState<'accepted' | 'rejected' | null>(null);
  const [latestAlertId, setLatestAlertId] = useState<string | null>(null);

  const generateMessageId = () => `msg-${Math.random().toString(36).substring(2, 11)}`;

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: generateMessageId(),
      text: inputText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const data = await response.json();

      if (response.ok) {
        const agentMsg: Message = {
          id: generateMessageId(),
          text: data.reply,
          isUser: false,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, agentMsg]);
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMsg: Message = {
        id: generateMessageId(),
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/critical');
        const data = await res.json();
        if (data.message && JSON.stringify(data.message) !== lastCritical) {
          console.log('Received critical payload:', data.message);
          setLastCritical(JSON.stringify(data.message));
          let alertText = '';
          // New backend: data.message is an array of bus objects
          if (Array.isArray(data.message)) {
            // New backend: data.message is an array of transformer objects
            if (data.message.length > 0 && data.message[0].name && data.message[0].current_kVA !== undefined) {
              alertText =
                `⚠️ Potential grid overload detected:\n\n` +
                data.message
                  .map(
                    (t: any) =>
                      `- Transformer **${t.name}**: **${t.current_kVA} kVA** / **${t.rated_kVA} kVA** (**${t.loading_percent}%** loaded)`
                  )
                  .join('\n') +
                `\n\nDo you want to release DFP?`;
            } else if (data.message.length > 0 && data.message[0].critical_transformers) {
              // Previous format: array of bus objects with critical_transformers
              const transformers = data.message.flatMap((busObj: any) => busObj.critical_transformers || []);
              if (transformers.length > 0) {
                alertText =
                  `⚠️ Potential grid overload detected:\n\n` +
                  transformers
                    .map(
                      (t: any) =>
                        `- Transformer **${t.name}**: **${t.current_kVA} kVA** / **${t.rated_kVA} kVA** (**${t.loading_percent}%** loaded)`
                    )
                    .join('\n') +
                  `\n\nDo you want to release DFP?`;
              } else {
                alertText = JSON.stringify(data.message, null, 2);
              }
            } else {
              alertText = JSON.stringify(data.message, null, 2);
            }
          } else if (data.message && data.message.transformer) {
            // Fallback for old format
            const t = data.message.transformer;
            const totalBaseKWh = data.message.totalBaseKWh;
            alertText = `⚠️ Potential grid overload at **${t.name}**.\nCurrent capacity: **${totalBaseKWh !== undefined && totalBaseKWh !== null ? totalBaseKWh : 'N/A'} kWh**\nMax capacity: **${t.max_capacity_KW} kW**\n\nDo you want to release DFP?`;
          } else {
            alertText = JSON.stringify(data.message, null, 2);
          }
          const newId = generateMessageId();
          setLatestAlertId(newId);
          setDfpAction(null);
          setMessages((prev) => [
            ...prev,
            {
              id: newId,
              text: alertText,
              isUser: false,
              timestamp: new Date().toISOString(),
              type: 'grid_alert',
            },
          ]);
        }
      } catch (e) {
        // ignore polling errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [lastCritical]);

  const handleDfpAction = (action: 'accepted' | 'rejected') => {
    setDfpAction(action);
    setMessages((prev) => [
      ...prev,
      {
        id: generateMessageId(),
        text: action === 'accepted' ? 'DFP release accepted.' : 'DFP release rejected.',
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'grid_alert',
      },
    ]);
    if (action === 'accepted') {
      // Find the latest alert message with transformer details
      let neighbourhoods = [];
      // Find the last grid_alert message
      const lastAlertMsg = [...messages].reverse().find((msg) => msg.type === 'grid_alert');
      if (lastAlertMsg) {
        // Try to extract transformer names from the alert text
        // Regex to match: - Transformer **name**:
        const regex = /- Transformer \*\*(.*?)\*\*:/g;
        let match;
        while ((match = regex.exec(lastAlertMsg.text)) !== null) {
          neighbourhoods.push(match[1]);
        }
      }
      const neighbourhoodsStr = neighbourhoods.length > 0 ? neighbourhoods.join(', ') : 'the most heavily loaded transformers';
      const userMsg: Message = {
        id: generateMessageId(),
        text: `Please provide details of all available DFPs for the following transformers: ${neighbourhoodsStr}.`,
        isUser: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
        .then((response) => response.json())
        .then((data) => {
          const agentMsg: Message = {
            id: generateMessageId(),
            text: data.reply,
            isUser: false,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, agentMsg]);
        })
        .catch((error) => {
          console.error('Failed to get AI response:', error);
          const errorMsg: Message = {
            id: generateMessageId(),
            text: "Sorry, I'm having trouble connecting. Please try again later.",
            isUser: false,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const renderChart = (chart: ChartData) => {
    return (
      <div
        key={chart.id}
        className="min-w-[200px] p-3 rounded-lg bg-background border border-border"
      >
        <div className="text-sm font-medium mb-2">{chart.title}</div>
        <div className="text-2xl font-bold" style={{ color: chart.color }}>
          {chart.value}
        </div>
        <div className="mt-2 space-y-1">
          {chart.data.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span>{item.name}</span>
              <span style={{ color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Format timestamp string to display time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isHtml = (str: string) => {
    if (typeof str !== "string") return 'Error: input is not a string';
    return /<([a-z][\w0-9]*)(\s[^>]*)?>[\s\S]*?<\/\1>/i.test(str.trim());
  };

  const unescapeHtml = (escaped: string) => {
    if (!escaped) return '';
    const doc = new window.DOMParser().parseFromString(escaped, 'text/html');
    return doc.documentElement.textContent || '';
  };

  // Render message content with or without markdown
  const renderMessageContent = (message: Message) => {
    if (message.isUser) {
      return message.text;
    }

    // If the message is pure HTML (not markdown), render as HTML
    if (isHtml(message.text) && !message.text.match(/[\#\*_`>\-]/)) {
      return (
        <div dangerouslySetInnerHTML={{ __html: message.text }} />
      );
    }

    // Otherwise, render as markdown (with inline HTML support)
    return (
      <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-1">
        <ReactMarkdown
          skipHtml={false}
          rehypePlugins={[rehypeRaw]}
          components={{
            a: ({node, ...props}) => (
              <a className="text-blue-500" {...props} />
            ),
            ul: ({node, ...props}) => (
              <ul className="my-2 list-disc pl-4" {...props} />
            ),
            li: ({node, ...props}) => (
              <li className="my-1" {...props} />
            ),
            h3: ({node, ...props}) => (
              <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />
            ),
            p: ({node, ...props}) => (
              <p className="my-2" {...props} />
            )
          }}
        >
          {message.text}
        </ReactMarkdown>
        {/* DFP Action Buttons for the latest alert only */}
        {message.type === 'grid_alert' && message.id === latestAlertId && dfpAction === null && (
          <div className="mt-4 flex gap-2">
            <button
              className="px-4 py-1 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              onClick={() => handleDfpAction('accepted')}
            >
              Accept
            </button>
            <button
              className="px-4 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              onClick={() => handleDfpAction('rejected')}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    );
  };

  // Get message class based on type
  const getMessageClass = (message: Message) => {
    if (message.isUser) {
      return "bg-primary text-primary-foreground";
    }
    
    if (message.type === 'grid_alert') {
      return "bg-amber-50 border-l-4 border-amber-500 text-amber-800";
    }
    
    return "chat-input-message text-foreground";
  };

  return (
    <div className="flex flex-col h-full w-full bg-card text-foreground rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3 w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Agent Chat</span>
            </div>
        </div>
      </div>
      {/* Messages */}
      <div
        className="flex-1 px-6 py-4 overflow-y-auto flex flex-col gap-1 bg-card"
        style={{ minHeight: 0 }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.isUser ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs ${
                  message.isUser
                    ? "text-blue-400"
                    : "text-blue-300 font-semibold"
                }`}
              >
                {message.isUser ? "You" : "Grid Agent"}
              </span>
              <span className="text-xs text-muted-foreground">
                {/* @ts-ignore */}
                {new Date(message.timestamp).toLocaleString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
              {message.type === 'grid_alert' && (
                <span className="text-xs text-amber-600 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Alert
                </span>
              )}
            </div>
            <div
              className={`mt-1 inline-block px-3 py-2 rounded-lg ${getMessageClass(message)}`}
            >
              {renderMessageContent(message)}
              {message.charts && (
                <div className="mt-3 flex space-x-3 overflow-x-auto">
                  {message.charts.map(renderChart)}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start mt-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-blue-300 font-semibold">
                  Utility Agent
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-1 inline-block px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-foreground">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className="p-3 border-t border-border flex items-center gap-2">
        <input
          type="text"
          className="flex-1 rounded-lg px-3 py-2 chat-input-message border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Type a Message"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          className={`rounded-full p-2 transition ${
            isLoading 
              ? "bg-gray-300 cursor-not-allowed" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
          disabled={isLoading}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      {/* CSS for typing indicator */}
      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 1px;
          background-color: #9E9E9E;
          border-radius: 50%;
          display: inline-block;
          opacity: 0.4;
        }
        .typing-indicator span:nth-child(1) {
          animation: pulse 1s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(2) {
          animation: pulse 1s infinite ease-in-out 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation: pulse 1s infinite ease-in-out 0.4s;
        }
        @keyframes pulse {
          0%, 60%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          30% {
            transform: scale(1.5);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default UtilityAgent;
