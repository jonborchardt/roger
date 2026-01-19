/**
 * Response text database for the game
 */

export const replies = {
  greet: 'You are alone in a junk bay. The greeting is noted anyway.',
  thanks: 'You are welcome. The bay remains unimpressed.',
  help:
    'Try: look, examine, search, scan, read, smell, listen, touch, take, use, press, clean, open, enter, talk, inventory. ' +
    'Ask about the archway, the machine, the symbols, the stains, the red disc, the blue box, or Roger.',
  statusPrefix: 'Status:',
  inventoryEmpty: 'You have nothing. Not even dignity. Just pockets.',
  inventoryPrefix: 'Inventory:',
  empty:
    'Say something. The bay is dark-blue, industrial, and stubbornly uninterested in your silence.',

  lookAreaA:
    'A dark-blue industrial bay. Rubble and metal fragments on the floor. A red disc, a blue box with a cylinder on it, ' +
    'a powered machine on the left with a blue glow, and an archway on the right that leads somewhere worse.',
  lookAreaB:
    'You are in a gritty junk bay with blue walls and a cold ceiling grid. Stains and symbols mark the back wall. ' +
    'Scrap and rubble underfoot. An archway to the right. A powered machine to the left.',
  lookWalls:
    'The walls are blue and worn, lined horizontally like a cheap attempt at order. Stains and old scuffs argue with that.',
  lookCeiling:
    'Ceiling lights in a grid. Pipes and conduits threaded above like bad veins. The light is cold and unhelpful.',
  lookLightsWorking:
    'The ceiling grid lights hold steady. Just enough illumination to make the mess feel intentional.',
  lookLightsDead:
    'The lights are too dim to trust. The bay gives you silhouettes and doubt.',
  lookLightsFlicker:
    'The ceiling grid lights flicker with a tired rhythm. The room never gets fully dark, but it keeps threatening.',
  lookShadows:
    'Shadows pool under scrap and along the edges of the archway. Nothing moves, but you still watch them.',
  lookDeck:
    'The floor is a mix of grit and metal, like someone paved a disaster with welded plates.',
  lookRubble:
    'Grit, fragments, and small sharp lies. The kind of ground that punishes bare hands and rewards persistence.',
  lookDebris:
    'Broken components and scrap metal. Some pieces look like they were once important. Now they are just geometry.',
  lookPipes:
    'Old pipes. They look pressurized in the way a bad mood is pressurized.',
  lookVents:
    'Vents clogged with dust and industrial lint. Air still moves, reluctantly.',
  lookCables:
    'Loose cables snake around the edges. They look like they were unplugged in a hurry.',
  lookStains:
    'Green and orange stains streak the wall like chemical bruises. They are old enough to be part of the decor.',
  lookSymbols:
    'The wall markings look like compressed technical notes and warnings. Not decorative. More like triage.',
  lookPillar:
    'A central pillar divides the back wall. Practical, boring, and probably full of conduits.',
  lookArchway:
    'A blue archway frames a darker passage beyond. It looks like the only honest exit in the room.',
  lookMachine:
    'On the left, a bulky machine with multiple panels. A blue square glows in its center. A side coupling ' +
    'looks like it expects a cartridge and a latch.',
  lookPanel:
    'A wall panel sits flush with the plating. It has seams, faint scuffs, and the vibe of a system that punishes guessing.',
  lookGlow:
    'The blue glow is steady. It says power exists. It does not promise cooperation.',
  lookRedDisc:
    'A red circular component lies on the floor. Heavy-looking, precise-looking, and exactly the wrong color to ignore.',
  lookBlueCrate:
    'A blue square object sits among the rubble. Its casing is scuffed, but its edges are too clean to be pure trash.',
  lookSilverCylinder:
    'A silver cylinder rests on the blue box like a cartridge. It looks like it belongs in a socket.',
  lookSlimePresent:
    'A slick smear of grime glistens on the floor. It looks harmless until you imagine its hobbies.',
  lookSlimeAbsent:
    'No slime jumps out at you, but the bay still manages to feel dirty on principle.',

  smellMetal:
    'Cold metal, old dust, and stale machinery. The bay smells like work that never ends.',
  smellOzone:
    'Under the metal stink is a hint of ozone, like electrics warming dust.',
  listenHum:
    'A distant low hum and the faint tick of stressed lights. Big systems are running somewhere, for their own reasons.',
  listenQuiet:
    'Quiet enough that your breathing sounds loud. You do not like that.',
  touchColdMetal:
    'Cold metal. It steals heat from your fingers like it has been waiting.',
  touchRubble:
    'Grit and sharp fragments. You can feel how easy it would be to bleed for no reward.',
  touchPanel:
    'Cool and slightly tacky with grime. It feels like it has been hit in panic before.',
  touchSlime:
    'Slick, unpleasant, and instantly regrettable. You now know too much about it.',
  tasteNo: 'No. Absolutely not.',
  waitA: 'You wait. The bay waits back. Neither of you improves.',
  waitB:
    'You pause. The hum continues. Whatever comes next is still your problem.',
  jump: 'You jump. Gravity accepts this with a shrug. Nothing improves.',
  kickAir: 'You kick at the air. The air wins by not caring.',

  pressPanelDead:
    'You press around the panel seams. Nothing changes. Either it is locked out, or it is waiting for a condition.',
  pressPanelBeep:
    'A dull beep. Not a welcome, more like an acknowledgment that you exist.',
  readSymbolsFail:
    'You try to read the symbols. They are technical, compressed, and meant for someone trained and caffeinated.',
  readSymbolsSuccess:
    'You piece together a gist: power routing, a magnetic coupling note, and a service passage hint pointing through the archway.',
  scanMachine:
    'Powered, stable, missing at least one part. The coupling is the weak point. The glow is the only friendly liar here.',
  cleanWall:
    'You wipe at the stains. They smear, the color remains. You have improved nothing, just redistributed it.',
  cleanFloor:
    'You sweep aside grit with your foot. You uncover more grit. The bay is committed to itself.',

  takeRedDisc:
    'You pick up the red disc. It is heavier than it looks. You now have a very practical argument.',
  takeCylinder:
    'You take the silver cylinder. It clicks loose with suspicious ease.',
  takeBlueCrate:
    'You try to lift the blue box. It does not move. Bolted down or just hateful.',
  takeNothing:
    'You find nothing you can reasonably take without starting a new and worse problem.',
  searchFoundTab:
    'You sift through rubble and find a small metal tab with a notch, like it belongs to a latch mechanism. You keep it.',
  searchNothing:
    'You rummage and find grit, shards, and regret. Nothing useful.',
  throwDisc:
    'You throw the red disc. It clatters loudly, rolls, and stops against debris. Nothing attacks you. Yet.',
  kickRubble:
    'You kick rubble. It scatters and reveals nothing you wanted. The bay stays consistent.',

  useCylinderOnPanel:
    'You seat the cylinder against the panel edge. It chirps, and the blue glow steadies. Something just changed.',
  useCylinderOnMachineFail:
    'You try fitting the cylinder into the machine coupling. Close, but not right. It needs a latch or adapter.',
  useTabOnMachineSuccess:
    'You fit the metal tab into the coupling as a latch. The cylinder seats cleanly. The machine hum deepens and the glow steadies.',
  useTabMissing: 'You do not have anything latch-like to make that work.',
  useNothing:
    'You try, but nothing here cooperates. The bay is not impressed by initiative.',

  approachArchway:
    'You move toward the archway. Air beyond is cooler, and the lighting is worse. That is usually how progress feels.',
  enterArchwayBlocked:
    'You step toward the archway, then stop. The darkness beyond reads as trap. You can still go, but it will not be smart.',
  enterArchwaySafe:
    'You pass through the archway, following the service passage hint. The darkness does not immediately punish you. Progress.',
  talkGeneral: 'You talk. The bay listens with all the empathy of scrap metal.',
  talkRogerUnavailable:
    'Roger is not available for conversation right now. If he wakes up, it will probably because something has already gone wrong.',

  rogerWho:
    'Roger Wilco is a Xenonian space janitor who keeps stumbling into crises he is not trained for, and keeps surviving anyway.',
  rogerPattern:
    'He survives by moving, scavenging, and improvising. He slips through gaps, sabotages what matters, and runs before anyone notices.',
  rogerStatusNow:
    'Right now he is alone in an escape pod, asleep in a cryogenic chamber, drifting until something finds him. Nobody is coming with a parade.',
  rogerPastArcada:
    'He was a low-ranking custodian on a research ship when invaders seized it and stole a catastrophic device. He escaped seconds before the ship was destroyed.',
  rogerPastKerona:
    'He crash-landed on a barren world, got hunted, and scraped together tools and transport by taking desperate jobs and making them work.',
  rogerPastVohaul:
    'He was abducted as punishment for interfering with a previous plot. He escaped a labor-planet disaster, infiltrated a base, and ended the threat by sabotaging life support.',
  rogerMood:
    'Roger is not a confident hero. He is persistent, anxious, and stubbornly alive. Courage shows up when panic stops being useful.',
};
