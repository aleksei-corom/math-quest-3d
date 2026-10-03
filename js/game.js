// Estado global del juego
const GameState = {
    playerName: 'Steve',
    grade: 9,
    mode: 'adventure',
    difficulty: 'normal',
    isPlaying: false,
    
    init() {
        // Cargar progreso si existe
        const saved = Storage.loadProgress();
        if (saved) {
            this.playerName = saved.playerName || 'Steve';
            this.grade = saved.grade || 9;
            this.mode = saved.mode || 'adventure';
        }
    },
    
    // Iniciar nuevo juego
    startNewGame(playerName, grade, mode) {
        this.playerName = playerName || 'Steve';
        this.grade = parseInt(grade) || 9;
        this.mode = mode || 'adventure';
        this.difficulty = (window.MenuManager && MenuManager.currentDifficulty) || 'normal';
        this.isPlaying = true;
        
        // Inicializar sistemas
        TicketSystem.init();
        QuestionManager.resetUsedQuestions();
        
        // Guardar
        Storage.saveProgress({
            playerName: this.playerName,
            grade: this.grade,
            mode: this.mode
        });
    },
    
    // Reiniciar
    restart() {
        this.isPlaying = false;
        TicketSystem.init();
        if (window.Player) Player.clearCollisionObjects();
    }
};

window.GameState = GameState;