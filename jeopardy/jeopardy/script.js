let count = 0;
let peer = null;
let connections = [];
let players = {};
let playerName = '';
let finalJeopardyMode = false;
let myWager = null;
let wagers = {};

const counterDisplay = document.getElementById('counter');
const plusButton = document.getElementById('plus');
const minusButton = document.getElementById('minus');
const statusDisplay = document.getElementById('status');
const playersListDisplay = document.getElementById('playersList');
const nameInput = document.getElementById('nameInput');
const wagerModal = document.getElementById('wagerModal');
const modalOverlay = document.getElementById('modalOverlay');
const wagerInput = document.getElementById('wagerInput');
const maxWagerDisplay = document.getElementById('maxWager');

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function updateCounter(value) {
    count = value;
    counterDisplay.textContent = count;
    broadcastCount();
}

plusButton.addEventListener('click', () => {
    updateCounter(count + 1);
});

minusButton.addEventListener('click', () => {
    updateCounter(count - 1);
});

function broadcastCount() {
    connections.forEach(conn => {
        if (conn.open) {
            conn.send({
                count: count,
                name: playerName,
                finalJeopardy: finalJeopardyMode,
                wager: myWager
            });
        }
    });
}

function broadcastMessage(message) {
    connections.forEach(conn => {
        if (conn.open) {
            conn.send(message);
        }
    });
}

function updatePlayersList() {
    const playerIds = Object.keys(players);
    if (playerIds.length === 0) {
        playersListDisplay.innerHTML = '<div style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">No other players</div>';
    } else {
        // Check if all players have wagered
        const allWagered = finalJeopardyMode && myWager !== null &&
            playerIds.every(id => wagers[id] !== undefined);

        playersListDisplay.innerHTML = playerIds.map(id => {
            const player = players[id];
            const displayName = player.name || 'Anonymous';
            let wagerDisplay = '';

            if (allWagered && wagers[id] !== undefined) {
                wagerDisplay = `<div class="player-wager">Wager: $${wagers[id]}</div>`;
            } else if (finalJeopardyMode && wagers[id] !== undefined) {
                wagerDisplay = `<div class="player-wager">Wagered ✓</div>`;
            }

            return `
                <div class="player-item">
                    <div class="player-name">${displayName}</div>
                    <div class="player-score">${player.count}</div>
                    ${wagerDisplay}
                </div>
            `;
        }).join('');
    }
}

function startFinalJeopardy() {
    if (connections.length === 0) {
        alert('No other players connected. Connect to other players first!');
        return;
    }

    finalJeopardyMode = true;
    broadcastMessage({
        type: 'finalJeopardyStart',
        name: playerName
    });
    showWagerModal();
}

function showWagerModal() {
    maxWagerDisplay.textContent = Math.max(0, count);
    wagerInput.value = '';
    wagerInput.max = Math.max(0, count);
    wagerModal.classList.add('show');
    modalOverlay.classList.add('show');
    wagerInput.focus();
}

function hideWagerModal() {
    wagerModal.classList.remove('show');
    modalOverlay.classList.remove('show');
}

function submitWager() {
    const wager = parseInt(wagerInput.value);

    if (isNaN(wager) || wager < 0) {
        alert('Please enter a valid wager amount');
        return;
    }

    if (wager > count) {
        alert(`Wager cannot exceed your current score of ${count}`);
        return;
    }

    myWager = wager;
    hideWagerModal();

    // Broadcast wager to all players
    broadcastMessage({
        type: 'wager',
        name: playerName,
        wager: wager,
        count: count
    });

    updatePlayersList();
}

function toggleConnectionPanel() {
    const panel = document.getElementById('connectionPanel');
    panel.classList.toggle('collapsed');
}

function createRoom() {
    playerName = nameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name');
        nameInput.focus();
        return;
    }

    const roomCode = generateRoomCode();
    statusDisplay.textContent = 'Creating room...';

    peer = new Peer(roomCode);

    peer.on('open', (id) => {
        statusDisplay.innerHTML = `<strong>Room Code:</strong> <span style="font-size: 24px; letter-spacing: 2px;">${id}</span><br><small>Share this code with other players</small>`;
    });

    peer.on('connection', (conn) => {
        setupConnection(conn);
    });

    peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
            statusDisplay.textContent = 'Code taken, generating new one...';
            peer.destroy();
            setTimeout(createRoom, 100);
        } else {
            statusDisplay.textContent = `Error: ${err.message}`;
        }
    });
}

function joinRoom() {
    playerName = nameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name');
        nameInput.focus();
        return;
    }

    const roomId = document.getElementById('roomInput').value.trim().toUpperCase();
    if (!roomId) {
        alert('Please enter a Room Code');
        return;
    }

    if (roomId.length !== 6) {
        alert('Room code must be 6 characters');
        return;
    }

    statusDisplay.textContent = 'Connecting...';

    if (!peer) {
        peer = new Peer();
        peer.on('open', () => {
            connectToPeer(roomId);
        });
        peer.on('error', (err) => {
            statusDisplay.textContent = `Error: ${err.message}`;
        });
    } else {
        connectToPeer(roomId);
    }

    peer.on('connection', (conn) => {
        setupConnection(conn);
    });
}

function connectToPeer(peerId) {
    const conn = peer.connect(peerId);
    setupConnection(conn);
}

function setupConnection(conn) {
    conn.on('open', () => {
        connections.push(conn);
        statusDisplay.textContent = `Connected to ${connections.length} player(s)`;

        // Send current count and name immediately
        conn.send({ count: count, name: playerName });
    });

    conn.on('data', (data) => {
        // Handle Final Jeopardy start
        if (data.type === 'finalJeopardyStart') {
            if (!finalJeopardyMode) {
                finalJeopardyMode = true;
                showWagerModal();
            }
            return;
        }

        // Handle wager submission
        if (data.type === 'wager') {
            wagers[conn.peer] = data.wager;
            updatePlayersList();
            return;
        }

        // Handle regular counter updates
        if (data.count !== undefined) {
            players[conn.peer] = {
                name: data.name || 'Anonymous',
                count: data.count
            };

            // Sync Final Jeopardy mode
            if (data.finalJeopardy && !finalJeopardyMode) {
                finalJeopardyMode = true;
                if (myWager === null) {
                    showWagerModal();
                }
            }

            // Sync wager if present
            if (data.wager !== null && data.wager !== undefined) {
                wagers[conn.peer] = data.wager;
            }

            updatePlayersList();
        }
    });

    conn.on('close', () => {
        connections = connections.filter(c => c !== conn);
        delete players[conn.peer];
        delete wagers[conn.peer];
        updatePlayersList();
        statusDisplay.textContent = connections.length > 0
            ? `Connected to ${connections.length} player(s)`
            : 'Not connected';
    });
}

updatePlayersList();
