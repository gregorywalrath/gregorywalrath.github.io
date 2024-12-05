// IndexedDB setup
let db;
const dbRequest = window.indexedDB.open('BasketballStats', 1);
dbRequest.addEventListener('error', () => console.error('Error opening DB'));
dbRequest.addEventListener('success', () => {
    console.log('Successfully opened DB');
    db = dbRequest.result;
});
dbRequest.addEventListener('upgradeneeded', init => {
    db = init.target.result;
    db.onerror = () => {
        console.error('Error loading database.');
    };
    const playersStore = db.createObjectStore('players', { keyPath: 'id', autoIncrement: true });
    const statsStore = db.createObjectStore('stats', { keyPath: 'id', autoIncrement: true });
})

document.getElementById('add-player').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('player-name').value;
    const team = document.getElementById('player-team').value;

    const transaction = db.transaction('players', 'readwrite');
    transaction.objectStore('players').add({ name, team });
    transaction.oncomplete = () => alert('Player added successfully!');
};

// Game stats
let fgattempt = 0;
let fgmade = 0;
let twoattempt = 0;
let twomade = 0;
let threeattempt = 0;
let threemade = 0;
let totalPoints = 0;
let block = 0;
let steal = 0;
let foul = 0;
let rebound = 0;

document.getElementById('fg-attempt').addEventListener('click', (e) => {
    e.preventDefault();
    fgattempt += 1;
    document.getElementById('fgAttempts').innerHTML = fgattempt;
});
document.getElementById('fg-made').addEventListener('click', (e) => {
    e.preventDefault();
    fgmade += 1;
    fgattempt += 1;
    totalPoints += 1;
    document.getElementById('fgMade').innerHTML = fgmade;
    document.getElementById('fgAttempts').innerHTML = fgattempt;
    document.getElementById('totalPoints').innerHTML = totalPoints;
});
document.getElementById('2pt-attempt').addEventListener('click', (e) => {
    e.preventDefault();
    twoattempt += 1;
    document.getElementById('2ptAttempts').innerHTML = twoattempt;
});
document.getElementById('2pt-made').addEventListener('click', (e) => {
    e.preventDefault();
    twomade += 1;
    twoattempt += 1;
    totalPoints += 2;
    document.getElementById('2ptMade').innerHTML = twomade;
    document.getElementById('2ptAttempts').innerHTML = twoattempt;
    document.getElementById('totalPoints').innerHTML = totalPoints;
});
document.getElementById('3pt-attempt').addEventListener('click', (e) => {
    e.preventDefault();
    threeattempt += 1;
    document.getElementById('3ptAttempts').innerHTML = threeattempt;
});
document.getElementById('3pt-made').addEventListener('click', (e) => {
    e.preventDefault();
    threemade += 1;
    threeattempt += 1;
    totalPoints += 3;
    document.getElementById('3ptMade').innerHTML = threemade;
    document.getElementById('3ptAttempts').innerHTML = threeattempt;
    document.getElementById('totalPoints').innerHTML = totalPoints;
});
document.getElementById('block').addEventListener('click', (e) => {
    e.preventDefault();
    block += 1;
    document.getElementById('blocks').innerHTML = block;
});
document.getElementById('steal').addEventListener('click', (e) => {
    e.preventDefault();
    steal += 1;
    document.getElementById('steals').innerHTML = steal;
});
document.getElementById('foul').addEventListener('click', (e) => {
    e.preventDefault();
    foul += 1;
    document.getElementById('fouls').innerHTML = foul;
});
document.getElementById('rebound').addEventListener('click', (e) => {
    e.preventDefault();
    rebound += 1;
    document.getElementById('rebounds').innerHTML = rebound;
});

document.getElementById('stats-form').onsubmit = (e) => {
    e.preventDefault();
    const player = document.getElementById('player-select').value;
    const gameDate = document.getElementById('game-date').value;
    const oppenent = document.getElementById('oppenent').value;
    // const points = parseInt(document.getElementById('points').value) || 0;
    // const rebounds = parseInt(document.getElementById('rebounds').value) || 0;

    const transaction = db.transaction('stats', 'readwrite');
    transaction.objectStore('stats').add({
        player,
        gameDate,
        oppenent,
        fgattempt,
        fgmade,
        twoattempt,
        twomade,
        threeattempt,
        threemade,
        totalPoints,
        block,
        steal,
        foul,
        rebound
    });
    transaction.oncomplete = () => alert('Stats logged!');
};

function refreshPlayerList(db) {
    const transaction = db.transaction('players', 'readonly');
    const store = transaction.objectStore('players');
    const request = store.getAll();

    request.onsuccess = () => {
        const playerList = document.getElementById('player-list');
        const playerSelect = document.getElementById('player-select');
        playerList.innerHTML = '';
        request.result.forEach((player) => {
            const option = document.createElement('option');
            option.textContent = `${player.name}`;
            option.value = `${player.name}`;
            playerSelect.appendChild(option);

            const li = document.createElement('li');
            li.textContent = `${player.name} (${player.team})`;

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.onclick = () => editPlayer(db, player.id);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deletePlayer(db, player.id);

            li.appendChild(editButton);
            li.appendChild(deleteButton);
            playerList.appendChild(li);
        });
    };
}

function editPlayer(db, id) {
    const name = prompt('Enter new name:');
    const team = prompt('Enter new team:');

    const transaction = db.transaction('players', 'readwrite');
    const store = transaction.objectStore('players');
    store.get(id).onsuccess = (event) => {
        const player = event.target.result;
        player.name = name || player.name;
        player.team = team || player.team;
        store.put(player);
        refreshPlayerList(db);
    };
}

function deletePlayer(db, id) {
    const transaction = db.transaction('players', 'readwrite');
    transaction.objectStore('players').delete(id).onsuccess = () => {
        alert('Player deleted!');
        refreshPlayerList(db);
    };
}

// Call refreshPlayerList() after adding or editing a player
dbRequest.onsuccess = () => {
    const db = dbRequest.result;
    refreshPlayerList(db);
};

function generateChart(db, playerId) {
    const transaction = db.transaction('stats', 'readonly');
    const store = transaction.objectStore('stats');
    const request = store.getAll();

    request.onsuccess = () => {
        const stats = request.result.filter(stat => stat.player === playerId);
        const labels = stats.map(stat => new Date(stat.date).toLocaleDateString());
        const data = stats.map(stat => stat.points);

        const ctx = document.getElementById('performance-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Points',
                    data,
                    borderColor: '#6200ea',
                    fill: false,
                }],
            },
        });
    };
}

