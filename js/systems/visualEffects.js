// Efectos visuales - Glow, partículas y transiciones
const VisualEffects = {
    glows: [],
    transitionMesh: null,

    init() {
        const geo = new THREE.PlaneGeometry(10, 10);
        const mat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthTest: false });
        this.transitionMesh = new THREE.Mesh(geo, mat);
        this.transitionMesh.visible = false;
    },

    addBlockGlow(block, color) {
        const c = document.createElement('canvas');
        c.width = 64; c.height = 64;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        const hex = '#' + new THREE.Color(color).getHexString();
        g.addColorStop(0, hex + '80');
        g.addColorStop(1, hex + '00');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
        const tex = new THREE.CanvasTexture(c);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(4, 4, 1);
        block.add(sprite);
        this.glows.push({ sprite, block, color: new THREE.Color(color) });
    },

    clearWorldEffects() {
        this.glows = [];
    },

    update(time) {
        this.glows.forEach((g, i) => {
            if (!g.block.parent) return;
            const pulse = 0.7 + Math.sin(time * 2.5 + i) * 0.3;
            g.sprite.scale.set(4 * pulse, 4 * pulse, 1);
            g.sprite.material.opacity = 0.4 + Math.sin(time * 3 + i) * 0.3;
        });
    },

    spawnBreakParticles(pos, color, count = 15) {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const vel = [];
        for (let i = 0; i < count; i++) {
            positions[i * 3] = pos.x + (Math.random() - 0.5);
            positions[i * 3 + 1] = pos.y + (Math.random() - 0.5);
            positions[i * 3 + 2] = pos.z + (Math.random() - 0.5);
            vel.push({ x: (Math.random() - 0.5) * 0.08, y: Math.random() * 0.1, z: (Math.random() - 0.5) * 0.08 });
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({ color, size: 0.15, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
        const pts = new THREE.Points(geo, mat);
        GameScene.scene.add(pts);

        let life = 1.0;
        const anim = () => {
            life -= 0.03;
            if (life <= 0) { GameScene.scene.remove(pts); geo.dispose(); mat.dispose(); return; }
            const p = geo.attributes.position.array;
            for (let i = 0; i < count; i++) {
                p[i * 3] += vel[i].x; p[i * 3 + 1] += vel[i].y; p[i * 3 + 2] += vel[i].z;
                vel[i].y -= 0.004;
            }
            geo.attributes.position.needsUpdate = true;
            mat.opacity = life;
            requestAnimationFrame(anim);
        };
        anim();
    }
};
window.VisualEffects = VisualEffects;
