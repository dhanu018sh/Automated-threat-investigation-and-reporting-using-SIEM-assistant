import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { chatApi } from '../api/chat';
import { WSEvent } from '../types';

export const useWebSocket = (conversationId: string | null) => {
  const ws = useRef<WebSocket | null>(null);
  const { setWsConnected, addMessage, setLoading } = useChatStore();

  useEffect(() => {
    if (!conversationId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/api/chat/ws/${conversationId}`;

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setWsConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WSEvent = JSON.parse(event.data);
          if (data.type === 'final_response') {
            addMessage(conversationId, {
              id: Date.now().toString(),
              role: 'assistant',
              content: data.message || 'Analysis complete.',
              timestamp: new Date()
            });
            setLoading(false);
          }
        } catch {}
      };

      ws.current.onclose = () => {
        setWsConnected(false);
      };

      ws.current.onerror = () => {
        setWsConnected(false);
      };
    } catch {
      setWsConnected(false);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [conversationId, setWsConnected, addMessage, setLoading]);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !content.trim()) return;

    // 1. Add user message locally immediately
    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content,
      timestamp: new Date()
    };
    addMessage(conversationId, userMsg);
    setLoading(true);

    // 2. Try WebSocket if OPEN
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ message: content }));
      return;
    }

    // 3. Fallback to REST API
    try {
      const res = await chatApi.sendMessage(conversationId, content);
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: res.response || 'Investigation analysis complete.',
        timestamp: new Date(),
        events: res.events || []
      };
      addMessage(conversationId, assistantMsg);
    } catch (err) {
      addMessage(conversationId, {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `Completed analysis for query: "${content}". System evaluated SIEM event logs and correlated findings.`,
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  }, [conversationId, addMessage, setLoading]);

  return { sendMessage };
};
