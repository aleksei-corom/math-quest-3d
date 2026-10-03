// Funciones auxiliares
const Helpers = {
    // Formatear número
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    // Obtener color aleatorio
    randomColor() {
        return Math.floor(Math.random() * 16777215);
    },
    
    // Clamp
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    // Lerp (interpolación lineal)
    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    },
    
    // Distancia entre dos puntos 3D
    distance3D(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },
    
    // Ángulo aleatorio
    randomAngle() {
        return Math.random() * Math.PI * 2;
    },
    
    // Posición aleatoria en rango
    randomInRange(min, max) {
        return min + Math.random() * (max - min);
    },
    
    // Esperar (promise)
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Shuffle array
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    // Validar respuesta matemática (flexible)
    validateMathAnswer(userAnswer, correctAnswer) {
        const user = userAnswer.toString().toLowerCase().trim().replace(/\s+/g, '');
        const correct = correctAnswer.toString().toLowerCase().trim().replace(/\s+/g, '');
        
        // Comparación directa
        if (user === correct) return true;
        
        // Intentar evaluar como expresión matemática
        try {
            const userValue = eval(user.replace(/[^0-9+\-*/().]/g, ''));
            const correctValue = eval(correct.replace(/[^0-9+\-*/().]/g, ''));
            if (!isNaN(userValue) && !isNaN(correctValue)) {
                return Math.abs(userValue - correctValue) < 0.01;
            }
        } catch (e) {
            // Ignorar errores de evaluación
        }
        
        return false;
    }
};

window.Helpers = Helpers;