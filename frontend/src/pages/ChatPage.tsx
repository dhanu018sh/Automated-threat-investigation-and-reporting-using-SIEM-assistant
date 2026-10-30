import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import EndpointTelemetryBar from '../components/EndpointTelemetryBar';

const ChatPage = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <EndpointTelemetryBar />
        <ChatInterface />
      </main>
    </div>
  );
};

export default ChatPage;
