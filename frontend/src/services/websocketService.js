import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// Sử dụng biến môi trường hoặc URL cố định
const SOCKET_URL = 'http://localhost:8080/ws';

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = {};
        this.pendingSubscriptions = new Map();
        this.connectionPromise = null;
    }

    async connect(onConnect, onError) {
        if (this.connected) {
            console.log('[WebSocket] Already connected, reusing connection');
            if (onConnect) onConnect();
            return;
        }

        if (this.connectionPromise) {
            console.log('[WebSocket] Connection in progress, waiting...');
            return this.connectionPromise;
        }

        console.log('[WebSocket] Attempting to connect...');

        this.connectionPromise = new Promise((resolve, reject) => {
            const socket = new SockJS(SOCKET_URL, null, {
                transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
                timeout: 5000,
                withCredentials: true,
            });

            this.client = new Client({
                webSocketFactory: () => socket,
                debug: (str) => console.log('[WebSocket]', str),
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                connectHeaders: {
                    // Add any headers if needed
                },
                onStompError: (frame) => {
                    console.error('[WebSocket] STOMP error:', frame);
                    this.connected = false;
                    this.connectionPromise = null;
                },
                onWebSocketError: (event) => {
                    console.error('[WebSocket] WebSocket error:', event);
                    this.connected = false;
                    this.connectionPromise = null;
                },
                onWebSocketClose: (event) => {
                    console.log('[WebSocket] WebSocket closed:', event);
                    this.connected = false;
                    this.connectionPromise = null;
                },
            });

            this.client.onConnect = (frame) => {
                this.connected = true;
                console.log('[WebSocket] Successfully connected to server', frame);

                // Process any pending subscriptions after a short delay
                setTimeout(() => {
                    console.log('[WebSocket] Processing pending subscriptions:', this.pendingSubscriptions.size);
                    this.pendingSubscriptions.forEach((callback, topic) => {
                        console.log('[WebSocket] Processing subscription for topic:', topic);
                        this.subscribe(topic, callback);
                    });
                    this.pendingSubscriptions.clear();
                }, 100);

                if (onConnect) onConnect();
                resolve();
            };

            this.client.onStompError = (frame) => {
                console.error('[WebSocket] Broker reported error: ' + frame.headers['message']);
                console.error('[WebSocket] Additional details: ' + frame.body);
                this.connected = false;
                this.connectionPromise = null;
                if (onError) onError(frame);
                reject(frame);
            };

            this.client.onWebSocketError = (event) => {
                console.error('[WebSocket] WebSocket error:', event);
                this.connected = false;
                this.connectionPromise = null;
                if (onError) onError(event);
                reject(event);
            };

            this.client.onDisconnect = () => {
                this.connected = false;
                console.log('[WebSocket] Disconnected from server');
                this.subscriptions = {};
                this.connectionPromise = null;
            };

            try {
                this.client.activate();
            } catch (error) {
                console.error('[WebSocket] Failed to activate client:', error);
                this.connected = false;
                this.connectionPromise = null;
                if (onError) onError(error);
                reject(error);
            }
        });

        return this.connectionPromise;
    }

    disconnect() {
        if (this.client && this.connected) {
            try {
                this.client.deactivate();
            } catch (error) {
                console.error('[WebSocket] Error during disconnect:', error);
            }
            this.connected = false;
            this.subscriptions = {};
            this.pendingSubscriptions.clear();
            this.connectionPromise = null;
        }
    }

    async subscribe(topic, callback) {
        console.log('[WebSocket] Attempting to subscribe to topic:', topic);
        console.log('[WebSocket] Current connection status:', this.connected);
        console.log('[WebSocket] Current subscriptions:', Object.keys(this.subscriptions));

        if (!this.connected) {
            console.warn('[WebSocket] Not connected yet, storing subscription for later:', topic);
            this.pendingSubscriptions.set(topic, callback);
            return;
        }

        if (this.subscriptions[topic]) {
            console.log('[WebSocket] Already subscribed to:', topic);
            return;
        }

        try {
            // Wait a bit to ensure STOMP connection is ready
            await new Promise((resolve) => setTimeout(resolve, 100));

            console.log('[WebSocket] Creating subscription for topic:', topic);
            const subscription = this.client.subscribe(topic, (message) => {
                console.log('[WebSocket] Received raw message on topic:', topic);
                console.log('[WebSocket] Message headers:', message.headers);
                console.log('[WebSocket] Message body:', message.body);

                if (callback) {
                    try {
                        const parsedMessage = JSON.parse(message.body);
                        console.log('[WebSocket] Successfully parsed message:', parsedMessage);
                        callback(parsedMessage);
                    } catch (error) {
                        console.error('[WebSocket] Error parsing message:', error);
                        console.error('[WebSocket] Raw message body:', message.body);
                        callback(message.body);
                    }
                }
            });
            this.subscriptions[topic] = subscription;
            console.log('[WebSocket] Successfully subscribed to:', topic);
        } catch (error) {
            console.error('[WebSocket] Error subscribing to topic:', topic, error);
            this.pendingSubscriptions.set(topic, callback);
        }
    }

    // Kiểm tra xem đã đăng ký topic chưa
    isSubscribed(topic) {
        return this.subscriptions[topic] !== undefined;
    }

    unsubscribe(topic) {
        console.log('[WebSocket] Attempting to unsubscribe from topic:', topic);
        if (this.subscriptions[topic]) {
            try {
                this.subscriptions[topic].unsubscribe();
                delete this.subscriptions[topic];
                console.log('[WebSocket] Successfully unsubscribed from:', topic);
            } catch (error) {
                console.error('[WebSocket] Error unsubscribing from topic:', topic, error);
            }
        } else {
            console.log('[WebSocket] No active subscription found for topic:', topic);
        }
        this.pendingSubscriptions.delete(topic);
    }

    send(destination, body) {
        if (this.client && this.connected) {
            try {
                console.log('[WebSocket] Preparing to send message:', {
                    destination,
                    body,
                });

                const messageBody = JSON.stringify(body);
                console.log('[WebSocket] Serialized message body:', messageBody);

                this.client.publish({
                    destination,
                    body: messageBody,
                    headers: {
                        'content-type': 'application/json',
                    },
                });
                console.log('[WebSocket] Message sent successfully to:', destination);
            } catch (error) {
                console.error('[WebSocket] Error sending message:', error);
                throw error;
            }
        } else {
            const error = new Error('[WebSocket] Cannot send message - not connected');
            console.error(error);
            throw error;
        }
    }
}

// Export một instance duy nhất
const websocketService = new WebSocketService();
export default websocketService;
