// Sistema de tickets con streak y bonificaciones
const TicketSystem = {
    tickets: 0,
    blocksMined: {},
    streak: 0,
    maxStreak: 0,
    
    init() {
        this.tickets = 0;
        this.blocksMined = {};
        this.streak = 0;
        this.maxStreak = 0;
        CONFIG.WORLD_ORDER.forEach(world => {
            this.blocksMined[world] = 0;
        });
    },
    
    // Añadir tickets
    addTickets(amount) {
        this.tickets += amount;
        this.updateUI();
        AudioSystem.play('pickup');
        return this.tickets;
    },
    
    // Respuesta correcta - con streak bonus
    onCorrectAnswer() {
        this.streak++;
        if (this.streak > this.maxStreak) this.maxStreak = this.streak;
        
        let bonus = 0;
        // +1 extra ticket cada 3 aciertos consecutivos
        if (this.streak >= 3 && this.streak % 3 === 0) {
            bonus = 1;
        }
        
        const baseTickets = 2;
        this.addTickets(baseTickets + bonus);
        
        // Notificar streak
        if (this.streak >= 3) {
            HUD.showNotification('🔥 Racha de ' + this.streak + '! +1 bonus');
        }
        
        return { streak: this.streak, bonus: bonus };
    },
    
    // Respuesta incorrecta - reiniciar streak
    onWrongAnswer() {
        this.streak = 0;
    },
    
    // Marcar bloque como minado
    mineBlock(worldName, blockIndex) {
        const key = worldName + '_' + blockIndex;
        if (!this.blocksMined[key]) {
            this.blocksMined[key] = true;
            this.blocksMined[worldName]++;
            return true;
        }
        return false;
    },
    
    // Verificar si el mundo está completo
    isWorldComplete(worldName) {
        return this.blocksMined[worldName] >= CONFIG.BLOCKS_PER_WORLD;
    },
    
    // Verificar si el juego está completo
    isGameComplete() {
        return this.tickets >= CONFIG.TOTAL_TICKETS;
    },
    
    // Actualizar UI
    updateUI() {
        const ticketEl = document.getElementById('ticket-count');
        if (ticketEl) {
            ticketEl.textContent = this.tickets;
        }
        // Actualizar barra de progreso si existe
        const progressEl = document.getElementById('world-progress');
        if (progressEl && WorldManager.currentWorld) {
            const mined = this.blocksMined[WorldManager.currentWorld] || 0;
            progressEl.style.width = ((mined / CONFIG.BLOCKS_PER_WORLD) * 100) + '%';
        }
    },
    
    // Obtener estadísticas
    getStats() {
        return {
            tickets: this.tickets,
            blocksMined: { ...this.blocksMined },
            streak: this.streak,
            maxStreak: this.maxStreak
        };
    }
};

window.TicketSystem = TicketSystem;
