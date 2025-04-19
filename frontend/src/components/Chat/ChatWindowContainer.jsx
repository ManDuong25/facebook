import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatWindow from './ChatWindow';

const ChatWindowContainer = () => {
    const { activeConversations, handleCloseChat, maxChatWindows } = useChat();

    return (
        <div className="fixed bottom-0 right-0 z-40 flex justify-end space-x-3 mr-[100px]">
            {activeConversations.map((conv, index) => (
                <ChatWindow
                    key={conv.id}
                    conversation={conv}
                    onClose={() => handleCloseChat(conv.id)}
                    index={index}
                    isOldest={activeConversations.length >= maxChatWindows && index === 0}
                />
            ))}
        </div>
    );
};

export default ChatWindowContainer;
