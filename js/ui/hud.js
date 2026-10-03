// HUD - Interfaz durante el juego
const HUD = {
    init() {
        // Botón de sonido
        document.getElementById('sound-toggle').addEventListener('click', () => {
            const enabled = AudioSystem.toggle();
            document.getElementById('sound-toggle').textContent = enabled ? '🔊' : '🔇';
        });
        
        // Botón de pausa
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.showPauseMenu();
        });
    },
    
    updatePlayerName(name) {
        const nameEl = document.getElementById('player-name-display');
        if (nameEl) nameEl.textContent = name;
    },
    
    updateGrade(grade) {
        const gradeEl = document.getElementById('grade-display');
        if (gradeEl) gradeEl.textContent = `${grade}°`;
    },
    
    updateWorldName(worldName) {
        const names = {
            overworld: '🌳 Overworld',
            mines: '⛏️ Mines',
            nether: '🔥 Nether',
            end: '🐉 The End'
        };
        document.getElementById('world-name').textContent = names[worldName] || worldName;
    },
    
    updateLevel(level) {
        document.getElementById('level-indicator').textContent = `NIVEL ${level}`;
    },
    
    updateTickets(tickets) {
        document.getElementById('ticket-count').textContent = tickets;
    },
    
    updateHearts(hearts) {
        const heartsStr = '❤️'.repeat(hearts) + '🖤'.repeat(5 - hearts);
        document.getElementById('hearts').textContent = heartsStr;
    },
    
    updateDragonHP(hp, maxHP) {
        const dragonHPBar = document.getElementById('dragon-hp');
        if (dragonHPBar) {
            dragonHPBar.textContent = `${hp} / ${maxHP} HP`;
            
            // Cambiar color según HP
            const percent = (hp / maxHP) * 100;
            if (percent > 60) {
                dragonHPBar.style.color = '#4CAF50';
            } else if (percent > 30) {
                dragonHPBar.style.color = '#FFC107';
            } else {
                dragonHPBar.style.color = '#F44336';
            }
        }
    },
    
    showNotification(message, duration = 2000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            border: 2px solid #4CAF50;
            z-index: 1000;
            font-size: 1.2em;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },
    
    showPauseMenu() {
        const pauseModal = document.createElement('div');
        pauseModal.className = 'modal';
        pauseModal.innerHTML = `
            <div class="modal-content">
                <h2>⏸️ Pausa</h2>
                <div style="display:flex;flex-direction:column;gap:15px;margin-top:20px;">
                    <button class="primary-btn" onclick="this.closest('.modal').remove()">▶️ Continuar</button>
                    <button class="secondary-btn" onclick="MenuManager.returnToMenu();this.closest('.modal').remove()">🏠 Menú Principal</button>
                </div>
            </div>
        `;
        document.body.appendChild(pauseModal);
    }
};

window.HUD = HUD;