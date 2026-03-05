/**
 * WebRTC Module - Conexión P2P local entre clientes y servidor
 * Permite sincronización de datos en red local
 */

const WebRTC = {
    // Estado de la conexión
    isServer: false,
    isConnected: false,
    peers: new Map(), // Mapa de conexiones activas
    localInfo: null,
    
    // Configuración STUN
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ],

    /**
     * Obtener dirección IP local del dispositivo
     */
    async getLocalIP() {
        return new Promise((resolve) => {
            const rtcPeerConnection = new (window.RTCPeerConnection || window.webkitRTCPeerConnection)({
                iceServers: this.iceServers
            });

            rtcPeerConnection.createDataChannel('');
            rtcPeerConnection.createOffer()
                .then(offer => rtcPeerConnection.setLocalDescription(offer))
                .catch(() => resolve('127.0.0.1'));

            rtcPeerConnection.onicecandidate = (ice) => {
                if (!ice || !ice.candidate) {
                    rtcPeerConnection.close();
                    return;
                }

                const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                const ipAddress = ipRegex.exec(ice.candidate.candidate);
                if (ipAddress) {
                    const ip = ipAddress[1];
                    if (ip.startsWith('192.') || ip.startsWith('10.') || ip.startsWith('172.')) {
                        rtcPeerConnection.close();
                        resolve(ip);
                    }
                }
            };

            setTimeout(() => {
                rtcPeerConnection.close();
                resolve('127.0.0.1');
            }, 3000);
        });
    },

    /**
     * Iniciar como servidor
     */
    async startServer() {
        this.isServer = true;
        this.isConnected = true;

        const ip = await this.getLocalIP();
        const port = 8080; // Puerto local
        const wsPort = 8081; // Puerto WebSocket simulado

        this.localInfo = {
            role: 'server',
            ip: ip,
            port: port,
            wsPort: wsPort,
            peerId: this.generatePeerId(),
            timestamp: Date.now()
        };

        // Crear servidor WebSocket local simulado
        this.startWebSocketServer();

        // Iniciar broadcast de presencia
        this.startPresenceBroadcast();

        return this.localInfo;
    },

    /**
     * Conectar como cliente a servidor
     */
    async connectToServer(serverIp, serverId) {
        const ip = await this.getLocalIP();

        this.localInfo = {
            role: 'client',
            ip: ip,
            serverId: serverId,
            serverIp: serverIp,
            peerId: this.generatePeerId(),
            timestamp: Date.now()
        };

        // Intentar conexión WebSocket
        this.connectWebSocket(serverIp, 8081);
        
        return this.localInfo;
    },

    /**
     * Generar ID único de peer
     */
    generatePeerId() {
        return 'peer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Iniciar servidor WebSocket local
     */
    startWebSocketServer() {
        // Simulación de servidor WebSocket (en producción sería Node.js)
        // Para entorno browser, usaremos Service Worker o IndexedDB como intermediario
        
        // Guardar estado de servidor en localStorage
        localStorage.setItem('wsServer', JSON.stringify({
            active: true,
            peerId: this.localInfo.peerId,
            timestamp: Date.now()
        }));

        // Escuchar cambios de otros clientes
        window.addEventListener('storage', (e) => {
            if (e.key === 'peerMessage' && e.newValue) {
                const message = JSON.parse(e.newValue);
                if (message.to === this.localInfo.peerId) {
                    this.handlePeerMessage(message);
                }
            }
        });
    },

    /**
     * Conectar WebSocket a servidor
     */
    connectWebSocket(serverIp, port) {
        try {
            // En entorno local, usamos localStorage como canal de comunicación
            const clientData = {
                peerId: this.localInfo.peerId,
                role: 'client',
                ip: this.localInfo.ip,
                timestamp: Date.now()
            };

            localStorage.setItem('peerClient_' + this.localInfo.peerId, JSON.stringify(clientData));
            this.isConnected = true;

            // Solicitar datos del servidor
            this.sendMessage({
                type: 'SYNC_REQUEST',
                from: this.localInfo.peerId,
                to: this.localInfo.serverId
            });

            // Escuchar respuestas
            window.addEventListener('storage', (e) => {
                if (e.key === 'peerMessage_' + this.localInfo.peerId) {
                    const message = JSON.parse(e.newValue);
                    this.handlePeerMessage(message);
                }
            });

        } catch (error) {
            console.error('Error connecting to server:', error);
            this.isConnected = false;
        }
    },

    /**
     * Enviar mensaje a peer
     */
    sendMessage(message) {
        const envelope = {
            ...message,
            timestamp: Date.now(),
            from: this.localInfo.peerId
        };

        if (message.to) {
            // Mensaje a peer específico
            localStorage.setItem('peerMessage_' + message.to, JSON.stringify(envelope));
        } else {
            // Broadcast a todos
            localStorage.setItem('peerBroadcast_' + Date.now(), JSON.stringify(envelope));
        }

        // Trigger storage event en otras pestañas
        window.dispatchEvent(new CustomEvent('peerMessageSent', { detail: envelope }));
    },

    /**
     * Manejar mensajes de peers
     */
    handlePeerMessage(message) {
        switch(message.type) {
            case 'SYNC_REQUEST':
                this.handleSyncRequest(message);
                break;
            case 'SYNC_RESPONSE':
                this.handleSyncResponse(message);
                break;
            case 'DATA_UPDATE':
                this.handleDataUpdate(message);
                break;
            case 'DELETE_SALE':
                this.handleDeleteSale(message);
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    },

    /**
     * Manejar solicitud de sincronización
     */
    handleSyncRequest(message) {
        if (!this.isServer) return;

        // Servidor envía todos sus datos
        const syncData = {
            type: 'SYNC_RESPONSE',
            to: message.from,
            data: {
                ingredients: Data.ingredients,
                products: Data.products,
                salesHistory: Data.salesHistory,
                stock: Data.stock
            }
        };

        this.sendMessage(syncData);
    },

    /**
     * Manejar respuesta de sincronización
     */
    handleSyncResponse(message) {
        if (this.isServer || !message.data) return;

        // Cliente recibe datos del servidor
        Sync.mergeServerData(message.data);
    },

    /**
     * Manejar actualización de datos
     */
    handleDataUpdate(message) {
        if (!message.data) return;

        // Fusionar cambios
        Sync.applyRemoteChanges(message.data);
    },

    /**
     * Manejar eliminación de venta
     */
    handleDeleteSale(message) {
        if (!this.isServer || !message.saleId) return;

        // Servidor elimina venta confirmada
        Data.deleteSale(message.saleId);
        UI.renderAll();
    },

    /**
     * Broadcast de cambios a clientes
     */
    broadcastDataUpdate(type, data) {
        if (!this.isServer) return;

        const message = {
            type: 'DATA_UPDATE',
            dataType: type,
            data: data,
            timestamp: Date.now()
        };

        this.sendMessage(message);
    },

    /**
     * Desconectar
     */
    disconnect() {
        this.isConnected = false;
        if (this.isServer) {
            localStorage.removeItem('wsServer');
            this.stopPresenceBroadcast();
        } else {
            localStorage.removeItem('peerClient_' + this.localInfo.peerId);
        }
    },

    /**
     * Broadcast presencia del servidor
     */
    broadcastPresence() {
        if (this.isServer && this.localInfo) {
            const presenceData = {
                type: 'server_presence',
                ip: this.localInfo.ip,
                id: this.localInfo.peerId,
                timestamp: Date.now()
            };
            
            // Guardar en localStorage para que otros puedan detectar
            localStorage.setItem('server_presence', JSON.stringify(presenceData));
            
            // Limpiar después de 30 segundos
            setTimeout(() => {
                localStorage.removeItem('server_presence');
            }, 30000);
        }
    },

    /**
     * Iniciar broadcast periódico de presencia
     */
    startPresenceBroadcast() {
        this.broadcastPresence(); // Broadcast inmediato
        
        // Broadcast cada 10 segundos
        this.presenceInterval = setInterval(() => {
            this.broadcastPresence();
        }, 10000);
    },

    /**
     * Detener broadcast de presencia
     */
    stopPresenceBroadcast() {
        if (this.presenceInterval) {
            clearInterval(this.presenceInterval);
            this.presenceInterval = null;
        }
        localStorage.removeItem('server_presence');
    },

    /**
     * Detectar servidores presentes
     */
    detectServers() {
        const presence = localStorage.getItem('server_presence');
        if (presence) {
            try {
                const data = JSON.parse(presence);
                // Verificar que no haya expirado (30 segundos)
                if (Date.now() - data.timestamp < 30000) {
                    return [data];
                } else {
                    localStorage.removeItem('server_presence');
                }
            } catch (e) {
                localStorage.removeItem('server_presence');
            }
        }
        return [];
    },

    /**
     * Obtener estado de conexión
     */
    getStatus() {
        return {
            isServer: this.isServer,
            isConnected: this.isConnected,
            localInfo: this.localInfo
        };
    }
};
