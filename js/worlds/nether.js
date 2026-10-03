// Mundo 3: Nether - Probabilidad
const Nether = {
    name: 'Nether',
    theme: 'Probabilidad',
    objects: [],
    
    create() {
        console.log('🔥 Creando Nether...');
        
        this.createNetherrackGround();
        this.createLavaOcean();
        this.createFortress();
        this.createGlowstone();
        this.createQuestionBlocks();
        this.createParticles();
    },
    
    createNetherrackGround() {
        const groundGeo = new THREE.PlaneGeometry(80, 80, 20, 20);
        const matOptions = { color: 0xB71C1C, flatShading: true };
        
        if (window.TextureGenerator && TextureGenerator.textures.netherrack) {
            const tex = TextureGenerator.textures.netherrack.clone();
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(40, 40);
            matOptions.map = tex;
            matOptions.color = 0xffffff;
        }
        
        const groundMat = new THREE.MeshLambertMaterial(matOptions);
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        GameScene.scene.add(ground);
    },
    
    createLavaOcean() {
        const lavaGeo = new THREE.PlaneGeometry(200, 200);
        const matOptions = { 
            color: 0xFF5722,
            emissive: 0xFF5722,
            transparent: true,
            opacity: 0.9
        };
        
        if (window.TextureGenerator && TextureGenerator.textures.lava) {
            const tex = TextureGenerator.textures.lava.clone();
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(100, 100);
            matOptions.map = tex;
            matOptions.color = 0xffffff;
            matOptions.emissive = 0xffffff;
            matOptions.emissiveMap = tex;
        }
        
        const lavaMat = new THREE.MeshBasicMaterial(matOptions);
        const lava = new THREE.Mesh(lavaGeo, lavaMat);
        lava.rotation.x = -Math.PI / 2;
        lava.position.y = -2;
        GameScene.scene.add(lava);
        
        // Luz ambiental roja
        const lavaLight = new THREE.PointLight(0xFF5722, 1, 50);
        lavaLight.position.set(0, 5, 0);
        GameScene.scene.add(lavaLight);
    },
    
    createFortress() {
        // Estructura de fortaleza del Nether
        const fortress = new THREE.Group();
        
        // Material de Obsidiana/Ladrillos del nether
        const brickMatOptions = { color: 0x3E2723 };
        if (window.TextureGenerator && TextureGenerator.textures.obsidian) {
            brickMatOptions.map = TextureGenerator.textures.obsidian;
            brickMatOptions.color = 0xffffff;
        }
        
        // Pilares
        for (let i = 0; i < 4; i++) {
            const pillar = this.createPillar(brickMatOptions);
            const angle = (i / 4) * Math.PI * 2;
            pillar.position.set(
                Math.cos(angle) * 15,
                0,
                Math.sin(angle) * 15
            );
            fortress.add(pillar);
        }
        
        // Plataforma central
        const platformGeo = new THREE.BoxGeometry(10, 1, 10);
        const platformMat = new THREE.MeshLambertMaterial(brickMatOptions);
        const platform = new THREE.Mesh(platformGeo, platformMat);
        platform.position.y = 0.5;
        fortress.add(platform);
        
        GameScene.scene.add(fortress);
    },
    
    createPillar(matOptions) {
        const pillar = new THREE.Group();
        
        for (let i = 0; i < 5; i++) {
            const blockGeo = new THREE.BoxGeometry(2, 2, 2);
            const blockMat = new THREE.MeshLambertMaterial(matOptions || { 
                color: 0x3E2723,
                flatShading: true
            });
            const block = new THREE.Mesh(blockGeo, blockMat);
            block.position.y = i * 2 + 1;
            block.castShadow = true;
            pillar.add(block);
        }
        
        return pillar;
    },
    
    createGlowstone() {
        for (let i = 0; i < 10; i++) {
            const glowGeo = new THREE.BoxGeometry(1, 1, 1);
            
            const matOptions = { 
                color: 0xFFEB3B,
                emissive: 0xFFEB3B
            };
            if (window.TextureGenerator && TextureGenerator.textures.gold) {
                matOptions.map = TextureGenerator.textures.gold;
                matOptions.color = 0xffffff;
                matOptions.emissive = 0xffffff;
                matOptions.emissiveMap = TextureGenerator.textures.gold;
            }
            
            const glowMat = new THREE.MeshBasicMaterial(matOptions);
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.set(
                (Math.random() - 0.5) * 40,
                8 + Math.random() * 5,
                (Math.random() - 0.5) * 40
            );
            GameScene.scene.add(glow);
        }
    },
    
    createQuestionBlocks() {
        const worldData = QuestionBank.nether;
        
        worldData.blocks.forEach((blockData, index) => {
            const block = Overworld.createVoxelBlock(blockData, index);
            GameScene.scene.add(block);
            this.objects.push(block);
        });
    },
    
    createParticles() {
        // Brasas de fuego
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = [];
        
        const fireColors = [
            new THREE.Color(0xFF5722), // Naranja oscuro
            new THREE.Color(0xFF9800), // Naranja claro
            new THREE.Color(0xFFC107), // Amarillo
            new THREE.Color(0xFF3D00)  // Rojo anaranjado
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 80;
            positions[i3 + 1] = -2 + Math.random() * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 80;
            
            const col = fireColors[Math.floor(Math.random() * fireColors.length)];
            colors[i3] = col.r;
            colors[i3 + 1] = col.g;
            colors[i3 + 2] = col.b;
            
            velocities.push({
                x: (Math.random() - 0.5) * 0.05,
                y: 0.02 + Math.random() * 0.08, // Suben rápido (calor)
                z: (Math.random() - 0.5) * 0.05,
                sway: Math.random() * Math.PI * 2,
                swaySpeed: 1 + Math.random() * 2
            });
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending // Para que brillen mas
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.userData.isParticles = true;
        
        // Animacion
        particles.userData.animate = (time) => {
            const pos = geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const v = velocities[i];
                
                pos[i3] += v.x + Math.sin(time * v.swaySpeed + v.sway) * 0.02;
                pos[i3 + 1] += v.y;
                pos[i3 + 2] += v.z + Math.cos(time * v.swaySpeed + v.sway) * 0.02;
                
                // Reiniciar al llegar muy alto
                if (pos[i3 + 1] > 25) {
                    pos[i3] = (Math.random() - 0.5) * 80;
                    pos[i3 + 1] = -2;
                    pos[i3 + 2] = (Math.random() - 0.5) * 80;
                }
            }
            geometry.attributes.position.needsUpdate = true;
        };
        
        GameScene.scene.add(particles);
    }
};

window.Nether = Nether;