# BRICK MUSOU

**English** | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

**▶ Play now: <https://brick.akiraxclaw.com>** (mirror: <https://brick-warriors.vercel.app>)

![BRICK MUSOU](assets/og.jpg)

A **brick-built Three Kingdoms hack-and-slash** made with **Three.js**, packed into **one HTML file**.
Heroes and officers are built from real **LDraw brick parts** embedded in the page. Soldiers, weapons,
horses, scenery, animation, effects, post-processing, music and sound are all generated in code:
no image, model or audio files.

- Up to **140 brick soldiers on screen** at once, and more than 200 KOs a minute at full speed
- **3-battle campaign**, **Endless Array** and a **Daily Challenge** where everyone gets the same setup
- **4 playable heroes**, each with 36 moves and their own Musou attack
- Keyboard, **gamepad** and **touch** (multi-touch virtual stick)
- English and Traditional Chinese, switchable at any time in Settings

> Brick minifigures are rigid bodies: elbows and knees don't bend, and shoulders and hips swing on one axis.
> That matched the game's existing pose system exactly, so every combat system (36-move combos, aerial
> attacks, guarding, riding) carried over without changing a line.

## Quick start

- **Play online**: <https://brick.akiraxclaw.com>
- **Run locally**: open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Three.js r160 loads from a CDN, so you need an internet connection.
Leaderboards need the Vercel backend (see [Leaderboards](#leaderboards--analytics)). Without it they show "not open yet".

## Campaign — Chapter I: The Allied Coalition

Main menu **Sortie** → **campaign map** → choose a hero → briefing → battle. Each battle has its own map, time of day,
officers, music and objectives. Complete the **◆ main objectives** to win. Each **◇ optional objective** you complete
raises your rank. Clearing a battle unlocks the next one.

| Battle | Setting | Main objective | Optional objectives | Officers |
|---|---|---|---|---|
| **Battle of Sishui Gate** | Morning mountain pass between cliffs | Capture 2 camps → the gate opens and **Hua Xiong** sallies out → defeat him | Defeat Hua Xiong within 60 s of his sally ("before the wine cools"); capture every camp | Hua Xiong |
| **Battle of Hulao Gate** | Dusk plain, armies on both flanks | Defeat **Lu Bu** (the gate opens when he arrives) | Defeat Hu Zhen and Li Su; capture every base | Hu Zhen, Li Su, Lu Bu |
| **Pursuit Through Luoyang** | Burning city at night | Defeat **Dong Zhuo** before he escapes through the north gate (if he escapes, you lose) | Defeat Xu Rong; 400 KOs | Xu Rong, Dong Zhuo |

- Sishui and Hulao are open from the start. Luoyang unlocks after you clear Hulao.
- At Hulao, the story advances on **KOs or time, whichever comes first**. Strong players push ahead faster; newer players still progress.
- Your rank (S/A/B/C) is weighted by KOs, max combo, remaining HP, clear time, optional objectives and difficulty.
  Records are kept per battle × difficulty.

### Officer signature moves

| Officer | Signature | How to beat it |
|---|---|---|
| Hua Xiong | **Charge**: a straight warning line appears, then he dashes along it with super armor | Sidestep when the line appears |
| Hu Zhen | **Archer volley**: calls down 3 arrow storms around you | Leave the red circles |
| Li Su | **Counter stance**: raises a guard (gold sparkles) during your combos; hitting him triggers an unblockable spin | Stop attacking while the stance is up |
| Xu Rong | **Ambush smoke**: retreats into smoke and summons 6 ambushers around you | Clear them with Musou |
| Lu Bu | Leaping cleave (red circle warning), whirlwind, enrages below 35 % HP | — |
| Dong Zhuo | Flees toward the north gate. When caught, he fights back for 5–7 s (unblockable leap stomp), then runs again | Sprint after him and burst with Musou |

Luoyang also has **falling burning debris**: a red circle warns you 1.2 s before it lands, and it hurts both sides.

## Heroes

| Hero | Weapon | Style | Musou | Finisher |
|---|---|---|---|---|
| Liu Bei (Xuande) | Twin Dragon Swords | Fastest, smoothest combos; balanced | **Twin Dragon Rage**: dashes forward (steerable), crossing slashes in a 210° arc | Leaping cross cut, radius 6.5 |
| Guan Yu (Yunchang) | Green Dragon Blade | Widest reach, big sweeping arcs | **Azure Dragon Tide**: three full 360° sweeps, each with a shockwave | Overhead cleave, radius 9 |
| Zhang Fei (Yide) | Serpent Spear | Strongest hits; charge attacks split the ground | **Roar of Yan**: repeated ground strikes with growing shockwaves that launch everything | Earth splitter, radius 11 |
| Lu Bu (Fengxian) | Sky Piercer halberd | **Unlocked by defeating Lu Bu** in any mode; fights alone, with no allies | **Peerless**: a moving halberd cyclone that slams the ground every 0.9 s | Radius 12 |

Measured against a full crowd: Guan Yu about 200 KOs per Musou, Zhang Fei about 190, Liu Bei about 100. Liu Bei is the
speed hero: his Musou mows a path forward instead of clearing a circle, so its KO count is intentionally lower.

The two heroes you don't pick join as **allied officers** with green name tags and officer-level strength. When knocked
down, they kneel for 25 s and then return. They never die permanently, but each knockdown costs 8 morale.

## Modes

| Mode | Description |
|---|---|
| **Campaign** | The three battles above. |
| **Quick Battle** | Jumps straight into your last battle with your last hero and difficulty. |
| **Endless Array** | Infinite waves, one every 40 s. Each wave adds 7 % enemy HP and 5 % attack. An officer arrives every 3 waves, and Lu Bu returns every 6. Rank S at wave 12. |
| **Daily Challenge** | Seeded by the date: **everyone in the world gets the same hero, difficulty and mutation** that day, plus the same opening formation of 48 soldiers. Tracks your streak. |

**Daily mutations** (one per day): Arrow Storm (twice as many archers) · Iron Wall (enemy HP +35 %) ·
Bloodlust (Musou gauge +70 %) · Last Stand (HP −40 %, ATK +30 %) · Low Morale (bases no longer affect morale).

> Daily runs are **not frame-identical**. The on-screen enemy cap scales with device performance, so a phone and a
> desktop never play exactly the same fight. The hero, difficulty, mutation and opening formation are fixed.

## Progression & collection

- **Hero levels 1–20**: you earn EXP for your own KOs (soldier 1, officer 25, boss 150; burn and chain-lightning kills count)
  plus a clear bonus scaled by rank. Each level adds +2 % HP, +1.5 % ATK and +1 % Musou gain, and applies mid-battle.
  Allied KOs and the title-screen demo give no EXP.
- **26 achievements** in four groups (combat, campaign, modes, collection). See the **Achievements** screen.
- **Outfits** unlocked by achievements: Liu Bei *White Robe*, Guan Yu *Gold Armor*, Zhang Fei *Black Armor*,
  Lu Bu *Crimson Armor*. Press **C** (gamepad △) on hero select to switch.
- **Weapon growth**: officers and Lu Bu always drop a glowing **weapon crate**. Each crate gives weapon level +1
  (max 10, +6 % ATK each) and an element. Weapon progress is saved between runs:

| Element | Effect |
|---|---|
| **Flame** | Burns for 3 s, damage every 0.5 s |
| **Thunder** | 18 % chance to chain to up to 3 nearby enemies |
| **Frost** | 40 % slow for 3 s, 12 % chance to freeze |

## Combat

### Keyboard & mouse

| Key | Action |
|---|---|
| `WASD` / arrows | Move |
| `J` / `Z` / left click | Attack (**6-hit combo**) |
| `K` / `X` | **Charge attack**: standing = C1, after hit N = C(N+1), C1–C6 |
| `Space` | Jump (`J` in the air = aerial slashes, `K` in the air = ground slam) |
| `H` / right mouse (hold) | **Guard**: −85 % frontal damage. Get hit within 0.15 s of raising guard for a **perfect guard** (no damage, time stop, +12 Musou, next hit ×1.5) |
| `L` / middle click | **Musou** (when the gauge is full; works mid-combo or while being hit) |
| `R` | Mount / dismount (near the horse) |
| `Shift` | Sprint |
| `Q` / `E` | Rotate camera |
| `M` · `Esc` · `Tab` | Mute · Pause · Difficulty (hero select) |

### Charge attacks (same meaning for every hero, with weapon-specific motions)

| Move | Input | Effect |
|---|---|---|
| C1 | K while standing | Guard-breaking lunge that pierces shields |
| C2 | after 1 hit | **Launcher** into aerial combos |
| C3 | after 2 hits | Triple strike, last hit **stuns** 2.6 s |
| C4 | after 3 hits | Wide spin, knocks back |
| C5 | after 4 hits | Rising cut into a sweep |
| C6 | after 5 hits | Area burst: shockwave that knocks back everything around you |

### Gamepad (Xbox / PlayStation / XInput, plug and play)

| Button | Action |
|---|---|
| Left stick / D-pad | Move (**analog**: push further to run faster) |
| Right stick · `L2` `R2` | Camera |
| `□`/`X` · `△`/`Y` · `×`/`A` · `○`/`B` | Attack · Charge · Jump · Musou |
| `R1`/`RB` · `L1`/`LB` · `L3` | Guard · Sprint · Mount |
| `Start` · `Select` | Pause · Difficulty (hero select) |

### Touch (phones & tablets)

Drag on the left half for a **floating virtual stick**. Drag on empty space on the right half to turn the camera.
Buttons: **ATK** (hold for auto-combo), **C**, **JMP**, **MUSOU**, **GRD** (hold), **MNT**, and **Ⅱ** to pause.
Multi-touch works, so you can move and attack at the same time. The game goes fullscreen, prefers landscape, and starts
touch devices at medium quality. Button size and opacity are adjustable.

### Riding

A horse waits on the battlefield. Walk up to it and press `R`. Riding gives speed 12 (16 when sprinting),
**tramples** enemies at speed, `J` gives alternating side slashes and `K` a charging strike.

### Bases & morale

Sishui has 3 camps and Hulao has 4 bases, all held by Dong Zhuo at the start. Each has a **garrison** (40 by default).
KOs near the base reduce it (soldier 1, officer 6), and at zero you capture it: the flag changes and it stays yours.
Bases held set **morale** (0 bases → 38, all → 90). Low morale spawns more enemies. High morale pushes the
background armies visibly toward the gate.

### Enemies & events

- **Swordsmen / spearmen**: basic troops that take turns attacking you
- **Archers** (after 12 KOs): keep their distance and don't shoot through their own lines
- **Shield troops** (after 20 KOs): block normal attacks from the front 120°; use charge attacks, Musou, or hit them from behind
- **Cavalry charge**: a red path warning, then riders trample everyone on it
- **Arrow rain** and **flank ambushes**, triggered by the director's pressure system: it pushes harder when you're on a streak
  and backs off for 8 s when you drop below 30 % HP

Enemies drop **meat buns** (HP) and **wine** (Musou). Defeating an officer triggers a slow-motion orbit shot.
Combo titles appear at 10/30/60/120, and KO medals pop at 50/100/200/300/500/1000.

## Difficulty

| Difficulty | Enemy HP | Enemy ATK | Enemy count | Boss HP |
|---|---|---|---|---|
| Easy | ×0.75 | ×0.45 | ×0.72 | ×0.75 |
| Normal | ×1 | ×1 | ×1 | ×1 |
| Chaos | ×1.35 | ×1.5 | ×1.2 | ×1.6 |

## Guidance & presentation

- **Pre-battle briefing**: historical context, main and optional objectives, and a top-down map of the gates, bases,
  Dong Zhuo's escape route and your starting position. Quick Battle and retries skip it.
- **Contextual tutorial** on your first run: one hint at a time (move → combo → charge → guard → Musou → bases →
  officers → horse → jump). The wording matches keyboard, gamepad or touch, and each hint closes once you do the move.
  You can turn it off or reset it in Settings.
- **Dialogue** with brick-face portraits for openings, officer entrances and defeats, boss arrivals, fallen allies,
  low HP, victory and Dong Zhuo nearing the gate.
- **Per-battle music**: Sishui is bright at 104 BPM, Hulao is 96 BPM, and Luoyang is an urgent 118 BPM chase.
- **Share card** (`S` on the results screen): a 1200×630 card built from the current battlefield frame, with portrait,
  mode, rank, KOs, combo and time. Share it (Web Share on mobile), copy the image, download it, or copy a one-line text
  summary that includes the game link.

## Leaderboards & analytics

- **Boards**: Daily (one per day), Endless (wave first, then KOs), and each battle × difficulty.
  Scores are sent **only when you press "Submit Score"** on the results screen. Each device keeps its best
  score per board, and renaming yourself carries it over.
- **Server checks**: clear time 15–3600 s, caps on KOs, combo and waves relative to time, and 12 submissions per IP per
  minute. A browser game can't be made cheat-proof; this only rejects obviously impossible scores.
- **Built-in analytics**: no third-party scripts and no personal data. The server only keeps daily totals:
  starts, wins and losses with duration, when players are defeated, ranks, Endless waves, mid-battle quits,
  language and device type.
- **Backend**: `api/score.js`, `api/event.js`, `api/stats.js` (Vercel Functions) with Upstash Redis.
  **Without a database**, the API returns `503 {enabled:false}`: the in-game board shows "not open yet", the submit
  row is hidden, and nothing else is affected.
- **Setup**: Vercel project → Storage / Marketplace → add **Upstash Redis** and connect it to the project
  (this injects `KV_REST_API_URL` / `KV_REST_API_TOKEN`), then redeploy. To read stats, set `STATS_TOKEN` and open
  `/api/stats?days=7&token=…` for plays, win rate, average clear time and quits per battle and difficulty.
- **Local testing**: `.claude/serve.mjs` includes an in-memory Redis mock, so `/api/*` works locally.
  `POST /__mock?on=0` simulates "not configured", and `?reset=1` clears the data.

## Settings & language

English is the default. Traditional Chinese can be selected in Settings and switches instantly without reloading.
Saves from older versions switch to English once, and a later choice of Chinese is remembered.
Every name, title, weapon, officer, base, difficulty, element, combo title and medal is translated.

Settings (saved in `localStorage`): master / music / SFX volume · quality (auto by FPS / high / mid / low) ·
camera sensitivity & invert · screen shake 0–150 % · gamepad rumble & dead zone · damage numbers · tutorial ·
touch buttons (auto / on / off), size & opacity · reset save data.

## Self-test

Add **`?selftest`** to the URL (e.g. <https://brick.akiraxclaw.com/?selftest>), or run `await GAME.selftest()` in the
console. The page fast-forwards the game with `tick()` through **31 scenarios** in about 15–20 s:

- **System**: title-screen demo, no leftover input after entering battle, every hero spawns, every Musou, Endless,
  Daily, pause → settings persist, language switch, touch, gamepad, no console errors
- **Progression**: Lu Bu locked → unlocked by defeating him → solo sortie and Peerless; levels and saves;
  achievements and outfits; weapon crates don't wipe level bonuses
- **Guidance**: dialogue order and music changes, briefing, contextual tutorial
- **Battles**: Hulao objectives and gate; Sishui camps → Hua Xiong sally → 60 s timer (and failing it);
  officer signatures; Luoyang flee → catch → Xu Rong → defeat; Dong Zhuo escaping means defeat; burning debris;
  campaign map → record → next battle; victory results and share card; defeat
- **Online**: leaderboard detection, submit row shown or hidden, typing a nickname doesn't trigger game keys,
  board navigation, and the server rejecting impossible scores. Locally, with the mock database, it also submits,
  renames, reads back and checks analytics. On production it is read-only and never writes to the boards.
- **Balance regressions**: a simulated player, using real inputs only, must capture a camp within 60 s and must catch
  Dong Zhuo on Normal. Both checks have caught real soft-lock bugs.

Each test uses a fixed random seed and restores `localStorage` (`musou.*`), settings, language and gamepad afterwards.
The suite was checked by deliberately breaking the game and confirming the tests fail.
`GAME.selftest({only:'無雙'})` runs only tests whose name contains the keyword. Test names are in Chinese.

## Technical notes

- **Data-driven stages**: `STAGES.<id>` describes the arena, spawns, officers and boss timing, bases, background armies,
  unit unlocks, events, objectives, lighting and a scene builder. `loadStage()` tears down the old world, freeing only
  uncached GPU resources, and rebuilds it. Moving the hard-coded Hulao map into this system was verified with a
  17-field structural fingerprint, with zero differences.
- **Objectives (`OBJ`)**: defeat / capture / kills, with `after`, `within` (in game time, so slow motion and cutscenes
  don't eat the clock), `optional`, `final` and custom fail conditions.
- **Scenery kit (`propKit`)**: ground, gatehouses with hinged gates, canyon walls, stepped brick mountains, burnable
  houses, banners, braziers, tents, barricades and watchtowers. Blocks are merged by color, so a whole ridge costs only a few draw calls.
- **Unified input**: `input.keys` is a Proxy that reads keyboard ∪ gamepad. Gamepad, touch and the title-screen bot all
  synthesize the same key codes and analog axes, so adding them changed no combat code.
- **i18n**: `I18N.zh` / `I18N.en` plus `T(key, …args)`. Data tables carry `en:{…}` read by `LN(obj, field)`.
  Static DOM uses `data-t` / `data-th` / `data-tp`.
- **Crowd rendering**: background armies (4 InstancedMesh × 200), interactive soldiers (cap 60 / 100 / 140 by
  performance tier) and an instanced corpse pool. Each soldier's parts are vertex-color baked into one mesh per joint
  (21 → 10 draw calls). 160 soldiers cost about 4.6 ms per frame.
- **Hero models**: heads, torsos, arms and legs are LDraw parts. Armor, faces and capes are printed onto them with
  canvas at load time, and headgear, beards and pauldrons are sculpted in code. Each hero, officer and Dong Zhuo is one
  entry in the `V2` table, and static parts under the same joint are merged. Mobs share one muted enemy color on purpose,
  so the heroes stand out. Add **`?v1`** to the URL to see the older plain models.
  On touch devices the prints are drawn at half resolution (a quarter of the texture memory, with no visible
  difference on a phone screen). A stage's officers and boss are built during the stage intro, so they don't
  stutter when they first appear.
- **Crowd density**: enemies spawn in a ring 13–23 units around the player instead of at the gate. Far soldiers move
  faster to catch up, stragglers are recycled, and they circle inside your attack range. The pressure system limits
  how many attack at once, never how many are present.
- **Adaptive performance**: `PERF` switches three tiers with hysteresis (bloom, shadows, pixel ratio, enemy caps, army size).
- **Rendering**: EffectComposer + UnrealBloomPass (HDR threshold above 1.0, so only effects glow), ACES Filmic,
  4× MSAA half-float targets. Verlet cloth for capes and skirts. Web Audio synthesizes all music and sound.
- **Share capture**: the renderer doesn't use `preserveDrawingBuffer`. The results screen renders and then calls
  `drawImage` in the same task, so screenshots cost nothing during play.

### Debug console

```js
GAME.step(5)                   // fast-forward 5 s (GAME.step(5,{render:false}) to skip rendering)
GAME.PERF.force(0)             // force the lowest performance tier
GAME.setDiff('shura')          // change difficulty
GAME.cavalry(); GAME.arrowRain(); GAME.flank()   // trigger events
GAME.director.P                // current pressure
GAME.spawnDrop(GAME.player.pos,'wbox','fire')    // spawn a Flame weapon crate
GAME.bases; GAME.morale.v; GAME.MOUNT            // bases, morale, horse state
```

## Credits

Minifigure part geometry comes from the **[LDraw.org parts library](https://library.ldraw.org/)**, licensed
**[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)** and obtained through the
[gkjohnson/ldraw-parts-library](https://github.com/gkjohnson/ldraw-parts-library) mirror. The parts were expanded
offline and embedded in `index.html`.

Everything else (soldiers, horses, weapons, scenery, textures, animation, effects, music and sound) is generated
by this project's code.

BRICK MUSOU is an independent fan project. It is **not affiliated with, sponsored or endorsed by the LEGO Group**.
LDraw is a community-maintained open brick CAD library, also unaffiliated with the LEGO Group.
