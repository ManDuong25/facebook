const ChatMessage = ({ message, isCurrentUser }) => {
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}>
            <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isCurrentUser ? 'bg-[#0084FF] text-white' : 'bg-gray-200 text-black'
                }`}
            >
                <p className="text-sm break-words">{message.content}</p>
                <p className={`text-xs mt-1 ${isCurrentUser ? 'text-gray-200' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                </p>
            </div>
        </div>
    );
};
