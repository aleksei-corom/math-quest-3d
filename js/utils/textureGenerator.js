// Generador procedural de texturas para mantener la portabilidad
const TextureGenerator = {
    textures: {},
    
    init() {
        // Inicializar todas las texturas básicas
        this.textures.grass = this.createNoiseTexture('#4CAF50', '#388E3C');
        this.textures.dirt = this.createNoiseTexture('#795548', '#5D4037');
        this.textures.stone = this.createNoiseTexture('#9E9E9E', '#757575');
        this.textures.wood = this.createStripesTexture('#8D6E63', '#5D4037');
        this.textures.leaves = this.createNoiseTexture('#2E7D32', '#1B5E20', true);
        this.textures.lava = this.createNoiseTexture('#FF5722', '#F44336');
        this.textures.obsidian = this.createNoiseTexture('#1A1A2E', '#000000');
        this.textures.netherrack = this.createNoiseTexture('#B71C1C', '#D32F2F');
        this.textures.endstone = this.createNoiseTexture('#DBE3A4', '#C5CC8A');
        
        // Bloques especiales (Diamante, Oro, etc)
        this.textures.diamond = this.createOreTexture('#757575', '#00BCD4');
        this.textures.gold = this.createOreTexture('#757575', '#FFC107');
    },

    // Crear textura base de ruido (estilo Minecraft)
    createNoiseTexture(baseColor, noiseColor, transparent = false) {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');

        // Fondo
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 16, 16);

        // Ruido
        for (let i = 0; i < 256; i++) {
            if (Math.random() > 0.5) {
                const x = i % 16;
                const y = Math.floor(i / 16);
                
                // Si es transparente (como hojas), borrar algunos pixeles
                if (transparent && Math.random() > 0.8) {
                    ctx.clearRect(x, y, 1, 1);
                } else {
                    ctx.fillStyle = noiseColor;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        // Bordes suaves
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, 16, 1);
        ctx.fillRect(0, 0, 1, 16);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(0, 15, 16, 1);
        ctx.fillRect(15, 0, 1, 16);

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter; // Para mantener el estilo pixelado
        texture.minFilter = THREE.NearestFilter;
        return texture;
    },

    // Crear textura de madera (líneas)
    createStripesTexture(baseColor, stripeColor) {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 16, 16);

        ctx.fillStyle = stripeColor;
        for (let y = 0; y < 16; y++) {
            if (Math.random() > 0.3) {
                ctx.fillRect(0, y, 16, 1);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    },

    // Crear textura de minerales (piedra con destellos)
    createOreTexture(baseColor, oreColor) {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');

        // Fondo de piedra
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 16, 16);
        
        // Ruido de piedra
        ctx.fillStyle = '#616161';
        for (let i = 0; i < 256; i++) {
            if (Math.random() > 0.6) {
                const x = i % 16;
                const y = Math.floor(i / 16);
                ctx.fillRect(x, y, 1, 1);
            }
        }

        // Mineral
        ctx.fillStyle = oreColor;
        for (let i = 0; i < 15; i++) {
            const x = Math.floor(Math.random() * 14) + 1;
            const y = Math.floor(Math.random() * 14) + 1;
            ctx.fillRect(x, y, 2, 2);
            // Brillo
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x, y, 1, 1);
            ctx.fillStyle = oreColor;
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }
};

window.TextureGenerator = TextureGenerator;
