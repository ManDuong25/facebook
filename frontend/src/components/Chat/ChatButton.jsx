import React from 'react';
import { useChat } from '../../contexts/ChatContext';

/**
 * A reusable button component that opens a chat window with a specific user
 */
const ChatButton = ({ conversation, className, children }) => {
    const { handleSelectConversation } = useChat();

    const openChat = () => {
        handleSelectConversation(conversation);
    };

    return (
        <button onClick={openChat} className={`inline-flex items-center justify-center ${className || ''}`}>
            {children}
        </button>
    );
};

export default ChatButton;
