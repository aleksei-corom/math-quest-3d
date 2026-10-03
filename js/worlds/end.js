// Mundo 4: The End - Batalla Final
const End = {
    name: 'The End',
    theme: 'Batalla del Dragón',
    objects: [],
    dragon: null,
    dragonHP: 100,
    maxDragonHP: 100,
    
    create() {
        console.log('🐉 Creando The End...');
        
        this.dragonHP = 100;
        this.createEndStone();
        this.createObsidianPillars();
        this.createEnderCrystals();
        this.createDragon();
        this.createVoid();
        this.createQuestionBlocks();
        this.createStars();
        this.createPortalParticles();
    },
    
    createEndStone() {
        // Isla principal del End
        const islandGeo = new THREE.CylinderGeometry(25, 30, 5, 16);
        const matOptions = { color: 0xDBE3A4, flatShading: true };
        
        if (window.TextureGenerator && TextureGenerator.textures.endstone) {
            const tex = TextureGenerator.textures.endstone.clone();
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(15, 15);
            matOptions.map = tex;
            matOptions.color = 0xffffff;
        }
        
        const islandMat = new THREE.MeshLambertMaterial(matOptions);
        const island = new THREE.Mesh(islandGeo, islandMat);
        island.position.y = -2.5;
        island.receiveShadow = true;
        GameScene.scene.add(island);
    },
    
    createObsidianPillars() {
        const pillarPositions = [
            { x: -10, z: -10, height: 15 },
            { x: 10, z: -10, height: 12 },
            { x: -10, z: 10, height: 18 },
            { x: 10, z: 10, height: 14 },
            { x: 0, z: -15, height: 20 }
        ];
        
        // Material de Obsidiana
        const obsidianMatOptions = { color: 0x1A1A2E, flatShading: true };
        if (window.TextureGenerator && TextureGenerator.textures.obsidian) {
            obsidianMatOptions.map = TextureGenerator.textures.obsidian;
            obsidianMatOptions.color = 0xffffff;
        }
        
        pillarPositions.forEach(pos => {
            const pillar = this.createObsidianPillar(pos.height, obsidianMatOptions);
            pillar.position.set(pos.x, 0, pos.z);
            GameScene.scene.add(pillar);
        });
    },
    
    createObsidianPillar(height, matOptions) {
        const pillar = new THREE.Group();
        
        for (let i = 0; i < height; i++) {
            const blockGeo = new THREE.BoxGeometry(2, 2, 2);
            const blockMat = new THREE.MeshLambertMaterial(matOptions || { 
                color: 0x1A1A2E,
                flatShading: true
            });
            const block = new THREE.Mesh(blockGeo, blockMat);
            block.position.y = i * 2 + 1;
            block.castShadow = true;
            pillar.add(block);
        }
        
        return pillar;
    },
    
    createEnderCrystals() {
        for (let i = 0; i < 3; i++) {
            const crystal = this.createCrystal();
            const angle = (i / 3) * Math.PI * 2;
            crystal.position.set(
                Math.cos(angle) * 8,
                15 + Math.random() * 5,
                Math.sin(angle) * 8
            );
            GameScene.scene.add(crystal);
        }
    },
    
    createCrystal() {
        const crystal = new THREE.Group();
        
        const crystalGeo = new THREE.OctahedronGeometry(1, 0);
        const crystalMat = new THREE.MeshBasicMaterial({ 
            color: 0xE1BEE7,
            emissive: 0xE1BEE7,
            transparent: true,
            opacity: 0.8
        });
        const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.add(crystalMesh);
        
        // Luz del cristal
        const light = new THREE.PointLight(0xE1BEE7, 1, 10);
        crystal.add(light);
        
        // Animación
        crystal.userData.animate = (time) => {
            crystal.rotation.y += 0.02;
            crystalMesh.position.y = Math.sin(time * 2) * 0.5;
        };
        
        return crystal;
    },
    
    createDragon() {
        // Ender Dragón simplificado
        this.dragon = new THREE.Group();
        
        // Cuerpo
        const bodyGeo = new THREE.SphereGeometry(3, 16, 16);
        const bodyMat = new THREE.MeshLambertMaterial({ 
            color: 0x4A148C,
            emissive: 0x4A148C,
            emissiveIntensity: 0.3
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        this.dragon.add(body);
        
        // Cabeza
        const headGeo = new THREE.SphereGeometry(1.5, 16, 16);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(3, 1, 0);
        this.dragon.add(head);
        
        // Ojos (brillantes)
        const eyeGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ 
            color: 0xFF00FF,
            emissive: 0xFF00FF
        });
        
        const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
        eye1.position.set(4, 1.5, 0.5);
        this.dragon.add(eye1);
        
        const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
        eye2.position.set(4, 1.5, -0.5);
        this.dragon.add(eye2);
        
        // Alas
        const wingGeo = new THREE.PlaneGeometry(6, 4);
        const wingMat = new THREE.MeshBasicMaterial({ 
            color: 0x4A148C,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        
        const wing1 = new THREE.Mesh(wingGeo, wingMat);
        wing1.position.set(0, 2, 3);
        wing1.rotation.x = Math.PI / 6;
        this.dragon.add(wing1);
        
        const wing2 = new THREE.Mesh(wingGeo, wingMat);
        wing2.position.set(0, 2, -3);
        wing2.rotation.x = -Math.PI / 6;
        this.dragon.add(wing2);
        
        this.dragon.position.set(0, 20, 0);
        this.dragon.userData.animate = (time) => {
            // Vuelo circular
            this.dragon.position.x = Math.cos(time * 0.5) * 15;
            this.dragon.position.z = Math.sin(time * 0.5) * 15;
            this.dragon.position.y = 20 + Math.sin(time) * 3;
            this.dragon.rotation.y = time * 0.5 + Math.PI / 2;
            
            // Aleteo
            wing1.rotation.z = Math.sin(time * 5) * 0.3;
            wing2.rotation.z = -Math.sin(time * 5) * 0.3;
        };
        
        GameScene.scene.add(this.dragon);
    },
    
    createVoid() {
        // Vacío del End (estrellas)
        const voidGeo = new THREE.SphereGeometry(100, 32, 32);
        const voidMat = new THREE.MeshBasicMaterial({ 
            color: 0x0a0a2e,
            side: THREE.BackSide
        });
        const voidSphere = new THREE.Mesh(voidGeo, voidMat);
        GameScene.scene.add(voidSphere);
    },
    
    createQuestionBlocks() {
        const worldData = QuestionBank.end;
        
        worldData.blocks.forEach((blockData, index) => {
            const block = Overworld.createVoxelBlock(blockData, index);
            // Posicionar en círculo alrededor del dragón
            const angle = (index / worldData.blocks.length) * Math.PI * 2;
            block.position.set(
                Math.cos(angle) * 10,
                2,
                Math.sin(angle) * 10
            );
            GameScene.scene.add(block);
            this.objects.push(block);
        });
    },
    
    createStars() {
        const starCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
            const radius = 80 + Math.random() * 20;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.cos(phi);
            positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(geometry, material);
        GameScene.scene.add(stars);
    },
    
    // Dañar al dragón
    damageDragon(amount) {
        this.dragonHP = Math.max(0, this.dragonHP - amount);
        HUD.updateDragonHP(this.dragonHP, this.maxDragonHP);
        
        if (this.dragonHP <= 0) {
            this.defeatDragon();
        }
    },
    
    // Derrotar al dragón
    defeatDragon() {
        console.log('🐉 ¡Dragón derrotado!');
        
        // Animación de explosión
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / 2000, 1);
            
            if (this.dragon) {
                this.dragon.scale.set(
                    1 + progress * 2,
                    1 + progress * 2,
                    1 + progress * 2
                );
                this.dragon.rotation.y += 0.2;
                
                // Hacer transparente
                this.dragon.children.forEach(child => {
                    if (child.material) {
                        child.material.transparent = true;
                        child.material.opacity = 1 - progress;
                    }
                });
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                GameScene.scene.remove(this.dragon);
                this.dragon = null;
                WorldManager.onGameComplete();
            }
        };
        
        animate();
        AudioSystem.play('victory');
    },
    
    createPortalParticles() {
        const particleCount = 300;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const properties = [];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const radius = 5 + Math.random() * 20;
            const angle = Math.random() * Math.PI * 2;
            
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = Math.random() * 25;
            positions[i3 + 2] = Math.sin(angle) * radius;
            
            properties.push({
                radius: radius,
                angle: angle,
                speed: 0.2 + Math.random() * 0.5,
                yOffset: Math.random() * Math.PI * 2
            });
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xAA00FF, // Morado portal
            size: 0.4,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.userData.isParticles = true;
        
        particles.userData.animate = (time) => {
            const pos = geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const p = properties[i];
                
                // Rotacion orbital
                p.angle += p.speed * 0.02;
                
                pos[i3] = Math.cos(p.angle) * p.radius;
                pos[i3 + 1] += Math.sin(time * 2 + p.yOffset) * 0.05; // Flotacion suave
                pos[i3 + 2] = Math.sin(p.angle) * p.radius;
            }
            geometry.attributes.position.needsUpdate = true;
        };
        
        GameScene.scene.add(particles);
    }
};

window.End = End;