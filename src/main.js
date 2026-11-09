const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: '#0d0a14',
  pixelArt: false,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { y: 1500 }, debug: false } },
  scene: [BootScene, MenuScene, SelectScene, ControlsScene, StoryScene, LevelScene],
});
// Vollbild mit F11 oder Taste "B" im Menü ist Sache des Browsers; hier ein Shortcut:
window.addEventListener('keydown', e => { if (e.key === 'F' && e.shiftKey) game.scale.toggleFullscreen(); });
