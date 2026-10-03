// Salón de la Fama
const HallOfFame = {
    // Añadir entrada
    addEntry(playerName, grade, mode, tickets) {
        return Storage.addHallOfFameEntry({
            playerName,
            grade,
            mode,
            tickets,
            date: new Date().toISOString()
        });
    },
    
    // Obtener entradas
    getEntries() {
        return Storage.loadHallOfFame();
    },
    
    // Renderizar tabla
    renderTable() {
        const tbody = document.getElementById('hall-of-fame-body');
        if (!tbody) return;
        
        const entries = this.getEntries();
        
        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">No hay registros aún</td></tr>';
            return;
        }
        
        tbody.innerHTML = entries.map((entry, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${entry.playerName}</td>
                <td>${entry.grade}°</td>
                <td>${this.getModeEmoji(entry.mode)}</td>
                <td>💎 ${entry.tickets}</td>
            </tr>
        `).join('');
    },
    
    getModeEmoji(mode) {
        const emojis = {
            adventure: '🛡️',
            timed: '⏱️',
            duel: '⚔️'
        };
        return emojis[mode] || '🎮';
    }
};

window.HallOfFame = HallOfFame;