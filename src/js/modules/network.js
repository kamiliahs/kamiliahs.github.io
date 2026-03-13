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

    /**
     * Inicializar el sistema de red
     */
    async init() {
        try {
            // Obtener IP pública para agrupar dispositivos en la misma red
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            this.myPublicIp = data.ip;
            const ipHash = await this._hashString(this.myPublicIp);

            this.localId = 'kamilia-' + Math.random().toString(36).substr(2, 6);
            this.peer = new Peer(this.localId, {
                debug: 1
            });

            this.peer.on('open', (id) => {
                console.log('Mi ID de Peer:', id);
                this._setupDiscovery(ipHash);
                if (window.APP && window.APP.updateNetworkUI) window.APP.updateNetworkUI();
            });

            this.peer.on('connection', (conn) => {
                this._handleNewConnection(conn);
            });

            this.peer.on('error', (err) => {
                console.error('PeerJS Error:', err);
                if (err.type === 'unavailable-id') {
                    // Si el ID de coordinador ya está tomado, reintentamos como nodo
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
                        // Un nuevo nodo se ha unido
                        this._registerPeer(data.id, data.name, conn);
                        this._broadcastPeerList();
                    }
                });
            });
        });

        coordPeer.on('error', (err) => {
            if (err.type === 'unavailable-id') {
                console.log('Ya existe un coordinador, conectando como nodo...');
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
                this.nearbyPeers = data.peers.filter(p => p.id !== this.localId);
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

    _broadcastPeerList() {
        const list = this._coordinatorPeers.map(p => ({ id: p.id, name: p.name }));
        // Incluir al coordinador en la lista
        list.push({ id: this.coordinatorPeer.id, name: 'Coordinador Principal' });

        this._coordinatorPeers.forEach(p => {
            if (p.conn.open) {
                p.conn.send({ type: 'PEER_LIST', peers: list });
            }
        });

        // Actualizar localmente también
        this.nearbyPeers = list.filter(p => p.id !== this.localId);
        if (this.onPeerUpdate) this.onPeerUpdate(this.nearbyPeers);
    },

    /**
     * Manejar una nueva conexión entrante
     */
    _handleNewConnection(conn) {
        this.connections[conn.peer] = conn;

        conn.on('data', (data) => {
            if (data.type === 'RECIPE') {
                if (this.onDataReceived) this.onDataReceived(data.payload, conn.peer);
            }
            if (data.type === 'PIN_REQUEST') {
                // Manejar solicitud de enlace por PIN
            }
        });

        conn.on('close', () => {
            delete this.connections[conn.peer];
            if (window.APP && window.APP.updateNetworkUI) window.APP.updateNetworkUI();
        });
    },

    /**
     * Conectar a un peer específico
     */
    connectToPeer(peerId) {
        if (this.connections[peerId]) return this.connections[peerId];

        const conn = this.peer.connect(peerId);
        this._handleNewConnection(conn);
        return conn;
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
     * Enlazar mediante PIN (Simulado mediante nombres de sala)
     */
    async connectWithPin(pin) {
        const pinId = 'kamilia-pin-' + pin;
        // En un sistema real, usaríamos una señalización para intercambiar IDs reales.
        // Aquí intentaremos conectar directamente a ese ID si alguien lo está escuchando.
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
            // Cuando alguien conecta al PIN, le pasamos nuestro ID REA L
            conn.on('open', () => {
                conn.send({ type: 'REAL_ID', id: this.localId });
                // Y nos conectamos nosotros a él para la sesión real
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
