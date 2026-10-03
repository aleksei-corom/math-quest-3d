// Minimap - vista aerea del mundo actual
const Minimap = {
    canvas: null,
    ctx: null,
    label: null,
    container: null,
    
    // Configuracion del mapa
    mapSize: 180,       // pixeles del canvas
    worldRadius: 30,    // unidades del mundo que caben en el mapa
    playerDot: { r: 4, color: '#4ade80' },
    blockDot: { r: 5 },
    bgColor: 'rgba(15, 23, 42, 0.85)',
    gridColor: 'rgba(255, 255, 255, 0.06)',
    
    // Colores de bloques por mundo
    worldColors: {
        overworld: { ground: '#1a5c2a', block: '#FFD700' },
        mines: { ground: '#2a2a2a', block: '#00bcd4' },
        nether: { ground: '#5c1a1a', block: '#ff6f00' },
        end: { ground: '#1a1a3e', block: '#c084fc' }
    },
    
    // Bloques registrados
    blocks: [],
    
    init() {
        this.canvas = document.getElementById('minimap-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.label = document.getElementById('minimap-world-name');
        this.container = document.getElementById('minimap-container');
    },
    
    show(worldName) {
        if (this.container) this.container.classList.remove('hidden');
        if (this.label) {
            const names = { overworld: '🌳 OVERWORLD', mines: '⛏️ MINES', nether: '🔥 NETHER', end: '🐉 THE END' };
            this.label.textContent = names[worldName] || worldName;
        }
        this.registerBlocks(worldName);
    },
    
    hide() {
        if (this.container) this.container.classList.add('hidden');
    },
    
    // Registrar posiciones de bloques de pregunta
    registerBlocks(worldName) {
        this.blocks = [];
        const worldData = QuestionBank[worldName];
        if (!worldData || !worldData.blocks) return;
        
        const blocksMined = window.TicketSystem ? TicketSystem.blocksMined : {};
        
        worldData.blocks.forEach((blockData, index) => {
            const key = worldName + '_' + index;
            const mined = blocksMined[key];
            if (!mined) {
                this.blocks.push({
                    x: blockData.position.x,
                    z: blockData.position.z,
                    color: blockData.color,
                    index: index
                });
            }
        });
    },
    
    // Actualizar estado de bloques minados
    refreshBlocks(worldName) {
        this.registerBlocks(worldName);
    },
    
    // Convertir posicion del mundo a posicion del canvas
    worldToMap(worldX, worldZ) {
        const halfSize = this.mapSize / 2;
        const scale = halfSize / this.worldRadius;
        return {
            x: halfSize + worldX * scale,
            y: halfSize + worldZ * scale  // Z hacia abajo en el mapa
        };
    },
    
    // Renderizar el minimap
    render(playerPos, playerAngle, worldName) {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const s = this.mapSize;
        
        // Fondo
        const colors = this.worldColors[worldName] || { ground: '#1a1a2e', block: '#FFD700' };
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, s, s);
        
        // Grid sutil
        ctx.strokeStyle = this.gridColor;
        ctx.lineWidth = 1;
        for (let i = 0; i < s; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, s);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(s, i);
            ctx.stroke();
        }
        
        // Borde circular de suave
        const gradient = ctx.createRadialGradient(s/2, s/2, s*0.3, s/2, s/2, s*0.5);
        gradient.addColorStop(0, 'rgba(15,23,42,0)');
        gradient.addColorStop(1, 'rgba(15,23,42,0.6)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, s, s);
        
        // Dibujar bloques de pregunta
        this.blocks.forEach(block => {
            const pos = this.worldToMap(block.x, block.z);
            
            // Glow
            ctx.shadowColor = colors.block;
            ctx.shadowBlur = 8;
            
            ctx.fillStyle = colors.block;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.blockDot.r, 0, Math.PI * 2);
            ctx.fill();
            
            // Borde
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.shadowBlur = 0;
        });
        
        // Dibujar jugador (flecha que apunta en la direccion)
        const playerMapPos = this.worldToMap(playerPos.x, playerPos.z);
        const angle = playerAngle || 0;
        
        ctx.save();
        ctx.translate(playerMapPos.x, playerMapPos.y);
        ctx.rotate(-angle + Math.PI); // Rotar para que apunte hacia arriba
        
        // Triangulo del jugador
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 10;
        
        ctx.fillStyle = this.playerDot.color;
        ctx.beginPath();
        ctx.moveTo(0, -7);        // Punta
        ctx.lineTo(-4, 5);        // Base izquierda
        ctx.lineTo(4, 5);         // Base derecha
        ctx.closePath();
        ctx.fill();
        
        // Borde del triangulo
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.restore();
        
        // Borde del minimap
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, s, s);
    }
};

window.Minimap = Minimap;
