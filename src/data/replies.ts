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

  // Extended look commands
  lookCablesPlugged:
    'The cables are plugged in now. The machine hum changed pitch. Something is listening.',
  lookStainsWiped:
    'You wiped the stains. They faded but did not vanish. The wall remembers anyway.',
  lookSymbolsWiped:
    'You cleaned the symbols. Dust is gone. A faint panel seam is now visible underneath.',
  lookMachinePoweredDown:
    'The machine is silent. The blue glow is dead. You made a choice.',
  lookPanelSeamVisible:
    'A narrow seam outlines a hidden panel in the wall. It was under the symbols the whole time.',
  lookGlowFlicker:
    'The blue glow flickers like a nervous tell. Power is unstable.',
  lookCoupling:
    'The coupling socket is designed for a cylinder and a latch. It looks specific and unforgiving.',
  lookUnder:
    'You peer under debris and crates. Grit, shadows, and nothing you want to meet.',
  lookBehind:
    'You look behind the pillar and crates. More rubble, dust, and disappointment.',
  lookSelf:
    'You are still here. Still upright. Still making choices. The bay does not congratulate you.',

  // Smell commands
  smellArchway:
    'The archway exhales cooler air tinged with rust and old machinery. Not inviting.',
  smellSlime:
    'The slime smells chemical and faintly organic. You wish you had not checked.',
  smellRubble:
    'Dust, metal shavings, and the ghost of welding fumes. The bay is a relic.',
  smellVents:
    'The vents smell like old air filters and neglect. Circulation exists, barely.',
  smellDisc:
    'The red disc smells like machine oil and purpose. It has been handled before.',

  // Listen commands
  listenArchway:
    'From the archway: a faint draft, distant drips, and the suggestion of worse acoustics.',
  listenMachineHum:
    'The machine hums with a low, steady pulse. It is doing something. You are not sure what.',
  listenMachineSilent:
    'The machine is silent now. No hum, no glow. Just dead weight and your choices.',

  // Touch commands
  touchGlow:
    'You reach toward the blue glow. It is warm, not hot. The machine does not appreciate your curiosity.',
  touchDisc:
    'The red disc is heavy, smooth, and cool. It feels engineered. Precise. Expensive.',
  touchCables:
    'The cables are thick and coated in grime. They still carry current. You feel the hum.',

  // Movement commands
  run: 'You run in place briefly. The bay does not care. Your heart rate does.',
  crouch:
    'You crouch low. The perspective changes. The rubble looks bigger. You feel smaller.',
  hide: 'You duck behind debris. Nothing is hunting you yet. The bay finds your paranoia charming.',
  climbPillar:
    'You try to climb the central pillar. It is smooth, vertical, and uninterested in your ambition.',
  climbWall:
    'You attempt to climb the wall. The panels are flush and offer no grip. Gravity wins.',
  climbCrate:
    'You try to climb onto the blue crate. It is bolted down and mocks your effort.',

  // Search/Scan/Read commands
  searchCrate:
    'You search around the blue crate. Dust, grit, and a faint outline where it was welded to the floor.',
  searchArea:
    'You search the general area. Rubble, scrap, old stains, and the persistent feeling of being watched by geometry.',
  scanArchway:
    'You scan the archway frame. Blue metal, no controls, no damage. Just an exit that knows more than you.',
  scanPanel:
    'You scan the wall panel. Flush seams, faint scuff marks, and the vibe of a system that punishes guessing.',
  readPanel:
    'You try to read the panel. No labels, no instructions. Just the silent judgment of bad design.',
  readStains:
    'You try to interpret the stains. They tell a story of spills, heat, and regret. Not helpful.',

  // Clean commands
  cleanStains:
    'You rub at the green and orange stains. They smear but do not vanish. The wall is stained in principle now.',
  cleanSymbolsReveal:
    'You wipe the symbols clean. Dust falls away. A hidden panel seam is now visible beneath.',
  cleanSymbols:
    'You clean the wall symbols. They are easier to read now, but still cryptic and technical.',
  cleanPanel:
    'You wipe the panel surface. Grime comes off on your hand. The panel still does not open.',
  cleanVents:
    'You clear dust from the vent slats. Air flow improves slightly. The bay breathes easier. You do not.',

  // Open/Close commands
  openArchway:
    'The archway is already open. It frames darkness and the promise of worse navigation.',
  closeArchway:
    'You cannot close the archway. It has no door, no seal, and no interest in your anxiety.',
  openPanelSeam:
    'You try to pry open the panel seam. It resists. You need leverage or a key.',
  openPanel:
    'You attempt to open the panel. It is locked, welded, or just stubborn. You are not sure which.',
  openCrate:
    'You try to open the blue crate. It has no visible latch or hinge. It is a sealed mystery.',
  openMachine:
    'You try to open the machine casing. It is bolted shut. The blue glow stares at you.',
  closePanel:
    'The panel is already closed. Or locked. Or just philosophically opposed to you.',
  closeCrate:
    'The crate does not open, so closing it is redundant. The bay appreciates your effort anyway.',

  // Push/Pull/Lift commands
  pushCrate:
    'You push the blue crate. It does not move. Bolted down or just hateful. Hard to say.',
  pullCrate:
    'You pull at the blue crate. It ignores you. The bay finds your optimism refreshing.',
  moveCrate:
    'You try to move the crate. It is welded to the floor. The floor wins.',
  pushMachine:
    'You push against the machine. It is bolted to the wall and hums smugly at you.',
  pullCables:
    'You tug at the cables. They shift but stay connected. Unplugging them might be wiser.',
  pushPanel:
    'You push the wall panel. It does not budge. Either locked or just committed to being a wall.',
  pullRubble:
    'You pull at rubble. It shifts, clatters, and reveals more rubble. The bay is consistent.',
  liftDebris:
    'You lift a fragment of debris. It is heavy, sharp, and useless. You set it back down.',

  // Take commands (failures)
  takeMachine:
    'You try to take the machine. It is bolted to the wall and powered. It is not portable.',
  takePanel:
    'You cannot take the wall panel. It is part of the wall. The wall is not negotiable.',
  takeWall:
    'You try to take the wall. The wall declines. You reconsider your approach to problem-solving.',
  takePipes:
    'The pipes are welded in place and probably pressurized. Taking them would be loud and final.',
  takeCables:
    'You try to take the cables. They are plugged in, heavy, and committed to their current role.',
  takeSlime:
    'You try to scoop up the slime. It is viscous, unpleasant, and not something you want in your pockets.',
  takeDebris:
    'You pick up a fragment of debris. It is sharp, useless, and immediately regrettable. You drop it.',

  // Throw commands
  throwDiscAtMachine:
    'You throw the red disc at the machine. It clangs loudly. The machine does not flinch. You feel less confident.',
  throwDiscAtArchway:
    'You throw the red disc toward the archway. It bounces, rolls, and stops in the rubble. The archway is unimpressed.',
  throwDiscAtPanel:
    'You throw the red disc at the wall panel. It hits with a metallic clang and falls. The panel remains sealed.',
  throwCylinder:
    'You throw the silver cylinder. It clatters across the floor and stops. You now have to go get it.',
  throwNothing:
    'You mime throwing something. The bay does not react. Your performance needs work.',

  // Kick commands
  kickCrate:
    'You kick the blue crate. It is bolted down. Your foot regrets the impulse.',
  kickMachine:
    'You kick the machine. It hums louder. You have made an enemy.',
  kickWall:
    'You kick the wall. The wall wins. Your foot loses. Physics remains undefeated.',

  // Use commands
  useDiscOnCrate:
    'You try using the red disc on the blue crate. Nothing clicks. Wrong tool, wrong target.',
  pryWithDisc:
    'You try to pry things open with the red disc. It is heavy but not shaped for leverage. No progress.',
  useDiscHint:
    'The red disc is heavy and precise. It looks like a component, not a tool. Find where it fits.',
  useCylinderHint:
    'The silver cylinder looks like a cartridge. The machine coupling might accept it.',

  // Smash/Break commands
  smashMachine:
    'You try to smash the machine. It is bolted, powered, and unimpressed. You lack the tools and the confidence.',
  smashPanel:
    'You try to smash the wall panel. It is flush and solid. You hurt your hand more than the panel.',
  smashWall:
    'You try to smash the wall. The wall is metal plating over structure. You are flesh. The wall wins.',
  smashCrate:
    'You try to smash the blue crate. It is durable, bolted down, and built to outlast your tantrum.',
  smashLights:
    'You consider smashing the ceiling lights. They are too high, and darkness would not improve your situation.',
  smashDisc:
    'You try to smash the red disc. It is solid, heavy, and engineered. You fail to damage it.',

  // Rub/Smear commands
  rubSlimeOnMachine:
    'You smear slime on the machine. It glistens there, gross and pointless. The machine does not thank you.',
  rubSlimeOnPanel:
    'You rub slime on the wall panel. It leaves a streak. You have made the bay marginally worse.',
  rubSlimeOnWall:
    'You smear slime on the wall. It joins the existing stains. The wall now has more character.',
  rubStains:
    'You rub at the stains with your hand. They smear. Your hand is now part of the problem.',

  // Toggle/Flip/Turn commands
  toggleLights:
    'You try to toggle the ceiling lights. They are controlled elsewhere. You lack a switch.',
  toggleMachineOff:
    'You power down the machine. The blue glow dies. The hum stops. Silence feels heavier.',
  toggleMachineOn:
    'You power up the machine. The blue glow returns. The hum resumes. Something is listening again.',
  turnDisc:
    'You try turning the red disc. It does not rotate or have any mechanism. It is just a disc.',
  turnCylinder:
    'You twist the silver cylinder. It does not rotate or unscrew. It is a sealed cartridge.',

  // Plug/Unplug commands
  plugCables:
    'You plug the loose cables into nearby sockets. The machine hum deepens. The blue glow steadies.',
  unplugCables:
    'You unplug the cables. The machine hum falters. The blue glow flickers nervously.',
  plugMachine:
    'You try plugging things into the machine. The coupling needs a cartridge and latch, not random cables.',

  // Shake commands
  shakeCrate:
    'You shake the blue crate. It does not move or rattle. Bolted, sealed, or just stubborn.',
  shakeDisc:
    'You shake the red disc. It is solid and does not rattle. No hidden parts, no surprises.',
  shakeCylinder:
    'You shake the silver cylinder. It is sealed and does not rattle. Whatever is inside is staying there.',

  // Approach/Enter commands
  approachMachine:
    'You move closer to the machine. The blue glow is brighter up close. The hum is deeper.',

  enterMachine:
    'You try to enter the machine. It is a bulky panel system, not a doorway. You are too ambitious.',

  // Social commands
  talkSelf:
    'You talk to yourself. You offer no new insights. The bay listens with detached curiosity.',
  talkMachine:
    'You address the machine. It hums in response, which is either acknowledgment or coincidence.',
  talkArchway:
    'You speak toward the archway. Your voice echoes faintly. No one answers. No one ever does.',
  shout:
    'You shout. Your voice bounces off metal walls and dies in rubble. The bay absorbs your frustration.',
  swear:
    'You let loose a string of profanity. The bay has heard worse. You feel slightly better anyway.',

  // Player action commands
  sit: 'You sit down on the cold floor. The grit is uncomfortable. You stand back up quickly.',
  sleep:
    'You try to sleep. The floor is cold, the lights are bright, and your survival instinct objects loudly.',
  pray: 'You pray. The bay remains indifferent. No divine intervention arrives. You are still on your own.',
  dance:
    'You dance briefly. The bay does not applaud. Your rhythm is fine, but your audience is rubble.',
  sing: 'You sing a few bars. Your voice echoes flatly. The bay does not request an encore.',
};
