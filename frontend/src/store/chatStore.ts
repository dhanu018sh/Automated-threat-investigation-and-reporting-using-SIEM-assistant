import { create } from 'zustand';
import { Message, Conversation, WSEvent } from '../types';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  wsConnected: boolean;
  pendingEvents: WSEvent[];
  setWsConnected: (status: boolean) => void;
  setLoading: (loading: boolean) => void;
  setActiveConversation: (id: string) => void;
  addMessage: (convId: string, msg: Message) => void;
  deleteMessage: (convId: string, msgId: string) => void;
  addEventToLastMessage: (convId: string, event: WSEvent) => void;
  newConversation: () => string;
  deleteConversation: (id: string) => void;
  clearAllChats: () => void;
  setConversations: (convos: Conversation[]) => void;
}

const DEFAULT_CONV_ID = 'conv-clean-1';

const INITIAL_CONVERSATIONS: Conversation[] = [
  { id: DEFAULT_CONV_ID, title: 'New Investigation', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const CHAT_LOCAL_KEY = 'siem_saved_chats_v1';
const MSGS_LOCAL_KEY = 'siem_saved_messages_v1';

const loadSavedConversations = (): Conversation[] => {
  try {
    const raw = localStorage.getItem(CHAT_LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_CONVERSATIONS;
};

const loadSavedMessages = (): Record<string, Message[]> => {
  try {
    const raw = localStorage.getItem(MSGS_LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    }
  } catch {}
  return {
    [DEFAULT_CONV_ID]: [],
  };
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: loadSavedConversations(),
  activeConversationId: DEFAULT_CONV_ID,
  messages: loadSavedMessages(),
  isLoading: false,
  wsConnected: false,
  pendingEvents: [],
  setWsConnected: (status) => set({ wsConnected: status }),
  setLoading: (loading) => set({ isLoading: loading }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  clearAllChats: () => {
    try {
      localStorage.removeItem(CHAT_LOCAL_KEY);
      localStorage.removeItem(MSGS_LOCAL_KEY);
    } catch {}
    const newId = 'conv-' + Date.now();
    const cleanConvs = [{ id: newId, title: 'New Investigation', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
    set({
      conversations: cleanConvs,
      activeConversationId: newId,
      messages: { [newId]: [] }
    });
  },
  deleteConversation: (id) => set((state) => {
    const updatedConvos = state.conversations.filter(c => c.id !== id);
    const updatedMsgs = { ...state.messages };
    delete updatedMsgs[id];

    let nextActive = state.activeConversationId;
    if (state.activeConversationId === id) {
      if (updatedConvos.length > 0) {
        nextActive = updatedConvos[0].id;
      } else {
        const newId = 'conv-' + Date.now();
        const fresh: Conversation = { id: newId, title: 'New Investigation', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        updatedConvos.push(fresh);
        updatedMsgs[newId] = [];
        nextActive = newId;
      }
    }

    try {
      localStorage.setItem(CHAT_LOCAL_KEY, JSON.stringify(updatedConvos));
      localStorage.setItem(MSGS_LOCAL_KEY, JSON.stringify(updatedMsgs));
    } catch {}

    return {
      conversations: updatedConvos,
      messages: updatedMsgs,
      activeConversationId: nextActive
    };
  }),
  deleteMessage: (convId, msgId) => set((state) => {
    const existingMsgs = state.messages[convId] || [];
    const updatedMsgs = existingMsgs.filter(m => m.id !== msgId);
    const newMessages = {
      ...state.messages,
      [convId]: updatedMsgs
    };

    try {
      localStorage.setItem(MSGS_LOCAL_KEY, JSON.stringify(newMessages));
    } catch {}

    return {
      messages: newMessages
    };
  }),
  addMessage: (convId, msg) => set((state) => {
    const existingMsgs = state.messages[convId] || [];
    const updatedMsgs = [...existingMsgs, msg];
    const newMessages = {
      ...state.messages,
      [convId]: updatedMsgs
    };

    let updatedConvos = state.conversations;
    if (msg.role === 'user' && existingMsgs.filter(m => m.role === 'user').length === 0) {
      const shortTitle = msg.content.length > 35 ? msg.content.substring(0, 32) + '...' : msg.content;
      updatedConvos = state.conversations.map(c => 
        c.id === convId ? { ...c, title: shortTitle, updated_at: new Date().toISOString() } : c
      );
    }

    try {
      localStorage.setItem(CHAT_LOCAL_KEY, JSON.stringify(updatedConvos));
      localStorage.setItem(MSGS_LOCAL_KEY, JSON.stringify(newMessages));
    } catch {}

    return {
      messages: newMessages,
      conversations: updatedConvos
    };
  }),
  addEventToLastMessage: (convId, event) => set((state) => {
    const convMsgs = state.messages[convId] || [];
    if (convMsgs.length === 0) return state;
    const lastMsg = { ...convMsgs[convMsgs.length - 1] };
    const events = [...(lastMsg.events || []), event];
    lastMsg.events = events;
    const updatedMsgs = [...convMsgs.slice(0, -1), lastMsg];
    const newMessages = {
      ...state.messages,
      [convId]: updatedMsgs
    };

    try {
      localStorage.setItem(MSGS_LOCAL_KEY, JSON.stringify(newMessages));
    } catch {}

    return {
      messages: newMessages
    };
  }),
  newConversation: () => {
    const id = 'conv-' + Date.now();
    const newConv: Conversation = {
      id,
      title: 'New Investigation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    set((state) => {
      const updatedConvos = [newConv, ...state.conversations];
      const updatedMsgs = { ...state.messages, [id]: [] };
      try {
        localStorage.setItem(CHAT_LOCAL_KEY, JSON.stringify(updatedConvos));
        localStorage.setItem(MSGS_LOCAL_KEY, JSON.stringify(updatedMsgs));
      } catch {}
      return {
        conversations: updatedConvos,
        activeConversationId: id,
        messages: updatedMsgs
      };
    });
    return id;
  },
  setConversations: (convos) => set({ conversations: convos }),
}));
