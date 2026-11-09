// Start: erst Schrift und 3D-Modelle laden, dann das Spiel.
(async function () {
  try {
    const ff = new FontFace('Lilita One', b64ToBuf(ASSETS.font));
    await ff.load(); document.fonts.add(ff);
  } catch (e) { console.warn('Schrift konnte nicht geladen werden', e); }
  await loadAssets3D();
  document.getElementById('loading').remove();
  window.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: W,
    height: H,
    transparent: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [BootScene, MenuScene, CharSelectScene, SelectScene, MinigameScene, ControlsScene, StoryScene, LevelScene, HudScene],
  });
})();
