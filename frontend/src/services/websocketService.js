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
            console.log('[WebSocket] Already connected');
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
            });

            this.client.onConnect = () => {
                this.connected = true;
                console.log('[WebSocket] Successfully connected to server');

                // Process any pending subscriptions after a short delay
                setTimeout(() => {
                    this.pendingSubscriptions.forEach((callback, topic) => {
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
                if (onError) onError(frame);
                reject(frame);
            };

            this.client.onWebSocketError = (event) => {
                console.error('[WebSocket] WebSocket error:', event);
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
        if (!this.connected) {
            console.warn('[WebSocket] Not connected yet, storing subscription for later');
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

            const subscription = this.client.subscribe(topic, (message) => {
                if (callback) {
                    try {
                        const parsedMessage = JSON.parse(message.body);
                        callback(parsedMessage);
                    } catch (error) {
                        console.error('[WebSocket] Error parsing message:', error);
                        callback(message.body);
                    }
                }
            });
            this.subscriptions[topic] = subscription;
            console.log('[WebSocket] Subscribed to:', topic);
        } catch (error) {
            console.error('[WebSocket] Error subscribing to topic:', error);
            this.pendingSubscriptions.set(topic, callback);
        }
    }

    unsubscribe(topic) {
        if (this.subscriptions[topic]) {
            try {
                this.subscriptions[topic].unsubscribe();
                delete this.subscriptions[topic];
                console.log('[WebSocket] Unsubscribed from:', topic);
            } catch (error) {
                console.error('[WebSocket] Error unsubscribing from topic:', error);
            }
        }
        this.pendingSubscriptions.delete(topic);
    }

    send(destination, body) {
        if (this.client && this.connected) {
            try {
                this.client.publish({
                    destination,
                    body: JSON.stringify(body),
                });
                console.log('[WebSocket] Message sent to:', destination);
            } catch (error) {
                console.error('[WebSocket] Error sending message:', error);
            }
        } else {
            console.warn('[WebSocket] Cannot send message - not connected');
        }
    }
}

// Export một instance duy nhất
const websocketService = new WebSocketService();
export default websocketService;
