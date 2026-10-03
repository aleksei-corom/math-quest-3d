// Gestor de menús
const MenuManager = {
    currentMode: 'adventure',
    currentDifficulty: 'normal',
    currentGrade: 9,
    currentWorld: 'overworld',
    
    init() {
        this.setupEventListeners();
        this.checkSavedProgress();
    },
    
    setupEventListeners() {
        // Botón iniciar
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Selector de modo
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('.mode-btn');
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                this.currentMode = target.dataset.mode;
                if(window.AudioSystem) AudioSystem.play('click');
            });
        });
        
        // Selector de mundo
        document.querySelectorAll('.world-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('.world-card');
                document.querySelectorAll('.world-card').forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                this.currentWorld = target.dataset.world;
                if(window.AudioSystem) AudioSystem.play('click');
            });
        });
        
        // Selector de grado
        document.querySelectorAll('.grade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('.grade-btn');
                document.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                this.currentGrade = parseInt(target.dataset.grade);
                if(window.AudioSystem) AudioSystem.play('click');
            });
        });
        
        // Selector de dificultad
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('.diff-btn');
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                this.currentDifficulty = target.dataset.difficulty;
                if(window.AudioSystem) AudioSystem.play('click');
            });
        });

        // Botones secundarios
        document.getElementById('how-to-play-btn').addEventListener('click', () => {
            Modal.showHowToPlay();
        });
        
        document.getElementById('hall-of-fame-btn').addEventListener('click', () => {
            HallOfFame.renderTable();
            document.getElementById('hall-of-fame-modal').classList.remove('hidden');
        });
        
        // Cerrar modales
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.add('hidden');
            });
        });
    },
    
    checkSavedProgress() {
        const saved = Storage.loadProgress();
        if (saved && saved.playerName) {
            document.getElementById('player-name').value = saved.playerName;
            this.currentGrade = saved.grade || 9;
            // Actualizar botones de grado
            document.querySelectorAll('.grade-btn').forEach(btn => {
                btn.classList.remove('active');
                if (parseInt(btn.dataset.grade) === this.currentGrade) {
                    btn.classList.add('active');
                }
            });
        }
    },
    
    startGame() {
        const playerName = document.getElementById('player-name').value.trim() || 'Steve';
        const grade = this.currentGrade;
        
        // Iniciar estado del juego
        GameState.startNewGame(playerName, grade, this.currentMode);
        
        // Ocultar menú
        document.getElementById('main-menu').classList.remove('active');
        document.getElementById('main-menu').classList.add('hidden');
        
        // Mostrar HUD
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('controls-help').classList.remove('hidden');
        
        // Actualizar HUD
        HUD.updatePlayerName(playerName);
        HUD.updateGrade(grade);
        
        // Cargar el mundo seleccionado
        WorldManager.loadWorld(this.currentWorld);
        
        AudioSystem.play('levelUp');
        AudioSystem.playBGM();
        
        console.log(`🎮 Juego iniciado: ${playerName} - Grado ${grade} - Modo ${this.currentMode}`);
        
        // Solicitar bloqueo de ratón inmediatamente después de iniciar
        if (window.Player) {
            Player.lockPointer();
        }
    },
    
    returnToMenu() {
        // Limpiar escena
        GameScene.clear();
        
        // Limpiar colisiones
        if (window.Player) Player.clearCollisionObjects();
        
        // Ocultar minimap
        if (window.Minimap) Minimap.hide();
        
        // Ocultar HUD
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('controls-help').classList.add('hidden');
        
        // Mostrar menú
        document.getElementById('main-menu').classList.remove('hidden');
        document.getElementById('main-menu').classList.add('active');
        
        // Reiniciar estado
        GameState.restart();
        
        // Detener música de fondo
        if (window.AudioSystem) {
            AudioSystem.stopBGM();
        }
    }
};

window.MenuManager = MenuManager;