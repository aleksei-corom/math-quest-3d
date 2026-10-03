// Gestor de preguntas con generadores aleatorios
const QuestionManager = {
    currentQuestion: null,
    currentBlock: null,
    currentWorld: null,
    
    // Obtener pregunta para un bloque específico
    getQuestion(worldName, blockIndex, grade) {
        const world = QuestionBank[worldName];
        if (!world) return null;
        
        const block = world.blocks[blockIndex];
        if (!block) return null;
        
        let question;
        
        // Si el bloque tiene preguntas estáticas (formato legacy)
        if (block.questions && block.questions[grade]) {
            const pool = block.questions[grade];
            if (Array.isArray(pool)) {
                // Pool de preguntas - seleccionar aleatoria sin repetir
                question = this.getRandomFromPool(worldName, blockIndex, grade, pool);
            } else {
                // Formato legacy: un solo objeto de pregunta
                question = pool;
            }
        }
        // Si el bloque usa generador programático
        else if (world._generator) {
            const pool = world._generator(grade, blockIndex);
            if (pool && pool.length > 0) {
                question = this.getRandomFromPool(worldName, blockIndex, grade, pool);
            }
        }
        
        if (question) {
            this.currentQuestion = question;
            this.currentBlock = block;
            this.currentWorld = worldName;
        }
        
        return question;
    },
    
    // Seleccionar pregunta aleatoria del pool sin repetir
    usedQuestions: {},
    
    getRandomFromPool(worldName, blockIndex, grade, pool) {
        const key = worldName + '_' + blockIndex + '_' + grade;
        if (!this.usedQuestions[key]) {
            this.usedQuestions[key] = [];
        }
        
        const used = this.usedQuestions[key];
        const available = [];
        
        for (let i = 0; i < pool.length; i++) {
            if (!used.includes(i)) {
                available.push(i);
            }
        }
        
        // Si se agotaron todas, reiniciar
        if (available.length === 0) {
            this.usedQuestions[key] = [];
            return pool[Math.floor(Math.random() * pool.length)];
        }
        
        const randIdx = available[Math.floor(Math.random() * available.length)];
        used.push(randIdx);
        
        return pool[randIdx];
    },
    
    // Reiniciar preguntas usadas (para nueva partida)
    resetUsedQuestions() {
        this.usedQuestions = {};
    },
    
    // Verificar respuesta
    checkAnswer(userAnswer) {
        if (!this.currentQuestion) return false;
        
        const correct = this.currentQuestion.a.toLowerCase().trim();
        const user = userAnswer.toLowerCase().trim();
        
        // Comparación flexible
        return correct === user || 
               correct.replace(/\s/g, '') === user.replace(/\s/g, '');
    },
    
    // Obtener pista
    getHint() {
        return this.currentQuestion ? this.currentQuestion.hint : null;
    },
    
    // Obtener tema del mundo
    getWorldTheme(worldName) {
        return QuestionBank[worldName]?.theme || 'Desconocido';
    }
};

window.QuestionManager = QuestionManager;
