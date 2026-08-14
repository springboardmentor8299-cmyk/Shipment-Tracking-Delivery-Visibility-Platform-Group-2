import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

export function connectToTracking(shipmentId, onLocationUpdate, onEtaUpdate, onDelayAlert) {
    if (stompClient && stompClient.active) {
        stompClient.deactivate();
    }

    stompClient = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        connectHeaders: {},
        debug: () => {},
        reconnectDelay: 5000,
        onConnect: () => {
            stompClient.subscribe(`/topic/tracking/${shipmentId}`, (message) => {
                const data = JSON.parse(message.body);
                if (onLocationUpdate) onLocationUpdate(data);
            });

            stompClient.subscribe(`/topic/eta/${shipmentId}`, (message) => {
                const data = JSON.parse(message.body);
                if (onEtaUpdate) onEtaUpdate(data);
            });

            stompClient.subscribe(`/topic/delay/${shipmentId}`, (message) => {
                const data = JSON.parse(message.body);
                if (onDelayAlert) onDelayAlert(data);
            });
        },
        onStompError: (error) => {
            console.error('STOMP error:', error);
        }
    });

    stompClient.activate();
}

export function disconnect() {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
}

let adminClient = null;

export function connectToAdminAlerts(onAlert) {
    if (adminClient && adminClient.active) {
        adminClient.deactivate();
    }

    adminClient = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        connectHeaders: {},
        debug: () => {},
        reconnectDelay: 5000,
        onConnect: () => {
            adminClient.subscribe('/topic/admin/alerts', (message) => {
                const data = JSON.parse(message.body);
                if (onAlert) onAlert(data);
            });
        },
        onStompError: (error) => {
            console.error('STOMP admin error:', error);
        }
    });

    adminClient.activate();
}

export function disconnectAdmin() {
    if (adminClient) {
        adminClient.deactivate();
        adminClient = null;
    }
}

let supportChatClient = null;

export function connectToSupportChat(queryId, onUpdate) {
    if (supportChatClient && supportChatClient.active) {
        supportChatClient.deactivate();
    }

    supportChatClient = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        connectHeaders: {},
        debug: () => {},
        reconnectDelay: 5000,
        onConnect: () => {
            supportChatClient.subscribe(`/topic/support/${queryId}`, (message) => {
                if (onUpdate) onUpdate(JSON.parse(message.body));
            });
        },
        onStompError: (error) => {
            console.error('STOMP support chat error:', error);
        }
    });

    supportChatClient.activate();
}

export function disconnectSupportChat() {
    if (supportChatClient) {
        supportChatClient.deactivate();
        supportChatClient = null;
    }
}
