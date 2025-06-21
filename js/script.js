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
    const cooldownReadySound = document.getElementById("cooldownReadySound");
    const scoreContainer = document.getElementById("scoreContainer");
    const scoreDigits = [
        document.getElementById("scoreDigit0"),
        document.getElementById("scoreDigit1"),
        document.getElementById("scoreDigit2"),
        document.getElementById("scoreDigit3"),
        document.getElementById("scoreDigit4"),
    ];
    const xpBarContainer = document.getElementById("xpBarContainer");
    const healthBarContainer = document.getElementById("healthBarContainer");
    const heatBarContainer = document.getElementById("heatBarContainer");
    const heatBarFill = document.getElementById("heatBarFill");
    const heatText = document.getElementById("heatText");
    const levelUpScreen = document.getElementById("levelUpScreen");
    const rerollButton = document.getElementById("rerollButton");
    const controls = document.getElementById("controls");
    const gameOverScreen = document.getElementById("gameOverScreen");
    const restartButton = document.getElementById("restartButton");
    const bossHealthBarContainer = document.getElementById("bossHealthBarContainer");
    const bossHealthText = document.getElementById("bossHealthText");
    const bossWarningBorder = document.getElementById("bossWarningBorder");
    const cheatMenu = document.getElementById("cheatMenu");
    const cheatPowerupList = document.getElementById("cheatPowerupList");
    const closeCheatMenuBtn = document.getElementById("closeCheatMenuBtn");
    const pauseMenu = document.getElementById("pauseMenu");
    const resumeButton = document.getElementById("resumeButton");
    const restartFromPauseButton = document.getElementById("restartFromPauseButton");
    const abilityCooldownsContainer = document.getElementById("abilityCooldownsContainer");
    const passivePowerupsContainer = document.getElementById("passivePowerupsContainer");
    const damageFlashEffect = document.getElementById("damageFlashEffect");
    const notificationContainer = document.getElementById("notificationContainer");
    const bossRewardScreen = document.getElementById("bossRewardScreen");
    const cardTooltip = document.getElementById("cardTooltip");


    // --- MELHORIA: CENTRALIZAÇÃO DE CONSTANTES ---
    // Este objeto centraliza todos os valores numéricos importantes do jogo.
    // Alterar um valor aqui afeta o jogo inteiro, facilitando o balanceamento e a manutenção.
    const gameConfig = {
        // Configurações do Jogador
        player: {
            maxHealth: 100,
            baseDamage: 12, 
            armor: 0,
            fireRate: 2.3, 
            moveSpeed: 1.5,
            critChance: 0.05,
            critDamage: 1.5, // Fator de dano para acertos críticos
            projectileSpeed: 5.5, 
            projectileRange: 1000, 
            xpCollectionRadius: 100,
            cooldownReduction: 1, // Fator de redução de recarga
            rotationSpeed: 0.08, 
            luck: 0.1, // Chance de eventos positivos
            size: 30.375, 
            bobbingSpeed: 400, // Velocidade da flutuação
            bobbingAmount: 2,   // Amplitude da flutuação
        },
        // Configurações dos Asteroides
        asteroid: {
            small:  { radius: 15, health: 10,  damage: 15, xpReward: 2 },
            medium: { radius: 30, health: 40,  damage: 30, xpReward: 7 },
            large:  { radius: 50, health: 80,  damage: 70, xpReward: 9 }, 
            baseSpeed: 2
        },
        // Configurações dos Chefes
        boss: {
            terra: {
                health: 500,
                damage: 100,
                speed: 0.7
            },
            mars: {
                health: 800 * 0.65, 
                damage: 120,
                speed: 0.4 * 1.2, 
                turretDamage: 15 * 1.3,
                laserDamagePerFrame: 0.5 * 1.3,
                heatAuraDamage: 0.2
            }
        },
        // Configurações de Habilidades
        abilities: {
            plasmaCannon:     { cooldown: 360, damageMultiplier: 1.0 }, 
            energyBlade:      { cooldown: 900, duration: 600, damage: 0.5 }, 
            staticPulse:      { cooldown: 300, damageMultiplier: 0.5 }, 
            emergencyTeleport:{ cooldown: 180, distance: 150 },
            invisibilityCloak:{ cooldown: 600, duration: 300 },
            shieldOvercharge: { cooldown: 600, duration: 180, healthCost: 0.2 },
            reactiveShield:   { cooldown: 1800, duration: 120 },
            repulsionField:   { cooldown: 1800, radius: 105, force: 10 }
        },
        // Configurações de Pooling de Objetos
        pooling: {
            initialBulletPool: 100,
            initialParticlePool: 300,
            initialXpOrbPool: 50,
            initialFloatingNumberPool: 50
        }
    };


    // --- 2. ESTADO INICIAL E VARIÁVEIS GLOBAIS DO JOGO ---
    let animationFrameId = null;
    let soundEnabled = false;
    const gameState = {
        paused: false, isLevelingUp: false, level: 1, xp: 0, xpRequired: 5,
        rerollsAvailableThisLevel: 1, sector: 1, time: 0, score: 0, bossActive: false,
        postBossMode: false, bossDefeats: 0, isGameOver: false,
        doublePickActive: false,
        isChoosingBossReward: false,
        startTime: 0,
        asteroidsDestroyed: 0,
        damageDealt: 0
    };

    // Variáveis para controle de menu por teclado
    let selectedCardIndex = 0;
    let selectedPauseMenuIndex = 0;
    let selectedSoundPermissionIndex = 0;

    // Os stats do jogador agora são inicializados a partir do gameConfig
    const initialPlayerStats = {
        maxHealth: gameConfig.player.maxHealth, health: gameConfig.player.maxHealth,
        baseDamage: gameConfig.player.baseDamage, armor: gameConfig.player.armor,
        fireRate: gameConfig.player.fireRate, moveSpeed: gameConfig.player.moveSpeed,
        critChance: gameConfig.player.critChance, critDamage: gameConfig.player.critDamage,
        projectileSpeed: gameConfig.player.projectileSpeed, projectileRange: gameConfig.player.projectileRange,
        xpCollectionRadius: gameConfig.player.xpCollectionRadius, cooldownReduction: gameConfig.player.cooldownReduction,
        rotationSpeed: gameConfig.player.rotationSpeed, luck: gameConfig.player.luck
    };
    let playerStats = { ...initialPlayerStats };

    const initialPlayerEffects = {
        bifurcatedShot: { active: false, level: 0 },
        plasmaCannon: { active: false, charges: 0, maxCharges: 4, cooldown: 0, maxCooldown: gameConfig.abilities.plasmaCannon.cooldown },
        missileStorm: { active: false, shotCount: 0, shotsNeeded: 20 },
        orbitalDrones: { active: false, drones: [] },
        energyBlade: { active: false, duration: 0, cooldown: 0, maxCooldown: gameConfig.abilities.energyBlade.cooldown, maxDuration: gameConfig.abilities.energyBlade.duration, angle: 0, sizeMultiplier: 1 }, 
        ricochetShot: false,
        chainLightning: { active: false, chance: 0.30, bounces: 2, damage: 0.35 }, 
        battleFrenzy: { active: false, timer: 0, maxTime: 300 },
        staticPulse: { active: false, cooldown: 0, maxCooldown: gameConfig.abilities.staticPulse.cooldown },
        spectralCannon: false,
        reactiveShield: { active: false, cooldown: 0, maxCooldown: gameConfig.abilities.reactiveShield.cooldown, duration: 0, maxDuration: gameConfig.abilities.reactiveShield.duration },
        repulsionField: { active: false, radius: gameConfig.abilities.repulsionField.radius, force: gameConfig.abilities.repulsionField.force, cooldown: 0, maxCooldown: gameConfig.abilities.repulsionField.cooldown },
        emergencyTeleport: { active: false, cooldown: 0, maxCooldown: gameConfig.abilities.emergencyTeleport.cooldown },
        nanobotRegeneration: false,
        invisibilityCloak: { active: false, cooldown: 0, maxCooldown: gameConfig.abilities.invisibilityCloak.cooldown, duration: 0, maxDuration: gameConfig.abilities.invisibilityCloak.duration },
        shieldOvercharge: { active: false, cooldown: 0, maxCooldown: gameConfig.abilities.shieldOvercharge.cooldown, duration: 0, maxDuration: gameConfig.abilities.shieldOvercharge.duration },
        hullShield: { active: false, shield: 0, maxShield: 0 },
        reinforcedPlating: { active: false, noDamageTimer: 0 },
        magneticCollector: { active: false, level: 0 }
    };
    let playerEffects = JSON.parse(JSON.stringify(initialPlayerEffects));

    // MELHORIA: Animação da Nave
    const player = { x: 0, y: 0, angle: 0, targetAngle: 0, vx: 0, vy: 0, size: gameConfig.player.size, invisible: false, bobbingPhase: Math.random() * Math.PI * 2 };
    
    // MELHORIA: Pools de Objetos
    const objectPools = {
        bullets: [],
        particles: [],
        xpOrbs: [],
        floatingNumbers: []
    };
    // Arrays para os objetos ativos no jogo
    const bullets = [], asteroids = [], particles = [], missiles = [], xpOrbs = [], satellites = [], blueMeteors = [], lightningBolts = [], bossProjectiles = [], floatingNumbers = [];
    
    let boss = null, lastSatelliteLaunch = 0, lastBlueMeteorWaveTime = 0;
    const keys = {};
    let mouseDown = false;

    let keySequence = [];
    let sequenceTimeout;

    // Imagens do Jogo e UI
    const playerShipImage = new Image(); playerShipImage.src = "assets/images/player_ship.png";
    const projectileImage = new Image(); projectileImage.src = "assets/images/projectile.png";
    const asteroidImage = new Image(); asteroidImage.src = "assets/images/asteroid.png";
    const backgroundImage = new Image(); backgroundImage.src = "assets/images/background.png";
    const earthImage = new Image(); earthImage.src = "assets/images/terra.png";
    const moonImage = new Image(); moonImage.src = "assets/images/lua.png";
    const satelliteImage = new Image(); satelliteImage.src = "assets/images/satelite.png";
    const satelliteRedImage = new Image(); satelliteRedImage.src = "assets/images/satelitered.png";
    const blueMeteorImage = new Image(); blueMeteorImage.src = "assets/images/meteoroazul.png";
    const destroyedShipImage = new Image(); destroyedShipImage.src = "assets/images/Navedestruida.png";
    const restartButtonImage = new Image(); restartButtonImage.src = "assets/images/botaojogarnovamente.png";
    const gameOverMessageImage = new Image(); gameOverMessageImage.src = "assets/images/ruim.png";
    const plasmaShotImage = new Image(); plasmaShotImage.src = "assets/images/esferaplasma.png"; 
    const energyBladeImage = new Image(); energyBladeImage.src = "assets/images/lamina.png"; 
    const marsImage = new Image(); marsImage.src = "assets/images/marte.png";
    const marsShipImage = new Image(); marsShipImage.src = "assets/images/navemarte.png";
    const droneImage = new Image(); droneImage.src = "assets/images/dronesnave.png";
    
    const iconImages = {
        staticPulse: 'assets/icons/static_pulse.png',
        emergencyTeleport: 'assets/icons/teleport.png',
        energyBlade: 'assets/icons/energy_blade.png',
        invisibilityCloak: 'assets/icons/invisibility.png',
        shieldOvercharge: 'assets/icons/shield_overcharge.png',
        plasmaCannon: 'assets/icons/plasma_cannon.png',
        ricochetShot: 'assets/icons/ricochet.png',
        nanobotRegeneration: 'assets/icons/regen.png',
        spectralCannon: 'assets/icons/spectral.png'
    };

    const numberImages = [];
    for(let i=0; i < 10; i++) {
        numberImages[i] = new Image();
        numberImages[i].src = `assets/images/${i}.png`;
    }

    // Banco de Dados de Cartas com descrições detalhadas
    const cardDatabase = [
        { id: "bifurcated_shot", name: "Tiro Bifurcado", description: "Modifica o canhão principal para disparar projéteis adicionais em um arco.", type: "attack" },
        { id: "plasma_cannon", name: "Canhão de Plasma", description: "Equipa um sistema de arma secundário que dispara uma esfera de plasma devastadora.", type: "attack", key: 'K' },
        { id: "missile_storm", name: "Tormenta de Mísseis", description: "Instala um lançador automático que dispara uma salva de mísseis teleguiados após uma sequência de tiros.", type: "attack" },
        { id: "orbital_drones", name: "Drones Orbitais", description: "Lança um drone de combate autônomo que orbita a nave e ataca inimigos próximos.", type: "attack" },
        { id: "energy_blade", name: "Lâmina de Energia", description: "Ativa uma lâmina de energia passiva, maior e mais duradoura, que corta inimigos próximos.", type: "attack" }, 
        { id: "ricochet_shot", name: "Tiro Ricochete", description: "Reveste os projéteis com uma liga especial que permite que eles ricocheteiem nas superfícies.", type: "attack" },
        { id: "chain_lightning", name: "Cadeia de Raios", description: "Permite que os projéteis, ao impactar, liberem uma descarga elétrica que salta entre múltiplos alvos.", type: "attack" },
        { id: "battle_frenzy", name: "Frenesi de Batalha", description: "Entra em um estado de frenesi após cada abate, aumentando temporariamente a velocidade dos sistemas de armas.", type: "attack" },
        { id: "static_pulse", name: "Pulso Estático", description: "Libera uma onda de choque eletromagnética que se expande a partir da nave, danificando tudo em seu raio.", type: "attack", key: 'U' },
        { id: "spectral_cannon", name: "Canhão Espectral", description: "Altera a fase dos projéteis, permitindo que atravessem múltiplos inimigos em linha reta.", type: "attack" },
        { id: "reactive_shield", name: "Escudo Reativo", description: "Um escudo de emergência que ativa automaticamente ao sofrer dano, concedendo invulnerabilidade temporária.", type: "defense" },
        { id: "maneuver_thrusters", name: "Propulsores de Manobra", description: "Melhora os propulsores, resultando em uma nave mais ágil e rápida.", type: "defense" },
        { id: "adamantium_plating", name: "Placas de Adamântio", description: "Reforça a fuselagem com placas de metal super-resistente, aumentando a durabilidade geral da nave.", type: "defense" },
        { id: "repulsion_field", name: "Campo de Repulsão", description: "Gera um campo de força passivo que emite pulsos periódicos, empurrando para longe ameaças próximas.", type: "defense" },
        { id: "emergency_teleport", name: "Teleporte de Emergência", description: "Permite um salto espacial de curta distância na direção em que a nave está apontada.", type: "defense", key: 'P' },
        { id: "nanobot_regeneration", name: "Regeneração Nanobótica", description: "Injeta nanorrobôs no casco que reparam continuamente os danos sofridos pela nave.", type: "defense" },
        { id: "invisibility_cloak", name: "Manto de Invisibilidade", description: "Ativa um dispositivo de camuflagem que torna a nave invisível e intangível por um curto período.", type: "defense", key: 'I' },
        { id: "shield_overcharge", name: "Sobrecarga de Escudo", description: "Desvia energia dos sistemas para os escudos, garantindo invulnerabilidade total em troca de um custo.", type: "defense", key: 'O' },
        { id: "fine_calibration", name: "Calibragem Fina", description: "Ajusta os aceleradores de projéteis, fazendo com que os tiros viajem mais rápido.", type: "attribute" },
        { id: "combat_focus", name: "Foco de Combate", description: "Otimiza os sistemas de mira, aumentando a probabilidade de causar danos críticos aos pontos fracos do inimigo.", type: "attribute" },
        { id: "improved_reactor", name: "Reator Aprimorado", description: "Melhora o reator da nave, permitindo que as armas disparem com mais frequência.", type: "attribute" },
        { id: "expansion_modules", name: "Módulos de Expansão", description: "Aumenta a energia dos projéteis, permitindo que eles viajem distâncias maiores antes de se dissiparem.", type: "attribute" },
        { id: "target_analyzer", name: "Analisador de Alvos", description: "Instala um software de análise de alvo que melhora a eficácia dos acertos críticos.", type: "attribute" },
        { id: "magnetic_collector", name: "Coletor Magnético", description: "Amplifica o campo magnético da nave, atraindo orbes de experiência de uma distância maior.", type: "attribute" },
        { id: "cooldown_reducer", name: "Redutor de Recarga", description: "Otimiza os sistemas de habilidades, permitindo que sejam usados com mais frequência.", type: "attribute" },
        { id: "explorer_luck", name: "Sorte do Explorador", description: "Equipa um sensor de anomalias que aumenta a chance de encontrar recursos raros e obter mais experiência.", type: "attribute" },
        { id: "reinforced_chassis", name: "Chassi Reforçado", description: "Fortalece a estrutura interna da nave, aumentando sua capacidade de suportar danos.", type: "health" },
        { id: "armor_plating", name: "Placas de Blindagem", description: "Adiciona camadas extras de blindagem ao casco, reduzindo o dano recebido de todas as fontes.", type: "health" },
        { id: "hull_shield", name: "Escudo de Fuselagem", description: "Converte parte da integridade estrutural da nave em um escudo de energia que se regenera fora de combate.", type: "health" }
    ];
    
    const bossCardDatabase = [
        { id: "foco_cirurgico", name: "Foco Cirúrgico", description: "+15% de Dano Base. +1.5% de Chance de Crítico. +5% de Dano Crítico." },
        { id: "blindagem_reforcada", name: "Blindagem Reforçada", description: "+4 de Armadura. Após 15s sem sofrer dano, repara 5% da vida máxima a cada 10s." },
        { id: "propulsores_aprimorados", name: "Propulsores Aprimorados", description: "+15% de Velocidade de Movimento. +10% de Cadência de Tiro." }
    ];

    // --- 3. DEFINIÇÕES DE FUNÇÕES ---
    
    // Função auxiliar para interpolação suave de ângulos
    function lerpAngle(start, end, amount) {
        let difference = end - start;
        while (difference < -Math.PI) difference += Math.PI * 2;
        while (difference > Math.PI) difference -= Math.PI * 2;
        return start + difference * amount;
    }

    // --- CORREÇÃO DE BUG: Função centralizada para lidar com dano ---
    function dealDamageToEnemy(enemy, damage, isCrit = false) {
        if (enemy.health <= 0) return; // Impede gatilhos de morte múltiplos

        let finalDamage = damage;
        // Aplica a redução de dano se o inimigo tiver essa propriedade (ex: chefes)
        if (enemy.damageReduction) {
            finalDamage *= (1 - enemy.damageReduction);
        }

        enemy.health -= finalDamage;
        gameState.damageDealt += finalDamage;
        
        createFloatingNumber(enemy.x, enemy.y, Math.round(finalDamage), isCrit);

        if (enemy.health <= 0) {
            enemy.isDead = true; // Marca para remoção segura no final do ciclo
        }
    }

    // --- MELHORIA: FUNÇÕES DE OBJECT POOLING ---
    // Funções para gerenciar a reutilização de objetos, melhorando a performance.
    function getFromPool(poolName) {
        const pool = objectPools[poolName];
        if (pool.length > 0) {
            const obj = pool.pop();
            obj.active = true;
            return obj;
        }
        return { active: true }; // Retorna um novo objeto base se o pool estiver vazio
    }

    function returnToPool(obj, poolName) {
        obj.active = false;
        objectPools[poolName].push(obj);
    }
    
    function prewarmPools() {
        for (let i = 0; i < gameConfig.pooling.initialBulletPool; i++) {
            objectPools.bullets.push({ active: false });
        }
        for (let i = 0; i < gameConfig.pooling.initialParticlePool; i++) {
            objectPools.particles.push({ active: false });
        }
        for (let i = 0; i < gameConfig.pooling.initialXpOrbPool; i++) {
            objectPools.xpOrbs.push({ active: false });
        }
        for (let i = 0; i < gameConfig.pooling.initialFloatingNumberPool; i++) {
            objectPools.floatingNumbers.push({ active: false });
        }
    }

    function createFloatingNumber(x, y, text, isCrit) {
        const number = getFromPool('floatingNumbers');
        number.x = x;
        number.y = y;
        number.text = text;
        number.life = 60; // 1 segundo
        number.vy = -1.5; // Velocidade de subida
        number.alpha = 1.0;
        number.color = isCrit ? '#FFD700' : '#FFFFFF'; // Amarelo para crítico, branco para normal
        number.size = isCrit ? 24 : 16; // Maior para crítico
        floatingNumbers.push(number);
    }

    function createAsteroid(size, x, y, isFragment = false) {
        const speedMultiplier = 1 + (gameState.bossDefeats * 0.10);
        const baseSpeed = gameConfig.asteroid.baseSpeed;
        const speed = baseSpeed * speedMultiplier;
        const config = gameConfig.asteroid[size];

        const asteroid = { 
            x: x || Math.random() * canvas.width, 
            y: y || Math.random() * canvas.height, 
            angle: Math.random() * Math.PI * 2, 
            angularVelocity: (Math.random() - 0.5) * 0.1, 
            size: size, 
            isFragment: isFragment, 
            targetSpeed: speed,
            radius: config.radius,
            health: config.health,
            damage: config.damage,
            xpReward: config.xpReward,
            maxHealth: config.health,
            isDead: false, // Flag para a nova lógica de destruição
            killedByPlasmaBullet: null
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

        if (!isFragment && Math.hypot(asteroid.x - player.x, asteroid.y - player.y) < 200) { 
            asteroid.x = player.x + (Math.random() > 0.5 ? 250 : -250); 
            asteroid.y = player.y + (Math.random() > 0.5 ? 250 : -250); 
        }
        asteroids.push(asteroid);
        return asteroid;
    }

    function createBlueMeteor() {
        const radius = (15 * 0.7) * 1.35;
        const x = Math.random() * canvas.width;
        const y = -radius - (Math.random() * 250);
        const speedMultiplier = 1 + (gameState.bossDefeats * 0.20);
        const vx = -1 - Math.random() * 1.5; 
        const vy = (3 + Math.random()) * speedMultiplier; 
        blueMeteors.push({ x: x, y: y, vx: vx, vy: vy, radius: radius, damage: 20 });
    }

    // Refatorado para usar Object Pooling
    function createBullet(x, y, angle, speed = playerStats.projectileSpeed, damage = playerStats.baseDamage, special = {}) {
        if (soundEnabled && !special.plasma) {
            shotSound.currentTime = 0;
            shotSound.volume = 0.5;
            shotSound.play();
        }
        if (playerEffects.missileStorm.active) {
            playerEffects.missileStorm.shotCount++;
            if (playerEffects.missileStorm.shotCount >= playerEffects.missileStorm.shotsNeeded) {
                launchMissileSalvo();
                playerEffects.missileStorm.shotCount = 0;
            }
        }
        
        const b = getFromPool('bullets');
        b.x = x;
        b.y = y;
        b.vx = Math.cos(angle) * speed;
        b.vy = Math.sin(angle) * speed;
        b.damage = damage;
        b.life = special.plasma ? 360 : playerStats.projectileRange / speed; // 6 segundos de vida para plasma
        b.special = special;
        b.rotation = 0;
        b.bounced = 0;
        b.hitTargets = [];

        if (special.plasma && special.size) {
            b.radius = special.size / 2; 
        } else {
            b.radius = 5; 
        }
        
        bullets.push(b);
    }

    function createBossProjectile(x, y, vx, vy, damage = 10) {
        bossProjectiles.push({ x, y, vx, vy, damage, life: 300, radius: 5 });
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
        createBullet(player.x, player.y, player.angle, playerStats.projectileSpeed * 0.8, playerStats.baseDamage * gameConfig.abilities.plasmaCannon.damageMultiplier, special);
    }

    function createMissile(x, y, target, initialAngle) {
        const impulseForce = 4;
        missiles.push({
            x, y,
            target,
            vx: Math.cos(initialAngle) * impulseForce,
            vy: Math.sin(initialAngle) * impulseForce,
            speed: 6,
            damage: playerStats.baseDamage * 0.5,
            life: 300,
            angle: initialAngle,
            homingDelay: 15
        });
    }

    function launchMissileSalvo() {
        const enemies = [...asteroids, ...satellites].filter(e => e.health > 0);
        enemies.sort((a, b) => Math.hypot(player.x - a.x, player.y - a.y) - Math.hypot(player.x - b.x, player.y - b.y));
    
        if (enemies.length === 0) return;
    
        const rightOffsetAngle = player.angle + Math.PI / 2;
        const leftOffsetAngle = player.angle - Math.PI / 2;
        const spawnDist = 15;
    
        const rightSpawnX = player.x + Math.cos(rightOffsetAngle) * spawnDist;
        const rightSpawnY = player.y + Math.sin(rightOffsetAngle) * spawnDist;
        const leftSpawnX = player.x + Math.cos(leftOffsetAngle) * spawnDist;
        const leftSpawnY = player.y + Math.sin(leftOffsetAngle) * spawnDist;
    
        const totalMissiles = 8;
        for (let i = 0; i < totalMissiles; i++) {
            const target = enemies[i % enemies.length];
            const side = i < totalMissiles / 2 ? -1 : 1;
            const spawnX = side === -1 ? leftSpawnX : rightSpawnX;
            const spawnY = side === -1 ? leftSpawnY : rightSpawnY;
            const randomAngleOffset = (Math.random() - 0.5) * 1.2; 
            const initialAngle = player.angle + (side * 0.7) + randomAngleOffset;
            createMissile(spawnX, spawnY, target, initialAngle);
        }
    }
    
    // Refatorado para usar Object Pooling
    function createXPOrb(x, y, amount) {
        const orb = getFromPool('xpOrbs');
        orb.x = x;
        orb.y = y;
        orb.vx = (Math.random() - 0.5) * 2;
        orb.vy = (Math.random() - 0.5) * 2;
        orb.amount = amount;
        orb.life = 1000;
        xpOrbs.push(orb);
    }

    // MELHORIA: Partículas mais impactantes e com Object Pooling
    function createParticles(x, y, count, color = "#fff", maxSize = 4, lifeSpan = 20) {
        for (let i = 0; i < count; i++) {
            const p = getFromPool('particles');
            p.x = x;
            p.y = y;
            p.vx = (Math.random() - 0.5) * (maxSize * 2);
            p.vy = (Math.random() - 0.5) * (maxSize * 2);
            p.life = lifeSpan + Math.random() * lifeSpan;
            p.maxLife = p.life;
            p.color = color;
            p.size = 1 + Math.random() * (maxSize - 1);
            particles.push(p);
        }
    }

    function createLightningBolt(x, y, firstTarget, bounces, damage, alreadyHit) {
        lightningBolts.push({
            target: firstTarget,
            bouncesLeft: bounces,
            damage: damage,
            hitTargets: alreadyHit,
            path: [{x: x, y: y}, {x: firstTarget.x, y: firstTarget.y}],
            life: 15 
        });
        dealDamageToEnemy(firstTarget, damage);
    }

    function spawnNextBoss() {
        if (gameState.bossDefeats % 2 === 0) {
            spawnTerraBoss();
        } else {
            spawnMarsBoss();
        }
    }

    function createSatellite(x, y, side) {
        const baseAngle = Math.PI / 2;
        const separationAngle = Math.PI / 4;
        const spawnAngle = baseAngle + (side * separationAngle);
        const spawnX = x + Math.cos(spawnAngle) * (boss.radius + 10);
        const spawnY = y + Math.sin(spawnAngle) * (boss.radius + 10);
        const isElite = Math.random() < 0.20;

        const satellite = {
             x: spawnX, y: spawnY,
             speed: 1.8, radius: 20, damage: 20, health: 10,
             isElite: false, homingDelay: 45, isDead: false
        };

        const impulseAngle = Math.random() * Math.PI * 2;
        const impulseForce = 10;
        satellite.vx = Math.cos(impulseAngle) * impulseForce;
        satellite.vy = Math.sin(impulseAngle) * impulseForce;

        if (isElite) {
            satellite.speed = 1.0;
            satellite.radius = 30;
            satellite.damage = 20 * 1.20;
            satellite.health = 30;
            satellite.isElite = true;
        } 
        satellites.push(satellite);
    }

    function spawnTerraBoss() {
        if (soundEnabled) {
            gameMusic.pause();
            bossMusic.currentTime = 0;
            bossMusic.play();
        }
        gameState.bossActive = true;
        gameState.postBossMode = false;
        bossHealthBarContainer.classList.remove('hidden');
        bossHealthText.textContent = "Terra, o Explorador";
        bossWarningBorder.classList.remove('hidden');
        
        const bossSpeedMultiplier = 1 + (gameState.bossDefeats * 0.20);
        const healthMultiplier = 1 + gameState.bossDefeats * 0.35;

        boss = {
            type: 'terra',
            x: canvas.width / 2, y: -100, vx: 0, vy: 1, hasEntered: false, radius: 80,
            initialVx: gameConfig.boss.terra.speed * bossSpeedMultiplier,
            health: gameConfig.boss.terra.health * healthMultiplier,
            maxHealth: gameConfig.boss.terra.health * healthMultiplier,
            damage: gameConfig.boss.terra.damage,
            damageReduction: 0, 
            shieldActive: true,
            shieldHit: 0,
            moon: { angle: 0, distance: 120, radius: 16 }
        };
        lastSatelliteLaunch = Date.now();
    }

    function spawnMarsBoss() {
        if (soundEnabled) {
            gameMusic.pause();
            bossMusic.currentTime = 0;
            bossMusic.play();
        }
        gameState.bossActive = true;
        gameState.postBossMode = false;
        bossHealthBarContainer.classList.remove('hidden');
        bossHealthText.textContent = "Marte, o Conquistador";
        bossWarningBorder.classList.remove('hidden');
    
        const bossSpeedMultiplier = 1.2;
        const healthMultiplier = 1 + gameState.bossDefeats * 0.35;
        const marsHealth = gameConfig.boss.mars.health * healthMultiplier;

        boss = {
            type: 'marte',
            x: canvas.width / 2, y: -100, vx: 0, vy: 1, hasEntered: false, radius: 90,
            initialVx: gameConfig.boss.mars.speed * bossSpeedMultiplier,
            health: marsHealth,
            maxHealth: marsHealth,
            damage: gameConfig.boss.mars.damage,
            damageReduction: 0, 
            shieldActive: true,
            shieldHit: 0,
            turrets: [
                { xOffset: -105, yOffset: 0, health: 100, fireCooldown: 0, fireRate: 60, radius: 20, animationPhase: Math.random() * Math.PI * 2, angle: Math.PI / 2, targetAngle: Math.PI / 2 },
                { xOffset: 105, yOffset: 0, health: 100, fireCooldown: 0, fireRate: 60, radius: 20, animationPhase: Math.random() * Math.PI * 2, angle: Math.PI / 2, targetAngle: Math.PI / 2 }
            ],
            laserShips: [
                { side: 'left', health: 150, state: 'entering', timer: 0, animationPhase: Math.random() * Math.PI * 2, currentX: -50, targetX: 50, y: canvas.height / 2, targetY: canvas.height / 2, moveSpeedY: 2 },
                { side: 'right', health: 150, state: 'entering', timer: 0, animationPhase: Math.random() * Math.PI * 2, currentX: canvas.width + 50, targetX: canvas.width - 50, y: canvas.height / 2, targetY: canvas.height / 2, moveSpeedY: 2 }
            ],
            lasers: [],
            heatAura: {
                active: false,
                height: 100,
                verticalActivationRange: 200,
                damagePerFrame: gameConfig.boss.mars.heatAuraDamage
            }
        };
    }

    function activateRepulsionPulse() {
        const radius = playerEffects.repulsionField.radius;
        for(let i = 0; i < 360; i += 10) {
            const angle = i * Math.PI / 180;
            const pX = player.x + Math.cos(angle) * radius;
            const pY = player.y + Math.sin(angle) * radius;
            createParticles(pX, pY, 1, '#87CEEB');
        }

        const force = playerEffects.repulsionField.force;
        const allTargets = [...asteroids, ...satellites, ...blueMeteors];

        allTargets.forEach(target => {
            const dist = Math.hypot(player.x - target.x, player.y - target.y);
            if (dist < radius) {
                const angle = Math.atan2(target.y - player.y, target.x - player.x);
                target.vx += Math.cos(angle) * force;
                target.vy += Math.sin(angle) * force;
                if (target.size && !target.isFragment) {
                    target.isFragment = true; 
                }
            }
        });
    }
    
    function updateRepulsionField() {
        if (!playerEffects.repulsionField.active) return;
        
        if (playerEffects.repulsionField.cooldown > 0) {
            playerEffects.repulsionField.cooldown--;
        }
        
        if (playerEffects.repulsionField.cooldown <= 0) {
            activateRepulsionPulse();
            playerEffects.repulsionField.cooldown = playerEffects.repulsionField.maxCooldown * playerStats.cooldownReduction;
        }
    }


    function updatePlayer() {
        player.invisible = playerEffects.invisibilityCloak.duration > 0;
        
        let moveX = (keys["KeyD"] ? 1 : 0) - (keys["KeyA"] ? 1 : 0);
        let moveY = (keys["KeyS"] ? 1 : 0) - (keys["KeyW"] ? 1 : 0);

        if (moveX !== 0 || moveY !== 0) {
            player.targetAngle = Math.atan2(moveY, moveX);
        }

        let angleDiff = player.targetAngle - player.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        player.angle += angleDiff * playerStats.rotationSpeed;
        
        const thrustPower = 0.4 * playerStats.moveSpeed;
        player.vx += moveX * thrustPower;
        player.vy += moveY * thrustPower;
    
        player.vx *= 0.95; 
        player.vy *= 0.95;
        const maxSpeed = playerStats.moveSpeed * 1.5;
        const speed = Math.hypot(player.vx, player.vy);
        if (speed > maxSpeed) { 
            player.vx = (player.vx / speed) * maxSpeed; 
            player.vy = (player.vy / speed) * maxSpeed; 
        }
        player.x += player.vx; 
        player.y += player.vy;

        if (gameState.bossActive) {
            if (player.x - player.size < 0) player.x = player.size;
            if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
            if (player.y - player.size < 0) player.y = player.size;
            if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;
        } else {
            if (player.x < 0) player.x = canvas.width; if (player.x > canvas.width) player.x = 0;
            if (player.y < 0) player.y = canvas.height; if (player.y > canvas.height) player.y = 0;
        }
    
        Object.keys(playerEffects).forEach(effectName => {
            const effect = playerEffects[effectName];
            if (effect && typeof effect === 'object' && effect.cooldown > 0) {
                 effect.cooldown--;
                 if(effect.cooldown <= 0) {
                    const icon = document.getElementById(`icon-${effectName}`);
                    if (icon) {
                        icon.classList.add('icon-ready-glow');
                        setTimeout(() => icon.classList.remove('icon-ready-glow'), 500);
                        if(soundEnabled && cooldownReadySound) {
                            cooldownReadySound.currentTime = 0;
                            cooldownReadySound.volume = 0.4;
                            cooldownReadySound.play();
                        }
                    }
                 }
            }
            if (effect && typeof effect === 'object' && effect.duration > 0) {
                effect.duration--;
            }
        });

        if (playerEffects.reinforcedPlating.active) {
            playerEffects.reinforcedPlating.noDamageTimer++;
            // 15 segundos = 15 * 60 = 900 frames
            if (playerEffects.reinforcedPlating.noDamageTimer >= 900) {
                 // 10 segundos = 10 * 60 = 600 frames
                 if ((playerEffects.reinforcedPlating.noDamageTimer - 900) % 600 === 0) {
                     playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + playerStats.maxHealth * 0.05);
                 }
            }
        }

        // Lógica passiva da Lâmina de Energia
        if (playerEffects.energyBlade.active && playerEffects.energyBlade.cooldown <= 0) {
            playerEffects.energyBlade.duration = playerEffects.energyBlade.maxDuration;
            playerEffects.energyBlade.cooldown = playerEffects.energyBlade.maxCooldown * playerStats.cooldownReduction;
        }

        updateRepulsionField();

        if (playerEffects.battleFrenzy.active && playerEffects.battleFrenzy.timer > 0) {
            playerEffects.battleFrenzy.timer--;
        }
        if (playerEffects.nanobotRegeneration && playerStats.health < playerStats.maxHealth) {
             playerStats.health += (playerStats.maxHealth * 0.005) / 60; // Aplica a regeneração de vida passiva
        }
        if (playerEffects.hullShield.active && playerEffects.hullShield.shield < playerEffects.hullShield.maxShield) {
            playerEffects.hullShield.shield += 0.1;
        }
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
        const baseBladeLength = 90;
        const bladeLength = baseBladeLength * playerEffects.energyBlade.sizeMultiplier;
        const bladeWidth = 15 * playerEffects.energyBlade.sizeMultiplier; 
        const bladeRadius = bladeLength / 2;
        const angle = playerEffects.energyBlade.angle;
    
        if (!player.invisible) {
            const allEnemies = [...asteroids, ...satellites];
            if(boss) allEnemies.push(boss);
            allEnemies.forEach(enemy => {
                 const p1x = player.x + Math.cos(angle) * bladeRadius;
                const p1y = player.y + Math.sin(angle) * bladeRadius;
                const p2x = player.x - Math.cos(angle) * bladeRadius;
                const p2y = player.y - Math.sin(angle) * bladeRadius;
    
                const dist1 = Math.hypot(p1x - enemy.x, p1y - enemy.y);
                const dist2 = Math.hypot(p2x - enemy.x, p2y - enemy.y);
    
                if (dist1 < enemy.radius || dist2 < enemy.radius) {
                    dealDamageToEnemy(enemy, gameConfig.abilities.energyBlade.damage, false);
                }
            });
        }
    }

    // Refatorado para usar Object Pooling
    function updateBullets() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.x += b.vx;
            b.y += b.vy;
            b.life--;

            if (b.special && b.special.plasma) {
                b.rotation += 0.1;
                // Deixa um rastro de partículas
                createParticles(b.x, b.y, 1, '#00BFFF', 2, 10);
            }

            if (playerEffects.ricochetShot && b.bounced < 2) {
                if ((b.x < 0 || b.x > canvas.width)) { 
                    b.vx *= -1; 
                    b.bounced++;
                }
                if ((b.y < 0 || b.y > canvas.height)) { 
                    b.vy *= -1;
                    b.bounced++;
                }
            }
            
            // Retorna ao pool em vez de deletar
            if (b.life <= 0) {
                returnToPool(b, 'bullets');
                bullets.splice(i, 1);
            }
        }
        for (let i = bossProjectiles.length - 1; i >= 0; i--) {
            const bp = bossProjectiles[i];
            bp.x += bp.vx;
            bp.y += bp.vy;
            bp.life--;
            if (bp.life <= 0) {
                bossProjectiles.splice(i, 1);
                continue;
            }
            if (Math.hypot(player.x - bp.x, player.y - bp.y) < player.size + bp.radius) {
                if (!takeDamage(bp.damage)) {
                   createParticles(bp.x, bp.y, 5, 'red', 2);
                }
                bossProjectiles.splice(i, 1);
            }
        }
    }

    function updateMissiles() {
        for (let i = missiles.length - 1; i >= 0; i--) {
            const m = missiles[i];
    
            if (m.homingDelay > 0) {
                m.x += m.vx;
                m.y += m.vy;
                m.vx *= 0.98; 
                m.vy *= 0.98;
                m.homingDelay--;
            } else {
                if (!m.target || m.target.isDead) {
                    m.target = [...asteroids, ...satellites].filter(e => e.health > 0)
                                 .reduce((closest, ast) => (Math.hypot(m.x - ast.x, m.y - ast.y) < Math.hypot(m.x - (closest?.x || Infinity), m.y - (closest?.y || Infinity)) ? ast : closest), null);
                }
                if (m.target) {
                    const angleToTarget = Math.atan2(m.target.y - m.y, m.target.x - m.x);
                    m.vx = Math.cos(angleToTarget) * m.speed;
                    m.vy = Math.sin(angleToTarget) * m.speed;
                }
            }
    
            m.angle = Math.atan2(m.vy, m.vx);
            m.x += m.vx;
            m.y += m.vy;
            m.life--;
            if (m.life <= 0) missiles.splice(i, 1);
        }
    }

    function updateLightningBolts() {
        for (let i = lightningBolts.length - 1; i >= 0; i--) {
            const bolt = lightningBolts[i];
            bolt.life--;

            if (bolt.life <= 0) {
                lightningBolts.splice(i, 1);
                continue;
            }

            if (bolt.bouncesLeft > 0 && bolt.life < 5) { // Tenta saltar perto do fim da vida do segmento atual
                const lastTarget = bolt.target;
                let nextTarget = null;
                let minDistance = Infinity;
                const potentialTargets = [...asteroids, ...satellites];
                if (boss && !bolt.hitTargets.includes(boss)) potentialTargets.push(boss);

                potentialTargets.forEach(pTarget => {
                    if (pTarget.health > 0 && !bolt.hitTargets.includes(pTarget)) {
                        const distance = Math.hypot(lastTarget.x - pTarget.x, lastTarget.y - pTarget.y);
                        if (distance < minDistance && distance < 350) { // Distância máxima do salto
                            minDistance = distance;
                            nextTarget = pTarget;
                        }
                    }
                });

                if (nextTarget) {
                    dealDamageToEnemy(nextTarget, bolt.damage, false);
                    bolt.hitTargets.push(nextTarget);
                    bolt.target = nextTarget;
                    bolt.bouncesLeft--;
                    bolt.path.push({x: nextTarget.x, y: nextTarget.y});
                    bolt.life = 15; // Reseta a vida para o novo segmento ser visível
                }
            }
        }
    }

    function resolveAsteroidCollision(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);

        const angle = Math.atan2(dy, dx);
        
        const baseSpeed = (a.targetSpeed + b.targetSpeed) / 2 * 1.15;
        
        a.vx = -Math.cos(angle) * baseSpeed;
        a.vy = -Math.sin(angle) * baseSpeed;
        b.vx = Math.cos(angle) * baseSpeed;
        b.vy = Math.sin(angle) * baseSpeed;

        const overlap = (a.radius + b.radius) - distance;
        if (overlap > 0) {
            const separationX = (overlap / 2 + 0.1) * Math.cos(angle);
            const separationY = (overlap / 2 + 0.1) * Math.sin(angle);
            a.x -= separationX;
            a.y -= separationY;
            b.x += separationX;
            b.y += separationY;
        }
    }

    function updateAsteroids() {
        if (asteroids.length === 0 && !gameState.bossActive && boss === null) {
            spawnNextBoss();
        }
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const a = asteroids[i];
            if (a.isFragment) {
                a.vx *= 0.98; a.vy *= 0.98;
                if(Math.hypot(a.vx, a.vy) < a.targetSpeed) a.isFragment = false;
            }
            a.x += a.vx; a.y += a.vy; a.angle += a.angularVelocity;
            if (a.x < -a.radius) a.x = canvas.width + a.radius; if (a.x > canvas.width + a.radius) a.x = -a.radius;
            if (a.y < -a.radius) a.y = canvas.height + a.radius; if (a.y > canvas.height + a.radius) a.y = -a.radius;
            
            for (let j = i + 1; j < asteroids.length; j++) {
                const b = asteroids[j];
                const dist = Math.hypot(a.x - b.x, a.y - b.y);
                if (dist < a.radius + b.radius) {
                    resolveAsteroidCollision(a, b);
                }
            }

            if (!player.invisible && !gameState.isGameOver && !(playerEffects.shieldOvercharge.duration > 0) && Math.hypot(player.x - a.x, player.y - a.y) < a.radius + player.size) {
                const blocked = takeDamage(a.damage);
                const angleOfCollision = Math.atan2(player.y - a.y, player.x - a.x);
                const pushForce = 2;
                const weakPushForce = 0.5;

                a.vx -= Math.cos(angleOfCollision) * pushForce;
                a.vy -= Math.sin(angleOfCollision) * pushForce;
                if (blocked) {
                    player.vx += Math.cos(angleOfCollision) * weakPushForce;
                    player.vy += Math.sin(angleOfCollision) * weakPushForce;
                } else {
                    createParticles(player.x, player.y, 15, "#ff8c00", 3);
                    player.vx += Math.cos(angleOfCollision) * pushForce;
                    player.vy += Math.sin(angleOfCollision) * pushForce;
                }
            }

            for (let j = bullets.length - 1; j >= 0; j--) {
                const b = bullets[j];
                if (!b.active || b.hitTargets.includes(a)) continue;
                if (!player.invisible && Math.hypot(b.x - a.x, b.y - a.y) < a.radius + b.radius) {
                    const isCrit = Math.random() < playerStats.critChance;
                    const damage = isCrit ? b.damage * playerStats.critDamage : b.damage;
                    dealDamageToEnemy(a, damage, isCrit);
                    b.hitTargets.push(a);

                    if (b.special && b.special.plasma) {
                        if (a.health <= 0) {
                            a.killedByPlasmaBullet = b;
                        }
                    } else if (playerEffects.chainLightning.active && Math.random() < playerEffects.chainLightning.chance) {
                        createLightningBolt(b.x, b.y, a, playerEffects.chainLightning.bounces, playerStats.baseDamage * playerEffects.chainLightning.damage, [a]);
                    }
                    
                    createParticles(b.x, b.y, 3, "#FFD700", 2);
                    if (!b.special.spectral && !b.special.plasma) {
                        returnToPool(b, 'bullets');
                        bullets.splice(j, 1);
                    }
                }
            }

            for (let j = missiles.length - 1; j >= 0; j--) {
                const m = missiles[j];
                if (Math.hypot(m.x - a.x, m.y - a.y) < a.radius) {
                    dealDamageToEnemy(a, m.damage);
                    createParticles(m.x, m.y, 10, "#FF4500", 2.5);
                    missiles.splice(j, 1);
                }
            }
        }
    }

    function handleAsteroidDestruction(asteroid, index, killerBullet = null) {
        let particleCount = 20, particleSize = 3, particleLife = 30;
        if(asteroid.size === "medium") { particleCount = 40; particleSize = 4; particleLife = 40; }
        if(asteroid.size === "large")  { particleCount = 60; particleSize = 5, particleLife = 50; }
        createParticles(asteroid.x, asteroid.y, particleCount, "#A9A9A9", particleSize, particleLife);

        let xpAmount = asteroid.xpReward;
        if(Math.random() < 0.15 + playerStats.luck) {
            xpAmount *= 2;
        }
        createXPOrb(asteroid.x, asteroid.y, xpAmount);
        gameState.score += asteroid.xpReward;
        gameState.asteroidsDestroyed++;
        updateScoreUI();

        const fragments = [];
        if (asteroid.size === "large") { 
            fragments.push(createAsteroid("medium", asteroid.x, asteroid.y, true)); 
            fragments.push(createAsteroid("medium", asteroid.x, asteroid.y, true)); 
        } else if (asteroid.size === "medium") { 
            // Para asteroides médios, crie os fragmentos pequenos
            for(let i=0; i<4; i++) {
                fragments.push(createAsteroid("small", asteroid.x, asteroid.y, true)); 
            }
        }

        // Alteração: Garantir que a proteção do plasma se aplique aos fragmentos de asteroides de qualquer tamanho.
        // Esta lógica impede que um único tiro de plasma destrua o asteroide e seus fragmentos instantaneamente.
        if (killerBullet && killerBullet.special.plasma) {
            for (const frag of fragments) {
                killerBullet.hitTargets.push(frag);
            }
        }
        
        asteroids.splice(index, 1);
        if (playerEffects.battleFrenzy.active) { 
            playerEffects.battleFrenzy.timer = playerEffects.battleFrenzy.maxTime; 
        }
    }
    
    function updateBoss() {
        if (!boss) return;
        
        if (boss.shieldHit > 0) {
            boss.shieldHit--;
        }

        if (!boss.hasEntered) {
            boss.y += boss.vy;
            if (boss.y >= 150) {
                boss.hasEntered = true;
                boss.vx = boss.initialVx;
                boss.shieldActive = false;
            }
        } else {
            boss.x += boss.vx;
            if (boss.x - boss.radius < 0 || boss.x + boss.radius > canvas.width) {
                boss.vx *= -1;
            }
        }

        if (boss.type === 'terra') {
            updateTerraBoss();
        } else if (boss.type === 'marte') {
            updateMarsBoss();
        }

        updateBossUI();

        if (boss.health <= 0) {
            createParticles(boss.x, boss.y, 300, "#ffffff", 8, 100);
            if (soundEnabled) {
                bossMusic.pause();
                gameMusic.currentTime = 0;
                gameMusic.play();
            }
            gameState.bossActive = false;
            boss = null;
            satellites.length = 0; 
            bossProjectiles.length = 0;
            bossHealthBarContainer.classList.add('hidden');
            bossWarningBorder.classList.add('hidden');
            gameState.postBossMode = true;
            gameState.bossDefeats++;
            playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + 50 + (playerStats.maxHealth * 0.10));
            lastBlueMeteorWaveTime = Date.now();
            const asteroidsToSpawn = 7 + gameState.bossDefeats;
            for (let i = 0; i < asteroidsToSpawn; i++) createAsteroid("large");
            showBossRewardScreen();
        }
    }

    function updateTerraBoss() {
        boss.moon.angle += 0.02;
        const moonX = boss.x + Math.cos(boss.moon.angle) * boss.moon.distance;
        const moonY = boss.y + Math.sin(boss.moon.angle) * boss.moon.distance;
        
        const satelliteInterval = 4000 * Math.pow(0.8, gameState.bossDefeats);
        if (Date.now() - lastSatelliteLaunch > satelliteInterval && boss.hasEntered) {
            createSatellite(boss.x, boss.y, -1);
            createSatellite(boss.x, boss.y, 1);
            lastSatelliteLaunch = Date.now();
        }

        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            if (!b.active) continue;

            // --- Colisão com o corpo principal do chefe ---
            let hitBossBody = !player.invisible && !b.hitTargets.includes(boss) && Math.hypot(b.x - boss.x, b.y - boss.y) < boss.radius + b.radius;
            if (hitBossBody) {
                if (boss.shieldActive) {
                    boss.shieldHit = 10;
                    createParticles(b.x, b.y, 10, '#00FFFF', 3, 20);
                } else {
                    const isCrit = Math.random() < playerStats.critChance;
                    const damage = isCrit ? b.damage * playerStats.critDamage : b.damage;
                    dealDamageToEnemy(boss, damage, isCrit);
                    b.hitTargets.push(boss); // Previne múltiplos acertos no chefe
                    createParticles(b.x, b.y, 5, "#ff4500", 2);
                }

                // Tiros de plasma são destruídos pelo corpo principal do chefe
                if (!b.special.spectral) {
                    returnToPool(b, 'bullets');
                    bullets.splice(i, 1);
                }
                continue; // Lógica da bala encerrada para este frame
            }
            
            // --- Colisão com a lua ---
            // Verifica se a lua já foi atingida por esta bala
            if (!b.hitTargets.includes('terra_moon') && Math.hypot(b.x - moonX, b.y - moonY) < boss.moon.radius + b.radius) {
                createParticles(b.x, b.y, 3, "#cccccc", 1.5);
                b.hitTargets.push('terra_moon'); // Marca a lua como atingida

                // Ttiros de plasma atravessam a lua
                if (!b.special.spectral && !b.special.plasma) {
                    returnToPool(b, 'bullets');
                    bullets.splice(i, 1);
                }
            }
        }

        if (!player.invisible && !gameState.isGameOver && !boss.shieldActive) {
            if (Math.hypot(player.x - boss.x, player.y - boss.y) < boss.radius + player.size) {
                 const blocked = takeDamage(boss.damage);
                 if (!blocked) {
                    const angleOfCollision = Math.atan2(player.y - boss.y, player.x - boss.x);
                    const pushForce = 4;
                    player.vx += Math.cos(angleOfCollision) * pushForce;
                    player.vy += Math.sin(angleOfCollision) * pushForce;
                    createParticles(player.x, player.y, 20, "#ff4500", 3);
                 }
            }
            if (Math.hypot(player.x - moonX, player.y - moonY) < boss.moon.radius + player.size) {
                 const blocked = takeDamage(50);
                 if (!blocked) {
                    const angleOfCollision = Math.atan2(player.y - moonY, player.x - moonX);
                    const pushForce = 3;
                    player.vx += Math.cos(angleOfCollision) * pushForce;
                    player.vy += Math.sin(angleOfCollision) * pushForce;
                    createParticles(player.x, player.y, 10, "#cccccc", 2.5);
                 }
            }
        }
    }

    function updateMarsBoss() {
        const distY = Math.abs(player.y - boss.y);
        if (distY < boss.heatAura.verticalActivationRange) {
            boss.heatAura.active = true;
            if (distY < boss.heatAura.height / 2) {
                takeDamage(boss.heatAura.damagePerFrame);
            }
        } else {
            boss.heatAura.active = false;
        }

        if (!boss.shieldActive && Math.hypot(player.x - boss.x, player.y - boss.y) < boss.radius + player.size) {
            const blocked = takeDamage(boss.damage);
            if (!blocked) {
               const angleOfCollision = Math.atan2(player.y - boss.y, player.x - boss.x);
               const pushForce = 4;
               player.vx += Math.cos(angleOfCollision) * pushForce;
               player.vy += Math.sin(angleOfCollision) * pushForce;
               createParticles(player.x, player.y, 20, "#ff4500", 3);
            }
        }

        boss.turrets.forEach(turret => {
            if (turret.health <= 0) return;
            turret.x = boss.x + turret.xOffset;
            turret.y = boss.y + turret.yOffset + Math.sin(Date.now() / 400 + turret.animationPhase) * 8;
            
            const safeZoneWidth = boss.radius * 2;
            const safeZoneLeft = boss.x - safeZoneWidth / 2;
            const safeZoneRight = boss.x + safeZoneWidth / 2;
            
            const inSafeZone = player.x > safeZoneLeft && player.x < safeZoneRight;
    
            if (!inSafeZone) {
                turret.targetAngle = Math.atan2(player.y - turret.y, player.x - turret.x);
            } else {
                turret.targetAngle = Math.PI / 2; // Aim straight down
            }
    
            turret.angle = lerpAngle(turret.angle, turret.targetAngle, 0.05);
            
            if(boss.hasEntered) {
                turret.fireCooldown--;
                if (turret.fireCooldown <= 0) {
                    const projectileSpeed = 5;
                    const vx = Math.cos(turret.angle) * projectileSpeed;
                    const vy = Math.sin(turret.angle) * projectileSpeed;
                    createBossProjectile(turret.x, turret.y, vx, vy, gameConfig.boss.mars.turretDamage);
                    turret.fireCooldown = turret.fireRate;
                }
            }
        });
        
        boss.laserShips.forEach(ship => {
            if (ship.health <= 0) {
                ship.state = 'dead'; // Marca a nave como morta para não fazer mais nada
                return;
            }
    
            const onScreenX = ship.side === 'left' ? 50 : canvas.width - 50;
    
            switch(ship.state) {
                case 'entering':
                    ship.currentX += (onScreenX - ship.currentX) * 0.05;
                    if (Math.abs(ship.currentX - onScreenX) < 1) {
                        ship.currentX = onScreenX;
                        ship.state = 'moving'; // Começa a se mover após entrar
                    }
                    break;
                case 'moving':
                    // Se não tem um alvo Y ou chegou perto, pega um novo
                    if (!ship.targetY || Math.abs(ship.y - ship.targetY) < 10) {
                        const bossBottom = boss.y + boss.radius;
                        const availableHeight = canvas.height - bossBottom - 50; // Subtrai uma margem
                        ship.targetY = bossBottom + 25 + Math.random() * availableHeight;
                        ship.moveSpeedY = (ship.targetY > ship.y ? 1 : -1) * (1 + Math.random());
                    }
                    ship.y += ship.moveSpeedY;

                    // Lógica para decidir quando parar e atacar
                    if (!ship.attackTimer) ship.attackTimer = 300 + Math.random() * 180;
                    ship.attackTimer--;
                    if(ship.attackTimer <= 0) {
                        ship.state = 'charging';
                        ship.timer = 120; // Tempo de carga
                    }
                    break;
                case 'charging':
                    ship.timer--;
                    if (ship.timer <= 0) {
                        ship.state = 'firing';
                        ship.timer = 180; // Duração total da animação do laser
                        boss.lasers.push({
                            y: ship.y,
                            life: 180, maxLife: 180,
                            side: ship.side, originX: ship.currentX,
                            warmup: 40, cooldown: 40
                        });
                    }
                    break;
                case 'firing':
                    ship.timer--;
                    if (ship.timer <= 0) {
                        ship.state = 'moving';
                        ship.attackTimer = 300 + Math.random() * 180; // Reseta o timer para o próximo ataque
                    }
                    break;
                 case 'dead':
                    // A nave fica parada e não faz nada
                    break;
            }
        });

        for (let i = boss.lasers.length - 1; i >= 0; i--) {
            const laser = boss.lasers[i];
            laser.life--;
            if (player.y + player.size > laser.y - 20 && player.y - player.size < laser.y + 20) {
                if (!takeDamage(gameConfig.boss.mars.laserDamagePerFrame)) {
                    createParticles(player.x, laser.y, 2, 'red', 1.5);
                }
            }
            if (laser.life <= 0) {
                boss.lasers.splice(i, 1);
            }
        }
        
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            if (!b.active) continue;

            // --- 1. Colisão com o corpo principal do chefe ---
            let hitBossBody = !player.invisible && !b.hitTargets.includes(boss) && Math.hypot(b.x - boss.x, b.y - boss.y) < boss.radius + b.radius;
            if (hitBossBody) {
                if (boss.shieldActive) {
                    boss.shieldHit = 10;
                    createParticles(b.x, b.y, 10, '#00FFFF', 3, 20);
                } else {
                    const isCrit = Math.random() < playerStats.critChance;
                    const damage = isCrit ? b.damage * playerStats.critDamage : b.damage;
                    dealDamageToEnemy(boss, damage, isCrit);
                    b.hitTargets.push(boss);
                    createParticles(b.x, b.y, 5, "#ff4500", 2);
                }

                // Tiros de plasma são destruídos pelo corpo principal do chefe
                if (!b.special.spectral) {
                    returnToPool(b, 'bullets');
                    bullets.splice(i, 1);
                }
                continue; // Lógica da bala encerrada para este frame
            }

            // --- 2. Colisão com Componentes (Torretas, Naves Laser) ---
            let hitComponent = false;
            
            // Torretas
            boss.turrets.forEach(turret => {
                if (!b.active) return;
                if (turret.health > 0 && !b.hitTargets.includes(turret) && Math.hypot(b.x - turret.x, b.y - turret.y) < turret.radius + b.radius) {
                    const isCrit = Math.random() < playerStats.critChance;
                    const damage = isCrit ? b.damage * playerStats.critDamage : b.damage;
                    dealDamageToEnemy(turret, damage, isCrit);
                    b.hitTargets.push(turret);
                    hitComponent = true;
                    if(turret.health <= 0) createParticles(turret.x, turret.y, 50, "#FFA500", 5, 40);
                    else createParticles(b.x, b.y, 3, "#FFFFFF", 1.5);
                }
            });

            // Naves Laser
            boss.laserShips.forEach(ship => {
                if (!b.active) return;
                if (ship.state !== 'idle' && ship.health > 0 && !b.hitTargets.includes(ship)) {
                    if (Math.hypot(b.x - ship.currentX, b.y - ship.y) < 30 + b.radius) {
                        const isCrit = Math.random() < playerStats.critChance;
                        const damage = isCrit ? b.damage * playerStats.critDamage : b.damage;
                        dealDamageToEnemy(ship, damage, isCrit);
                        b.hitTargets.push(ship);
                        hitComponent = true;
                        if(ship.health <= 0) createParticles(ship.currentX, ship.y, 50, "#FFA500", 5, 40);
                        else createParticles(b.x, b.y, 3, "#FFFFFF", 1.5);
                    }
                }
            });

            // Se um componente foi atingido, destrói a bala (a menos que seja plasma ou espectral)
            if (hitComponent && !b.special.spectral && !b.special.plasma) {
                returnToPool(b, 'bullets');
                bullets.splice(i, 1);
            }
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
                if (!b.active || b.hitTargets.includes(s)) continue;
                if (!player.invisible && Math.hypot(b.x - s.x, b.y - s.y) < s.radius + b.radius) {
                    const isCrit = Math.random() < playerStats.critChance;
                    const damage = isCrit ? b.damage * playerStats.critDamage : b.damage;
                    dealDamageToEnemy(s, damage, isCrit);
                    if (b.special && b.special.plasma && !playerEffects.spectralCannon) {
                        createParticles(b.x, b.y, 5, '#87CEFA', 2.5, 20);
                    }
                     if (playerEffects.chainLightning.active && Math.random() < playerEffects.chainLightning.chance) {
                        createLightningBolt(b.x, b.y, s, playerEffects.chainLightning.bounces, playerStats.baseDamage * playerEffects.chainLightning.damage, [s]);
                    }
                    b.hitTargets.push(s);
                    createParticles(b.x, b.y, 2, "#ffff00", 1.5);
                    if(!b.special.spectral && !b.special.plasma) {
                        returnToPool(b, 'bullets');
                        bullets.splice(j, 1);
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
                    const blocked = takeDamage(s.damage);
                    if (!blocked) {
                        const angleOfCollision = Math.atan2(player.y - s.y, player.x - s.x);
                        const pushForce = 1.5;
                        player.vx += Math.cos(angleOfCollision) * pushForce;
                        player.vy += Math.sin(angleOfCollision) * pushForce;
                        createParticles(s.x, s.y, 10, "#ffff00", 2.5);
                    }
                    dealDamageToEnemy(s, 9999); // Destroy satellite on collision
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
                const blocked = takeDamage(bm.damage);
                if (!blocked) {
                    const angleOfCollision = Math.atan2(player.y - bm.y, player.x - bm.x);
                    const pushForce = 1.5;
                    player.vx += Math.cos(angleOfCollision) * pushForce;
                    player.vy += Math.sin(angleOfCollision) * pushForce;
                    createParticles(bm.x, bm.y, 15, "#00BFFF", 2.5);
                }
                blueMeteors.splice(i, 1);
                continue;
            }
            if(bm.y > canvas.height + bm.radius) blueMeteors.splice(i, 1);
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy; p.life--;
            if (p.life <= 0) {
                returnToPool(p, 'particles');
                particles.splice(i, 1);
            }
        }
    }
    
    function updateXPOrbs() {
        for (let i = xpOrbs.length - 1; i >= 0; i--) {
            const orb = xpOrbs[i];
            orb.life--;
            const dist = Math.hypot(player.x - orb.x, player.y - orb.y);
            let speed = 5;
            let currentRadius = playerStats.xpCollectionRadius;
            if(playerEffects.magneticCollector.active){
                speed += playerEffects.magneticCollector.level * 2;
                currentRadius += playerEffects.magneticCollector.level * 20;
            }

            if (dist < currentRadius) {
                const angleToPlayer = Math.atan2(player.y - orb.y, player.x - orb.x);
                orb.vx = Math.cos(angleToPlayer) * speed; 
                orb.vy = Math.sin(angleToPlayer) * speed;
            } else {
                orb.vx *= 0.98; orb.vy *= 0.98;
            }
            orb.x += orb.vx; orb.y += orb.vy;
            if (dist < 15 && !gameState.isGameOver) { 
                gainXP(orb.amount);
                returnToPool(orb, 'xpOrbs');
                xpOrbs.splice(i, 1); 
            }
            else if (orb.life <= 0) {
                returnToPool(orb, 'xpOrbs');
                xpOrbs.splice(i, 1);
            }
        }
    }

    function updateFloatingNumbers() {
        for (let i = floatingNumbers.length - 1; i >= 0; i--) {
            const num = floatingNumbers[i];
            num.y += num.vy;
            num.life--;
            num.alpha = num.life / 60;

            if (num.life <= 0) {
                returnToPool(num, 'floatingNumbers');
                floatingNumbers.splice(i, 1);
            }
        }
    }

    function drawPlayer() {
        ctx.save();
        
        const bobbingY = player.y + Math.sin(Date.now() / gameConfig.player.bobbingSpeed + player.bobbingPhase) * gameConfig.player.bobbingAmount;
        
        ctx.translate(player.x, bobbingY);

        ctx.rotate(player.angle);
        
        if (player.invisible) {
            ctx.globalAlpha = 0.4;
        }

        ctx.drawImage(playerShipImage, -player.size, -player.size, player.size * 2, player.size * 2);
        ctx.restore();

        if (playerEffects.reactiveShield.active) {
            if (playerEffects.reactiveShield.duration > 0) {
                ctx.save();
                ctx.beginPath();
                const activeAlpha = 0.5 + Math.sin(Date.now() / 150) * 0.2;
                ctx.arc(player.x, player.y, player.size * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 191, 255, ${activeAlpha * 0.4})`;
                ctx.fill();
                ctx.strokeStyle = `rgba(0, 191, 255, ${activeAlpha})`;
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.restore();
            } else if (playerEffects.reactiveShield.cooldown <= 0) {
                ctx.save();
                ctx.beginPath();
                const readyAlpha = 0.4 + Math.sin(Date.now() / 250) * 0.2;
                ctx.arc(player.x, player.y, player.size * 1.4, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 191, 255, ${readyAlpha})`;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            }
        }

        if (playerEffects.shieldOvercharge.duration > 0) { ctx.beginPath(); ctx.arc(player.x, player.y, player.size * 1.5, 0, Math.PI * 2); ctx.strokeStyle = `rgba(255, 223, 0, ${0.5 + Math.sin(Date.now() / 100) * 0.2})`; ctx.lineWidth = 4; ctx.stroke(); }
        if (playerEffects.hullShield.active) { ctx.beginPath(); ctx.arc(player.x, player.y, player.size * 1.2, 0, Math.PI * 2 * (playerEffects.hullShield.shield / playerEffects.hullShield.maxShield)); ctx.strokeStyle = "rgba(135, 206, 250, 0.7)"; ctx.lineWidth = 3; ctx.stroke(); }
    }
    
    function drawEnergyBlade() {
        if (!playerEffects.energyBlade.active || playerEffects.energyBlade.duration <= 0) return;
    
        const baseBladeLength = 90;
        const bladeLength = baseBladeLength * playerEffects.energyBlade.sizeMultiplier; 
        const bladeWidth = 15 * playerEffects.energyBlade.sizeMultiplier; 
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
                const angle = Math.atan2(b.vy, b.vx); 
                ctx.rotate(angle); 
                ctx.drawImage(projectileImage, -5, -5, 10, 10);
            }
            
            ctx.restore();
        }
        ctx.fillStyle = "red";
        for (const bp of bossProjectiles) {
            ctx.beginPath();
            ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawMissiles() { for (const m of missiles) { ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.angle); ctx.fillStyle = "orange"; ctx.fillRect(-5, -2, 10, 4); ctx.restore(); } }

    function drawXPOrbs() { for (const orb of xpOrbs) { ctx.fillStyle = "#00FF00"; ctx.beginPath(); ctx.arc(orb.x, orb.y, 5, 0, Math.PI * 2); ctx.fill(); } }

    function drawParticles() { for (const p of particles) { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2); ctx.fill(); } }

    function drawFloatingNumbers() {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (const num of floatingNumbers) {
            ctx.font = `bold ${num.size}px 'Courier New', monospace`;
            ctx.fillStyle = `rgba(${num.color.slice(1).match(/.{1,2}/g).map(hex => parseInt(hex, 16)).join(',')}, ${num.alpha})`;
            ctx.fillText(num.text, num.x, num.y);
        }
        ctx.restore();
    }


    function drawLightningBolts() {
        ctx.save();
        for (const bolt of lightningBolts) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${bolt.life / 15 * 0.8})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            if(bolt.path.length > 0) ctx.moveTo(bolt.path[0].x, bolt.path[0].y);
            for(let j = 1; j < bolt.path.length; j++) {
                const startNode = bolt.path[j-1];
                const endNode = bolt.path[j];
                const midX = (startNode.x + endNode.x) / 2 + (Math.random() - 0.5) * 20;
                const midY = (startNode.y + endNode.y) / 2 + (Math.random() - 0.5) * 20;
                ctx.quadraticCurveTo(midX, midY, endNode.x, endNode.y);
            }
            ctx.stroke();
        }
        ctx.restore();
    }

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
        
        if (boss.type === 'terra') {
            const moonX = boss.x + Math.cos(boss.moon.angle) * boss.moon.distance;
            const moonY = boss.y + Math.sin(boss.moon.angle) * boss.moon.distance;
            if (earthImage.loadSuccess !== false) ctx.drawImage(earthImage, boss.x - boss.radius, boss.y - boss.radius, boss.radius * 2, boss.radius * 2);
            if (moonImage.loadSuccess !== false) ctx.drawImage(moonImage, moonX - boss.moon.radius, moonY - boss.moon.radius, boss.moon.radius * 2, boss.moon.radius * 2);
        } else if (boss.type === 'marte') {
            if (boss.heatAura.active) {
                ctx.save();
                const alpha = (1 - (Math.abs(player.y - boss.y) / boss.heatAura.verticalActivationRange)) * 0.4;
                const gradient = ctx.createLinearGradient(0, boss.y - boss.heatAura.height / 2, 0, boss.y + boss.heatAura.height / 2);

                gradient.addColorStop(0, `rgba(255, 100, 0, 0)`);
                gradient.addColorStop(0.5, `rgba(255, 0, 0, ${Math.min(alpha, 0.4)})`);
                gradient.addColorStop(1, `rgba(255, 100, 0, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, boss.y - boss.heatAura.height / 2, canvas.width, boss.heatAura.height);
                ctx.restore();
            }

            ctx.drawImage(marsImage, boss.x - boss.radius, boss.y - boss.radius, boss.radius * 2, boss.radius * 2);
            boss.turrets.forEach(turret => {
                if (turret.health > 0) {
                    ctx.save();
                    ctx.translate(turret.x, turret.y);
                    ctx.rotate(turret.angle); 
                    ctx.drawImage(marsShipImage, -turret.radius, -turret.radius, turret.radius * 2, turret.radius * 2);
                    ctx.restore();
                }
            });
            boss.laserShips.forEach(ship => {
                if(ship.state !== 'dead' && ship.health > 0) {
                    const shipSize = 30;
                    ctx.save();
                    ctx.translate(ship.currentX, ship.y);
                    if (ship.side === 'left') {
                        ctx.scale(-1, 1);
                    }
                    if(ship.state === 'charging'){
                        const glow = Math.abs(Math.sin(ship.timer * 0.1)) * 10;
                        ctx.shadowColor = "red";
                        ctx.shadowBlur = 10 + glow;
                    }
                    ctx.drawImage(marsShipImage, -shipSize, -shipSize, shipSize*2, shipSize*2);
                    ctx.restore();
                }
            });
            boss.lasers.forEach(laser => {
                ctx.save();
                const laserAge = laser.maxLife - laser.life;
                const startX = laser.side === 'left' ? laser.originX : 0;
                const width = laser.side === 'left' ? canvas.width - laser.originX : laser.originX;
                
                let beamWidth = 40;
                let alpha = 0.7;
        
                if (laserAge < laser.warmup) { // Warmup
                    const warmupProgress = laserAge / laser.warmup;
                    beamWidth *= warmupProgress;
                    alpha *= warmupProgress;
                    for(let k=0; k<5; k++){
                        const pX = laser.originX + (Math.random() - 0.5) * 50 * warmupProgress;
                        const pY = laser.y + (Math.random() - 0.5) * 50 * warmupProgress;
                        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 105}, 100, ${1-warmupProgress})`;
                        ctx.beginPath();
                        ctx.arc(pX, pY, Math.random() * 3 * warmupProgress, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else if (laser.life < laser.cooldown) { // Cooldown
                    const cooldownProgress = laser.life / laser.cooldown;
                    beamWidth *= cooldownProgress;
                    alpha *= cooldownProgress;
                }
        
                // Outer glow
                const grad = ctx.createLinearGradient(0, laser.y - beamWidth / 2, 0, laser.y + beamWidth/2);
                grad.addColorStop(0, `rgba(255, 100, 0, 0)`);
                grad.addColorStop(0.2, `rgba(255, 50, 50, ${alpha * 0.5})`);
                grad.addColorStop(0.5, `rgba(255, 150, 50, ${alpha * 0.6})`);
                grad.addColorStop(0.8, `rgba(255, 50, 50, ${alpha * 0.5})`);
                grad.addColorStop(1, `rgba(255, 100, 0, 0)`);

                ctx.fillStyle = grad;
                ctx.fillRect(startX, laser.y - beamWidth / 2, width, beamWidth);
                
                // Inner core
                ctx.fillStyle = `rgba(255, 255, 220, ${alpha})`;
                ctx.fillRect(startX, laser.y - beamWidth / 8, width, beamWidth / 4);
                
                ctx.restore();
            });
        }
        
        if (boss.shieldHit > 0) {
            ctx.save();
            const shieldAlpha = (boss.shieldHit / 10) * 0.7;
            ctx.strokeStyle = `rgba(0, 255, 255, ${shieldAlpha})`;
            ctx.fillStyle = `rgba(0, 255, 255, ${shieldAlpha * 0.2})`;
            ctx.lineWidth = 2 + (boss.shieldHit / 10) * 3;
            ctx.beginPath();
            ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fill();
            ctx.restore();
        }
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
        const fireRateWithBonus = playerEffects.battleFrenzy.active && playerEffects.battleFrenzy.timer > 0 ? playerStats.fireRate * 1.5 : playerStats.fireRate;
        if (now - lastFireTime > 1000 / fireRateWithBonus) {
            let damage = playerStats.baseDamage;
            const special = { spectral: playerEffects.spectralCannon };
            
            if (playerEffects.bifurcatedShot.active) {
                const numShots = playerEffects.bifurcatedShot.level + 1;
                const totalAngle = 0.25 * numShots;
                const damagePerShot = damage; // Dano não é mais reduzido
                for (let i = 0; i < numShots; i++) {
                    const angleOffset = (numShots > 1) ? -totalAngle / 2 + (i * (totalAngle / (numShots - 1))) : 0;
                    createBullet(player.x, player.y, player.angle + angleOffset, playerStats.projectileSpeed, damagePerShot, special);
                }
            } else {
                createBullet(player.x, player.y, player.angle, playerStats.projectileSpeed, damage, special);
            }

            lastFireTime = now;
        }
    }

    function takeDamage(amount) {
        if (playerStats.health <= 0 || playerEffects.shieldOvercharge.duration > 0) return true;

        if (playerEffects.reactiveShield.duration > 0) {
            return true; // Dano bloqueado
        }
    
        if (playerEffects.reactiveShield.active && playerEffects.reactiveShield.cooldown <= 0) {
            playerEffects.reactiveShield.duration = playerEffects.reactiveShield.maxDuration;
            playerEffects.reactiveShield.cooldown = playerEffects.reactiveShield.maxCooldown * playerStats.cooldownReduction;
            createParticles(player.x, player.y, 40, "#00BFFF", 2.5); 
            return true; 
        }
        
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

        if (playerEffects.reinforcedPlating.active) {
            playerEffects.reinforcedPlating.noDamageTimer = 0;
        }

        damageFlashEffect.classList.remove('hidden');
        damageFlashEffect.classList.add('active');
        setTimeout(() => {
            damageFlashEffect.classList.remove('active');
        }, 200);


        if (playerStats.health <= 0) { playerStats.health = 0; gameOver(); }
        updateUI();
        return false;
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
        gameState.rerollsAvailableThisLevel = 1;
        playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + playerStats.maxHealth * 0.25);
        updateUI();
        showLevelUpScreen();
    }

    function getCardTooltipText(card) {
        let details = `<h4>${card.name}</h4><hr class='my-2 border-gray-600'>`;
        switch(card.id) {
            case "bifurcated_shot":
                details += `<p>Adiciona <span class='tooltip-stat'>+1</span> projétil. Total: <span class='tooltip-stat'>${playerEffects.bifurcatedShot.level + 2}</span></p>`;
                break;
            case "plasma_cannon":
                details += `<p>Próximo Nível: <span class='tooltip-stat'>+1</span> Carga Máxima.</p>`;
                break;
            case "orbital_drones":
                details += `<p>Adiciona <span class='tooltip-stat'>+1</span> Drone. Total: <span class='tooltip-stat'>${playerEffects.orbitalDrones.drones.length + 1}</span></p>`;
                break;
            case "chain_lightning":
                details += `<p>Próximo Nível: <span class='tooltip-stat'>+1</span> Salto.</p>`;
                break;
            case "maneuver_thrusters":
                details += `<p>Velocidade: <span class='tooltip-stat'>+25%</span></p>`;
                break;
            case "adamantium_plating":
                details += `<p>Vida Máxima: <span class='tooltip-stat'>+50</span></p>`;
                break;
            case "repulsion_field":
                details += `<p>Recarga: <span class='tooltip-stat'>-15%</span><br>Raio: <span class='tooltip-stat'>+35</span></p>`;
                break;
            case "fine_calibration":
                details += `<p>Velocidade do Projétil: <span class='tooltip-stat'>+20%</span></p>`;
                break;
            case "combat_focus":
                details += `<p>Chance de Crítico: <span class='tooltip-stat'>+5%</span></p>`;
                break;
            case "improved_reactor":
                details += `<p>Cadência de Tiro: <span class='tooltip-stat'>+25%</span></p>`;
                break;
            case "expansion_modules":
                details += `<p>Alcance do Projétil: <span class='tooltip-stat'>+30%</span></p>`;
                break;
            case "target_analyzer":
                details += `<p>Dano Crítico: <span class='tooltip-stat'>+15%</span><br>Chance de Crítico: <span class='tooltip-stat'>+5%</span></p>`;
                break;
            case "magnetic_collector":
                details += `<p>Nível: <span class='tooltip-stat'>${playerEffects.magneticCollector.level}</span> -> <span class='tooltip-stat'>${playerEffects.magneticCollector.level + 1}</span><br>Raio de Coleta: <span class='tooltip-stat'>+20</span><br>Velocidade de Atração: <span class='tooltip-stat'>+2</span></p>`;
                break;
            case "cooldown_reducer":
                details += `<p>Redução de Recarga: <span class='tooltip-stat'>-10%</span></p>`;
                break;
            case "explorer_luck":
                details += `<p>Sorte: <span class='tooltip-stat'>+1%</span></p>`;
                break;
            case "reinforced_chassis":
                details += `<p>Vida Máxima: <span class='tooltip-stat'>+35</span></p>`;
                break;
            case "armor_plating":
                details += `<p>Armadura: <span class='tooltip-stat'>+3</span></p>`;
                break;
            case "hull_shield":
                details += `<p>Converte <span class='tooltip-stat'>30%</span> da sua vida máxima em um escudo regenerativo.</p>`;
                break;
            default:
                details += `<p>Nenhum detalhe adicional disponível.</p>`;
                break;
        }
        return details;
    }


    function showLevelUpScreen() {
        gameState.isLevelingUp = true;
        togglePause(true, { fromLevelUp: true });
        levelUpScreen.classList.remove("hidden");
        
        rerollButton.classList.remove("hidden");
        rerollButton.disabled = gameState.rerollsAvailableThisLevel <= 0;
        rerollButton.textContent = `Rerolar (${gameState.rerollsAvailableThisLevel})`;

        selectedCardIndex = 0; // Reset index for keyboard navigation
        generateCards();
        updateCardSelection(); // Highlight the first card
    }

    function updateCardSelection() {
        const container = gameState.isChoosingBossReward ? '#bossCardContainer' : '#cardContainer';
        const cards = document.querySelectorAll(`${container} .card`);
        cards.forEach((card, index) => {
            const originalBorderColor = card.classList.contains('card-attack') ? '#ff4500' :
                                      card.classList.contains('card-defense') ? '#00BFFF' :
                                      card.classList.contains('card-attribute') ? '#9ACD32' :
                                      card.classList.contains('card-health') ? '#32CD32' : 
                                      '#FFD700'; // Default para cartas de chefe

            if (index === selectedCardIndex) {
                card.style.borderColor = '#00ff00';
                card.style.boxShadow = '0 0 25px rgba(0, 255, 255, 0.8)';
                card.style.transform = 'translateY(-10px) scale(1.05)';
            } else {
                card.style.borderColor = originalBorderColor;
                card.style.boxShadow = '';
                card.style.transform = '';
            }
        });
    }

    function updatePauseMenuSelection() {
        const buttons = pauseMenu.querySelectorAll('button');
        buttons.forEach((button, index) => {
            if (index === selectedPauseMenuIndex) {
                button.style.background = 'linear-gradient(145deg, #00cc00, #009900)';
                button.style.transform = 'scale(1.1)';
                button.style.boxShadow = '0 0 15px #00ff00';
            } else {
                button.style.background = ''; // Reset to CSS default
                button.style.transform = '';
                button.style.boxShadow = '';
            }
        });
    }
    
    // MELHORIA: Diferenciação visual das cartas
    function generateCards() {
        const cardContainer = document.getElementById("cardContainer");
        cardContainer.innerHTML = "";
        
        let cardPool = [...cardDatabase];
        let availableCards = [];

        const isSuperCard = Math.random() < (0.005 + (playerStats.luck * 0.01));
        if(isSuperCard){
            const cardElement = document.createElement("div");
            cardElement.className = "card super-card";
            cardElement.innerHTML = `<h3>SUPER CARTA!</h3><p>Escolha um power-up duas vezes!</p><button>Escolher</button>`;
            cardContainer.appendChild(cardElement);
            cardElement.querySelector("button").addEventListener("click", () => {
                gameState.doublePickActive = true;
                levelUpScreen.classList.add("hidden");
                showLevelUpScreen();
            });
        } else {
            for (let i = 0; i < 3; i++) {
                if (cardPool.length === 0) break;
                const cardIndex = Math.floor(Math.random() * cardPool.length);
                availableCards.push(cardPool[cardIndex]);
                cardPool.splice(cardIndex, 1);
            }
    
            availableCards.forEach(cardData => {
                const cardElement = document.createElement("div");
                cardElement.className = `card card-${cardData.type}`; // Adiciona a classe de tipo
                cardElement.innerHTML = `<h3>${cardData.name}</h3><p>${cardData.description}</p><button>Escolher</button>`;
                cardContainer.appendChild(cardElement);

                cardElement.addEventListener('mouseenter', (e) => {
                    cardTooltip.innerHTML = getCardTooltipText(cardData);
                    cardTooltip.classList.remove('hidden');
                    cardTooltip.style.opacity = 1;
                    const cardRect = cardElement.getBoundingClientRect();
                    cardTooltip.style.left = `${cardRect.right + 15}px`;
                    cardTooltip.style.top = `${cardRect.top}px`;
                });

                cardElement.addEventListener('mouseleave', () => {
                    cardTooltip.style.opacity = 0;
                    setTimeout(() => cardTooltip.classList.add('hidden'), 200);
                });

                cardElement.querySelector("button").addEventListener("click", () => {
                    applyCardEffect(cardData);
                    if (gameState.doublePickActive) {
                        gameState.doublePickActive = false;
                        showLevelUpScreen();
                    } else {
                        levelUpScreen.classList.add("hidden");
                        rerollButton.classList.add("hidden");
                        gameState.isLevelingUp = false;
                        togglePause(false);
                    }
                });
            });
        }
        updateCardSelection();
    }
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = message;
        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    function addAbilityIcon(effectName, key) {
        const existingIcon = document.getElementById(`icon-${effectName}`);
        if (existingIcon) return;

        const iconContainer = document.createElement('div');
        iconContainer.id = `icon-${effectName}`;
        iconContainer.className = 'ui-icon';
        
        const iconImg = document.createElement('img');
        iconImg.src = iconImages[effectName] || 'assets/icons/default.png';
        iconContainer.appendChild(iconImg);

        const keyText = document.createElement('span');
        keyText.className = 'cooldown-key';
        keyText.textContent = key;
        iconContainer.appendChild(keyText);

        const overlay = document.createElement('div');
        overlay.className = 'cooldown-overlay';
        iconContainer.appendChild(overlay);

        abilityCooldownsContainer.appendChild(iconContainer);
    }
    
    function addPassiveIcon(effectName) {
        const existingIcon = document.getElementById(`passive-icon-${effectName}`);
        if (existingIcon) return;

        const iconContainer = document.createElement('div');
        iconContainer.id = `passive-icon-${effectName}`;
        iconContainer.className = 'ui-icon passive-icon';
        
        const iconImg = document.createElement('img');
        iconImg.src = iconImages[effectName] || 'assets/icons/default.png';
        iconContainer.appendChild(iconImg);
        
        passivePowerupsContainer.appendChild(iconContainer);
    }

    function applyCardEffect(card) {
        if (card.key && !playerEffects[card.id]?.active) {
            showNotification(`Nova Habilidade: <strong>${card.name}</strong> <br> Pressione '${card.key.toUpperCase()}' para usar!`);
        }

        switch(card.id) {
            case "bifurcated_shot":
                playerEffects.bifurcatedShot.active = true;
                if(playerEffects.bifurcatedShot.level < 4) playerEffects.bifurcatedShot.level++; 
                break;
            case "plasma_cannon": 
                if (!playerEffects.plasmaCannon.active) addAbilityIcon('plasmaCannon', card.key);
                playerEffects.plasmaCannon.active = true;
                playerEffects.plasmaCannon.maxCharges++;
                playerEffects.plasmaCannon.charges++;
                heatBarContainer.classList.remove('hidden');
                break;
            case "missile_storm": 
                playerEffects.missileStorm.active = true;
                // A contagem de tiros necessários não é mais reduzida
                break;
            case "orbital_drones":
                playerEffects.orbitalDrones.active = true;
                playerEffects.orbitalDrones.drones.push({ angleOffset: Math.random() * Math.PI * 2, dist: 60, fireRate: 1, lastFire: 0, recoil: 0 });
                break;
            case "energy_blade": 
                if (!playerEffects.energyBlade.active) addPassiveIcon('energyBlade'); 
                playerEffects.energyBlade.active = true; 
                playerEffects.energyBlade.sizeMultiplier = 2.5; 
                break;
            case "ricochet_shot": 
                if (!playerEffects.ricochetShot) addPassiveIcon('ricochetShot');
                playerEffects.ricochetShot = true; 
                break;
            case "chain_lightning": 
                playerEffects.chainLightning.active = true; 
                playerEffects.chainLightning.bounces++;
                break;
            case "battle_frenzy": playerEffects.battleFrenzy.active = true; break;
            case "static_pulse": 
                if (!playerEffects.staticPulse.active) addAbilityIcon('staticPulse', card.key);
                playerEffects.staticPulse.active = true; 
                break;
            case "spectral_cannon": 
                if (!playerEffects.spectralCannon) addPassiveIcon('spectralCannon');
                playerEffects.spectralCannon = true; 
                break;
            case "reactive_shield": playerEffects.reactiveShield.active = true; break;
            case "maneuver_thrusters": playerStats.moveSpeed *= 1.25; break;
            case "adamantium_plating": playerStats.maxHealth += 50; playerStats.health += 50; break;
            case "repulsion_field": 
                playerEffects.repulsionField.active = true; 
                playerEffects.repulsionField.maxCooldown *= 0.85;
                playerEffects.repulsionField.radius += 35;
                break;
            case "emergency_teleport": 
                if (!playerEffects.emergencyTeleport.active) addAbilityIcon('emergencyTeleport', card.key);
                playerEffects.emergencyTeleport.active = true; 
                break;
            case "nanobot_regeneration": 
                if (!playerEffects.nanobotRegeneration) addPassiveIcon('nanobotRegeneration');
                playerEffects.nanobotRegeneration = true; 
                break;
            case "invisibility_cloak": 
                if (!playerEffects.invisibilityCloak.active) addAbilityIcon('invisibilityCloak', card.key);
                playerEffects.invisibilityCloak.active = true; 
                break;
            case "shield_overcharge": 
                if (!playerEffects.shieldOvercharge.active) addAbilityIcon('shieldOvercharge', card.key);
                playerEffects.shieldOvercharge.active = true; 
                break;
            case "fine_calibration": playerStats.projectileSpeed *= 1.2; break;
            case "combat_focus": playerStats.critChance += 0.05; break;
            case "improved_reactor": playerStats.fireRate *= 1.25; break;
            case "expansion_modules": playerStats.projectileRange *= 1.3; break;
            case "target_analyzer": 
                playerStats.critDamage += 0.15;
                playerStats.critChance += 0.05;
                break;
            case "magnetic_collector": 
                playerEffects.magneticCollector.active = true;
                playerEffects.magneticCollector.level++;
                break;
            case "cooldown_reducer": playerStats.cooldownReduction *= 0.9; break;
            case "explorer_luck": playerStats.luck += 0.01; break;
            case "reinforced_chassis": playerStats.maxHealth += 35; playerStats.health += 35; break;
            case "armor_plating": playerStats.armor += 3; break;
            case "hull_shield": playerEffects.hullShield.active = true; playerEffects.hullShield.maxShield = playerStats.maxHealth * 0.3; playerEffects.hullShield.shield = playerEffects.hullShield.maxShield; break;
        }
        updateUI();
    }

    function applyBossCardEffect(card) {
        switch(card.id) {
            case "foco_cirurgico":
                playerStats.baseDamage *= 1.15;
                playerStats.critChance += 0.015;
                playerStats.critDamage += 0.05;
                break;
            case "blindagem_reforcada":
                playerStats.armor += 4;
                playerEffects.reinforcedPlating.active = true;
                break;
            case "propulsores_aprimorados":
                playerStats.moveSpeed *= 1.15;
                playerStats.fireRate *= 1.10;
                break;
        }
        bossRewardScreen.classList.add("hidden");
        gameState.isChoosingBossReward = false;
        togglePause(false);
    }
    
    function showBossRewardScreen() {
        gameState.isChoosingBossReward = true;
        togglePause(true, { fromBossReward: true });
        bossRewardScreen.classList.remove("hidden");

        const cardContainer = document.getElementById("bossCardContainer");
        cardContainer.innerHTML = "";
        
        bossCardDatabase.forEach(card => {
            const cardElement = document.createElement("div");
            cardElement.className = "card";
            cardElement.innerHTML = `<h3>${card.name}</h3><p>${card.description}</p><button>Selecionar</button>`;
            cardContainer.appendChild(cardElement);
            cardElement.querySelector("button").addEventListener("click", () => {
                applyBossCardEffect(card);
            });
        });
        
        selectedCardIndex = 0;
        updateCardSelection();
    }

    function gameOver() {
        gameState.isGameOver = true;
        player.vx = 0; player.vy = 0;
        
        gameMusic.pause();
        bossMusic.pause();
        if(soundEnabled) {
            gameOverSound.currentTime = 0;
            gameOverSound.play();
        }

        // Atualizar estatísticas na tela de Game Over
        const timeSurvived = Math.floor((Date.now() - gameState.startTime) / 1000);
        document.getElementById('statsTime').textContent = `${timeSurvived}s`;
        document.getElementById('statsAsteroids').textContent = gameState.asteroidsDestroyed;
        document.getElementById('statsBosses').textContent = gameState.bossDefeats;
        document.getElementById('statsDamage').textContent = Math.round(gameState.damageDealt);

        createParticles(player.x, player.y, 150, "#ff4500", 4, 60);
        createParticles(player.x, player.y, 100, "#ffa500", 3, 50);
        setTimeout(() => { gameOverScreen.classList.remove('hidden'); }, 1000); 
    }

    function restartGame() {
        cancelAnimationFrame(animationFrameId);
        gameOverScreen.classList.add('hidden');
        pauseMenu.classList.add('hidden');
        bossHealthBarContainer.classList.add('hidden');
        bossWarningBorder.classList.add('hidden');
        heatBarContainer.classList.add('hidden');
        damageFlashEffect.classList.add('hidden');
        
        abilityCooldownsContainer.innerHTML = '';
        passivePowerupsContainer.innerHTML = '';
        
        gameState.paused = false;
        gameState.isLevelingUp = false;
        gameState.isGameOver = false;
        gameState.level = 1;
        gameState.xp = 0;
        gameState.xpRequired = 5;
        gameState.rerollsAvailableThisLevel = 1;
        gameState.score = 0;
        gameState.bossActive = false;
        gameState.postBossMode = false;
        gameState.bossDefeats = 0;
        gameState.startTime = Date.now();
        gameState.asteroidsDestroyed = 0;
        gameState.damageDealt = 0;
        boss = null;
        playerStats = { ...initialPlayerStats };
        playerEffects = JSON.parse(JSON.stringify(initialPlayerEffects));
        
        // Limpa arrays ativos
        asteroids.length = 0; bullets.length = 0; particles.length = 0;
        missiles.length = 0; xpOrbs.length = 0; satellites.length = 0; blueMeteors.length = 0; lightningBolts.length = 0;
        floatingNumbers.length = 0;

        // Re-inicializa os pools
        objectPools.bullets = [];
        objectPools.particles = [];
        objectPools.xpOrbs = [];
        objectPools.floatingNumbers = [];
        prewarmPools();
        
        initGame();
        
        if (soundEnabled) {
            bossMusic.pause();
            gameMusic.currentTime = 0;
            gameMusic.play().catch(e => console.error("A reprodução da música do jogo falhou:", e));
        }
    }

    function updateScoreUI() {
        const scoreString = gameState.score.toString().padStart(5, '0');
        for (let i = 0; i < scoreString.length; i++) {
            scoreDigits[i].src = numberImages[scoreString[i]].src;
        }
    }

    function updateUI() {
        xpBarContainer.querySelector("#xpText").textContent = `NÍVEL ${gameState.level} | XP: ${gameState.xp}/${gameState.xpRequired}`;
        xpBarContainer.querySelector("#xpBarFill").style.width = `${(gameState.xp / gameState.xpRequired) * 100}%`;
        healthBarContainer.querySelector("#healthText").textContent = `HP: ${Math.ceil(playerStats.health)}/${playerStats.maxHealth}`;
        const healthBarFill = healthBarContainer.querySelector("#healthBarFill");
        healthBarFill.style.width = `${(playerStats.health / playerStats.maxHealth) * 100}%`;
        healthBarFill.style.background = (playerStats.health / playerStats.maxHealth < 0.3) ? 'linear-gradient(90deg, #ff0000, #ff6600)' : 'linear-gradient(90deg, #00ff00, #ffff00)';
        
        updateScoreUI();

        if (playerEffects.plasmaCannon.active) {
            if (playerEffects.plasmaCannon.cooldown > 0) {
                const cooldownProgress = 1 - (playerEffects.plasmaCannon.cooldown / (playerEffects.plasmaCannon.maxCooldown * playerStats.cooldownReduction));
                heatBarFill.style.width = `${cooldownProgress * 100}%`;
                heatText.textContent = `RECARREGANDO...`;
            } else {
                const chargeProgress = playerEffects.plasmaCannon.charges / playerEffects.plasmaCannon.maxCharges;
                heatBarFill.style.width = `${chargeProgress * 100}%`;
                heatText.textContent = `CARGAS: ${playerEffects.plasmaCannon.charges}/${playerEffects.plasmaCannon.maxCharges}`;
            }
        }
        
        Object.keys(playerEffects).forEach(effectName => {
            const effect = playerEffects[effectName];
            if (effect.active && effect.maxCooldown) {
                const icon = document.getElementById(`icon-${effectName}`);
                if (icon) {
                    const overlay = icon.querySelector('.cooldown-overlay');
                    const cooldown = effect.cooldown || 0;
                    const maxCooldown = effect.maxCooldown * playerStats.cooldownReduction;
                    const heightPercentage = (cooldown / maxCooldown) * 100;
                    overlay.style.height = `${heightPercentage}%`;
                }
            }
        });
    }

    function updateBossUI() {
        if (!boss) return;
        bossHealthBarContainer.querySelector("#bossHealthBarFill").style.width = `${(boss.health / boss.maxHealth) * 100}%`;
    }

    function gameLoop() {
        if (gameState.paused) return;
        
        animationFrameId = requestAnimationFrame(gameLoop);

        try {
            if (!gameState.isGameOver) {
                updatePlayer();
            }
            updateEnergyBlade();
            
            if (!gameState.isGameOver) {
                if (mouseDown || keys['Space']) {
                    fireBullet();
                }
            }
            updateBullets();
            updateMissiles();
            updateLightningBolts();
            if (gameState.bossActive) { 
                updateBoss();
                if(boss && boss.type === 'terra') updateSatellites();
            } else { 
                updateAsteroids();
            }
            if (gameState.postBossMode) updateBlueMeteors();
            updateParticles();
            updateXPOrbs();
            updateFloatingNumbers();
            
            for (let i = asteroids.length - 1; i >= 0; i--) {
                if (asteroids[i].isDead) {
                    handleAsteroidDestruction(asteroids[i], i, asteroids[i].killedByPlasmaBullet);
                }
            }
            for (let i = satellites.length - 1; i >= 0; i--) {
                if (satellites[i].isDead) {
                    createParticles(satellites[i].x, satellites[i].y, 15, "#ffa500", 2.5, 30);
                    satellites.splice(i, 1);
                }
            }

            updateUI();

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (backgroundImage.loadSuccess !== false) ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
            drawParticles();
            drawBullets();
            drawMissiles();
            drawXPOrbs();
            drawLightningBolts();
            drawAsteroids();
            drawBoss();
            drawSatellites();
            drawBlueMeteors();
            drawFloatingNumbers();
            
            if (!gameState.isGameOver) {
                drawPlayer();
            }
            drawEnergyBlade();
            
            if (playerEffects.orbitalDrones.active) {
                playerEffects.orbitalDrones.drones.forEach((drone, index) => {
                    const angleStep = (Math.PI * 2) / playerEffects.orbitalDrones.drones.length;
                    drone.angleOffset += 0.05;
                    const orbitalAngle = angleStep * index + drone.angleOffset;
                    let dX = player.x + Math.cos(orbitalAngle) * drone.dist;
                    let dY = player.y + Math.sin(orbitalAngle) * drone.dist;
                    
                    if (drone.recoil > 0) {
                        dX -= Math.cos(drone.fireAngle) * drone.recoil;
                        dY -= Math.sin(drone.fireAngle) * drone.recoil;
                        drone.recoil *= 0.8;
                    }

                    ctx.save();
                    ctx.translate(dX, dY);
                    
                    const target = [...asteroids, ...satellites, ...(boss ? [boss] : [])].filter(e => e.health > 0)
                                     .reduce((closest, e) => (Math.hypot(dX - e.x, dY - e.y) < Math.hypot(dX - (closest?.x || Infinity), dY - (closest?.y || Infinity)) ? e : closest), null);
                    
                    if (target) {
                        const angleToTarget = Math.atan2(target.y - dY, target.x - dX);
                        ctx.rotate(angleToTarget + Math.PI / 2);
                    } else {
                        ctx.rotate(orbitalAngle + Math.PI / 2);
                    }
                    
                    const droneSize = 24;
                    ctx.drawImage(droneImage, -droneSize / 2, -droneSize / 2, droneSize, droneSize);
                    ctx.restore();

                    if(!gameState.isGameOver && Date.now() - drone.lastFire > 1000 / drone.fireRate) {
                        if(target){
                           const angleToTarget = Math.atan2(target.y - dY, target.x - dX);
                           createBullet(dX, dY, angleToTarget, playerStats.projectileSpeed * 0.8, playerStats.baseDamage * 0.5);
                           drone.lastFire = Date.now();
                           drone.recoil = 5; 
                           drone.fireAngle = angleToTarget;
                        }
                    }
                });
            }
        } catch (e) {
            console.error("Erro no gameLoop:", e);
            togglePause(true);
        }
    }

    // --- 4. INICIALIZAÇÃO E EVENT LISTENERS ---
    
    function startBossFight(bossType) {
        if (gameState.isGameOver || gameState.bossActive) return;

        asteroids.length = 0;
        bullets.forEach(b => returnToPool(b, 'bullets'));
        bullets.length = 0;
        missiles.length = 0;
        xpOrbs.forEach(orb => returnToPool(orb, 'xpOrbs'));
        xpOrbs.length = 0;
        
        if (bossType === 'terra') {
            spawnTerraBoss();
        } else if (bossType === 'marte') {
            spawnMarsBoss();
        }
    }

    function togglePause(shouldPause, options = {}) {
        const { fromLevelUp = false, showPauseUI = true, fromBossReward = false } = options;

        if (shouldPause && !gameState.paused) {
            gameState.paused = true;
            cancelAnimationFrame(animationFrameId);
            if (fromLevelUp || fromBossReward) {
                return;
            }
            if (showPauseUI) {
                pauseMenu.classList.remove('hidden');
                selectedPauseMenuIndex = 0;
                updatePauseMenuSelection();
            }
        } else if (!shouldPause && gameState.paused) {
            if (gameState.isLevelingUp || gameState.isChoosingBossReward) return;
            
            gameState.paused = false;
            pauseMenu.classList.add('hidden');
            cheatMenu.classList.add('hidden');
            gameLoop();
        }
    }

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

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function initGame() {
        resizeCanvas();
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        player.invisible = false; 
        gameState.startTime = Date.now();
        asteroids.length = 0;
        for (let i = 0; i < 5; i++) createAsteroid("large");
        updateUI();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        prewarmPools();
        gameLoop();
    }
    
    function startGameFlow() {
        if (!introScreen.classList.contains('hidden')) {
            introScreen.classList.add("hidden");
            canvas.classList.remove("hidden");
            xpBarContainer.classList.remove("hidden");
            healthBarContainer.classList.remove("hidden");
            controls.classList.remove("hidden");
            scoreContainer.classList.remove("hidden");
            abilityCooldownsContainer.classList.remove("hidden");
            passivePowerupsContainer.classList.remove("hidden");
            damageFlashEffect.classList.remove('hidden');
            introMusic.pause();
            if (soundEnabled) {
                gameMusic.currentTime = 0;
                gameMusic.play().catch(e => console.error("A reprodução da música do jogo falhou:", e));
            }
            initGame();
        }
    }
    
    function updateSoundPermissionSelection() {
        if (selectedSoundPermissionIndex === 0) { // Sim
            allowSoundBtn.style.transform = 'scale(1.1)';
            allowSoundBtn.style.boxShadow = '0 0 15px #00ff00';
            denySoundBtn.style.transform = '';
            denySoundBtn.style.boxShadow = '';
        } else { // Não
            allowSoundBtn.style.transform = '';
            allowSoundBtn.style.boxShadow = '';
            denySoundBtn.style.transform = 'scale(1.1)';
            denySoundBtn.style.boxShadow = '0 0 15px #ff4500';
        }
    }

    playButton.addEventListener("click", startGameFlow);
    restartButton.addEventListener('click', () => {
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
        restartGame();
    });
    
    resumeButton.addEventListener('click', () => togglePause(false));
    restartFromPauseButton.addEventListener('click', restartGame);

    rerollButton.addEventListener("click", () => {
        if (gameState.rerollsAvailableThisLevel > 0) {
            gameState.rerollsAvailableThisLevel--;
            rerollButton.textContent = `Rerolar (${gameState.rerollsAvailableThisLevel})`;
            generateCards();
            if (gameState.rerollsAvailableThisLevel <= 0) {
                rerollButton.disabled = true;
            }
        }
    });

    document.addEventListener("keydown", (e) => {
        if (!soundPermissionPopup.classList.contains("hidden") && soundPermissionPopup.style.display === 'flex') {
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
                selectedSoundPermissionIndex = 0;
                updateSoundPermissionSelection();
            } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
                selectedSoundPermissionIndex = 1;
                updateSoundPermissionSelection();
            } else if (e.code === 'Enter' || e.code === 'Space') {
                if (selectedSoundPermissionIndex === 0) {
                    allowSoundBtn.click();
                } else {
                    denySoundBtn.click();
                }
            }
            return;
        }

        if (!introScreen.classList.contains("hidden")) {
            if (e.code === 'Space' || e.code === 'Enter') {
                startGameFlow();
            }
            return;
        }

        if (!gameOverScreen.classList.contains("hidden")) {
            if (e.code === 'Enter' || e.code === 'Space') {
                restartButton.click();
            }
            return;
        }
        
        if (gameState.paused && !gameState.isLevelingUp && !gameState.isChoosingBossReward && !cheatMenu.classList.contains("hidden")) {
             if (e.code === 'Escape') {
                 closeCheatMenu();
             }
             return;
        }

        if (gameState.paused && !gameState.isLevelingUp && !gameState.isChoosingBossReward) {
            const buttons = pauseMenu.querySelectorAll('button');
            if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                selectedPauseMenuIndex = (selectedPauseMenuIndex - 1 + buttons.length) % buttons.length;
                updatePauseMenuSelection();
            } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                selectedPauseMenuIndex = (selectedPauseMenuIndex + 1) % buttons.length;
                updatePauseMenuSelection();
            } else if (e.code === 'Enter' || e.code === 'Space') {
                buttons[selectedPauseMenuIndex].click();
            } else if (e.code === 'Escape') {
                 togglePause(false);
            }
            return;
        }

        if (gameState.isLevelingUp || gameState.isChoosingBossReward) {
            const container = gameState.isChoosingBossReward ? '#bossCardContainer' : '#cardContainer';
            const cards = document.querySelectorAll(`${container} .card`);
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                selectedCardIndex = (selectedCardIndex - 1 + cards.length) % cards.length;
                updateCardSelection();
            } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                selectedCardIndex = (selectedCardIndex + 1) % cards.length;
                updateCardSelection();
            } else if (e.code === 'Enter' || e.code === 'Space') {
                if (cards[selectedCardIndex]) {
                    cards[selectedCardIndex].querySelector('button').click();
                }
            } else if (e.code === 'Tab' && !gameState.isChoosingBossReward) {
                e.preventDefault(); 
                rerollButton.click();
            }
            return;
        }
        
        if (e.code === 'Escape' && !gameState.isGameOver) {
            e.preventDefault();
            togglePause(!gameState.paused);
        }
        
        if (gameState.paused) return;

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
            } else if (currentSequence.endsWith('0000')) {
                openCheatMenu();
                keySequence = [];
            }
        }

        if (!gameState.isGameOver) {
            if (e.code === 'KeyK' && playerEffects.plasmaCannon.active && playerEffects.plasmaCannon.charges > 0 && playerEffects.plasmaCannon.cooldown <= 0) {
                firePlasmaShot();
                playerEffects.plasmaCannon.charges--;
                if (playerEffects.plasmaCannon.charges <= 0) {
                    playerEffects.plasmaCannon.cooldown = playerEffects.plasmaCannon.maxCooldown * playerStats.cooldownReduction;
                }
                updateUI();
            }
            if (e.code === "KeyU" && playerEffects.staticPulse.active && playerEffects.staticPulse.cooldown <= 0) {
                asteroids.forEach(a => {
                    if (Math.hypot(player.x - a.x, player.y - a.y) < 200) {
                        dealDamageToEnemy(a, playerStats.baseDamage * gameConfig.abilities.staticPulse.damageMultiplier);
                    }
                });
                createParticles(player.x, player.y, 50, "#FFFF00", 3);
                playerEffects.staticPulse.cooldown = playerEffects.staticPulse.maxCooldown * playerStats.cooldownReduction;
            }
            if (e.code === "KeyP" && playerEffects.emergencyTeleport.active && playerEffects.emergencyTeleport.cooldown <= 0) {
                player.x += Math.cos(player.angle) * gameConfig.abilities.emergencyTeleport.distance; 
                player.y += Math.sin(player.angle) * gameConfig.abilities.emergencyTeleport.distance;
                createParticles(player.x, player.y, 20, "#00FFFF", 2.5);
                playerEffects.emergencyTeleport.cooldown = playerEffects.emergencyTeleport.maxCooldown * playerStats.cooldownReduction;
            }
            if (e.code === "KeyI" && playerEffects.invisibilityCloak.active && playerEffects.invisibilityCloak.cooldown <= 0) {
                playerEffects.invisibilityCloak.duration = playerEffects.invisibilityCloak.maxDuration;
                playerEffects.invisibilityCloak.cooldown = playerEffects.invisibilityCloak.maxCooldown * playerStats.cooldownReduction;
            }
            if (e.code === "KeyO" && playerEffects.shieldOvercharge.active && playerEffects.shieldOvercharge.cooldown <= 0) {
                const healthCost = playerStats.maxHealth * gameConfig.abilities.shieldOvercharge.healthCost;
                if(playerStats.health > healthCost) {
                    playerStats.health -= healthCost; 
                    playerEffects.shieldOvercharge.duration = playerEffects.shieldOvercharge.maxDuration;
                    playerEffects.shieldOvercharge.cooldown = playerEffects.shieldOvercharge.maxCooldown * playerStats.cooldownReduction;
                }
            }
        }
    });
    
    document.addEventListener("keyup", (e) => { keys[e.code] = false; if (e.code === "Space") e.preventDefault(); });
    document.addEventListener("mousedown", () => { if(!gameState.paused) mouseDown = true; });
    document.addEventListener("mouseup", () => { mouseDown = false; });

    document.addEventListener('mousemove', (e) => {
        // Este evento não faz mais nada relacionado à mira da nave.
    });

    function openCheatMenu() {
        if (gameState.paused) return;
        togglePause(true, { showPauseUI: false }); 
        cheatMenu.classList.remove('hidden');
        
        cheatPowerupList.innerHTML = '';
        
        cardDatabase.forEach(card => {
            const btn = document.createElement('button');
            btn.className = 'cheat-button';
            btn.textContent = card.name;
            btn.onclick = () => {
                applyCardEffect(card);
            };
            cheatPowerupList.appendChild(btn);
        });
        
        const separator = document.createElement('div');
        separator.className = 'cheat-section-title';
        separator.textContent = '--- Teste de Chefes ---';
        cheatPowerupList.appendChild(separator);

        const terraBtn = document.createElement('button');
        terraBtn.className = 'cheat-button boss-cheat';
        terraBtn.textContent = 'Invocar Terra';
        terraBtn.onclick = () => {
            startBossFight('terra');
            closeCheatMenu();
        };
        cheatPowerupList.appendChild(terraBtn);

        const marsBtn = document.createElement('button');
        marsBtn.className = 'cheat-button boss-cheat';
        marsBtn.textContent = 'Invocar Marte';
        marsBtn.onclick = () => {
            startBossFight('marte');
            closeCheatMenu();
        };
        cheatPowerupList.appendChild(marsBtn);
    }

    function closeCheatMenu() {
        cheatMenu.classList.add('hidden');
        togglePause(false);
    }

    closeCheatMenuBtn.addEventListener('click', closeCheatMenu);

    window.addEventListener("resize", resizeCanvas);
    
    window.addEventListener('blur', () => {
        if (!gameState.isGameOver) {
            togglePause(true);
        }
    });
    
    soundPermissionPopup.style.display = 'flex';
    updateSoundPermissionSelection();
};

