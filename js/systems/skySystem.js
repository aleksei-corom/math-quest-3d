// Sistema de Cielo Dinámico con Shaders Procedurales
// Crea cielos personalizados para cada mundo sin texturas externas

const SkySystem = {
    skyMesh: null,
    sunMesh: null,
    moonMesh: null,
    starField: null,
    cloudField: null,
    currentWorld: null,
    
    // Configuración de cielo por mundo
    SKY_CONFIG: {
        overworld: {
            skyTop: new THREE.Color(0x1E88E5),
            skyHorizon: new THREE.Color(0x87CEEB),
            skyBottom: new THREE.Color(0xE3F2FD),
            sunColor: new THREE.Color(0xFFF176),
            sunSize: 0.08,
            sunPosition: new THREE.Vector3(0.3, 0.6, -0.5),
            hasSun: true,
            hasMoon: false,
            hasStars: false,
            hasClouds: true,
            cloudColor: new THREE.Color(0xFFFFFF),
            cloudOpacity: 0.8,
            fogDensity: 0.015,
            ambientIntensity: 0.6,
            sunIntensity: 0.9
        },
        mines: {
            skyTop: new THREE.Color(0x1a1a1a),
            skyHorizon: new THREE.Color(0x2d2d2d),
            skyBottom: new THREE.Color(0x0a0a0a),
            sunColor: new THREE.Color(0xFF9800),
            sunSize: 0.06,
            sunPosition: new THREE.Vector3(0.2, 0.3, -0.4),
            hasSun: true, // Antorchas simuladas como sol tenue
            hasMoon: false,
            hasStars: false,
            hasClouds: false,
            cloudColor: new THREE.Color(0x333333),
            cloudOpacity: 0.0,
            fogDensity: 0.025,
            ambientIntensity: 0.3,
            sunIntensity: 0.4
        },
        nether: {
            skyTop: new THREE.Color(0x3E0000),
            skyHorizon: new THREE.Color(0x8B0000),
            skyBottom: new THREE.Color(0x1A0000),
            sunColor: new THREE.Color(0xFF4500),
            sunSize: 0.12,
            sunPosition: new THREE.Vector3(0.0, 0.4, -0.6),
            hasSun: true, // Sol rojo infernal
            hasMoon: false,
            hasStars: false,
            hasClouds: true, // Nubes de ceniza
            cloudColor: new THREE.Color(0x4A0000),
            cloudOpacity: 0.5,
            fogDensity: 0.02,
            ambientIntensity: 0.4,
            sunIntensity: 0.7
        },
        end: {
            skyTop: new THREE.Color(0x000011),
            skyHorizon: new THREE.Color(0x0a0a2e),
            skyBottom: new THREE.Color(0x000005),
            sunColor: new THREE.Color(0x9C27B0),
            sunSize: 0.15,
            sunPosition: new THREE.Vector3(0.1, 0.5, -0.7),
            hasSun: false,
            hasMoon: true, // Luna púrpura
            hasStars: true,
            hasClouds: false,
            cloudColor: new THREE.Color(0x1A0033),
            cloudOpacity: 0.2,
            fogDensity: 0.01,
            ambientIntensity: 0.2,
            sunIntensity: 0.3
        }
    },

    init() {
        this.createSkyShader();
        this.createSun();
        this.createMoon();
        this.createStarField();
        this.createCloudField();
    },

    // Shader de cielo procedural con gradiente y atmósfera
    createSkyShader() {
        const vertexShader = `
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            uniform vec3 topColor;
            uniform vec3 horizonColor;
            uniform vec3 bottomColor;
            uniform vec3 sunColor;
            uniform vec3 sunPosition;
            uniform float sunSize;
            uniform float sunGlow;
            uniform float time;
            
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            
            // Función de ruido simple
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            void main() {
                vec3 viewDirection = normalize(vWorldPosition);
                float y = viewDirection.y;
                
                // Gradiente principal del cielo
                float horizonBlend = smoothstep(-0.1, 0.3, y);
                float skyBlend = smoothstep(0.3, 1.0, y);
                
                vec3 color = mix(bottomColor, horizonColor, horizonBlend);
                color = mix(color, topColor, skyBlend);
                
                // Añadir textura sutil al cielo
                float skyNoise = noise(viewDirection.xz * 3.0 + time * 0.01) * 0.03;
                color += skyNoise;
                
                // Sol
                if (sunSize > 0.0) {
                    vec3 sunDir = normalize(sunPosition);
                    float sunAngle = acos(clamp(dot(viewDirection, sunDir), -1.0, 1.0));
                    float sunDisc = 1.0 - smoothstep(0.0, sunSize, sunAngle);
                    float sunHalo = 1.0 - smoothstep(0.0, sunSize * 4.0, sunAngle);
                    
                    // Ganancias bajas: el disc/halo pasa el umbral de bloom sin saturar a blanco
                    color += sunColor * sunDisc * 1.1;
                    color += sunColor * sunHalo * sunGlow * 0.18;
                }
                
                // Niebla atmosférica en el horizonte
                float fogAmount = 1.0 - smoothstep(-0.2, 0.5, y);
                color = mix(color, horizonColor * 0.8, fogAmount * 0.3);
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        const geometry = new THREE.SphereGeometry(400, 32, 32);
        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                topColor: { value: new THREE.Color(0x1E88E5) },
                horizonColor: { value: new THREE.Color(0x87CEEB) },
                bottomColor: { value: new THREE.Color(0xE3F2FD) },
                sunColor: { value: new THREE.Color(0xFFF176) },
                sunPosition: { value: new THREE.Vector3(0.3, 0.6, -0.5) },
                sunSize: { value: 0.08 },
                sunGlow: { value: 1.0 },
                time: { value: 0 }
            },
            side: THREE.BackSide,
            depthWrite: false
        });

        this.skyMesh = new THREE.Mesh(geometry, material);
        this.skyMesh.name = 'skyDome';
        this.skyMesh.userData.isSkyElement = true;
        GameScene.scene.add(this.skyMesh);
    },

    createSun() {
        // Sprite de sol brillante para efecto visual extra
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 240, 150, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.sunMesh = new THREE.Sprite(material);
        this.sunMesh.scale.set(14, 14, 1);
        this.sunMesh.visible = false;
        this.sunMesh.userData.isSkyElement = true;
        GameScene.scene.add(this.sunMesh);
    },

    createMoon() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(200, 150, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(150, 100, 200, 0.5)');
        gradient.addColorStop(1, 'rgba(100, 50, 150, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.moonMesh = new THREE.Sprite(material);
        this.moonMesh.scale.set(25, 25, 1);
        this.moonMesh.visible = false;
        this.moonMesh.userData.isSkyElement = true;
        GameScene.scene.add(this.moonMesh);
    },

    createStarField() {
        const starCount = 800;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        const colors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 350;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            sizes[i] = 0.5 + Math.random() * 1.5;
            
            const colorType = Math.random();
            if (colorType < 0.7) {
                colors[i3] = 1.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 1.0;
            } else if (colorType < 0.85) {
                colors[i3] = 1.0; colors[i3 + 1] = 0.9; colors[i3 + 2] = 0.7;
            } else {
                colors[i3] = 0.7; colors[i3 + 1] = 0.8; colors[i3 + 2] = 1.0;
            }
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 1.0,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.starField = new THREE.Points(geometry, material);
        this.starField.visible = false;
        this.starField.userData.isSkyElement = true;
        GameScene.scene.add(this.starField);
    },

    createCloudField() {
        // Nubes como grupos de sprites suaves
        this.cloudField = new THREE.Group();
        
        for (let i = 0; i < 15; i++) {
            const cloud = this.createCloudSprite();
            cloud.position.set(
                (Math.random() - 0.5) * 300,
                50 + Math.random() * 80,
                (Math.random() - 0.5) * 300
            );
            cloud.userData.speed = 0.5 + Math.random() * 1.5;
            cloud.userData.initialX = cloud.position.x;
            this.cloudField.add(cloud);
        }
        
        this.cloudField.visible = false;
        this.cloudField.userData.isSkyElement = true;
        GameScene.scene.add(this.cloudField);
    },

    createCloudSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(64, 32, 0, 64, 32, 64);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthWrite: false
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(40 + Math.random() * 30, 20 + Math.random() * 15, 1);
        return sprite;
    },

    setWorld(worldName) {
        const config = this.SKY_CONFIG[worldName];
        if (!config) return;
        
        this.currentWorld = worldName;
        
        // Actualizar uniforms del shader de cielo
        if (this.skyMesh) {
            const mat = this.skyMesh.material;
            mat.uniforms.topColor.value.copy(config.skyTop);
            mat.uniforms.horizonColor.value.copy(config.skyHorizon);
            mat.uniforms.bottomColor.value.copy(config.skyBottom);
            mat.uniforms.sunColor.value.copy(config.sunColor);
            mat.uniforms.sunPosition.value.copy(config.sunPosition);
            mat.uniforms.sunSize.value = config.sunSize;
            mat.uniforms.sunGlow.value = config.hasSun ? 1.0 : 0.0;
        }
        
        // Actualizar visibilidad de elementos
        if (this.sunMesh) this.sunMesh.visible = config.hasSun;
        if (this.moonMesh) this.moonMesh.visible = config.hasMoon;
        if (this.starField) this.starField.visible = config.hasStars;
        if (this.cloudField) {
            this.cloudField.visible = config.hasClouds;
            // Actualizar color de nubes
            this.cloudField.children.forEach(cloud => {
                cloud.material.color.copy(config.cloudColor);
                cloud.material.opacity = config.cloudOpacity;
            });
        }
        
        // Actualizar luz ambiental
        this.updateLighting(config);
        
        // Actualizar niebla
        if (GameScene.scene) {
            GameScene.scene.fog.density = config.fogDensity;
        }
    },

    updateLighting(config) {
        if (!GameScene.scene) return;
        
        // Encontrar y actualizar luz ambiental
        GameScene.scene.children.forEach(child => {
            if (child instanceof THREE.AmbientLight || child instanceof THREE.HemisphereLight) {
                child.intensity = config.ambientIntensity;
            }
            if (child instanceof THREE.DirectionalLight) {
                child.intensity = config.sunIntensity;
                child.color.copy(config.sunColor);
            }
        });
    },

    update(time, delta) {
        if (!this.currentWorld) return;
        
        const config = this.SKY_CONFIG[this.currentWorld];
        
        // Actualizar tiempo en el shader
        if (this.skyMesh) {
            this.skyMesh.material.uniforms.time.value = time;
        }
        
        // Animar nubes
        if (this.cloudField && this.cloudField.visible) {
            this.cloudField.children.forEach(cloud => {
                cloud.position.x += cloud.userData.speed * delta;
                if (cloud.position.x > 200) {
                    cloud.position.x = -200;
                }
            });
        }
        
        // Animar estrellas (parpadeo sutil)
        if (this.starField && this.starField.visible) {
            this.starField.rotation.y += delta * 0.002;
        }
        
        // Posicionar sol/luna (también si están ocultos: si no, quedan en (0,0,0)
        // dentro de la cabeza del jugador y bloquean el raycast de minado)
        if (this.sunMesh) {
            this.sunMesh.position.copy(config.sunPosition).multiplyScalar(300);
        }
        if (this.moonMesh) {
            this.moonMesh.position.set(-config.sunPosition.x, config.sunPosition.y, config.sunPosition.z).multiplyScalar(300);
        }
    },

    // Transición suave entre cielos
    transitionToWorld(worldName, duration = 2.0) {
        const newConfig = this.SKY_CONFIG[worldName];
        if (!newConfig || !this.skyMesh) return;
        
        const mat = this.skyMesh.material;
        const oldTop = mat.uniforms.topColor.value.clone();
        const oldHorizon = mat.uniforms.horizonColor.value.clone();
        const oldBottom = mat.uniforms.bottomColor.value.clone();
        const oldSunColor = mat.uniforms.sunColor.value.clone();
        
        let elapsed = 0;
        const animate = (dt) => {
            elapsed += dt;
            const t = Math.min(elapsed / duration, 1.0);
            const ease = t * t * (3 - 2 * t); // Smoothstep
            
            mat.uniforms.topColor.value.lerpColors(oldTop, newConfig.skyTop, ease);
            mat.uniforms.horizonColor.value.lerpColors(oldHorizon, newConfig.skyHorizon, ease);
            mat.uniforms.bottomColor.value.lerpColors(oldBottom, newConfig.skyBottom, ease);
            mat.uniforms.sunColor.value.lerpColors(oldSunColor, newConfig.sunColor, ease);
            
            if (t < 1.0) {
                requestAnimationFrame(() => animate(0.016));
            } else {
                this.setWorld(worldName);
            }
        };
        
        animate(0);
    }
};

window.SkySystem = SkySystem;
