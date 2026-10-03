// Configuración global del juego
const CONFIG = {
    // Mundos del juego
    WORLDS: {
        OVERWORLD: 'overworld',
        MINES: 'mines',
        NETHER: 'nether',
        END: 'end'
    },
    
    // Orden de progresión
    WORLD_ORDER: ['overworld', 'mines', 'nether', 'end'],
    
    // Tickets por mundo
    TICKETS_PER_WORLD: 10,
    BLOCKS_PER_WORLD: 5,
    TOTAL_TICKETS: 40,
    
    // Configuración 3D
    THREE: {
        FOV: 75,
        NEAR: 0.1,
        FAR: 1000,
        PLAYER_HEIGHT: 1.7,
        MOVE_SPEED: 0.15,
        JUMP_FORCE: 0.3,
        GRAVITY: 0.015
    },
    
    // Colores y atmósfera de mundos
    WORLD_COLORS: {
        overworld: { 
            sky: 0x87CEEB, 
            fog: 0x87CEEB, 
            ground: 0x4CAF50,
            lightSky: 0xffffff,
            lightGround: 0x4CAF50,
            lightDir: 0xffffee,
            bloom: { intensity: 0.8, radius: 0.5, threshold: 0.85 }
        },
        mines: { 
            sky: 0x1a1a1a, 
            fog: 0x2a2a2a, 
            ground: 0x424242,
            lightSky: 0x555566,
            lightGround: 0x222222,
            lightDir: 0x9999aa,
            bloom: { intensity: 1.2, radius: 0.4, threshold: 0.7 }
        },
        nether: { 
            sky: 0x8B0000, 
            fog: 0xB71C1C, 
            ground: 0x8B0000,
            lightSky: 0xffaa55,
            lightGround: 0x8B0000,
            lightDir: 0xff4422,
            bloom: { intensity: 1.5, radius: 0.8, threshold: 0.6 }
        },
        end: { 
            sky: 0x0a0a2e, 
            fog: 0x1a1a4e, 
            ground: 0x2a2a5e,
            lightSky: 0xaa88ff,
            lightGround: 0x111133,
            lightDir: 0xdcaaff,
            bloom: { intensity: 2.0, radius: 1.0, threshold: 0.5 }
        }
    },
    
    // Modos de juego
    GAME_MODES: {
        ADVENTURE: 'adventure',
        TIMED: 'timed',
        DUEL: 'duel'
    },

    // Configuracion de dificultad
    DIFFICULTY: { EASY: "easy", NORMAL: "normal", HARD: "hard" },

    // Rangos por dificultad
    DIFFICULTY_RANGES: {
        easy: { min: 1, max: 5, operators: [2,3,4] },
        normal: { min: 2, max: 10, operators: [2,3,4,5,6,7,8] },
        hard: { min: 3, max: 15, operators: [2,3,4,5,6,7,8,9,10] }
    },

    // Modo contrarreloj
    TIMED_MODE: { TIME_PER_QUESTION: 30, BONUS_TIME: 5, MAX_BONUS: 20 }
};

// Constantes de preguntas
const QUESTION_THEMES = {
    LINEAR: 'Función Lineal',
    QUADRATIC: 'Función Cuadrática',
    PROBABILITY: 'Probabilidad',
    MIXED: 'Repaso Mixto'
};