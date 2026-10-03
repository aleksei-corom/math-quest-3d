// Sistema de voxels tipo Minecraft
const VoxelSystem = {
    voxels: [],
    
    // Crear voxel básico
    createVoxel(x, y, z, color, size = 1) {
        const geo = new THREE.BoxGeometry(size, size, size);
        const mat = new THREE.MeshLambertMaterial({ 
            color: color,
            flatShading: true
        });
        const voxel = new THREE.Mesh(geo, mat);
        voxel.position.set(x, y, z);
        voxel.castShadow = true;
        voxel.receiveShadow = true;
        return voxel;
    },
    
    // Crear estructura de voxels
    createVoxelStructure(structure, offsetX = 0, offsetY = 0, offsetZ = 0) {
        const group = new THREE.Group();
        
        structure.forEach(voxel => {
            const mesh = this.createVoxel(
                voxel.x + offsetX,
                voxel.y + offsetY,
                voxel.z + offsetZ,
                voxel.color,
                voxel.size || 1
            );
            group.add(mesh);
        });
        
        return group;
    },
    
    // Animar voxel (romper)
    breakVoxel(voxel, duration = 500) {
        const startTime = Date.now();
        const originalScale = voxel.scale.clone();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Encoger
            voxel.scale.set(
                originalScale.x * (1 - progress),
                originalScale.y * (1 - progress),
                originalScale.z * (1 - progress)
            );
            
            // Rotar
            voxel.rotation.x += 0.1;
            voxel.rotation.y += 0.1;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                GameScene.scene.remove(voxel);
            }
        };
        
        animate();
        AudioSystem.play('pickup');
    },
    
    // Crear partículas al romper
    createBreakParticles(position, color) {
        const particleCount = 10;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const mat = new THREE.MeshBasicMaterial({ color: color });
            const particle = new THREE.Mesh(geo, mat);
            
            particle.position.copy(position);
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                Math.random() * 0.2,
                (Math.random() - 0.5) * 0.2
            );
            particle.userData.life = 1;
            
            GameScene.scene.add(particle);
            particles.push(particle);
        }
        
        // Animar partículas
        const animate = () => {
            let allDead = true;
            
            particles.forEach(particle => {
                if (particle.userData.life > 0) {
                    particle.position.add(particle.userData.velocity);
                    particle.userData.velocity.y -= 0.01; // Gravedad
                    particle.userData.life -= 0.02;
                    particle.material.opacity = particle.userData.life;
                    particle.material.transparent = true;
                    allDead = false;
                } else {
                    GameScene.scene.remove(particle);
                }
            });
            
            if (!allDead) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
};

window.VoxelSystem = VoxelSystem;