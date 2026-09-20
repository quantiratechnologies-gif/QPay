import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Modal } from '../../Modal';

interface Message {
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

interface LiveChatModalProps {
  isOpen: boolean;
  isAr: boolean;
  onClose: () => void;
}

export const LiveChatModal: React.FC<LiveChatModalProps> = ({ isOpen, isAr, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'agent',
      text: isAr
        ? 'مرحباً بك! كيف يمكننا مساعدتك في حساب كيو تي باي اليوم؟'
        : 'Hello! How can I assist you with your QTPay account today?',
      time: isAr ? 'الآن' : 'Just now',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setMessages((prev) => [...prev, { sender: 'user', text: userText, time: 'Just now' }]);
    setInputMsg('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: isAr
            ? `شكراً لتواصلك معنا بخصوص "${userText}". يقوم فريق خدمة العملاء بمراجعة استفسارك وسيتم الرد عليك في أقرب وقت.`
            : `Thank you for reaching out regarding "${userText}". Our customer support team is reviewing your inquiry and will respond shortly.`,
          time: isAr ? 'الآن' : 'Just now',
        },
      ]);
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isAr ? 'الدعم المباشر' : 'Live Support'}>
      <div
        style={{
          height: '260px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginBottom: '14px',
          paddingRight: '4px',
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'user' ? '#7FE87F' : '#1E1E32',
              color: msg.sender === 'user' ? '#0B0B14' : '#FFFFFF',
              border: msg.sender === 'user' ? 'none' : '1px solid #2C2C44',
              padding: '10px 14px',
              borderRadius: '14px',
              maxWidth: '80%',
              fontSize: '13px',
              fontWeight: 600,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Type your message...'}
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1px solid #2C2C44',
            backgroundColor: '#1E1E32',
            color: '#FFFFFF',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          className="interactive-tap"
          style={{
            backgroundColor: '#7FE87F',
            border: 'none',
            color: '#0B0B14',
            padding: '0 16px',
            borderRadius: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: 'none',
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </Modal>
  );
};
