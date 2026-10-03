// Mundo 2: Minas - Función Cuadrática
const Mines = {
    name: 'Mines',
    theme: 'Función Cuadrática',
    objects: [],
    
    create() {
        console.log('⛏️ Creando Minas...');
        
        this.createCave();
        this.createStalactites();
        this.createTorches();
        this.createQuestionBlocks();
        this.createLavaPools();
    },
    
    createCave() {
        // Material de piedra
        const stoneMatOptions = { color: 0x424242, flatShading: true };
        const darkStoneMatOptions = { color: 0x212121, side: THREE.DoubleSide };
        const rockMatOptions = { color: 0x616161, flatShading: true };
        
        if (window.TextureGenerator && TextureGenerator.textures.stone) {
            const stoneTex = TextureGenerator.textures.stone.clone();
            stoneTex.wrapS = THREE.RepeatWrapping;
            stoneTex.wrapT = THREE.RepeatWrapping;
            stoneTex.repeat.set(15, 15);
            stoneMatOptions.map = stoneTex;
            
            darkStoneMatOptions.map = TextureGenerator.textures.stone;
            rockMatOptions.map = TextureGenerator.textures.stone;
        }
        
        // Suelo de piedra
        const groundGeo = new THREE.PlaneGeometry(60, 60, 15, 15);
        const groundMat = new THREE.MeshLambertMaterial(stoneMatOptions);
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -5;
        ground.receiveShadow = true;
        GameScene.scene.add(ground);
        
        // Techo de la cueva
        const ceilingGeo = new THREE.PlaneGeometry(60, 60);
        const ceilingMat = new THREE.MeshLambertMaterial(darkStoneMatOptions);
        const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 10;
        GameScene.scene.add(ceiling);
        
        // Paredes rocosas
        for (let i = 0; i < 20; i++) {
            const rock = this.createRock(rockMatOptions);
            const angle = (i / 20) * Math.PI * 2;
            const radius = 25 + Math.random() * 5;
            rock.position.set(
                Math.cos(angle) * radius,
                -5 + Math.random() * 10,
                Math.sin(angle) * radius
            );
            GameScene.scene.add(rock);
        }
    },
    
    createRock(matOptions) {
        const size = 2 + Math.random() * 3;
        const geo = new THREE.DodecahedronGeometry(size, 0);
        const mat = new THREE.MeshLambertMaterial(matOptions || { 
            color: 0x616161,
            flatShading: true
        });
        const rock = new THREE.Mesh(geo, mat);
        rock.castShadow = true;
        return rock;
    },
    
    createStalactites() {
        for (let i = 0; i < 15; i++) {
            const stalactite = this.createStalactite();
            stalactite.position.set(
                (Math.random() - 0.5) * 50,
                10,
                (Math.random() - 0.5) * 50
            );
            GameScene.scene.add(stalactite);
        }
    },
    
    createStalactite() {
        const height = 2 + Math.random() * 3;
        const geo = new THREE.ConeGeometry(0.5, height, 6);
        const mat = new THREE.MeshLambertMaterial({ 
            color: 0x757575,
            flatShading: true
        });
        const stalactite = new THREE.Mesh(geo, mat);
        stalactite.rotation.x = Math.PI;
        stalactite.position.y = 10 - height / 2;
        return stalactite;
    },
    
    createTorches() {
        const torchPositions = [
            { x: -10, z: -10 },
            { x: 10, z: -10 },
            { x: -10, z: 10 },
            { x: 10, z: 10 },
            { x: 0, z: 0 }
        ];
        
        torchPositions.forEach(pos => {
            const torch = this.createTorch();
            torch.position.set(pos.x, -4, pos.z);
            GameScene.scene.add(torch);
            
            // Luz de la antorcha
            const light = new THREE.PointLight(0xFF9800, 1, 10);
            light.position.set(pos.x, -2, pos.z);
            GameScene.scene.add(light);
        });
    },
    
    createTorch() {
        const torch = new THREE.Group();
        
        // Palo
        const stickGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.5);
        const stickMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });
        const stick = new THREE.Mesh(stickGeo, stickMat);
        stick.position.y = 0.75;
        torch.add(stick);
        
        // Llama
        const flameGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const flameMat = new THREE.MeshBasicMaterial({ 
            color: 0xFF9800,
            emissive: 0xFF9800
        });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.y = 1.7;
        torch.add(flame);
        
        return torch;
    },
    
    createQuestionBlocks() {
        const worldData = QuestionBank.mines;
        
        worldData.blocks.forEach((blockData, index) => {
            const block = Overworld.createVoxelBlock(blockData, index);
            block.position.y = -4; // En el suelo de la mina
            GameScene.scene.add(block);
            this.objects.push(block);
        });
    },
    
    createLavaPools() {
        for (let i = 0; i < 3; i++) {
            const lavaGeo = new THREE.CircleGeometry(2 + Math.random() * 2, 16);
            const lavaMat = new THREE.MeshBasicMaterial({ 
                color: 0xFF5722,
                emissive: 0xFF5722
            });
            const lava = new THREE.Mesh(lavaGeo, lavaMat);
            lava.rotation.x = -Math.PI / 2;
            lava.position.set(
                (Math.random() - 0.5) * 30,
                -4.9,
                (Math.random() - 0.5) * 30
            );
            GameScene.scene.add(lava);
        }
    }
};

window.Mines = Mines;