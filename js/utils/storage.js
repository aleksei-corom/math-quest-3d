// Sistema de almacenamiento persistente
const Storage = {
    KEYS: {
        PROGRESS: 'mathquest_progress',
        HALL_OF_FAME: 'mathquest_hall_of_fame',
        SETTINGS: 'mathquest_settings'
    },
    
    // Guardar progreso del juego
    saveProgress(gameState) {
        try {
            localStorage.setItem(this.KEYS.PROGRESS, JSON.stringify(gameState));
            return true;
        } catch (e) {
            console.error('Error guardando progreso:', e);
            return false;
        }
    },
    
    // Cargar progreso
    loadProgress() {
        try {
            const data = localStorage.getItem(this.KEYS.PROGRESS);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error cargando progreso:', e);
            return null;
        }
    },
    
    // Limpiar progreso
    clearProgress() {
        localStorage.removeItem(this.KEYS.PROGRESS);
    },
    
    // Salón de la Fama
    saveHallOfFame(entries) {
        try {
            localStorage.setItem(this.KEYS.HALL_OF_FAME, JSON.stringify(entries));
            return true;
        } catch (e) {
            return false;
        }
    },
    
    loadHallOfFame() {
        try {
            const data = localStorage.getItem(this.KEYS.HALL_OF_FAME);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },
    
    addHallOfFameEntry(entry) {
        const entries = this.loadHallOfFame();
        entries.push({
            ...entry,
            date: new Date().toISOString()
        });
        // Ordenar por tickets descendente
        entries.sort((a, b) => b.tickets - a.tickets);
        // Mantener solo top 20
        const top20 = entries.slice(0, 20);
        this.saveHallOfFame(top20);
        return top20;
    }
};

// Exportar para uso global
window.Storage = Storage;