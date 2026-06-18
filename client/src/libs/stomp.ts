import { Client } from '@stomp/stompjs';
import { notification } from './Notification';

const stompClient = new Client({
    brokerURL: import.meta.env.VITE_WEBSOCKET_API,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onStompError: (frame) => {
        if (notification) {
            notification.error({
                message: 'Chat Connection Error',
                description: frame.headers['message'] || 'An error occurred with the real-time chat connection.'
            });
        }
    },
    onWebSocketError: (evt) => {
        console.error('WebSocket Error:', evt);
    }
});

export default stompClient;