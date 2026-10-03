// Escena 3D principal
const GameScene = {
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    bloomPass: null,
    hemisphereLight: null,
    directionalLight: null,
    clock: null,
    
    init() {
        // Escena
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.015); // niebla exponencial (SkySystem ajusta density por mundo)
        
        // Cámara
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.THREE.FOV,
            window.innerWidth / window.innerHeight,
            CONFIG.THREE.NEAR,
            CONFIG.THREE.FAR
        );
        this.camera.position.set(0, CONFIG.THREE.PLAYER_HEIGHT, 5);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras suaves
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        // Post-procesado (Bloom)
        this.setupPostProcessing();
        
        // Sistemas visuales
        if (window.SkySystem) SkySystem.init();
        if (window.VisualEffects) VisualEffects.init();
        
        // Iluminación
        this.setupLights();
        
        // Reloj
        this.clock = new THREE.Clock();
        
        // Resize
        window.addEventListener('resize', () => this.onResize());
    },
    
    // Bloom via EffectComposer (si el CDN de post-processing cargó)
    setupPostProcessing() {
        try {
            if (!THREE.EffectComposer || !THREE.RenderPass || !THREE.UnrealBloomPass) return;
            
            const bloom = CONFIG.WORLD_COLORS.overworld.bloom;
            
            this.composer = new THREE.EffectComposer(this.renderer);
            this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
            
            this.bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                bloom.intensity,
                bloom.radius,
                bloom.threshold
            );
            this.composer.addPass(this.bloomPass);
        } catch (e) {
            console.warn('⚠️ Bloom deshabilitado:', e);
            this.composer = null;
            this.bloomPass = null;
        }
    },
    
    setupLights() {
        // Luz de cielo y suelo (HemisphereLight)
        this.hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x4CAF50, 0.6);
        this.scene.add(this.hemisphereLight);
        
        // Luz direccional (sol)
        this.directionalLight = new THREE.DirectionalLight(0xffffee, 0.8);
        this.directionalLight.position.set(10, 20, 10);
        this.directionalLight.castShadow = true;
        
        // Sombra de alta calidad
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 100;
        this.directionalLight.shadow.camera.left = -40;
        this.directionalLight.shadow.camera.right = 40;
        this.directionalLight.shadow.camera.top = 40;
        this.directionalLight.shadow.camera.bottom = -40;
        
        this.scene.add(this.directionalLight);
    },
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    },
    
    // Cambiar ambiente del mundo
    setWorldEnvironment(worldName) {
        const colors = CONFIG.WORLD_COLORS[worldName];
        if (!colors) return;
        
        this.scene.background = new THREE.Color(colors.sky);
        this.scene.fog.color.setHex(colors.fog);
        
        // Actualizar luces
        if (this.hemisphereLight) {
            this.hemisphereLight.color.setHex(colors.lightSky);
            this.hemisphereLight.groundColor.setHex(colors.lightGround);
        }
        if (this.directionalLight) {
            this.directionalLight.color.setHex(colors.lightDir);
        }
        
        // Actualizar Bloom
        if (this.bloomPass && colors.bloom) {
            this.bloomPass.strength = colors.bloom.intensity;
            this.bloomPass.radius = colors.bloom.radius;
            this.bloomPass.threshold = colors.bloom.threshold;
        }
        
        // Cielo dinámico del mundo (luces, nubes, estrellas, niebla)
        if (window.SkySystem) {
            SkySystem.setWorld(worldName);
        }
    },
    
    // Loop de renderizado
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        
        // Actualizar jugador
        if (window.Player) {
            Player.update(delta);
        }
        
        // Animar bloques flotantes
        this.scene.traverse((obj) => {
            if (obj.userData && obj.userData.animate) {
                obj.userData.animate(time);
            }
        });
        
        // Actualizar sistemas visuales
        if (window.SkySystem) SkySystem.update(time, delta);
        if (window.VisualEffects) VisualEffects.update(time, delta);
        if (window.NPCSystem) NPCSystem.update(time, delta);
        
        // Actualizar minimap
        if (window.Minimap && window.Player && window.GameState && GameState.isPlaying) {
            Minimap.render(
                Player.position,
                Player.euler.y,
                WorldManager.currentWorld
            );
        }
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    },
    
    // Limpiar escena
    clear() {
        const objectsToRemove = [];
        this.scene.children.forEach(obj => {
            if (obj.userData && obj.userData.isSkyElement) return; // cielo dinámico persistente
            if (!obj.userData.isPlayerGroup && !(obj instanceof THREE.HemisphereLight) && !(obj instanceof THREE.DirectionalLight)) {
                objectsToRemove.push(obj);
            }
        });
        
        objectsToRemove.forEach(obj => {
            this.scene.remove(obj);
        });
        
        if (!this.scene.children.find(obj => obj instanceof THREE.HemisphereLight)) {
            this.setupLights();
        }
    }
};

window.GameScene = GameScene;