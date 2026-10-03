// Controles del jugador en primera y tercera persona
// Con cara, animacion de caminar, y colision
const Player = {
    position: new THREE.Vector3(0, 2, 0),
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    onGround: true,
    euler: new THREE.Euler(0, 0, 0, 'YXZ'),
    keys: {},
    isLocked: false,

    isThirdPerson: false,
    playerModel: null,

    // Piezas animables
    leftArm: null,
    rightArm: null,
    leftLeg: null,
    rightLeg: null,
    head: null,
    body: null,
    walkTime: 0,
    isMoving: false,
    walkTimer: 0,
    walkInterval: 0.38,

    // Colision: radios de colision por mundo
    collisionObjects: [],
    playerRadius: 0.5,

    init() {
        this.position.y = CONFIG.THREE.PLAYER_HEIGHT;

        // Controles de teclado
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Controles de raton (Pointer Lock)
        document.addEventListener('click', () => {
            if (window.GameState && GameState.isPlaying) {
                // No intentar minar si el dialogo esta abierto
                if (window.Modal && Modal.isDialogOpen) return;
                if (!this.isLocked) {
                    this.lockPointer();
                } else {
                    this.tryMineBlock();
                }
            }
        });
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Listener de pointer lock (una sola vez)
        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === GameScene.renderer.domElement;
            this.updateCrosshair();
        });

        // Crear modelo del jugador
        this.createPlayerModel();
    },
    
    updateCrosshair() {
        const ch = document.getElementById('crosshair');
        if (!ch) return;
        if (this.isLocked && this.isThirdPerson === false) {
            ch.classList.remove('hidden');
        } else {
            ch.classList.add('hidden');
        }
    },

    createPlayerModel() {
        this.playerModel = new THREE.Group();
        this.playerModel.userData.isPlayerGroup = true;

        const skinMat = new THREE.MeshLambertMaterial({ color: 0xFFCCAA });
        const shirtMat = new THREE.MeshLambertMaterial({ color: 0x00BCD4 });
        const pantsMat = new THREE.MeshLambertMaterial({ color: 0x1565C0 });
        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0xCC8866 });

        // === CABEZA ===
        this.head = new THREE.Group();
        const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
        this.head.add(headMesh);

        // Ojos blancos
        const eyeGeo = new THREE.BoxGeometry(0.12, 0.08, 0.02);
        const eyeWhiteL = new THREE.Mesh(eyeGeo, eyeWhiteMat);
        eyeWhiteL.position.set(-0.1, 0.05, 0.26);
        this.head.add(eyeWhiteL);

        const eyeWhiteR = new THREE.Mesh(eyeGeo, eyeWhiteMat);
        eyeWhiteR.position.set(0.1, 0.05, 0.26);
        this.head.add(eyeWhiteR);

        // Pupils (centrados, miran hacia adelante)
        const pupilGeo = new THREE.BoxGeometry(0.06, 0.06, 0.02);
        const pupilL = new THREE.Mesh(pupilGeo, eyePupilMat);
        pupilL.position.set(-0.1, 0.05, 0.28);
        this.head.add(pupilL);

        const pupilR = new THREE.Mesh(pupilGeo, eyePupilMat);
        pupilR.position.set(0.1, 0.05, 0.28);
        this.head.add(pupilR);

        // Cejas
        const browGeo = new THREE.BoxGeometry(0.13, 0.03, 0.02);
        const browMat = new THREE.MeshBasicMaterial({ color: 0x5D4037 });
        const browL = new THREE.Mesh(browGeo, browMat);
        browL.position.set(-0.1, 0.13, 0.26);
        this.head.add(browL);
        const browR = new THREE.Mesh(browGeo, browMat);
        browR.position.set(0.1, 0.13, 0.26);
        this.head.add(browR);

        // Boca (sonrisa)
        const mouthGeo = new THREE.BoxGeometry(0.12, 0.03, 0.02);
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, -0.08, 0.26);
        this.head.add(mouth);

        this.head.position.y = 1.5;
        this.playerModel.add(this.head);

        // === CUERPO ===
        this.body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.25), shirtMat);
        this.body.position.y = 0.875;
        this.playerModel.add(this.body);

        // === BRAZO IZQUIERDO ===
        this.leftArm = new THREE.Group();
        const armMeshL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), skinMat);
        armMeshL.position.y = -0.3;
        this.leftArm.add(armMeshL);
        this.leftArm.position.set(0.35, 1.2, 0);
        this.playerModel.add(this.leftArm);

        // === BRAZO DERECHO ===
        this.rightArm = new THREE.Group();
        const armMeshR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), skinMat);
        armMeshR.position.y = -0.3;
        this.rightArm.add(armMeshR);
        this.rightArm.position.set(-0.35, 1.2, 0);
        this.playerModel.add(this.rightArm);

        // === PIERNA IZQUIERDA ===
        this.leftLeg = new THREE.Group();
        const legMeshL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.2), pantsMat);
        legMeshL.position.y = -0.25;
        this.leftLeg.add(legMeshL);
        this.leftLeg.position.set(0.1, 0.5, 0);
        this.playerModel.add(this.leftLeg);

        // === PIERNA DERECHA ===
        this.rightLeg = new THREE.Group();
        const legMeshR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.2), pantsMat);
        legMeshR.position.y = -0.25;
        this.rightLeg.add(legMeshR);
        this.rightLeg.position.set(-0.1, 0.5, 0);
        this.playerModel.add(this.rightLeg);

        // Configurar sombras
        this.playerModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.userData.isPlayer = true;
            }
        });

        this.playerModel.visible = false;
        GameScene.scene.add(this.playerModel);
    },

    lockPointer() {
        if (this.isLocked) return;
        // No lockear si el dialogo o un modal esta abierto
        if (window.Modal && Modal.isDialogOpen) return;

        const canvas = GameScene.renderer.domElement;
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
        canvas.requestPointerLock();
    },

    onKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;

        // Cambiar camara con 'V'
        if (e.key.toLowerCase() === 'v' && window.GameState && GameState.isPlaying) {
            this.isThirdPerson = !this.isThirdPerson;
            this.updateCrosshair();
        }

        // Picar con 'E'
        if (e.key.toLowerCase() === 'e') {
            if (window.Modal && Modal.isDialogOpen) return;
            this.tryMineBlock();
        }
    },

    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    },

    onMouseMove(e) {
        if (!this.isLocked) return;

        const sensitivity = 0.002;
        this.euler.y -= e.movementX * sensitivity;
        this.euler.x -= e.movementY * sensitivity;
        this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
    },

    update(delta) {
        if (this.isCinematic) return;
        
        const speed = CONFIG.THREE.MOVE_SPEED;
        const camera = GameScene.camera;

        // No mover si el dialogo esta abierto
        if (window.Modal && Modal.isDialogOpen) {
            this.animateIdle(delta);
            return;
        }

        // Direccion de movimiento
        this.direction.set(0, 0, 0);

        if (this.keys['w']) this.direction.z -= 1;
        if (this.keys['s']) this.direction.z += 1;
        if (this.keys['a']) this.direction.x -= 1;
        if (this.keys['d']) this.direction.x += 1;

        this.direction.normalize();

        // Aplicar rotacion a los vectores de movimiento
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);

        const right = new THREE.Vector3(1, 0, 0);
        right.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);

        // Calcular nueva posicion
        const moveX = this.direction.x * speed;
        const moveZ = -this.direction.z * speed;

        // Intentar mover en X
        const newX = this.position.x + right.x * moveX + forward.x * moveZ;
        const newZ = this.position.z + right.z * moveX + forward.z * moveZ;

        // Verificar colision antes de mover
        if (!this.checkCollision(newX, this.position.z)) {
            this.position.x = newX;
        }
        if (!this.checkCollision(this.position.x, newZ)) {
            this.position.z = newZ;
        }

        // Salto
        if (this.keys[' '] && this.onGround) {
            this.velocity.y = CONFIG.THREE.JUMP_FORCE;
            this.onGround = false;
        }

        // Gravedad
        this.velocity.y -= CONFIG.THREE.GRAVITY;
        this.position.y += this.velocity.y;

        // Suelo
        if (this.position.y < CONFIG.THREE.PLAYER_HEIGHT) {
            this.position.y = CONFIG.THREE.PLAYER_HEIGHT;
            this.velocity.y = 0;
            this.onGround = true;
        }

        // Determinar si se esta moviendo
        this.isMoving = (this.direction.x !== 0 || this.direction.z !== 0);

        // Sonido de pasos
        if (this.isMoving && this.onGround) {
            this.walkTimer -= delta;
            if (this.walkTimer <= 0) {
                AudioSystem.play('footstep');
                this.walkTimer = this.walkInterval;
            }
        } else {
            this.walkTimer = 0;
        }

        // Actualizar animacion
        this.animateWalk(delta);

        // Actualizar camara y modelo
        camera.quaternion.setFromEuler(this.euler);

        if (this.isThirdPerson) {
            if (!this.playerModel.parent && GameScene.scene) {
                GameScene.scene.add(this.playerModel);
            }

            this.playerModel.visible = true;
            this.playerModel.position.copy(this.position);
            this.playerModel.position.y -= CONFIG.THREE.PLAYER_HEIGHT;
            this.playerModel.rotation.y = this.euler.y;

            const offset = new THREE.Vector3(0, 0.5, 4);
            offset.applyEuler(this.euler);

            camera.position.copy(this.position).add(offset);
        } else {
            // En primera persona, mostrar brazos pequeños si se mueve
            this.playerModel.visible = false;
            camera.position.copy(this.position);
        }
    },

    // === ANIMACION DE CAMINAR ===
    animateWalk(delta) {
        if (this.isMoving) {
            this.walkTime += delta * 8;
        } else {
            this.walkTime *= 0.85; // Frenar suavemente
        }

        if (!this.leftArm || !this.rightArm || !this.leftLeg || !this.rightLeg) return;

        const swing = Math.sin(this.walkTime) * 0.5;
        const bounce = this.isMoving ? Math.abs(Math.sin(this.walkTime * 2)) * 0.03 : 0;

        // Brazos se balancean en sentido contrario a las piernas
        this.leftArm.rotation.x = swing;
        this.rightArm.rotation.x = -swing;

        // Piernas se balancean
        this.leftLeg.rotation.x = -swing;
        this.rightLeg.rotation.x = swing;

        // Cuerpo rebota levemente al caminar
        if (this.body) {
            this.body.position.y = 0.875 + bounce;
        }
        if (this.head) {
            this.head.position.y = 1.5 + bounce;
        }
    },

    animateIdle(delta) {
        this.walkTime *= 0.9;
        this.animateWalk(delta);
    },

    // === COLISION ===
    registerCollisionObject(mesh, radius, worldX, worldZ) {
        this.collisionObjects.push({
            mesh: mesh,
            position: new THREE.Vector3(worldX || 0, 0, worldZ || 0),
            radius: radius || 1.0
        });
    },

    clearCollisionObjects() {
        this.collisionObjects = [];
    },

    checkCollision(x, z) {
        for (let i = 0; i < this.collisionObjects.length; i++) {
            const obj = this.collisionObjects[i];
            const dx = x - obj.position.x;
            const dz = z - obj.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const minDist = this.playerRadius + obj.radius;

            if (dist < minDist) {
                return true; // Colision detectada
            }
        }
        return false;
    },

    // Intentar minar bloque (raycasting)
    tryMineBlock() {
        if (!this.isLocked) return;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), GameScene.camera);

        const intersects = raycaster.intersectObjects(GameScene.scene.children, true);

        if (intersects.length > 0) {
            const hit = intersects.find(i => !i.object.userData.isPlayer);

            if (hit && hit.distance < 8) {
                const hitObject = hit.object;
                if (window.WorldManager) {
                    WorldManager.handleBlockClick(hitObject);
                }
            }
        }
    }
};

window.Player = Player;
