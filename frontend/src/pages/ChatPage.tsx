import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';

const ChatPage = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <ChatInterface />
      </main>
    </div>
  );
};

export default ChatPage;
