// Inicialización del juego
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 MATH QUEST 3D - Iniciando...');
    
    // Inicializar sistemas
    AudioSystem.init();
    if (window.TextureGenerator) TextureGenerator.init();
    GameState.init();
    GameScene.init();
    Player.init();
    
    // Iniciar loop de renderizado
    GameScene.animate();
    
    // Configurar eventos de UI
    MenuManager.init();
    HUD.init();
    Modal.init();
    Minimap.init();
    
    console.log('✅ Juego listo');
});