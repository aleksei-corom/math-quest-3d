// Mundo 1: Overworld - Función Lineal
const Overworld = {
    name: 'Overworld',
    theme: 'Función Lineal',
    objects: [],
    
    create() {
        console.log('🌳 Creando Overworld...');
        
        // Crear suelo de pasto
        this.createGround();
        
        // Crear árboles decorativos
        this.createTrees();
        
        // Crear casa de Steve
        this.createHouse();
        
        // Crear bloques de preguntas
        this.createQuestionBlocks();
        
        // Crear nubes
        this.createClouds();
        
        // Crear sol
        this.createSun();
        
        // Crear particulas ambientales
        this.createLeaves();
        this.createButterflies();
    },
    
    createGround() {
        // Suelo principal (pasto)
        const groundGeo = new THREE.PlaneGeometry(100, 100, 20, 20);
        
        // Usar textura si está disponible, si no, color plano
        const matOptions = { flatShading: true };
        if (window.TextureGenerator && TextureGenerator.textures.grass) {
            const tex = TextureGenerator.textures.grass.clone();
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(50, 50);
            matOptions.map = tex;
        } else {
            matOptions.color = 0x4CAF50;
        }
        
        const groundMat = new THREE.MeshLambertMaterial(matOptions);
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        GameScene.scene.add(ground);
    },
    
    createTrees() {
        const treePositions = [
            { x: -15, z: -10 },
            { x: 20, z: -15 },
            { x: -25, z: 5 },
            { x: 15, z: 20 },
            { x: -10, z: 25 }
        ];
        
        treePositions.forEach(pos => {
            const tree = this.createTree();
            tree.position.set(pos.x, 0, pos.z);
            GameScene.scene.add(tree);
        });
    },
    
    createTree() {
        const tree = new THREE.Group();
        
        // Materiales
        const trunkMatOptions = { color: 0x6D4C41 };
        const leavesMatOptions = { color: 0x2E7D32 };
        
        if (window.TextureGenerator) {
            if (TextureGenerator.textures.wood) trunkMatOptions.map = TextureGenerator.textures.wood;
            if (TextureGenerator.textures.leaves) {
                leavesMatOptions.map = TextureGenerator.textures.leaves;
                leavesMatOptions.transparent = true;
                leavesMatOptions.alphaTest = 0.1;
                leavesMatOptions.color = 0xffffff; // Reset color to not tint texture
            }
        }
        
        // Tronco
        const trunkGeo = new THREE.BoxGeometry(1, 4, 1);
        const trunkMat = new THREE.MeshLambertMaterial(trunkMatOptions);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 2;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Hojas (cubos)
        const leavesGeo = new THREE.BoxGeometry(3, 3, 3);
        const leavesMat = new THREE.MeshLambertMaterial(leavesMatOptions);
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.y = 5;
        leaves.castShadow = true;
        tree.add(leaves);
        
        return tree;
    },
    
    createHouse() {
        const house = new THREE.Group();
        
        // Materiales
        const wallMatOptions = { color: 0x8D6E63 };
        const roofMatOptions = { color: 0xD32F2F };
        const doorMatOptions = { color: 0x3E2723 };
        
        if (window.TextureGenerator) {
            if (TextureGenerator.textures.wood) {
                wallMatOptions.map = TextureGenerator.textures.wood;
                wallMatOptions.color = 0xffffff;
            }
        }
        
        // Paredes
        const wallGeo = new THREE.BoxGeometry(6, 4, 6);
        const wallMat = new THREE.MeshLambertMaterial(wallMatOptions);
        const walls = new THREE.Mesh(wallGeo, wallMat);
        walls.position.y = 2;
        walls.castShadow = true;
        house.add(walls);
        
        // Techo
        const roofGeo = new THREE.ConeGeometry(5, 2, 4);
        const roofMat = new THREE.MeshLambertMaterial(roofMatOptions);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        house.add(roof);
        
        // Puerta
        const doorGeo = new THREE.BoxGeometry(1.5, 2.5, 0.2);
        const doorMat = new THREE.MeshLambertMaterial(doorMatOptions);
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 1.25, 3.1);
        house.add(door);
        
        house.position.set(-20, 0, -20);
        GameScene.scene.add(house);
    },
    
    createQuestionBlocks() {
        const worldData = QuestionBank.overworld;
        
        worldData.blocks.forEach((blockData, index) => {
            const block = this.createVoxelBlock(blockData, index);
            GameScene.scene.add(block);
            this.objects.push(block);
        });
    },
    
    createVoxelBlock(blockData, index) {
        // Cubo principal
        const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const mat = new THREE.MeshLambertMaterial({ 
            color: blockData.color,
            emissive: blockData.color,
            emissiveIntensity: 0.2
        });
        const block = new THREE.Mesh(geo, mat);
        
        block.position.set(
            blockData.position.x,
            blockData.position.y,
            blockData.position.z
        );
        
        block.castShadow = true;
        block.receiveShadow = true;
        
        // Datos del bloque
        block.userData = {
            isQuestionBlock: true,
            blockIndex: index,
            type: blockData.type,
            world: 'overworld'
        };
        
        // Borde brillante (indicador interactivo)
        const edges = new THREE.EdgesGeometry(geo);
        const edgeMat = new THREE.LineBasicMaterial({ 
            color: 0xFFEB3B,
            linewidth: 2
        });
        const wireframe = new THREE.LineSegments(edges, edgeMat);
        block.add(wireframe);
        
        // Animación flotante
        block.userData.animate = (time) => {
            block.position.y = blockData.position.y + Math.sin(time * 2 + index) * 0.2;
            block.rotation.y += 0.01;
        };
        
        return block;
    },
    
    createClouds() {
        for (let i = 0; i < 8; i++) {
            const cloud = this.createCloud();
            cloud.position.set(
                (Math.random() - 0.5) * 80,
                20 + Math.random() * 10,
                (Math.random() - 0.5) * 80
            );
            GameScene.scene.add(cloud);
        }
    },
    
    createCloud() {
        const cloud = new THREE.Group();
        const cloudMat = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 5; i++) {
            const size = 1 + Math.random() * 2;
            const geo = new THREE.BoxGeometry(size, size * 0.5, size);
            const cube = new THREE.Mesh(geo, cloudMat);
            cube.position.set(
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 3
            );
            cloud.add(cube);
        }
        
        return cloud;
    },
    
    createSun() {
        const sunGeo = new THREE.SphereGeometry(3, 16, 16);
        const sunMat = new THREE.MeshBasicMaterial({ 
            color: 0xFFEB3B,
            emissive: 0xFFEB3B
        });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.set(30, 40, -30);
        GameScene.scene.add(sun);
    },
    
    // === POLEN MÁGICO ===
    createLeaves() {
        const count = 150;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const velocities = [];
        
        const pollenColors = [
            new THREE.Color(0xFFEB3B), // Amarillo
            new THREE.Color(0xFFFFFF), // Blanco
            new THREE.Color(0x8BC34A)  // Verde muy claro
        ];
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3]     = (Math.random() - 0.5) * 80;
            positions[i3 + 1] = Math.random() * 20; // Repartido en altura
            positions[i3 + 2] = (Math.random() - 0.5) * 80;
            
            const col = pollenColors[Math.floor(Math.random() * pollenColors.length)];
            colors[i3]     = col.r;
            colors[i3 + 1] = col.g;
            colors[i3 + 2] = col.b;
            
            sizes[i] = 0.1 + Math.random() * 0.15; // Más pequeñas que hojas
            
            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: 0.005 + Math.random() * 0.015, // Flotan hacia arriba
                z: (Math.random() - 0.5) * 0.02,
                swayPhase: Math.random() * Math.PI * 2,
                swaySpeed: 0.5 + Math.random() * 1.0,
                swayAmount: 0.01 + Math.random() * 0.02
            });
        }
        
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const mat = new THREE.PointsMaterial({
            size: 0.4,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        const pollen = new THREE.Points(geo, mat);
        pollen.userData.isLeaves = true;
        pollen.userData.velocities = velocities;
        pollen.userData.animate = (time) => {
            const pos = geo.attributes.position.array;
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                const v = velocities[i];
                
                pos[i3]     += v.x + Math.sin(time * v.swaySpeed + v.swayPhase) * v.swayAmount;
                pos[i3 + 1] += v.y; // Sube
                pos[i3 + 2] += v.z + Math.cos(time * v.swaySpeed * 0.7 + v.swayPhase) * v.swayAmount;
                
                // Reiniciar cuando llegan muy alto
                if (pos[i3 + 1] > 25) {
                    pos[i3]     = (Math.random() - 0.5) * 80;
                    pos[i3 + 1] = -1; // Aparecen desde el suelo
                    pos[i3 + 2] = (Math.random() - 0.5) * 80;
                }
            }
            geo.attributes.position.needsUpdate = true;
        };
        
        GameScene.scene.add(pollen);
    },
    
    // === MARIPOSAS ===
    createButterflies() {
        const butterflyColors = [0xFF4081, 0xE040FB, 0x448AFF, 0xFFEB3B, 0xFF7043];
        
        for (let i = 0; i < 8; i++) {
            const butterfly = this.createButterfly(
                butterflyColors[Math.floor(Math.random() * butterflyColors.length)]
            );
            
            const startX = (Math.random() - 0.5) * 40;
            const startY = 2 + Math.random() * 4;
            const startZ = (Math.random() - 0.5) * 40;
            
            butterfly.position.set(startX, startY, startZ);
            
            // Datos de animacion
            butterfly.userData.animate = (time) => {
                const t = time + i * 2.5;
                butterfly.position.x = startX + Math.sin(t * 0.3) * 5;
                butterfly.position.y = startY + Math.sin(t * 1.2) * 1.5;
                butterfly.position.z = startZ + Math.cos(t * 0.4) * 4;
                
                // Aleteo
                const wingSpeed = 15 + Math.sin(t) * 3;
                const wingAngle = Math.sin(time * wingSpeed) * 0.6;
                if (butterfly.children[0]) butterfly.children[0].rotation.y = wingAngle;
                if (butterfly.children[1]) butterfly.children[1].rotation.y = -wingAngle;
                
                // Mirar en la direccion del movimiento
                butterfly.rotation.y = Math.atan2(
                    Math.cos(t * 0.3) * 0.3,
                    -Math.sin(t * 0.4) * 0.4
                );
            };
            
            GameScene.scene.add(butterfly);
        }
    },
    
    createButterfly(color) {
        const group = new THREE.Group();
        
        const wingGeo = new THREE.PlaneGeometry(0.3, 0.2);
        const wingMat = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        
        // Ala izquierda
        const wingL = new THREE.Mesh(wingGeo, wingMat);
        wingL.position.set(-0.15, 0, 0);
        group.add(wingL);
        
        // Ala derecha
        const wingR = new THREE.Mesh(wingGeo, wingMat);
        wingR.position.set(0.15, 0, 0);
        group.add(wingR);
        
        // Cuerpo
        const bodyGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 4);
        const bodyMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.x = Math.PI / 2;
        group.add(body);
        
        // Escala diminuta
        group.scale.set(1.5, 1.5, 1.5);
        
        return group;
    }
};

window.Overworld = Overworld;