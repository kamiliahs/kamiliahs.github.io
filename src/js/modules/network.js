/**
 * Network Module - Handles WebRTC connections, discovery and data transfer
 */
const Network = {
    peer: null,
    connections: {},
    localId: null,
    myPublicIp: null,
    isCoordinator: false,
    nearbyPeers: [],
    onPeerUpdate: null,
    onDataReceived: null,
    onConnectionStateChange: null,

    /**
     * Inicializar el sistema de red
     */
    async init() {
        if (this.peer) {
            try { this.peer.destroy(); } catch(e) {}
            this.peer = null;
        }
        try {
            // Recuperar o generar ID local estable
            this.localId = localStorage.getItem('kamilia_peer_id');
            if (!this.localId) {
                this.localId = 'kamilia-' + Math.random().toString(36).substr(2, 6);
                localStorage.setItem('kamilia_peer_id', this.localId);
            }

            // Obtener IP pública para agrupar dispositivos en la misma red
            let ipHash = 'offline-lan';
            try {
                const response = await Promise.race([
                    fetch('https://api.ipify.org?format=json'),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
                ]);
                const data = await response.json();
                this.myPublicIp = data.ip;
                ipHash = await this._hashString(this.myPublicIp);
            } catch (e) {
                console.warn('No se pudo obtener IP pública, usando modo local limitado:', e);
                this.myPublicIp = 'Desconocida (Offline)';
            }

            const ns = Data.settings.networkServer || { host: '0.peerjs.com', port: 443, path: '/', secure: true };
            
            this.peer = new Peer(this.localId, {
                host: ns.host || '0.peerjs.com',
                port: ns.port || 443,
                path: ns.path || '/',
                secure: ns.secure !== false,
                debug: 1,
                config: {
                    'iceServers': [
                        { url: 'stun:stun.l.google.com:19302' },
                        { url: 'stun:stun1.l.google.com:19302' }
                    ]
                }
            });

            this.peer.on('open', (id) => {
                console.log('Mi ID de Peer:', id);
                this._setupDiscovery(ipHash);

                // Intentar reconectar con pares persistentes
                this._attemptPersistentReconnection();

                if (window.APP && window.APP.updateNetworkUI) window.APP.updateNetworkUI();
            });

            this.peer.on('connection', (conn) => {
                this._handleNewConnection(conn);
            });

            this.peer.on('error', (err) => {
                console.error('PeerJS Error:', err);
                if (err.type === 'unavailable-id') {
                    // Si el ID está ocupado (ej: refresco rápido), reintentar con sufijo temporal
                    this.localId += '-' + Math.floor(Math.random() * 100);
                    this.init();
                }
            });

        } catch (error) {
            console.error('Error inicializando red:', error);
        }
    },

    /**
     * Configurar el sistema de descubrimiento por IP
     */
    async _setupDiscovery(ipHash) {
        const coordId = 'kamilia-coord-' + ipHash.substr(0, 10);

        // Intentar ser el coordinador de esta red
        const coordPeer = new Peer(coordId, { debug: 1 });

        coordPeer.on('open', () => {
            console.log('Soy el coordinador de la red');
            this.isCoordinator = true;
            this.coordinatorPeer = coordPeer;

            coordPeer.on('connection', (conn) => {
                conn.on('data', (data) => {
                    if (data.type === 'HELO') {
                        this._registerPeer(data.id, data.name, conn);
                        this._broadcastPeerList();
                    }
                });

                conn.on('close', () => {
                    this._unregisterPeerByConn(conn);
                    this._broadcastPeerList();
                });
            });
        });

        coordPeer.on('error', (err) => {
            if (err.type === 'unavailable-id') {
                this._connectToCoordinator(coordId);
            }
        });
    },

    _connectToCoordinator(coordId) {
        const conn = this.peer.connect(coordId);
        conn.on('open', () => {
            conn.send({
                type: 'HELO',
                id: this.localId,
                name: 'Dispositivo ' + this.localId.split('-')[1].toUpperCase()
            });
        });

        conn.on('data', (data) => {
            if (data.type === 'PEER_LIST') {
                // FILTRAR COORDINADOR de la lista visible
                this.nearbyPeers = data.peers.filter(p => p.id !== this.localId && !p.id.startsWith('kamilia-coord-'));
                if (this.onPeerUpdate) this.onPeerUpdate(this.nearbyPeers);
            }
        });
    },

    _coordinatorPeers: [],
    _registerPeer(id, name, conn) {
        if (!this._coordinatorPeers.find(p => p.id === id)) {
            this._coordinatorPeers.push({ id, name, conn });
        }
    },

    _unregisterPeerByConn(conn) {
        this._coordinatorPeers = this._coordinatorPeers.filter(p => p.conn !== conn);
    },

    _broadcastPeerList() {
        const list = this._coordinatorPeers.map(p => ({ id: p.id, name: p.name }));

        this._coordinatorPeers.forEach(p => {
            if (p.conn.open) {
                p.conn.send({ type: 'PEER_LIST', peers: list });
            }
        });

        // Actualizar localmente también (filtrando coordinador)
        this.nearbyPeers = list.filter(p => p.id !== this.localId && !p.id.startsWith('kamilia-coord-'));
        if (this.onPeerUpdate) this.onPeerUpdate(this.nearbyPeers);
    },

    /**
     * Manejar una nueva conexión entrante o saliente
     */
    _handleNewConnection(conn) {
        this.connections[conn.peer] = conn;

        conn.on('open', () => {
            console.log('Conexión abierta con:', conn.peer);
            this._savePersistentPeer(conn.peer);

            // Enviar ACK de conexión para feedback
            conn.send({ type: 'CONNECT_ACK', id: this.localId });

            if (this.onConnectionStateChange) this.onConnectionStateChange(conn.peer, 'connected');
            if (window.APP && window.APP.updateNetworkUI) window.APP.updateNetworkUI();
        });

        conn.on('data', (data) => {
            if (data.type === 'RECIPE') {
                if (this.onDataReceived) this.onDataReceived(data.payload, conn.peer);
            }
            if (data.type === 'CONNECT_ACK') {
                if (window.Utils) Utils.showToast('CONECTADO CON ' + data.id.toUpperCase());
            }
            if (data.type === 'DISCONNECT') {
                this.disconnect(conn.peer, false);
            }
        });

        conn.on('close', () => {
            console.log('Conexión cerrada:', conn.peer);
            delete this.connections[conn.peer];
            if (this.onConnectionStateChange) this.onConnectionStateChange(conn.peer, 'disconnected');
            if (window.APP && window.APP.updateNetworkUI) window.APP.updateNetworkUI();
        });

        conn.on('error', (err) => {
            console.error('Error en conexión con ' + conn.peer, err);
        });
    },

    /**
     * Conectar a un peer específico
     */
    connectToPeer(peerId) {
        if (this.connections[peerId] && this.connections[peerId].open) return this.connections[peerId];

        const conn = this.peer.connect(peerId);
        this._handleNewConnection(conn);
        return conn;
    },

    /**
     * Desconectarse de un peer
     */
    disconnect(peerId, notify = true) {
        const conn = this.connections[peerId];
        if (conn) {
            if (notify && conn.open) {
                conn.send({ type: 'DISCONNECT' });
            }
            conn.close();
            delete this.connections[peerId];
            this._removePersistentPeer(peerId);

            if (window.APP && window.APP.updateNetworkUI) window.APP.updateNetworkUI();
            if (window.Utils && notify) Utils.showToast('DESCONECTADO');
        }
    },

    /**
     * Persistencia de conexiones
     */
    _savePersistentPeer(peerId) {
        let peers = JSON.parse(localStorage.getItem('kamilia_persistent_peers') || '[]');
        if (!peers.includes(peerId)) {
            peers.push(peerId);
            localStorage.setItem('kamilia_persistent_peers', JSON.stringify(peers));
        }
    },

    _removePersistentPeer(peerId) {
        let peers = JSON.parse(localStorage.getItem('kamilia_persistent_peers') || '[]');
        peers = peers.filter(id => id !== peerId);
        localStorage.setItem('kamilia_persistent_peers', JSON.stringify(peers));
    },

    _attemptPersistentReconnection() {
        const peers = JSON.parse(localStorage.getItem('kamilia_persistent_peers') || '[]');
        peers.forEach(peerId => {
            console.log('Intentando reconexión persistente con:', peerId);
            this.connectToPeer(peerId);
        });
    },

    /**
     * Enviar una receta a un peer
     */
    sendRecipe(peerId, recipeData) {
        const conn = this.connections[peerId];
        if (conn && conn.open) {
            conn.send({
                type: 'RECIPE',
                payload: recipeData
            });
            return true;
        }
        return false;
    },

    /**
     * Generar un PIN aleatorio
     */
    generatePin() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    },

    /**
     * Enlazar mediante PIN
     */
    async connectWithPin(pin) {
        const pinId = 'kamilia-pin-' + pin;
        const conn = this.peer.connect(pinId);
        this._handleNewConnection(conn);
        return conn;
    },

    /**
     * Activar modo escucha con PIN
     */
    async startPinListening(pin) {
        const pinId = 'kamilia-pin-' + pin;
        if (this.pinPeer) this.pinPeer.destroy();

        this.pinPeer = new Peer(pinId, { debug: 1 });
        this.pinPeer.on('connection', (conn) => {
            conn.on('open', () => {
                conn.send({ type: 'REAL_ID', id: this.localId });
                this.connectToPeer(conn.peer);
            });
        });
    },

    async _hashString(str) {
        const msgUint8 = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
};
