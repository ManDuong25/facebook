import React, { createContext, useState, useContext } from 'react';

// Create context
const ChatContext = createContext();

// Define the constant directly here instead of importing from chatConstants
const MAX_CHAT_WINDOWS = 4;

export const ChatProvider = ({ children }) => {
    const [activeConversations, setActiveConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [maxChatWindows, setMaxChatWindows] = useState(MAX_CHAT_WINDOWS);

    // Handle max chat windows change
    const handleMaxChatWindowsChange = (newMax) => {
        setMaxChatWindows(newMax);

        // If we now have more active conversations than allowed, remove the oldest ones
        if (activeConversations.length > newMax) {
            const conversationsToKeep = activeConversations.slice(activeConversations.length - newMax);
            setActiveConversations(conversationsToKeep);
        }
    };

    // Handle conversation selection
    const handleSelectConversation = (conversation) => {
        // Check if conversation is already active
        const isAlreadyActive = activeConversations.some((conv) => conv.id === conversation.id);

        // If already active, bring it to the front by removing and adding to the end
        if (isAlreadyActive) {
            const updatedConversations = activeConversations.filter((conv) => conv.id !== conversation.id);
            setActiveConversations([...updatedConversations, conversation]);
        } else {
            // If we already have MAX_CHAT_WINDOWS chat windows, remove the oldest one
            if (activeConversations.length >= maxChatWindows) {
                const updatedConversations = [...activeConversations.slice(1)];
                setActiveConversations([...updatedConversations, conversation]);
            } else {
                // Otherwise just add the new conversation
                setActiveConversations((prev) => [...prev, conversation]);
            }
        }

        // Set as selected conversation
        setSelectedConversation(conversation);
    };

    // Handle closing a chat window
    const handleCloseChat = (conversationId) => {
        setActiveConversations((prev) => prev.filter((conv) => conv.id !== conversationId));

        // If the closed conversation was selected, deselect it
        if (selectedConversation && selectedConversation.id === conversationId) {
            setSelectedConversation(null);
        }
    };

    return (
        <ChatContext.Provider
            value={{
                activeConversations,
                selectedConversation,
                maxChatWindows,
                handleSelectConversation,
                handleCloseChat,
                handleMaxChatWindowsChange,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

// Custom hook to use the chat context
export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export default ChatContext;
