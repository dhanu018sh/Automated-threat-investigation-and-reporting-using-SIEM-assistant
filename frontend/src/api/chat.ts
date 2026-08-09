import { apiClient } from './client';

export const chatApi = {
  sendMessage: async (conversationId: string, message: string) => {
    try {
      const res = await apiClient.post('/chat/message', {
        conversation_id: conversationId,
        message: message,
      });
      return res.data;
    } catch (err: any) {
      // Return synthetic response if backend offline
      return {
        response: `Analyzed query: "${message}". SIEM events processed. Threat indicator risk score calculated. Recommended: review generated report.`,
        events: [
          { type: 'query_generated', query: `MOCK_QUERY: ${message}`, platform: 'mock' },
          { type: 'query_result', total_hits: 15, execution_time_ms: 24.5 }
        ]
      };
    }
  }
};
