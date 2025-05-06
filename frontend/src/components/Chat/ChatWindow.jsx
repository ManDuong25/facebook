import React, { useState, useRef, useEffect } from 'react';
import { getAvatarUrl, handleImageError } from '../../utils/avatarUtils';
import { getCurrentUser } from '../../services/authService';
import { sendMessage, getMessagesBetweenUsers } from '../../services/messageService';
import websocketService from '../../services/websocketService';

const ChatWindow = ({ conversation, onClose, index = 0, isOldest = false }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [minimized, setMinimized] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const loggedInUser = getCurrentUser();
    const loggedInUserId = loggedInUser?.id;

    useEffect(() => {
        const connectWebSocket = async () => {
            try {
                await websocketService.connect(() => {
                    console.log('WebSocket connected');

                    // Subscribe to user-specific topic
                    const userTopic = `/topic/messages/${loggedInUserId}`;
                    websocketService.subscribe(userTopic, (message) => {
                        console.log('Received message:', message);
                        if (message.senderId === conversation.id || message.receiverId === conversation.id) {
                            setMessages((prevMessages) => {
                                // Kiểm tra xem tin nhắn đã tồn tại chưa (dựa vào ID hoặc nội dung)
                                const messageExists = prevMessages.some(
                                    (msg) =>
                                        msg.id === message.id ||
                                        (msg.pending &&
                                            msg.content === message.content &&
                                            msg.senderId === message.senderId),
                                );

                                // Đảm bảo sentAt luôn có giá trị
                                const messageSentAt = message.sentAt || new Date().toISOString();

                                if (messageExists) {
                                    // Nếu tin nhắn đã tồn tại, cập nhật nó thay vì thêm mới
                                    return prevMessages.map((msg) =>
                                        msg.id === message.id ||
                                        (msg.pending &&
                                            msg.content === message.content &&
                                            msg.senderId === message.senderId)
                                            ? {
                                                  ...msg,
                                                  id: message.id,
                                                  pending: false,
                                                  timestamp: formatMessageTime(messageSentAt),
                                                  sentAt: messageSentAt,
                                              }
                                            : msg,
                                    );
                                } else {
                                    // Nếu là tin nhắn mới, thêm vào danh sách
                                    return [
                                        ...prevMessages,
                                        {
                                            id: message.id,
                                            senderId: message.senderId,
                                            content: message.content,
                                            timestamp: formatMessageTime(messageSentAt),
                                            sentAt: messageSentAt,
                                        },
                                    ];
                                }
                            });
                        }
                    });
                });
            } catch (error) {
                console.error('Failed to connect to WebSocket:', error);
            }
        };

        connectWebSocket();

        return () => {
            websocketService.disconnect();
        };
    }, [conversation.id, loggedInUserId]);

    // Fetch previous messages when the conversation changes
    useEffect(() => {
        if (conversation && loggedInUserId) {
            fetchMessages();
        }
    }, [conversation, loggedInUserId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (!isLoading) {
            scrollToBottom();
        }
    }, [messages, isLoading]);

    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const receiverId = conversation.id;

            // Fetch messages between the logged-in user and the conversation partner
            const response = await getMessagesBetweenUsers(loggedInUserId, receiverId);

            if (response.status === 'success' && response.data) {
                // Format the messages for display
                const formattedMessages = response.data.map((msg) => ({
                    id: msg.id,
                    senderId: msg.senderId,
                    content: msg.content,
                    timestamp: formatMessageTime(msg.sentAt),
                    sentAt: msg.sentAt,
                }));

                setMessages(formattedMessages);
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Format the timestamp from the server
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return '';

        try {
            // Handle the specific format returned by the API: "2025-04-18 20:55:33"
            const date = new Date(timestamp.replace(' ', 'T'));

            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.error('Invalid date:', timestamp);
                return timestamp; // Return original string if can't parse
            }

            // Format time in 24-hour format
            return date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            console.error('Error formatting timestamp:', e, 'Original timestamp:', timestamp);
            return timestamp; // Return original string on error
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        try {
            setIsSending(true);

            // Create a new message object to add to UI immediately
            const tempId = Date.now();
            const now = new Date();
            const newMsg = {
                id: tempId,
                senderId: loggedInUserId,
                content: newMessage,
                timestamp: formatMessageTime(now.toISOString()),
                sentAt: now.toISOString(),
                pending: true,
            };

            console.log(newMsg);

            // Add to UI
            setMessages((prevMessages) => [...prevMessages, newMsg]);
            setNewMessage('');

            // Get receiver ID from conversation
            const receiverId = conversation.id;

            // Send message via WebSocket only
            websocketService.send('/app/chat', {
                senderId: loggedInUserId,
                receiverId: receiverId,
                content: newMessage.trim(),
                type: 'CHAT',
                sentAt: now.toISOString(),
            });

            // The message will be updated when we receive it back from the server
            // through the WebSocket subscription
        } catch (error) {
            console.error('Failed to send message:', error);
            // Mark the message as failed
            setMessages((prevMessages) =>
                prevMessages.map((msg) => (msg.id === tempId ? { ...msg, failed: true, pending: false } : msg)),
            );
        } finally {
            setIsSending(false);
        }
    };

    const toggleMinimize = () => {
        setMinimized(!minimized);
    };

    return (
        <div
            className={`bg-white rounded-t-lg shadow-lg border border-gray-300 z-40 flex flex-col transition-all duration-200 ease-in-out w-[328px] ${
                minimized ? 'h-[40px]' : 'h-[455px]'
            }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b bg-white rounded-t-lg">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={getAvatarUrl(conversation.avatar)}
                            alt={conversation.name}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={handleImageError}
                        />
                        {conversation.online && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                    </div>
                    <div className="font-semibold text-sm">{conversation.name}</div>
                </div>
                <div className="flex items-center gap-2">
                    {!minimized && (
                        <>
                            <i className="bi bi-telephone text-gray-600 cursor-pointer hover:text-gray-800"></i>
                            <i className="bi bi-camera-video text-gray-600 cursor-pointer hover:text-gray-800"></i>
                            <i className="bi bi-info-circle text-gray-600 cursor-pointer hover:text-gray-800"></i>
                        </>
                    )}
                    <i
                        className="bi bi-dash text-gray-600 cursor-pointer hover:text-gray-800"
                        onClick={toggleMinimize}
                    ></i>
                    <i className="bi bi-x text-gray-600 cursor-pointer hover:text-gray-800" onClick={onClose}></i>
                </div>
            </div>

            {/* Messages Container */}
            {!minimized && (
                <>
                    <div className="flex-1 p-3 overflow-y-auto bg-gray-100">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <i className="bi bi-chat-text text-3xl mb-2"></i>
                                <p className="text-sm">Chưa có tin nhắn nào</p>
                                <p className="text-xs">Hãy bắt đầu cuộc trò chuyện</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex mb-2 ${
                                        message.senderId === loggedInUserId ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    {message.senderId !== loggedInUserId && (
                                        <img
                                            src={getAvatarUrl(conversation.avatar)}
                                            alt=""
                                            className="w-8 h-8 rounded-full mr-2 self-end"
                                            onError={handleImageError}
                                        />
                                    )}
                                    <div
                                        className={`max-w-[70%] p-2 rounded-lg group relative ${
                                            message.senderId === loggedInUserId
                                                ? 'bg-blue-500 text-white rounded-br-none'
                                                : 'bg-white text-gray-800 rounded-bl-none'
                                        } ${message.pending ? 'opacity-70' : ''} ${
                                            message.failed ? 'border-red-500 border' : ''
                                        }`}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs opacity-70">
                                                {message.timestamp || formatMessageTime(message.sentAt)}
                                            </span>
                                            {message.pending && (
                                                <span className="text-xs opacity-70">
                                                    <i className="bi bi-clock"></i>
                                                </span>
                                            )}
                                            {message.failed && (
                                                <span className="text-xs text-red-500">
                                                    <i className="bi bi-exclamation-circle"></i>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-2 border-t flex items-center gap-2 bg-white">
                        <i className="bi bi-plus-circle text-xl text-gray-600 cursor-pointer"></i>
                        <i className="bi bi-image text-xl text-gray-600 cursor-pointer"></i>
                        <i className="bi bi-emoji-smile text-xl text-gray-600 cursor-pointer"></i>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 py-1 px-3 rounded-full bg-gray-100 outline-none"
                            placeholder="Aa"
                            disabled={isSending || isLoading}
                        />
                        <i
                            className={`bi bi-send${newMessage.trim() ? '-fill' : ''} text-xl ${
                                newMessage.trim() && !isSending && !isLoading
                                    ? 'text-blue-500 cursor-pointer'
                                    : 'text-gray-400'
                            }`}
                            onClick={newMessage.trim() && !isSending && !isLoading ? handleSendMessage : undefined}
                        ></i>
                    </form>
                </>
            )}
        </div>
    );
};

export default ChatWindow;
