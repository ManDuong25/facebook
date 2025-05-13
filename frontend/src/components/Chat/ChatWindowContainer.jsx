import React from 'react';
import ChatWindow from './ChatWindow';
import ChatRoomWindow from './ChatRoomWindow';
import { useChat, CHAT_TYPES } from '~/contexts/ChatContext';

const ChatWindowContainer = () => {
    const { activeConversations, handleCloseChat } = useChat();

    return (
        <div className="fixed bottom-0 right-0 flex flex-row-reverse gap-2 mx-20 pt-4 pb-0 z-50">
            {activeConversations.map((conversation, index) => {
                const isOldest = index === 0;
                const isNewest = index === activeConversations.length - 1;

                // Render ChatRoomWindow cho GROUP chat và ChatWindow cho PRIVATE chat
                return conversation.type === CHAT_TYPES.GROUP ? (
                    <ChatRoomWindow
                        key={conversation.id}
                        conversation={conversation}
                        onClose={() => handleCloseChat(conversation.id)}
                        index={index}
                        isOldest={isOldest}
                    />
                ) : (
                    <ChatWindow
                        key={conversation.id}
                        conversation={conversation}
                        onClose={() => handleCloseChat(conversation.id)}
                        index={index}
                        isOldest={isOldest}
                    />
                );
            })}
        </div>
    );
};

export default ChatWindowContainer;
