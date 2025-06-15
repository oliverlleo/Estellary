window.onload = function() {

    // --- 1. SELEÇÃO DE ELEMENTOS DO DOM ---
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const soundPermissionPopup = document.getElementById("soundPermissionPopup");
    const allowSoundBtn = document.getElementById("allowSoundBtn");
    const denySoundBtn = document.getElementById("denySoundBtn");
    const introScreen = document.getElementById("introScreen");
    const playButton = document.getElementById("playButton");
    const introVideo = document.getElementById("introVideo");
    const introMusic = document.getElementById("introMusic");
    const gameMusic = document.getElementById("gameMusic");
    const shotSound = document.getElementById("shotSound"); 
    const plasmaSound = document.getElementById("plasmaSound");
    const gameOverSound = document.getElementById("gameOverSound");
    const bossMusic = document.getElementById("bossMusic");
    const xpBarContainer = document.getElementById("xpBarContainer");
    const healthBarContainer = document.getElementById("healthBarContainer");
    const heatBarContainer = document.getElementById("heatBarContainer");
    const heatBarFill = document.getElementById("heatBarFill");
    const heatText = document.getElementById("heatText");
    const levelUpScreen = document.getElementById("levelUpScreen");
    const controls = document.getElementById("controls");
    const gameOverScreen = document.getElementById("gameOverScreen");
    const restartButton = document.getElementById("restartButton");
    const bossHealthBarContainer = document.getElementById("bossHealthBarContainer");
    const bossWarningBorder = document.getElementById("bossWarningBorder");

    // --- 2. ESTADO INICIAL E VARIÁVEIS GLOBAIS DO JOGO ---
    let animationFrameId = null;
    let soundEnabled = false;
    const gameState = {
        paused: false, level: 1, xp: 0, xpRequired: 5, sector: 1, time: 0, score: 0,
        bossActive: false, postBossMode: false, bossDefeats: 0, isGameOver: false
    };
    const initialPlayerStats = {
        maxHealth: 100, health: 100, baseDamage: 10, armor: 0, fireRate: 4, moveSpeed: 1.5,
        critChance: 0.05, critDamage: 1.5, projectileSpeed: 8, projectileRange: 1000,
        xpCollectionRadius: 100, cooldownReduction: 1, rotationSpeed: 5, luck: 0
    };
    let playerStats = { ...initialPlayerStats };
    const initialPlayerEffects = {
        bifurcatedShot: { active: false, level: 0 },
        plasmaCannon: { active: false, charges: 0, maxCharges: 4, cooldown: 0, cooldownDuration: 360 },
        missileStorm: { active: false, shotCount: 0 },
        orbitalDrones: { active: false, drones: [] },
        energyBlade: { active: false, duration: 0, cooldown: 0, angle: 0 },
        ricochetShot: false,
        chainLightning: false,
        battleFrenzy: { active: false, stacks: 0, timer: 0 },
        staticPulse: { active: false, cooldown: 0 },
        spectralCannon: false,
        reactiveShield: { active: false, cooldown: 0, shieldAmount: 0 },
        repulsionField: false,
        emergencyTeleport: { active: false, cooldown: 0 },
        nanobotRegeneration: false,
        invisibilityCloak: { active: false, cooldown: 0, duration: 0 },
        shieldOvercharge: { active: false, cooldown: 0, duration: 0 },
        hullShield: { active: false, shield: 0, maxShield: 0 }
    };
    let playerEffects = JSON.parse(JSON.stringify(initialPlayerEffects));

    const player = { x: 0, y: 0, angle: 0, vx: 0, vy: 0, size: 15, invisible: false };
    const bullets = [], asteroids = [], particles = [], missiles = [], xpOrbs = [], satellites = [], blueMeteors = [];
    let boss = null, lastSatelliteLaunch = 0, lastBlueMeteorWaveTime = 0;
    const keys = {};
    let mouseDown = false, chargeTime = 0;

    let keySequence = [];
    let sequenceTimeout;

    // Imagens do Jogo
    const playerShipImage = new Image(); playerShipImage.src = "player_ship.png";
    const projectileImage = new Image(); projectileImage.src = "projectile.png";
    const asteroidImage = new Image(); asteroidImage.src = "asteroid.png";
    const backgroundImage = new Image(); backgroundImage.src = "background.png";
    const earthImage = new Image(); earthImage.src = "terra.png";
    const moonImage = new Image(); moonImage.src = "lua.png";
    const satelliteImage = new Image(); satelliteImage.src = "satelite.png";
    const satelliteRedImage = new Image(); satelliteRedImage.src = "satelitered.png";
    const blueMeteorImage = new Image(); blueMeteorImage.src = "meteoroazul.png";
    const destroyedShipImage = new Image(); destroyedShipImage.src = "Navedestruida.png";
    const restartButtonImage = new Image(); restartButtonImage.src = "botaojogarnovamente.png";
    const gameOverMessageImage = new Image(); gameOverMessageImage.src = "ruim.png";
    const plasmaShotImage = new Image(); plasmaShotImage.src = "esferaplasma.png"; 
    const energyBladeImage = new Image(); energyBladeImage.src = "lamina.png"; 

    // Banco de Dados de Cartas
    const cardDatabase = [
        { id: "bifurcated_shot", name: "Tiro Bifurcado", description: "Adiciona +1 projétil ao disparo (máx 4).", type: "attack" },
        { id: "plasma_cannon", name: "Canhão de Plasma", description: "Ativa tiro carregado com 'X'. Upgrades dão +1 carga.", type: "attack" },
        { id: "missile_storm", name: "Tormenta de Mísseis", description: "Lança mísseis teleguiados.", type: "attack" },
        { id: "orbital_drones", name: "Disparos Orbitais", description: "Gera um drone que dispara.", type: "attack" },
        { id: "energy_blade", name: "Lâmina de Energia", description: "Laser giratório (tecla R).", type: "attack" },
        { id: "ricochet_shot", name: "Tiro Ricochete", description: "Projéteis ricocheteiam na tela.", type: "attack" },
        { id: "chain_lightning", name: "Cadeia de Raios", description: "Raio atinge múltiplos inimigos.", type: "attack" },
        { id: "battle_frenzy", name: "Frenesi de Batalha", description: "Aumenta cadência ao destruir.", type: "attack" },
        { id: "static_pulse", name: "Pulso Estático", description: "Onda de choque (tecla Q).", type: "attack" },
        { id: "spectral_cannon", name: "Canhão Espectral", description: "Tiros atravessam inimigos.", type: "attack" },
        { id: "reactive_shield", name: "Escudo Reativo", description: "Gera escudo ao sofrer dano.", type: "defense" },
        { id: "maneuver_thrusters", name: "Propulsores de Manobra", description: "Aumenta velocidade de movimento.", type: "defense" },
        { id: "adamantium_plating", name: "Placas de Adamântio", description: "Aumenta vida máxima e armadura.", type: "defense" },
        { id: "repulsion_field", name: "Campo de Repulsão", description: "Desvia projéteis inimigos.", type: "defense" },
        { id: "emergency_teleport", name: "Teleporte de Emergência", description: "Teleporte curto (tecla E).", type: "defense" },
        { id: "nanobot_regeneration", name: "Regeneração de Nanorobôs", description: "Regenera vida lentamente.", type: "defense" },
        { id: "scrap_attraction", name: "Atração de Sucata", description: "Aumenta raio de coleta de XP.", type: "defense" },
        { id: "invisibility_cloak", name: "Manto de Invisibilidade", description: "Atravessa inimigos (tecla I).", type: "defense" },
        { id: "shield_overcharge", name: "Sobrecarga de Escudo", description: "Escudos invulneráveis (tecla O).", type: "defense" },
        { id: "fine_calibration", name: "Calibragem Fina", description: "Aumenta velocidade dos projéteis.", type: "attribute" },
        { id: "combat_focus", name: "Foco de Combate", description: "Aumenta chance de crítico.", type: "attribute" },
        { id: "improved_reactor", name: "Reator Aprimorado", description: "Aumenta o ritmo de tiro.", type: "attribute" },
        { id: "expansion_modules", name: "Módulos de Expansão", description: "Aumenta o alcance dos tiros.", type: "attribute" },
        { id: "target_analyzer", name: "Analisador de Alvos", description: "Aumenta o dano crítico.", type: "attribute" },
        { id: "magnetic_collector", name: "Coletor Magnético", description: "Aumenta o raio de coleta de XP.", type: "attribute" },
        { id: "cooldown_reducer", name: "Redutor de Recarga", description: "Diminui recarga de habilidades.", type: "attribute" },
        { id: "explorer_luck", name: "Sorte do Explorador", description: "Aumenta a sorte.", type: "attribute" },
        { id: "reinforced_chassis", name: "Chassi Reforçado", description: "Aumenta vida máxima.", type: "health" },
        { id: "armor_plating", name: "Placas de Blindagem", description: "Adiciona armadura.", type: "health" },
        { id: "hull_shield", name: "Escudo de Fuselagem", description: "Converte vida em escudo.", type: "health" }
    ];

    // --- 3. DEFINIÇÕES DE FUNÇÕES ---
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function initGame() {
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        player.invisible = false; 
        asteroids.length = 0;
        for (let i = 0; i < 5; i++) createAsteroid("large");
        updateUI();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        gameLoop();
    }

    function createAsteroid(size, x, y, isFragment = false) {
        let healthMultiplier = 1;
        let damageMultiplier = 1;
        let speedMultiplier = 1 + (gameState.bossDefeats * 0.10);
        if (gameState.bossDefeats > 0) {
            healthMultiplier = 1.20;
            damageMultiplier = 1.25;
        }
        const baseSpeed = 2;
        const speed = baseSpeed * speedMultiplier;
        const asteroid = { 
            x: x || Math.random() * canvas.width, 
            y: y || Math.random() * canvas.height, 
            angle: Math.random() * Math.PI * 2, 
            angularVelocity: (Math.random() - 0.5) * 0.1, 
            size: size, isFragment: isFragment, targetSpeed: speed
        };
        if (isFragment) {
            const angle = Math.random() * Math.PI * 2;
            const pushSpeed = speed * 2.5;
            asteroid.vx = Math.cos(angle) * pushSpeed;
            asteroid.vy = Math.sin(angle) * pushSpeed;
        } else {
            asteroid.vx = (Math.random() - 0.5) * speed; 
            asteroid.vy = (Math.random() - 0.5) * speed; 
        }
        switch (size) {
            case "small": asteroid.radius = 15; asteroid.health = 10 * healthMultiplier; asteroid.damage = 15 * damageMultiplier; asteroid.xpReward = 1; break;
            case "medium": asteroid.radius = 30; asteroid.health = 40 * healthMultiplier; asteroid.damage = 30 * damageMultiplier; asteroid.xpReward = 5; break;
            case "large": asteroid.radius = 50; asteroid.health = 100 * healthMultiplier; asteroid.damage = 60 * damageMultiplier; asteroid.xpReward = 7; break;
        }
        asteroid.maxHealth = asteroid.health;
        if (!isFragment && Math.hypot(asteroid.x - player.x, asteroid.y - player.y) < 200) { 
            asteroid.x = player.x + (Math.random() > 0.5 ? 250 : -250); 
            asteroid.y = player.y + (Math.random() > 0.5 ? 250 : -250); 
        }
        asteroids.push(asteroid);
    }

    function createBlueMeteor() {
        const radius = (15 * 0.7) * 1.35;
        const x = Math.random() * canvas.width;
        const y = -radius; 
        blueMeteors.push({ x: x, y: y, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random(), radius: radius, damage: 20 });
    }

    function createBullet(x, y, angle, speed = playerStats.projectileSpeed, damage = playerStats.baseDamage, special = {}) {
        if (soundEnabled && !special.plasma) {
            shotSound.currentTime = 0;
            shotSound.volume = 0.5;
            shotSound.play();
        }
        bullets.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, damage, life: playerStats.projectileRange / speed, special, rotation: 0 });
    }

    function firePlasmaShot() {
        if (soundEnabled) {
            plasmaSound.currentTime = 0;
            plasmaSound.volume = 0.7;
            plasmaSound.play();
        }
        const special = { 
            plasma: true, 
            size: player.size * 5 
        };
        createBullet(player.x, player.y, player.angle, playerStats.projectileSpeed * 0.8, playerStats.baseDamage * 3, special);
    }

    function createMissile(x, y) {
        missiles.push({ x, y, vx: 0, vy: 0, target: null, speed: 6, damage: playerStats.baseDamage * 0.8, life: 300, angle: 0 });
    }

    function createXPOrb(x, y, amount) {
        xpOrbs.push({ x, y, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, amount, life: 600 });
    }

    function createParticles(x, y, count, color = "#fff") {
        for (let i = 0; i < count; i++) {
            particles.push({ x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 30 + Math.random() * 30, maxLife: 30 + Math.random() * 30, color, size: 2 + Math.random() * 3 });
        }
    }

    function spawnBoss() {
        if (soundEnabled) {
            gameMusic.pause();
            bossMusic.currentTime = 0;
            bossMusic.play();
        }
        gameState.bossActive = true;
        bossHealthBarContainer.classList.remove('hidden');
        bossWarningBorder.classList.remove('hidden');
        boss = {
            x: canvas.width / 2, y: -100, vx: 0, vy: 1, hasEntered: false, radius: 80,
            health: 500 * (1 + gameState.bossDefeats * 0.5), maxHealth: 500 * (1 + gameState.bossDefeats * 0.5),
            damage: 100, moon: { angle: 0, distance: 120, radius: 16 }
        };
        lastSatelliteLaunch = Date.now();
    }

    function createSatellite(x, y, side) {
        const baseAngle = Math.PI / 2;
        const separationAngle = Math.PI / 4;
        const spawnAngle = baseAngle + (side * separationAngle);
        const spawnX = x + Math.cos(spawnAngle) * (boss.radius + 10);
        const spawnY = y + Math.sin(spawnAngle) * (boss.radius + 10);
        const isElite = Math.random() < 0.20;

        if (isElite) {
            satellites.push({
                x: spawnX, y: spawnY, vx: 0, vy: 0,
                speed: 1.0, radius: 30, damage: 20 * 1.20,
                health: 30, isElite: true
            });
        } else {
            const impulseAngle = Math.random() * Math.PI * 2;
            const impulseForce = 10;
            satellites.push({
                x: spawnX, y: spawnY,
                vx: Math.cos(impulseAngle) * impulseForce,
                vy: Math.sin(impulseAngle) * impulseForce,
                speed: 1.2 * 1.15,
                radius: 20, damage: 20, health: 10,
                isElite: false, homingDelay: 45
            });
        }
    }

    function updatePlayer() {
        player.invisible = playerEffects.invisibilityCloak.duration > 0;
        
        let moveX = (keys["KeyD"] || keys["ArrowRight"] ? 1 : 0) - (keys["KeyA"] || keys["ArrowLeft"] ? 1 : 0);
        let moveY = (keys["KeyS"] || keys["ArrowDown"] ? 1 : 0) - (keys["KeyW"] || keys["ArrowUp"] ? 1 : 0);
        if (moveX !== 0 && moveY !== 0) { moveX *= 0.707; moveY *= 0.707; }
        if (moveX !== 0 || moveY !== 0) {
            const thrustPower = 0.4 * playerStats.moveSpeed;
            player.vx += moveX * thrustPower;
            player.vy += moveY * thrustPower;
            player.angle = Math.atan2(moveY, moveX);
        }
        
        player.vx *= 0.95; player.vy *= 0.95;
        const maxSpeed = playerStats.moveSpeed * 1.5;
        const speed = Math.hypot(player.vx, player.vy);
        if (speed > maxSpeed) { player.vx = (player.vx / speed) * maxSpeed; player.vy = (player.vy / speed) * maxSpeed; }
        player.x += player.vx; player.y += player.vy;

        if (gameState.bossActive) {
            if (player.x - player.size < 0) player.x = player.size;
            if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
            if (player.y - player.size < 0) player.y = player.size;
            if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;
        } else {
            if (player.x < 0) player.x = canvas.width; if (player.x > canvas.width) player.x = 0;
            if (player.y < 0) player.y = canvas.height; if (player.y > canvas.height) player.y = 0;
        }

        Object.values(playerEffects).forEach(effect => { 
            if (effect && typeof effect === 'object') {
                if (effect.cooldown > 0) effect.cooldown--; 
                if (effect.duration > 0) effect.duration--;
            }
        });
        if (playerEffects.battleFrenzy.timer > 0) playerEffects.battleFrenzy.timer--; else playerEffects.battleFrenzy.stacks = 0;
        if (playerEffects.nanobotRegeneration && playerStats.health < playerStats.maxHealth) playerStats.health += 0.05;
        if (playerEffects.hullShield.active && playerEffects.hullShield.shield < playerEffects.hullShield.maxShield) playerEffects.hullShield.shield += 0.1;
        playerStats.health = Math.min(playerStats.health, playerStats.maxHealth);

        if (playerEffects.plasmaCannon.active && playerEffects.plasmaCannon.cooldown > 0) {
            if (playerEffects.plasmaCannon.cooldown <= 1) {
                playerEffects.plasmaCannon.charges = playerEffects.plasmaCannon.maxCharges;
            }
        }
    }
    
    function updateEnergyBlade() {
        if (!playerEffects.energyBlade.active || playerEffects.energyBlade.duration <= 0) return;
        playerEffects.energyBlade.angle += 0.05;
        const bladeLength = 80;
        const bladeRadius = bladeLength / 2;
        const angle = playerEffects.energyBlade.angle;
        const p1x = player.x + Math.cos(angle) * bladeRadius;
        const p1y = player.y + Math.sin(angle) * bladeRadius;
        const p2x = player.x - Math.cos(angle) * bladeRadius;
        const p2y = player.y - Math.sin(angle) * bladeRadius;
    
        if (!player.invisible) {
            const allEnemies = [...asteroids, ...satellites];
            if(boss) allEnemies.push(boss);
            allEnemies.forEach(enemy => {
                const dist1 = Math.hypot(p1x - enemy.x, p1y - enemy.y);
                const dist2 = Math.hypot(p2x - enemy.x, p2y - enemy.y);
                if (dist1 < enemy.radius || dist2 < enemy.radius) {
                    enemy.health -= 0.5;
                }
            });
        }
    }

    function updateBullets() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.x += b.vx;
            b.y += b.vy;
            b.life--;

            if (b.special && b.special.plasma) {
                b.rotation += 0.1;
            }

            if (playerEffects.ricochetShot) {
                if (b.x < 0 || b.x > canvas.width) b.vx *= -1;
                if (b.y < 0 || b.y > canvas.height) b.vy *= -1;
            }
            if (b.life <= 0) bullets.splice(i, 1);
        }
    }

    function updateMissiles() {
        if (gameState.bossActive) return;
        for (let i = missiles.length - 1; i >= 0; i--) {
            const m = missiles[i];
            if (!m.target || m.target.health <= 0) m.target = asteroids.reduce((closest, ast) => (Math.hypot(m.x - ast.x, m.y - ast.y) < Math.hypot(m.x - (closest?.x || Infinity), m.y - (closest?.y || Infinity)) ? ast : closest), null);
            if (m.target) {
                const angleToTarget = Math.atan2(m.target.y - m.y, m.target.x - m.x);
                m.vx = Math.cos(angleToTarget) * m.speed; m.vy = Math.sin(angleToTarget) * m.speed; m.angle = angleToTarget;
            }
            m.x += m.vx; m.y += m.vy; m.life--;
            if (m.life <= 0) missiles.splice(i, 1);
        }
    }

    function updateAsteroids() {
        if (asteroids.length === 0 && !gameState.bossActive && boss === null) spawnBoss();
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const a = asteroids[i];
            if (a.isFragment) {
                a.vx *= 0.98; a.vy *= 0.98;
                if(Math.hypot(a.vx, a.vy) < a.targetSpeed) a.isFragment = false;
            }
            a.x += a.vx; a.y += a.vy; a.angle += a.angularVelocity;
            if (a.x < -a.radius) a.x = canvas.width + a.radius; if (a.x > canvas.width + a.radius) a.x = -a.radius;
            if (a.y < -a.radius) a.y = canvas.height + a.radius; if (a.y > canvas.height + a.radius) a.y = -a.radius;
            if (!player.invisible && !gameState.isGameOver && !(playerEffects.shieldOvercharge.duration > 0) && Math.hypot(player.x - a.x, player.y - a.y) < a.radius + player.size) {
                takeDamage(a.damage);
                createParticles(player.x, player.y, 15, "#ff8c00");
                const angleOfCollision = Math.atan2(player.y - a.y, player.x - a.x);
                const pushForce = 2;
                player.vx += Math.cos(angleOfCollision) * pushForce;
                player.vy += Math.sin(angleOfCollision) * pushForce;
                a.vx -= Math.cos(angleOfCollision) * pushForce;
                a.vy -= Math.sin(angleOfCollision) * pushForce;
            }
            for (let j = bullets.length - 1; j >= 0; j--) {
                const b = bullets[j];
                if (!player.invisible && Math.hypot(b.x - a.x, b.y - a.y) < a.radius) {
                    a.health -= b.damage;
                    createParticles(b.x, b.y, 5, "#FFD700");
                    if (!b.special.spectral) bullets.splice(j, 1);
                    if (a.health <= 0) { handleAsteroidDestruction(a, i); break; }
                }
            }
            if (i >= asteroids.length || asteroids[i].health <= 0) continue;
            for (let j = missiles.length - 1; j >= 0; j--) {
                if (Math.hypot(missiles[j].x - a.x, missiles[j].y - a.y) < a.radius) {
                    a.health -= missiles[j].damage;
                    createParticles(missiles[j].x, missiles[j].y, 10, "#FF4500");
                    missiles.splice(j, 1);
                    if (a.health <= 0) { handleAsteroidDestruction(a, i); break; }
                }
            }
        }
    }

    function updateBoss() {
        if (!boss) return;
        if (!boss.hasEntered) {
            boss.y += boss.vy;
            if (boss.y >= 150) {
                boss.hasEntered = true;
                boss.vx = (Math.random() > 0.5 ? 1 : -1) * 0.4;
            }
        } else {
            boss.x += boss.vx;
            if (boss.x - boss.radius < 0 || boss.x + boss.radius > canvas.width) boss.vx *= -1;
        }
        boss.moon.angle += 0.02;
        const moonX = boss.x + Math.cos(boss.moon.angle) * boss.moon.distance;
        const moonY = boss.y + Math.sin(boss.moon.angle) * boss.moon.distance;
        if (Date.now() - lastSatelliteLaunch > 2000) {
            createSatellite(boss.x, boss.y, -1);
            createSatellite(boss.x, boss.y, 1);
            lastSatelliteLaunch = Date.now();
        }
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            let hit = false;
            if (Math.hypot(b.x - moonX, b.y - moonY) < boss.moon.radius) {
                createParticles(b.x, b.y, 3, "#cccccc");
                hit = true;
            } else if (!player.invisible && Math.hypot(b.x - boss.x, b.y - boss.y) < boss.radius) {
                boss.health -= b.damage;
                createParticles(b.x, b.y, 5, "#ff4500");
                hit = true;
            }
            if (hit) bullets.splice(i, 1);
        }
        if (!player.invisible && !gameState.isGameOver) {
            if (Math.hypot(player.x - boss.x, player.y - boss.y) < boss.radius + player.size) takeDamage(boss.damage);
            if (Math.hypot(player.x - moonX, player.y - moonY) < boss.moon.radius + player.size) takeDamage(50);
        }
        updateBossUI();
        if (boss.health <= 0) {
            createParticles(boss.x, boss.y, 300, "#ffffff");
            if (soundEnabled) {
                bossMusic.pause();
                gameMusic.currentTime = 0;
                gameMusic.play();
            }
            gameState.bossActive = false;
            boss = null;
            satellites.length = 0; 
            bossHealthBarContainer.classList.add('hidden');
            bossWarningBorder.classList.add('hidden');
            gameState.postBossMode = true;
            gameState.bossDefeats++;
            lastBlueMeteorWaveTime = Date.now();
            for (let i = 0; i < 7; i++) createAsteroid("large");
        }
    }

    function updateSatellites() {
        for (let i = satellites.length - 1; i >= 0; i--) {
            const s = satellites[i];

            if (s.homingDelay && s.homingDelay > 0) {
                s.x += s.vx;
                s.y += s.vy;
                s.vx *= 0.98; 
                s.vy *= 0.98;
                s.homingDelay--;
            } else {
                const angleToPlayer = Math.atan2(player.y - s.y, player.x - s.x);
                s.vx = Math.cos(angleToPlayer) * s.speed;
                s.vy = Math.sin(angleToPlayer) * s.speed;
                s.x += s.vx;
                s.y += s.vy;
            }
            
            for (let j = bullets.length - 1; j >= 0; j--) {
                const b = bullets[j];
                if (!player.invisible && Math.hypot(b.x - s.x, b.y - s.y) < s.radius) {
                    s.health -= b.damage;
                    createParticles(b.x, b.y, 3, "#ffff00");
                    bullets.splice(j, 1);
                    if (s.health <= 0) {
                        createParticles(s.x, s.y, 15, "#ffa500");
                        satellites.splice(i, 1);
                        break; 
                    }
                }
            }
            
            if (i >= satellites.length) continue;

            if (!player.invisible && !gameState.isGameOver) {
                const noseX = player.x + Math.cos(player.angle) * (player.size * 0.5);
                const noseY = player.y + Math.sin(player.angle) * (player.size * 0.5);
                const distCenter = Math.hypot(player.x - s.x, player.y - s.y);
                const distNose = Math.hypot(noseX - s.x, noseY - s.y);
                if (distCenter < s.radius + player.size * 0.8 || distNose < s.radius + player.size * 0.5) {
                    takeDamage(s.damage);
                    createParticles(s.x, s.y, 10, "#ffff00");
                    satellites.splice(i, 1);
                    continue; 
                }
            }
        }
    }

    function updateBlueMeteors() {
        if (gameState.postBossMode && Date.now() - lastBlueMeteorWaveTime > 13000) {
            const probability = [3, 3, 3, 4, 4, 5, 5, 6, 7];
            const amount = probability[Math.floor(Math.random() * probability.length)];
            for(let i=0; i<amount; i++) createBlueMeteor();
            lastBlueMeteorWaveTime = Date.now();
        }
        for (let i = blueMeteors.length - 1; i >= 0; i--) {
            const bm = blueMeteors[i];
            bm.x += bm.vx; bm.y += bm.vy;
            if (!player.invisible && !gameState.isGameOver && Math.hypot(player.x - bm.x, player.y - bm.y) < bm.radius + player.size) {
                takeDamage(bm.damage);
                createParticles(bm.x, bm.y, 15, "#00BFFF");
                blueMeteors.splice(i, 1);
                continue;
            }
            if(bm.y > canvas.height + bm.radius) blueMeteors.splice(i, 1);
        }
    }

    function handleAsteroidDestruction(asteroid, index) {
        createParticles(asteroid.x, asteroid.y, 20, "#A9A9A9");
        createXPOrb(asteroid.x, asteroid.y, asteroid.xpReward);
        gameState.score += asteroid.xpReward;
        if (asteroid.size === "large") { createAsteroid("medium", asteroid.x, asteroid.y, true); createAsteroid("medium", asteroid.x, asteroid.y, true); }
        else if (asteroid.size === "medium") { for(let i=0; i<4; i++) createAsteroid("small", asteroid.x, asteroid.y, true); }
        asteroids.splice(index, 1);
        if (playerEffects.battleFrenzy.active) { playerEffects.battleFrenzy.stacks++; playerEffects.battleFrenzy.timer = 300; }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy; p.life--;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function updateXPOrbs() {
        for (let i = xpOrbs.length - 1; i >= 0; i--) {
            const orb = xpOrbs[i];
            orb.life--;
            const dist = Math.hypot(player.x - orb.x, player.y - orb.y);
            if (dist < playerStats.xpCollectionRadius) {
                const angleToPlayer = Math.atan2(player.y - orb.y, player.x - orb.x);
                orb.vx = Math.cos(angleToPlayer) * 5; orb.vy = Math.sin(angleToPlayer) * 5;
            } else {
                orb.vx *= 0.98; orb.vy *= 0.98;
            }
            orb.x += orb.vx; orb.y += orb.vy;
            if (dist < 15 && !gameState.isGameOver) { gainXP(orb.amount); xpOrbs.splice(i, 1); }
            else if (orb.life <= 0) xpOrbs.splice(i, 1);
        }
    }

    function drawPlayer() {
        if (player.invisible) {
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.translate(player.x, player.y);
            ctx.rotate(player.angle);
            ctx.drawImage(playerShipImage, -player.size, -player.size, player.size * 2, player.size * 2);
            ctx.restore();
        } else {
            ctx.save();
            ctx.translate(player.x, player.y);
            ctx.rotate(player.angle);
            ctx.drawImage(playerShipImage, -player.size, -player.size, player.size * 2, player.size * 2);
            ctx.restore();
        }

        if (playerEffects.shieldOvercharge.duration > 0) { ctx.beginPath(); ctx.arc(player.x, player.y, player.size * 1.5, 0, Math.PI * 2); ctx.strokeStyle = `rgba(255, 223, 0, ${0.5 + Math.sin(Date.now() / 100) * 0.2})`; ctx.lineWidth = 4; ctx.stroke(); }
        if (playerEffects.hullShield.active) { ctx.beginPath(); ctx.arc(player.x, player.y, player.size * 1.2, 0, Math.PI * 2 * (playerEffects.hullShield.shield / playerEffects.hullShield.maxShield)); ctx.strokeStyle = "rgba(135, 206, 250, 0.7)"; ctx.lineWidth = 3; ctx.stroke(); }
    }
    
    function drawEnergyBlade() {
        if (!playerEffects.energyBlade.active || playerEffects.energyBlade.duration <= 0) return;
    
        const bladeLength = 90; 
        const bladeWidth = 15; 
        const angle = playerEffects.energyBlade.angle;
    
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(angle);
        ctx.drawImage(energyBladeImage, -bladeLength / 2, -bladeWidth / 2, bladeLength, bladeWidth);
        ctx.restore();
    }

    function drawBullets() {
        for (const b of bullets) {
            ctx.save();
            ctx.translate(b.x, b.y);
            
            if (b.special && b.special.plasma) {
                const size = b.special.size;
                ctx.rotate(b.rotation);
                ctx.drawImage(plasmaShotImage, -size / 2, -size / 2, size, size);
            } else {
                ctx.drawImage(projectileImage, -5, -5, 10, 10);
            }
            
            ctx.restore();
        }
    }

    function drawMissiles() { for (const m of missiles) { ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.angle); ctx.fillStyle = "orange"; ctx.fillRect(-5, -2, 10, 4); ctx.restore(); } }

    function drawXPOrbs() { for (const orb of xpOrbs) { ctx.fillStyle = "#00FF00"; ctx.beginPath(); ctx.arc(orb.x, orb.y, 5, 0, Math.PI * 2); ctx.fill(); } }

    function drawParticles() { for (const p of particles) { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2); ctx.fill(); } }

    function drawAsteroids() {
        for (const a of asteroids) {
            if (a.loadSuccess !== false) ctx.drawImage(asteroidImage, a.x - a.radius, a.y - a.radius, a.radius * 2, a.radius * 2);
            const barX = a.x - a.radius, barY = a.y - a.radius - 10;
            ctx.fillStyle = "red"; ctx.fillRect(barX, barY, a.radius * 2, 5);
            ctx.fillStyle = "lime"; ctx.fillRect(barX, barY, a.radius * 2 * (a.health / a.maxHealth), 5);
        }
    }

    function drawBoss() {
        if (!boss) return;
        const moonX = boss.x + Math.cos(boss.moon.angle) * boss.moon.distance;
        const moonY = boss.y + Math.sin(boss.moon.angle) * boss.moon.distance;
        if (earthImage.loadSuccess !== false) ctx.drawImage(earthImage, boss.x - boss.radius, boss.y - boss.radius, boss.radius * 2, boss.radius * 2);
        if (moonImage.loadSuccess !== false) ctx.drawImage(moonImage, moonX - boss.moon.radius, moonY - boss.moon.radius, boss.moon.radius * 2, boss.moon.radius * 2);
    }

    function drawSatellites() {
        for (const s of satellites) {
            const imageToDraw = s.isElite ? satelliteRedImage : satelliteImage;
            if (imageToDraw.loadSuccess !== false) {
                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(Math.atan2(s.vy, s.vx) + Math.PI / 2);
                
                if (s.isElite) {
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                    ctx.beginPath();
                    ctx.arc(0, 0, s.radius * 1.2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.drawImage(imageToDraw, -s.radius, -s.radius, s.radius * 2, s.radius * 2);
                ctx.restore();
            }
        }
    }

    function drawBlueMeteors() {
        for (const bm of blueMeteors) {
            if (blueMeteorImage.loadSuccess !== false) ctx.drawImage(blueMeteorImage, bm.x - bm.radius, bm.y - bm.radius, bm.radius * 2, bm.radius * 2);
        }
    }

    let lastFireTime = 0;
    function fireBullet() {
        const now = Date.now();
        const fireRateWithBonus = playerStats.fireRate * (1 + playerEffects.battleFrenzy.stacks * 0.1);
        if (now - lastFireTime > 1000 / fireRateWithBonus) {
            let damage = playerStats.baseDamage;
            if (Math.random() < playerStats.critChance) damage *= playerStats.critDamage;
            const special = { spectral: playerEffects.spectralCannon };
            
            if (playerEffects.bifurcatedShot.active) {
                const numShots = playerEffects.bifurcatedShot.level + 1;
                const totalAngle = 0.25 * numShots;
                for (let i = 0; i < numShots; i++) {
                    const angleOffset = -totalAngle / 2 + (i * (totalAngle / (numShots - 1 || 1)));
                    createBullet(player.x, player.y, player.angle + angleOffset, playerStats.projectileSpeed, damage * 0.7, special);
                }
            } else {
                createBullet(player.x, player.y, player.angle, playerStats.projectileSpeed, damage, special);
            }

            lastFireTime = now;
            if (playerEffects.missileStorm.active && ++playerEffects.missileStorm.shotCount >= 10) { createMissile(player.x, player.y); playerEffects.missileStorm.shotCount = 0; }
        }
    }

    function takeDamage(amount) {
        if (playerStats.health <= 0) return;
        const finalDamage = Math.max(0, amount - playerStats.armor);
        if (playerEffects.hullShield.active && playerEffects.hullShield.shield > 0) {
            playerEffects.hullShield.shield -= finalDamage;
            if (playerEffects.hullShield.shield < 0) {
                playerStats.health += playerEffects.hullShield.shield;
                playerEffects.hullShield.shield = 0;
            }
        } else {
            playerStats.health -= finalDamage;
        }
        if (playerStats.health <= 0) { playerStats.health = 0; gameOver(); }
        updateUI();
    }

    function gainXP(amount) {
        if (gameState.bossActive || gameState.isGameOver) return;
        gameState.xp += amount;
        if (gameState.xp >= gameState.xpRequired) levelUp();
        updateUI();
    }

    function levelUp() {
        gameState.level++; 
        gameState.xp -= gameState.xpRequired; 
        gameState.xpRequired = Math.floor(5 * Math.pow(gameState.level, 1.5));
        playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + playerStats.maxHealth * 0.20);
        updateUI();
        showLevelUpScreen();
    }

    function showLevelUpScreen() {
        cancelAnimationFrame(animationFrameId);
        gameState.paused = true;
        levelUpScreen.classList.remove("hidden");
        const cardContainer = document.getElementById("cardContainer");
        cardContainer.innerHTML = "";
        const availableCards = cardDatabase.sort(() => 0.5 - Math.random()).slice(0, 3);
        availableCards.forEach(card => {
            const cardElement = document.createElement("div");
            cardElement.className = "card";
            cardElement.innerHTML = `<h3>${card.name}</h3><p>${card.description}</p><button>Escolher</button>`;
            cardContainer.appendChild(cardElement);
            cardElement.querySelector("button").addEventListener("click", () => {
                applyCardEffect(card);
                levelUpScreen.classList.add("hidden");
                gameState.paused = false;
                gameLoop();
            });
        });
    }

    function applyCardEffect(card) {
        switch(card.id) {
            case "bifurcated_shot":
                playerEffects.bifurcatedShot.active = true;
                if(playerEffects.bifurcatedShot.level < 3) {
                    playerEffects.bifurcatedShot.level++;
                }
                break;
            case "plasma_cannon": 
                playerEffects.plasmaCannon.active = true;
                playerEffects.plasmaCannon.maxCharges++;
                playerEffects.plasmaCannon.charges++;
                heatBarContainer.classList.remove('hidden');
                break;
            case "missile_storm": playerEffects.missileStorm.active = true; break;
            case "orbital_drones":
                playerEffects.orbitalDrones.active = true;
                const newDroneAngle = Math.random() * Math.PI * 2;
                playerEffects.orbitalDrones.drones.push({ angleOffset: newDroneAngle, dist: 60, fireRate: 1, lastFire: 0 });
                break;
            case "energy_blade": playerEffects.energyBlade.active = true; break;
            case "ricochet_shot": playerEffects.ricochetShot = true; break;
            case "chain_lightning": playerEffects.chainLightning = true; break;
            case "battle_frenzy": playerEffects.battleFrenzy.active = true; break;
            case "static_pulse": playerEffects.staticPulse.active = true; break;
            case "spectral_cannon": playerEffects.spectralCannon = true; break;
            case "reactive_shield": playerEffects.reactiveShield.active = true; break;
            case "maneuver_thrusters": playerStats.moveSpeed *= 1.25; break;
            case "adamantium_plating": playerStats.maxHealth += 50; playerStats.health += 50; playerStats.armor += 5; break;
            case "repulsion_field": playerEffects.repulsionField = true; break;
            case "emergency_teleport": playerEffects.emergencyTeleport.active = true; break;
            case "nanobot_regeneration": playerEffects.nanobotRegeneration = true; break;
            case "scrap_attraction": playerStats.xpCollectionRadius *= 1.5; break;
            case "invisibility_cloak": playerEffects.invisibilityCloak.active = true; break;
            case "shield_overcharge": playerEffects.shieldOvercharge.active = true; break;
            case "fine_calibration": playerStats.projectileSpeed *= 1.2; break;
            case "combat_focus": playerStats.critChance += 0.05; break;
            case "improved_reactor": playerStats.fireRate *= 1.25; break;
            case "expansion_modules": playerStats.projectileRange *= 1.3; break;
            case "target_analyzer": playerStats.critDamage += 0.5; break;
            case "magnetic_collector": playerStats.xpCollectionRadius *= 1.2; break;
            case "cooldown_reducer": playerStats.cooldownReduction *= 0.9; break;
            case "explorer_luck": playerStats.luck += 0.01; break;
            case "reinforced_chassis": playerStats.maxHealth += 35; playerStats.health += 35; break;
            case "armor_plating": playerStats.armor += 3; break;
            case "hull_shield": playerEffects.hullShield.active = true; playerEffects.hullShield.maxShield = playerStats.maxHealth * 0.3; playerEffects.hullShield.shield = playerEffects.hullShield.maxShield; break;
        }
        updateUI();
    }

    function gameOver() {
        gameState.isGameOver = true;
        player.invisible = true;
        player.vx = 0; player.vy = 0;
        
        gameMusic.pause();
        bossMusic.pause();
        if(soundEnabled) {
            gameOverSound.currentTime = 0;
            gameOverSound.play();
        }

        createParticles(player.x, player.y, 150, "#ff4500");
        createParticles(player.x, player.y, 100, "#ffa500");
        setTimeout(() => { gameOverScreen.classList.remove('hidden'); }, 1000); 
    }

    function restartGame() {
        cancelAnimationFrame(animationFrameId);
        gameOverScreen.classList.add('hidden');
        bossHealthBarContainer.classList.add('hidden');
        bossWarningBorder.classList.add('hidden');
        heatBarContainer.classList.add('hidden');
        gameState.paused = false;
        gameState.isGameOver = false;
        gameState.level = 1;
        gameState.xp = 0;
        gameState.xpRequired = 5;
        gameState.score = 0;
        gameState.bossActive = false;
        gameState.postBossMode = false;
        gameState.bossDefeats = 0;
        boss = null;
        playerStats = { ...initialPlayerStats };
        playerEffects = JSON.parse(JSON.stringify(initialPlayerEffects));
        asteroids.length = 0; bullets.length = 0; particles.length = 0;
        missiles.length = 0; xpOrbs.length = 0; satellites.length = 0; blueMeteors.length = 0;
        
        // CORREÇÃO: Não chama initGame() diretamente, pois o playButton fará isso.
        // Apenas prepara para a tela de intro.
        if (soundEnabled) {
            gameMusic.currentTime = 0;
            gameMusic.play().catch(e => console.error("A reprodução da música do jogo falhou:", e));
        }
        initGame();
    }

    function updateUI() {
        xpBarContainer.querySelector("#xpText").textContent = `NÍVEL ${gameState.level} | XP: ${gameState.xp}/${gameState.xpRequired}`;
        xpBarContainer.querySelector("#xpBarFill").style.width = `${(gameState.xp / gameState.xpRequired) * 100}%`;
        healthBarContainer.querySelector("#healthText").textContent = `HP: ${Math.ceil(playerStats.health)}/${playerStats.maxHealth}`;
        const healthBarFill = healthBarContainer.querySelector("#healthBarFill");
        healthBarFill.style.width = `${(playerStats.health / playerStats.maxHealth) * 100}%`;
        healthBarFill.style.background = (playerStats.health / playerStats.maxHealth < 0.3) ? 'linear-gradient(90deg, #ff0000, #ff6600)' : 'linear-gradient(90deg, #00ff00, #ffff00)';
        
        if (playerEffects.plasmaCannon.active) {
            if (playerEffects.plasmaCannon.cooldown > 0) {
                const cooldownProgress = 1 - (playerEffects.plasmaCannon.cooldown / playerEffects.plasmaCannon.cooldownDuration);
                heatBarFill.style.width = `${cooldownProgress * 100}%`;
                heatText.textContent = `RECARREGANDO...`;
            } else {
                const chargeProgress = playerEffects.plasmaCannon.charges / playerEffects.plasmaCannon.maxCharges;
                heatBarFill.style.width = `${chargeProgress * 100}%`;
                heatText.textContent = `CARGAS: ${playerEffects.plasmaCannon.charges}/${playerEffects.plasmaCannon.maxCharges}`;
            }
        }
    }

    function updateBossUI() {
        if (!boss) return;
        bossHealthBarContainer.querySelector("#bossHealthBarFill").style.width = `${(boss.health / boss.maxHealth) * 100}%`;
    }

    function gameLoop() {
        if (gameState.paused) return;
        try {
            updatePlayer();
            updateEnergyBlade();
            
            if (!gameState.isGameOver) {
                if (mouseDown || keys['Space']) {
                    fireBullet();
                }
            }
            updateBullets();
            updateMissiles();
            if (gameState.bossActive) { updateBoss(); updateSatellites(); } else { updateAsteroids(); }
            if (gameState.postBossMode) updateBlueMeteors();
            updateParticles();
            updateXPOrbs();

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (backgroundImage.loadSuccess !== false) ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
            drawParticles();
            drawBullets();
            drawMissiles();
            drawXPOrbs();
            drawAsteroids();
            drawBoss();
            drawSatellites();
            drawBlueMeteors();
            drawPlayer();
            drawEnergyBlade();
            
            if (playerEffects.orbitalDrones.active) {
                playerEffects.orbitalDrones.drones.forEach((drone, index) => {
                    const angleStep = (Math.PI * 2) / playerEffects.orbitalDrones.drones.length;
                    drone.angleOffset += 0.05;
                    const dX = player.x + Math.cos(angleStep * index + drone.angleOffset) * drone.dist;
                    const dY = player.y + Math.sin(angleStep * index + drone.angleOffset) * drone.dist;
                    ctx.fillStyle = "#8A2BE2"; ctx.beginPath(); ctx.arc(dX, dY, 8, 0, Math.PI * 2); ctx.fill();
                    if(!gameState.isGameOver && Date.now() - drone.lastFire > 1000 / drone.fireRate) {
                        const target = [...asteroids, ...satellites].reduce((closest, ast) => (Math.hypot(dX - ast.x, dY - ast.y) < Math.hypot(dX - (closest?.x || Infinity), dY - (closest?.y || Infinity)) ? ast : closest), null);
                        if(target){
                           const angleToTarget = Math.atan2(target.y - dY, target.x - dX);
                           createBullet(dX, dY, angleToTarget, playerStats.projectileSpeed * 0.8, playerStats.baseDamage * 0.5);
                           drone.lastFire = Date.now();
                        }
                    }
                });
            }
        } catch (e) {
            console.error("Erro no gameLoop:", e);
            gameState.paused = true;
        }
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // --- 4. INICIALIZAÇÃO E EVENT LISTENERS ---
    function startIntro(withSound) {
        soundPermissionPopup.classList.add('hidden');
        introScreen.classList.remove('hidden');
        soundEnabled = withSound;

        if (soundEnabled) {
            introMusic.muted = false;
            introMusic.play().catch(e => console.error("A reprodução de música falhou:", e));
        } else {
            introMusic.muted = true;
        }

        introVideo.play().catch(e => console.error("A reprodução de vídeo falhou:", e));
    }

    allowSoundBtn.addEventListener('click', () => startIntro(true));
    denySoundBtn.addEventListener('click', () => startIntro(false));

    playButton.addEventListener("click", () => {
        introScreen.classList.add("hidden");
        canvas.classList.remove("hidden");
        xpBarContainer.classList.remove("hidden");
        healthBarContainer.classList.remove("hidden");
        controls.classList.remove("hidden");
        introMusic.pause();
        if (soundEnabled) {
            gameMusic.currentTime = 0;
            gameMusic.play().catch(e => console.error("A reprodução da música do jogo falhou:", e));
        }
        initGame();
    });

    restartButton.addEventListener('click', () => {
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
        gameOverScreen.classList.add('hidden');
        restartGame();
    });
    
    document.addEventListener("keydown", (e) => {
        keys[e.code] = true;
        if (e.code === "Space") e.preventDefault();
        
        if (!isNaN(e.key)) {
            clearTimeout(sequenceTimeout);
            keySequence.push(e.key);
            sequenceTimeout = setTimeout(() => { keySequence = []; }, 1500);
            
            const currentSequence = keySequence.join('');
            if (currentSequence.endsWith('1973')) {
                const card = cardDatabase.find(c => c.id === 'plasma_cannon');
                if (card) applyCardEffect(card);
                keySequence = [];
            } else if (currentSequence.endsWith('7319')) {
                const card = cardDatabase.find(c => c.id === 'bifurcated_shot');
                if (card) applyCardEffect(card);
                keySequence = [];
            }
        }

        if (!gameState.isGameOver && !gameState.paused) {
            if (e.code === 'KeyX' && playerEffects.plasmaCannon.active && playerEffects.plasmaCannon.charges > 0 && playerEffects.plasmaCannon.cooldown <= 0) {
                firePlasmaShot();
                playerEffects.plasmaCannon.charges--;
                if (playerEffects.plasmaCannon.charges <= 0) {
                    playerEffects.plasmaCannon.cooldown = playerEffects.plasmaCannon.cooldownDuration;
                }
                updateUI();
            }
            if (e.code === "KeyR" && playerEffects.energyBlade.active && playerEffects.energyBlade.cooldown === 0) {
                playerEffects.energyBlade.duration = 600;
                playerEffects.energyBlade.cooldown = 1200;
            }
            if (e.code === "KeyQ" && playerEffects.staticPulse.active && playerEffects.staticPulse.cooldown === 0) {
                for (let a of asteroids) { if(Math.hypot(player.x - a.x, player.y - a.y) < 200) a.health -= playerStats.baseDamage * 3; }
                createParticles(player.x, player.y, 50, "#FFFF00");
                playerEffects.staticPulse.cooldown = 300 * playerStats.cooldownReduction;
            }
            if (e.code === "KeyE" && playerEffects.emergencyTeleport.active && playerEffects.emergencyTeleport.cooldown === 0) {
                player.x += Math.cos(player.angle) * 150; player.y += Math.sin(player.angle) * 150;
                createParticles(player.x, player.y, 20, "#00FFFF");
                playerEffects.emergencyTeleport.cooldown = 180 * playerStats.cooldownReduction;
            }
            if (e.code === "KeyI" && playerEffects.invisibilityCloak.active && playerEffects.invisibilityCloak.cooldown === 0) {
                playerEffects.invisibilityCloak.duration = 300;
                playerEffects.invisibilityCloak.cooldown = 600 * playerStats.cooldownReduction;
            }
            if (e.code === "KeyO" && playerEffects.shieldOvercharge.active && playerEffects.shieldOvercharge.cooldown === 0) {
                takeDamage(playerStats.maxHealth * -0.2);
                playerEffects.shieldOvercharge.duration = 180;
                playerEffects.shieldOvercharge.cooldown = 600 * playerStats.cooldownReduction;
            }
        }
    });
    
    document.addEventListener("keyup", (e) => { keys[e.code] = false; if (e.code === "Space") e.preventDefault(); });
    document.addEventListener("mousedown", () => mouseDown = true);
    document.addEventListener("mouseup", () => { mouseDown = false; chargeTime = 0; });

    soundPermissionPopup.style.display = 'flex';
};
