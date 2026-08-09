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
  addEventToLastMessage: (convId: string, event: WSEvent) => void;
  newConversation: () => string;
  setConversations: (convos: Conversation[]) => void;
}

const DEFAULT_CONV_ID = 'conv-initial-1';

const INITIAL_CONVERSATIONS: Conversation[] = [
  { id: DEFAULT_CONV_ID, title: 'Brute Force Investigation', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'conv-initial-2', title: 'Phishing Campaign Analysis', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: INITIAL_CONVERSATIONS,
  activeConversationId: DEFAULT_CONV_ID,
  messages: {
    [DEFAULT_CONV_ID]: [],
    'conv-initial-2': [],
  },
  isLoading: false,
  wsConnected: false,
  pendingEvents: [],
  setWsConnected: (status) => set({ wsConnected: status }),
  setLoading: (loading) => set({ isLoading: loading }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  addMessage: (convId, msg) => set((state) => ({
    messages: {
      ...state.messages,
      [convId]: [...(state.messages[convId] || []), msg]
    }
  })),
  addEventToLastMessage: (convId, event) => set((state) => {
    const convMsgs = state.messages[convId] || [];
    if (convMsgs.length === 0) return state;
    const lastMsg = { ...convMsgs[convMsgs.length - 1] };
    const events = [...(lastMsg.events || []), event];
    lastMsg.events = events;
    const updatedMsgs = [...convMsgs.slice(0, -1), lastMsg];
    return {
      messages: {
        ...state.messages,
        [convId]: updatedMsgs
      }
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
    set((state) => ({
      conversations: [newConv, ...state.conversations],
      activeConversationId: id,
      messages: { ...state.messages, [id]: [] }
    }));
    return id;
  },
  setConversations: (convos) => set({ conversations: convos }),
}));
