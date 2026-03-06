import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class SocketService {
    constructor() {
        this.client = null;
        this.subscribers = {}; // topic -> array of callbacks
    }

    connect(token) {
        if (this.client && this.client.connected) return; // already connected

        // Setup SockJS and Stomp
        const socket = new SockJS('http://localhost:8080/ws');

        this.client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => {
                // console.log(str); // Uncomment for debugging
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
            console.log('Connected to WebSocket server');
            // Re-subscribe to all existing topics
            Object.keys(this.subscribers).forEach(topic => {
                this.client.subscribe(topic, (message) => {
                    const data = JSON.parse(message.body);
                    this.subscribers[topic].forEach(callback => callback(data));
                });
            });
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.activate();
    }

    subscribe(topic, callback) {
        if (!this.subscribers[topic]) {
            this.subscribers[topic] = [];

            // If already connected, subscribe immediately
            if (this.client && this.client.connected) {
                this.client.subscribe(topic, (message) => {
                    const data = JSON.parse(message.body);
                    this.subscribers[topic].forEach(cb => cb(data));
                });
            }
        }
        this.subscribers[topic].push(callback);
    }

    unsubscribe(topic, callback) {
        if (!this.subscribers[topic]) return;
        this.subscribers[topic] = this.subscribers[topic].filter(cb => cb !== callback);
        // Note: Full unsubscription from STOMP requires keeping track of the subscription ID.
        // For simplicity, we just remove the callback here. 
    }

    sendLocation(driverId, rideId, lat, lng) {
        if (this.client && this.client.connected) {
            this.client.publish({
                destination: '/app/driver/location',
                body: JSON.stringify({ driverId, rideId, lat, lng })
            });
        }
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.subscribers = {};
        }
    }
}

export default new SocketService();
