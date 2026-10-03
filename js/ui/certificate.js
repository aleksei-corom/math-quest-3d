// Generador de certificados
const Certificate = {
    canvas: null,
    ctx: null,
    
    generate() {
        this.canvas = document.getElementById('certificate-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.drawCertificate();
    },
    
    drawCertificate() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Fondo con gradiente
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Borde dorado
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 10;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        
        // Borde interior
        ctx.strokeStyle = '#FFA000';
        ctx.lineWidth = 3;
        ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);
        
        // Esquinas decorativas
        this.drawCornerDecoration(40, 40);
        this.drawCornerDecoration(canvas.width - 40, 40, true);
        this.drawCornerDecoration(40, canvas.height - 40, false, true);
        this.drawCornerDecoration(canvas.width - 40, canvas.height - 40, true, true);
        
        // Título
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 CERTIFICADO DE MAESTRÍA MATEMÁTICA 🏆', canvas.width / 2, 100);
        
        // Subtítulo
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.fillText('Se otorga el presente reconocimiento a:', canvas.width / 2, 150);
        
        // Nombre del jugador
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 48px Arial';
        ctx.fillText(GameState.playerName.toUpperCase(), canvas.width / 2, 230);
        
        // Línea decorativa
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(200, 250);
        ctx.lineTo(600, 250);
        ctx.stroke();
        
        // Texto de logro
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px Arial';
        ctx.fillText('Por haber completado exitosamente', canvas.width / 2, 290);
        ctx.fillText('MATH QUEST 3D: Camino al End', canvas.width / 2, 320);
        
        // Estadísticas
        ctx.font = '16px Arial';
        ctx.fillStyle = '#00BCD4';
        ctx.fillText(`📊 Tickets Totales: ${TicketSystem.tickets}`, canvas.width / 2, 370);
        ctx.fillText(`🎓 Grado: ${GameState.grade}°`, canvas.width / 2, 400);
        ctx.fillText(`🎮 Modo: ${this.getModeName(GameState.mode)}`, canvas.width / 2, 430);
        
        // Dimensiones completadas
        ctx.fillStyle = '#FFD700';
        ctx.font = '14px Arial';
        ctx.fillText('🌳 Overworld  ·  ⛏️ Mines  ·  🔥 Nether  ·  🐉 The End', canvas.width / 2, 470);
        
        // Fecha
        const date = new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.fillText(`Fecha: ${date}`, canvas.width / 2, 520);
        
        // Firmas
        ctx.font = 'italic 12px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText('Steam Fair 2025 · Grado 9° N4', canvas.width / 2, 560);
        
        // Integrantes
        ctx.font = '10px Arial';
        ctx.fillText('Gabriela Ramírez · David Corpas · Ángela Crizón', canvas.width / 2, 580);
    },
    
    drawCornerDecoration(x, y, flipX = false, flipY = false) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        if (flipX) ctx.scale(-1, 1);
        if (flipY) ctx.scale(1, -1);
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(30, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 30);
        ctx.stroke();
        
        ctx.restore();
    },
    
    getModeName(mode) {
        const names = {
            adventure: 'Aventura',
            timed: 'Contrarreloj',
            duel: 'Duelo 1v1'
        };
        return names[mode] || mode;
    },
    
    download() {
        const link = document.createElement('a');
        link.download = `Certificado_${GameState.playerName}_MathQuest3D.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
        
        HUD.showNotification('📥 Certificado descargado');
    },
    
    print() {
        const printWindow = window.open('', '_blank');
        const imgData = this.canvas.toDataURL('image/png');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Certificado - ${GameState.playerName}</title>
                <style>
                    body { 
                        margin: 0; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        min-height: 100vh;
                        background: #f0f0f0;
                    }
                    img { 
                        max-width: 100%; 
                        height: auto;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    }
                    @media print {
                        body { background: white; }
                        img { box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                <img src="${imgData}" onload="window.print();">
            </body>
            </html>
        `);
        printWindow.document.close();
    }
};

window.Certificate = Certificate;