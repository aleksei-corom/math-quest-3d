// Gestor de mundos
const WorldManager = {
    currentWorld: null,
    currentWorldIndex: 0,
    worldObjects: [],
    
    // Cargar mundo
    loadWorld(worldName) {
        this.currentWorld = worldName;
        this.currentWorldIndex = CONFIG.WORLD_ORDER.indexOf(worldName);
        
        // Limpiar escena
        GameScene.clear();
        
        // Limpiar objetos de colision del jugador
        if (window.Player) Player.clearCollisionObjects();
        
        // Configurar ambiente
        GameScene.setWorldEnvironment(worldName);
        
        // Crear mundo específico
        switch (worldName) {
            case 'overworld': Overworld.create(); break;
            case 'mines': Mines.create(); break;
            case 'nether': Nether.create(); break;
            case 'end': End.create(); break;
        }
        
        // Registrar objetos de colision
        this.registerWorldCollisions(worldName);
        
        // Resaltar bloques de pregunta (glow)
        this.highlightQuestionBlocks();
        
        // Actualizar HUD
        HUD.updateWorldName(worldName);
        
        // Mostrar minimap
        if (window.Minimap) Minimap.show(worldName);
        
        // Animacion cinematica de entrada
        this.playCinematicIntro();
    },
    
    // Añadir glow a los bloques de pregunta del mundo actual
    highlightQuestionBlocks() {
        if (!window.VisualEffects) return;
        
        VisualEffects.clearWorldEffects();
        
        GameScene.scene.traverse(obj => {
            if (obj.userData && obj.userData.isQuestionBlock && obj.material && obj.material.color) {
                VisualEffects.addBlockGlow(obj, obj.material.color.getHex());
            }
        });
    },
    
    // Cinematica al entrar al mundo
    playCinematicIntro() {
        if (!window.Player || !GameScene.camera) return;
        
        // Bloquear controles del jugador
        Player.isCinematic = true;
        
        // Guardar la direccion del jugador
        const targetPos = Player.position.clone();
        
        // Empezar desde muy arriba
        GameScene.camera.position.set(0, 60, 0);
        GameScene.camera.lookAt(targetPos);
        
        const startTime = Date.now();
        const duration = 2000;
        
        const animateIntro = () => {
            const elapsed = Date.now() - startTime;
            let progress = Math.min(elapsed / duration, 1);
            
            // Easing (easeOutExpo)
            progress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            if (progress < 1) {
                // Bajar la camara
                const currentY = 60 - (60 - targetPos.y) * progress;
                GameScene.camera.position.set(0, currentY, 0);
                GameScene.camera.lookAt(targetPos);
                
                requestAnimationFrame(animateIntro);
            } else {
                // Devolver control y resetear rotacion de camara original
                Player.isCinematic = false;
            }
        };
        
        animateIntro();
    },
    
    // Registrar objetos de colision para el jugador
    registerWorldCollisions(worldName) {
        if (!window.Player) return;
        
        const worldPos = new THREE.Vector3();
        
        // Solo registrar hijos de nivel superior del scene (NO cada mesh individual)
        // Esto evita que hijos de groups (troncos, hojas, paredes) se registren en (0,0,0)
        GameScene.scene.children.forEach(obj => {
            // Saltar tipos que no son solidos
            if (obj.isLight) return;
            if (obj.isPoints) return;           // particulas
            if (obj.userData && obj.userData.isPlayerGroup) return;
            if (obj.userData && obj.userData.isParticles) return;
            if (obj.userData && obj.userData.isLeaves) return;
            if (obj.userData && obj.userData.isButterfly) return;
            
            // Obtener bounding box del objeto completo (incluye hijos)
            const box = new THREE.Box3().setFromObject(obj);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            
            // Filtrar: solo objetos de tamaño razonable
            if (maxDim < 0.8 || maxDim > 40) return;
            
            // Obtener posicion REAL en el mundo
            obj.getWorldPosition(worldPos);
            
            // No registrar objetos en el cielo o bajo el suelo
            if (worldPos.y > 15 || worldPos.y < -10) return;
            
            const radius = maxDim * 0.35;
            Player.registerCollisionObject(obj, radius, worldPos.x, worldPos.z);
        });
    },
    
    // Manejar clic en bloque
    handleBlockClick(hitObject) {
        // Encontrar el objeto principal que tiene la data (por si el rayo golpeó los bordes/wireframe)
        let block = hitObject;
        while (block && (!block.userData || !block.userData.isQuestionBlock)) {
            block = block.parent;
        }
        
        if (!block) return;
        
        const blockIndex = block.userData.blockIndex;
        const worldName = this.currentWorld;
        
        // No abrir dialogo si ya esta abierto
        if (window.Modal && Modal.isDialogOpen) return;
        
        // Verificar si ya fue minado
        const key = `${worldName}_${blockIndex}`;
        if (TicketSystem.blocksMined[key]) {
            HUD.showNotification('⛏️ Ya minaste este bloque');
            return;
        }
        
        // Obtener pregunta
        const grade = GameState.grade;
        const question = QuestionManager.getQuestion(worldName, blockIndex, grade);
        
        if (question) {
            Modal.showQuestion(question, () => {
                this.onQuestionAnswered(worldName, blockIndex, block);
            });
        }
    },
    
    // Respuesta correcta
    onQuestionAnswered(worldName, blockIndex, block) {
        // Marcar bloque como minado
        TicketSystem.mineBlock(worldName, blockIndex);
        
        // Animación de bloque minado
        this.animateBlockMined(block);
        
        // Actualizar minimap
        if (window.Minimap) Minimap.refreshBlocks(worldName);
        
        // Verificar completitud del mundo
        if (TicketSystem.isWorldComplete(worldName)) {
            setTimeout(() => this.onWorldComplete(), 1500);
        }
    },
    
    // Animación de bloque minado
    animateBlockMined(block) {
        const originalScale = block.scale.clone();
        const startTime = Date.now();
        
        // Partículas al romper el bloque
        if (window.VisualEffects) {
            const position = new THREE.Vector3();
            block.getWorldPosition(position);
            VisualEffects.spawnBreakParticles(
                position,
                block.material.color ? block.material.color.getHex() : 0xFFEB3B
            );
        }
        
        // Remover de colision
        if (window.Player) {
            Player.collisionObjects = Player.collisionObjects.filter(obj => obj.mesh !== block);
        }
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / 500, 1);
            
            block.scale.set(
                originalScale.x * (1 - progress),
                originalScale.y * (1 - progress),
                originalScale.z * (1 - progress)
            );
            block.material.opacity = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                GameScene.scene.remove(block);
            }
        };
        
        animate();
    },
    
    // Mundo completado
    onWorldComplete() {
        AudioSystem.play('levelUp');
        
        if (this.currentWorldIndex >= CONFIG.WORLD_ORDER.length - 1) {
            // Juego completado
            this.onGameComplete();
        } else {
            // Mostrar modal de dimensión completada
            Modal.showDimensionComplete(
                CONFIG.BLOCKS_PER_WORLD,
                CONFIG.TICKETS_PER_WORLD,
                TicketSystem.tickets,
                () => this.nextWorld()
            );
        }
    },
    
    // Siguiente mundo
    nextWorld() {
        const nextIndex = this.currentWorldIndex + 1;
        if (nextIndex < CONFIG.WORLD_ORDER.length) {
            this.loadWorld(CONFIG.WORLD_ORDER[nextIndex]);
        }
    },
    
    // Juego completado
    onGameComplete() {
        AudioSystem.play('victory');
        HallOfFame.addEntry(
            GameState.playerName,
            GameState.grade,
            GameState.mode,
            TicketSystem.tickets
        );
        Modal.showVictory();
    }
};

window.WorldManager = WorldManager;