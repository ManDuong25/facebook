// Test data for messages
const testMessages = {
    // Alex Johnson
    1: [
        {
            id: 101,
            senderId: 1,
            content: "Hey, how's it going?",
            timestamp: '10:30 AM',
        },
        {
            id: 102,
            senderId: 1,
            content: 'Did you see the game last night?',
            timestamp: '10:32 AM',
        },
        {
            id: 103,
            senderId: 1, // Current user
            content: "Hi Alex! I'm good, thanks. Yeah, it was amazing!",
            timestamp: '10:35 AM',
        },
        {
            id: 104,
            senderId: 1,
            content: 'Right? That last-minute goal was incredible.',
            timestamp: '10:36 AM',
        },
    ],

    // Sarah Miller
    2: [
        {
            id: 201,
            senderId: 2,
            content: 'Are we still meeting tomorrow?',
            timestamp: '1:15 PM',
        },
        {
            id: 202,
            senderId: 1, // Current user
            content: 'Yes, definitely! 2pm at the coffee shop?',
            timestamp: '1:20 PM',
        },
        {
            id: 203,
            senderId: 2,
            content: "Perfect! I'll bring the documents we need to discuss.",
            timestamp: '1:22 PM',
        },
        {
            id: 204,
            senderId: 1, // Current user
            content: 'Sounds good. Looking forward to it!',
            timestamp: '1:25 PM',
        },
    ],

    // David Wilson
    3: [
        {
            id: 301,
            senderId: 3,
            content: 'Check out this new photo!',
            timestamp: 'Yesterday',
        },
        {
            id: 302,
            senderId: 3,
            content: "It's from our trip last weekend.",
            timestamp: 'Yesterday',
        },
        {
            id: 303,
            senderId: 1, // Current user
            content: 'Wow, that looks amazing! The scenery is beautiful.',
            timestamp: 'Yesterday',
        },
        {
            id: 304,
            senderId: 3,
            content: 'Yeah, we should plan another trip soon!',
            timestamp: 'Yesterday',
        },
    ],

    // Emma Thompson
    4: [
        {
            id: 401,
            senderId: 4,
            content: 'Thanks for the help yesterday',
            timestamp: 'Monday',
        },
        {
            id: 402,
            senderId: 1, // Current user
            content: 'No problem at all! Happy to help.',
            timestamp: 'Monday',
        },
        {
            id: 403,
            senderId: 4,
            content: 'I finished the project thanks to your suggestions.',
            timestamp: 'Monday',
        },
        {
            id: 404,
            senderId: 1, // Current user
            content: "That's great news! Let me know if you need any more help.",
            timestamp: 'Monday',
        },
    ],

    // Michael Brown
    5: [
        {
            id: 501,
            senderId: 5,
            content: 'Did you finish the project?',
            timestamp: 'Sunday',
        },
        {
            id: 502,
            senderId: 1, // Current user
            content: "Almost! I'm just wrapping up the final details.",
            timestamp: 'Sunday',
        },
        {
            id: 503,
            senderId: 5,
            content: 'Great, the client is asking for an update.',
            timestamp: 'Sunday',
        },
        {
            id: 504,
            senderId: 1, // Current user
            content: "I'll have it done by tomorrow morning.",
            timestamp: 'Sunday',
        },
    ],

    // Remaining conversations
    6: [
        {
            id: 601,
            senderId: 6,
            content: "Let's go for lunch sometime",
            timestamp: 'Last week',
        },
        {
            id: 602,
            senderId: 1, // Current user
            content: "I'd love to! How about Friday?",
            timestamp: 'Last week',
        },
    ],

    7: [
        {
            id: 701,
            senderId: 7,
            content: 'Can you send me the files?',
            timestamp: '2 weeks ago',
        },
        {
            id: 702,
            senderId: 1, // Current user
            content: "Sure, I'll email them to you right away.",
            timestamp: '2 weeks ago',
        },
    ],

    8: [
        {
            id: 801,
            senderId: 8,
            content: 'Happy birthday!',
            timestamp: '2 weeks ago',
        },
        {
            id: 802,
            senderId: 1, // Current user
            content: 'Thank you so much! 😊',
            timestamp: '2 weeks ago',
        },
    ],

    9: [
        {
            id: 901,
            senderId: 9,
            content: "How's the new job going?",
            timestamp: '3 weeks ago',
        },
        {
            id: 902,
            senderId: 1, // Current user
            content: "It's great! Really enjoying the new team.",
            timestamp: '3 weeks ago',
        },
    ],

    10: [
        {
            id: 1001,
            senderId: 10,
            content: "I'm visiting next month",
            timestamp: '1 month ago',
        },
        {
            id: 1002,
            senderId: 1, // Current user
            content: "That's fantastic! Let me know your dates and we can plan something.",
            timestamp: '1 month ago',
        },
    ],

    // Friends from right sidebar
    101: [
        {
            id: 10101,
            senderId: 101,
            content: 'Chào bạn, bạn khỏe không?',
            timestamp: 'Hôm nay',
        },
        {
            id: 10102,
            senderId: 1, // Current user
            content: 'Mình khỏe, cảm ơn bạn! Còn bạn thì sao?',
            timestamp: 'Hôm nay',
        },
        {
            id: 10103,
            senderId: 101,
            content: 'Mình cũng vậy. Tuần này bạn có kế hoạch gì không?',
            timestamp: 'Hôm nay',
        },
    ],

    102: [
        {
            id: 10201,
            senderId: 102,
            content: 'Bạn đã làm xong bài tập chưa?',
            timestamp: 'Hôm qua',
        },
        {
            id: 10202,
            senderId: 1, // Current user
            content: 'Mình đang làm. Còn một số câu hỏi khó.',
            timestamp: 'Hôm qua',
        },
        {
            id: 10203,
            senderId: 102,
            content: 'Mình có thể giúp đỡ bạn nếu cần.',
            timestamp: 'Hôm qua',
        },
    ],

    103: [
        {
            id: 10301,
            senderId: 103,
            content: 'Ngày mai chúng ta họp lúc mấy giờ?',
            timestamp: 'Thứ Ba',
        },
        {
            id: 10302,
            senderId: 1, // Current user
            content: '9 giờ sáng ở phòng A3 nhé.',
            timestamp: 'Thứ Ba',
        },
        {
            id: 10303,
            senderId: 103,
            content: 'Cảm ơn. Mình sẽ chuẩn bị tài liệu.',
            timestamp: 'Thứ Ba',
        },
    ],

    104: [
        {
            id: 10401,
            senderId: 104,
            content: 'Bạn có đi dự tiệc cuối tuần này không?',
            timestamp: 'Thứ Hai',
        },
        {
            id: 10402,
            senderId: 1, // Current user
            content: 'Mình dự định đi. Bạn đi à?',
            timestamp: 'Thứ Hai',
        },
        {
            id: 10403,
            senderId: 104,
            content: 'Đúng rồi. Hay chúng ta đi cùng nhau nhé?',
            timestamp: 'Thứ Hai',
        },
    ],

    105: [
        {
            id: 10501,
            senderId: 105,
            content: 'Chúc mừng sinh nhật bạn!',
            timestamp: 'Chủ Nhật',
        },
        {
            id: 10502,
            senderId: 1, // Current user
            content: 'Cảm ơn bạn nhiều lắm! 🎂',
            timestamp: 'Chủ Nhật',
        },
    ],

    106: [
        {
            id: 10601,
            senderId: 106,
            content: 'Bạn đã xem bộ phim mới chưa?',
            timestamp: 'Tuần trước',
        },
        {
            id: 10602,
            senderId: 1, // Current user
            content: 'Rồi. Phim hay lắm! Bạn có thích không?',
            timestamp: 'Tuần trước',
        },
    ],

    107: [
        {
            id: 10701,
            senderId: 107,
            content: 'Hôm nay thời tiết đẹp quá!',
            timestamp: 'Thứ Bảy trước',
        },
        {
            id: 10702,
            senderId: 1, // Current user
            content: 'Đúng vậy. Bạn có kế hoạch gì cho ngày đẹp trời này không?',
            timestamp: 'Thứ Bảy trước',
        },
    ],
};

export default testMessages;
