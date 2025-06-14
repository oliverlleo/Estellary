// --- CONFIGURAÇÃO INICIAL ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elementos da UI
const introScreen = document.getElementById("introScreen");
const playButton = document.getElementById("playButton");
const introVideo = document.getElementById("introVideo");
const xpBarContainer = document.getElementById("xpBarContainer");
const healthBarContainer = document.getElementById("healthBarContainer");
const levelUpScreen = document.getElementById("levelUpScreen");
const controls = document.getElementById("controls");
const gameOverScreen = document.getElementById("gameOverScreen");
const restartButton = document.getElementById("restartButton");

// Carregar imagens (usando os nomes de arquivos locais originais)
const playerShipImage = new Image();
playerShipImage.src = "player_ship.png";

const projectileImage = new Image();
projectileImage.src = "projectile.png";

const asteroidImage = new Image();
asteroidImage.src = "asteroid.png";

const backgroundImage = new Image();
backgroundImage.src = "background.png";

// Ajustar tamanho do canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// --- ESTADO DO JOGO E JOGADOR ---
const gameState = {
    paused: false,
    level: 1,
    xp: 0,
    xpRequired: 10,
    sector: 1,
    time: 0,
    score: 0
};

// Salva o estado inicial para poder reiniciar o jogo
const initialPlayerStats = {
    maxHealth: 100,
    health: 100,
    baseDamage: 10,
    armor: 0,
    fireRate: 4,
    moveSpeed: 1.5,
    critChance: 0.05,
    critDamage: 1.5,
    projectileSpeed: 8,
    projectileRange: 1000,
    xpCollectionRadius: 100,
    cooldownReduction: 1,
    rotationSpeed: 5,
    luck: 0
};

let playerStats = { ...initialPlayerStats };

const initialPlayerEffects = {
    bifurcatedShot: false, plasmaCannon: false,
    missileStorm: { active: false, shotCount: 0 },
    orbitalDrones: { active: false, drones: [] },
    energyBlade: false, ricochetShot: false, chainLightning: false,
    battleFrenzy: { active: false, stacks: 0, timer: 0 },
    staticPulse: { active: false, cooldown: 0 },
    spectralCannon: false, reactiveShield: { active: false, cooldown: 0, shieldAmount: 0 },
    repulsionField: false,
    emergencyTeleport: { active: false, cooldown: 0 },
    nanobotRegeneration: false,
    invisibilityCloak: { active: false, cooldown: 0, duration: 0 },
    shieldOvercharge: { active: false, cooldown: 0, duration: 0 },
    hullShield: { active: false, shield: 0, maxShield: 0 }
};

let playerEffects = JSON.parse(JSON.stringify(initialPlayerEffects));


// --- BANCO DE DADOS DE CARTAS (POWER-UPS) ---
const cardDatabase = [
    { id: "bifurcated_shot", name: "Tiro Bifurcado", description: "Seus projéteis se dividem em dois.", type: "attack" },
    { id: "plasma_cannon", name: "Canhão de Plasma", description: "Adiciona um tiro carregado.", type: "attack" },
    { id: "missile_storm", name: "Tormenta de Mísseis", description: "Lança mísseis teleguiados.", type: "attack" },
    { id: "orbital_drones", name: "Disparos Orbitais", description: "Gera drones que disparam.", type: "attack" },
    { id: "energy_blade", name: "Lâmina de Energia", description: "Ataque corpo a corpo (tecla R).", type: "attack" },
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
    { id: "invisibility_cloak", name: "Manto de Invisibilidade", description: "Fica invisível (tecla I).", type: "defense" },
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

// --- OBJETOS DO JOGO ---
const player = { x: 0, y: 0, angle: 0, vx: 0, vy: 0, size: 15, invisible: false };
const bullets = [];
const asteroids = [];
const particles = [];
const missiles = [];
const xpOrbs = [];

// --- CONTROLES ---
const keys = {};
let mouseDown = false;
let chargeTime = 0;

document.addEventListener("keydown", (e) => { keys[e.code] = true; if (e.code === "Space") e.preventDefault(); });
document.addEventListener("keyup", (e) => { keys[e.code] = false; if (e.code === "Space") e.preventDefault(); });
document.addEventListener("mousedown", () => { mouseDown = true; });
document.addEventListener("mouseup", () => { mouseDown = false; chargeTime = 0; });

// --- INICIALIZAÇÃO DO JOGO ---
playButton.addEventListener("click", () => {
    introScreen.classList.add("hidden");
    canvas.classList.remove("hidden");
    xpBarContainer.classList.remove("hidden");
    healthBarContainer.classList.remove("hidden");
    controls.classList.remove("hidden");
    introVideo.pause();
    initGame();
});

restartButton.addEventListener('click', restartGame);


function initGame() {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.invisible = false; // Garante que o jogador esteja visível no início
    for (let i = 0; i < 5; i++) createAsteroid("large");
    updateUI();
    gameLoop();
}

// --- FUNÇÕES DE CRIAÇÃO DE OBJETOS ---
function createAsteroid(size, x, y) {
    const asteroid = { x: x || Math.random() * canvas.width, y: y || Math.random() * canvas.height, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, angle: Math.random() * Math.PI * 2, angularVelocity: (Math.random() - 0.5) * 0.1, size: size };
    switch (size) {
        case "small": asteroid.radius = 15; asteroid.health = 10; asteroid.damage = 15; asteroid.xpReward = 5; break;
        case "medium": asteroid.radius = 30; asteroid.health = 40; asteroid.damage = 30; asteroid.xpReward = 20; break;
        case "large": asteroid.radius = 50; asteroid.health = 100; asteroid.damage = 60; asteroid.xpReward = 50; break;
    }
    asteroid.maxHealth = asteroid.health;
    if (Math.hypot(asteroid.x - player.x, asteroid.y - player.y) < 200) { asteroid.x = player.x + (Math.random() > 0.5 ? 250 : -250); asteroid.y = player.y + (Math.random() > 0.5 ? 250 : -250); }
    asteroids.push(asteroid);
}

function createBullet(x, y, angle, speed = playerStats.projectileSpeed, damage = playerStats.baseDamage, special = {}) {
    bullets.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, damage, life: playerStats.projectileRange / speed, special });
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

// --- LÓGICA DE ATUALIZAÇÃO (UPDATE) ---
function updatePlayer() {
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

    if (player.x < 0) player.x = canvas.width; if (player.x > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height; if (player.y > canvas.height) player.y = 0;
    
    Object.values(playerEffects).forEach(effect => {
        if (effect.cooldown > 0) effect.cooldown--;
        if (effect.duration > 0) effect.duration--;
    });
    if (playerEffects.battleFrenzy.timer > 0) playerEffects.battleFrenzy.timer--; else playerEffects.battleFrenzy.stacks = 0;
    if (playerEffects.invisibilityCloak.duration <= 0 && player.invisible) player.invisible = false;
    
    if (playerEffects.nanobotRegeneration && playerStats.health < playerStats.maxHealth) playerStats.health += 0.05;
    if (playerEffects.hullShield.active && playerEffects.hullShield.shield < playerEffects.hullShield.maxShield) playerEffects.hullShield.shield += 0.1;
    playerStats.health = Math.min(playerStats.health, playerStats.maxHealth);
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx; b.y += b.vy; b.life--;
        if (playerEffects.ricochetShot) {
            if (b.x < 0 || b.x > canvas.width) b.vx *= -1;
            if (b.y < 0 || b.y > canvas.height) b.vy *= -1;
        }
        if (b.life <= 0) bullets.splice(i, 1);
    }
}

function updateMissiles() {
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
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.x += a.vx; a.y += a.vy; a.angle += a.angularVelocity;
        if (a.x < -a.radius) a.x = canvas.width + a.radius; if (a.x > canvas.width + a.radius) a.x = -a.radius;
        if (a.y < -a.radius) a.y = canvas.height + a.radius; if (a.y > canvas.height + a.radius) a.y = -a.radius;

        if (!player.invisible && !(playerEffects.shieldOvercharge.duration > 0) && Math.hypot(player.x - a.x, player.y - a.y) < a.radius + player.size) {
            
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
            if (Math.hypot(bullets[j].x - a.x, bullets[j].y - a.y) < a.radius) {
                a.health -= bullets[j].damage;
                createParticles(bullets[j].x, bullets[j].y, 5, "#FFD700");
                if (!bullets[j].special?.spectral) bullets.splice(j, 1);
                if (a.health <= 0) { handleAsteroidDestruction(a, i); break; }
            }
        }
        if (a.health <= 0) continue;

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

function handleAsteroidDestruction(asteroid, index) {
    createParticles(asteroid.x, asteroid.y, 20, "#A9A9A9");
    createXPOrb(asteroid.x, asteroid.y, asteroid.xpReward);
    gameState.score += asteroid.xpReward;
    if (asteroid.size === "large") { createAsteroid("medium", asteroid.x, asteroid.y); createAsteroid("medium", asteroid.x, asteroid.y); }
    else if (asteroid.size === "medium") { createAsteroid("small", asteroid.x, asteroid.y); createAsteroid("small", asteroid.x, asteroid.y); }
    if (asteroids[index] === asteroid) asteroids.splice(index, 1);
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
        if (dist < 15) { gainXP(orb.amount); xpOrbs.splice(i, 1); }
        else if (orb.life <= 0) { xpOrbs.splice(i, 1); }
    }
}

// --- FUNÇÕES DE DESENHO (DRAW) ---
function drawPlayer() {
    if (player.invisible) return; // Não desenha o jogador se ele estiver invisível (morto)
    ctx.save();
    // A invisibilidade de power-up tem um efeito visual diferente
    ctx.globalAlpha = playerEffects.invisibilityCloak.duration > 0 ? 0.4 : 1.0;
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.drawImage(playerShipImage, -player.size, -player.size, player.size * 2, player.size * 2);
    ctx.restore();
    if (playerEffects.shieldOvercharge.duration > 0) { ctx.beginPath(); ctx.arc(player.x, player.y, player.size * 1.5, 0, Math.PI * 2); ctx.strokeStyle = `rgba(255, 223, 0, ${0.5 + Math.sin(Date.now() / 100) * 0.2})`; ctx.lineWidth = 4; ctx.stroke(); }
    if (playerEffects.hullShield.active) { ctx.beginPath(); ctx.arc(player.x, player.y, player.size * 1.2, 0, Math.PI * 2 * (playerEffects.hullShield.shield / playerEffects.hullShield.maxShield)); ctx.strokeStyle = "rgba(135, 206, 250, 0.7)"; ctx.lineWidth = 3; ctx.stroke(); }
}

function drawBullets() { for (const b of bullets) ctx.drawImage(projectileImage, b.x - 5, b.y - 5, 10, 10); }
function drawMissiles() { for (const m of missiles) { ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.angle); ctx.fillStyle = "orange"; ctx.fillRect(-5, -2, 10, 4); ctx.restore(); } }
function drawXPOrbs() { for (const orb of xpOrbs) { ctx.fillStyle = "#00FF00"; ctx.beginPath(); ctx.arc(orb.x, orb.y, 5, 0, Math.PI * 2); ctx.fill(); } }
function drawParticles() { for (const p of particles) { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2); ctx.fill(); } }
function drawAsteroids() {
    for (const a of asteroids) {
        ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.angle);
        ctx.drawImage(asteroidImage, -a.radius, -a.radius, a.radius * 2, a.radius * 2);
        ctx.restore();
        const barX = a.x - a.radius, barY = a.y - a.radius - 10;
        ctx.fillStyle = "red"; ctx.fillRect(barX, barY, a.radius * 2, 5);
        ctx.fillStyle = "lime"; ctx.fillRect(barX, barY, a.radius * 2 * (a.health / a.maxHealth), 5);
    }
}

// --- LÓGICA DO JOGO ---
let lastFireTime = 0;
function fireBullet() {
    const now = Date.now();
    const fireRateWithBonus = playerStats.fireRate * (1 + playerEffects.battleFrenzy.stacks * 0.1);
    if (now - lastFireTime > 1000 / fireRateWithBonus) {
        let damage = playerStats.baseDamage;
        if (Math.random() < playerStats.critChance) damage *= playerStats.critDamage;
        const special = { spectral: playerEffects.spectralCannon && Math.random() < 0.2 };
        createBullet(player.x, player.y, player.angle, playerStats.projectileSpeed, damage, special);

        if (playerEffects.bifurcatedShot) {
            createBullet(player.x, player.y, player.angle - 0.2, playerStats.projectileSpeed, damage * 0.7, special);
            createBullet(player.x, player.y, player.angle + 0.2, playerStats.projectileSpeed, damage * 0.7, special);
        }
        
        lastFireTime = now;
        if (playerEffects.missileStorm.active && ++playerEffects.missileStorm.shotCount >= 10) { createMissile(player.x, player.y); playerEffects.missileStorm.shotCount = 0; }
    }
}

function takeDamage(amount) {
    if (playerStats.health <= 0) return; // Previne dano extra após a morte

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
    
    if (playerStats.health <= 0) {
        playerStats.health = 0;
        gameOver();
    }
    updateUI();
}

function gainXP(amount) {
    gameState.xp += amount;
    if (gameState.xp >= gameState.xpRequired) levelUp();
    updateUI();
}

function levelUp() {
    gameState.level++; gameState.xp -= gameState.xpRequired; gameState.xpRequired = Math.floor(gameState.xpRequired * 1.5);
    playerStats.health = playerStats.maxHealth;
    updateUI();
    showLevelUpScreen();
}

function showLevelUpScreen() {
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
        case "bifurcated_shot": playerEffects.bifurcatedShot = true; break;
        case "plasma_cannon": playerEffects.plasmaCannon = true; break;
        case "missile_storm": playerEffects.missileStorm.active = true; break;
        case "orbital_drones": playerEffects.orbitalDrones.active = true; playerEffects.orbitalDrones.drones = [{angleOffset:0, dist:50, fireRate:1, lastFire:0}, {angleOffset:Math.PI, dist:50, fireRate:1, lastFire:0}]; break;
        case "energy_blade": playerEffects.energyBlade = true; break;
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
    gameState.paused = true;
    player.invisible = true; // Esconde a nave
    player.vx = 0; player.vy = 0; // Para a nave

    // Cria a explosão
    createParticles(player.x, player.y, 150, "#ff4500");
    createParticles(player.x, player.y, 100, "#ffa500");

    // Mostra a tela de game over após um breve delay
    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, 1000); 
}

function restartGame() {
    gameOverScreen.classList.add('hidden');

    // Reseta o estado do jogo
    gameState.paused = false;
    gameState.level = 1;
    gameState.xp = 0;
    gameState.xpRequired = 10;
    gameState.score = 0;

    // Reseta os status e efeitos do jogador
    playerStats = { ...initialPlayerStats };
    playerEffects = JSON.parse(JSON.stringify(initialPlayerEffects));

    // Limpa todos os objetos da tela
    asteroids.length = 0;
    bullets.length = 0;
    particles.length = 0;
    missiles.length = 0;
    xpOrbs.length = 0;

    // Reinicia o jogo
    initGame();
}

function updateUI() {
    document.getElementById("xpText").textContent = `NÍVEL ${gameState.level} | XP: ${gameState.xp}/${gameState.xpRequired}`;
    document.getElementById("xpBarFill").style.width = `${(gameState.xp / gameState.xpRequired) * 100}%`;
    const healthText = document.getElementById("healthText");
    const healthBarFill = document.getElementById("healthBarFill");
    if (healthText && healthBarFill) {
        healthText.textContent = `HP: ${Math.ceil(playerStats.health)}/${playerStats.maxHealth}`;
        healthBarFill.style.width = `${(playerStats.health / playerStats.maxHealth) * 100}%`;
        healthBarFill.style.background = (playerStats.health / playerStats.maxHealth < 0.3) ? 'linear-gradient(90deg, #ff0000, #ff6600)' : 'linear-gradient(90deg, #00ff00, #ffff00)';
    }
}

// --- LOOP PRINCIPAL DO JOGO ---
function gameLoop() {
    if (gameState.paused) return;

    updatePlayer();
    updateBullets();
    updateMissiles();
    updateAsteroids();
    updateParticles();
    updateXPOrbs();

    if (mouseDown || keys['Space']) {
        if (playerEffects.plasmaCannon) chargeTime++; else fireBullet();
    }
    if (!mouseDown && playerEffects.plasmaCannon && chargeTime > 0) {
        const plasmaDamage = playerStats.baseDamage * (1 + chargeTime / 60);
        createBullet(player.x, player.y, player.angle, playerStats.projectileSpeed * 0.7, plasmaDamage, { plasma: true });
        chargeTime = 0;
    }

    if (playerEffects.staticPulse.active && keys["KeyQ"] && playerEffects.staticPulse.cooldown === 0) {
         for (let a of asteroids) { if(Math.hypot(player.x - a.x, player.y - a.y) < 200) a.health -= playerStats.baseDamage * 3; }
         createParticles(player.x, player.y, 50, "#FFFF00");
         playerEffects.staticPulse.cooldown = 300 * playerStats.cooldownReduction;
    }
    if (playerEffects.emergencyTeleport.active && keys["KeyE"] && playerEffects.emergencyTeleport.cooldown === 0) {
        player.x += Math.cos(player.angle) * 150; player.y += Math.sin(player.angle) * 150;
        createParticles(player.x, player.y, 20, "#00FFFF");
        playerEffects.emergencyTeleport.cooldown = 180 * playerStats.cooldownReduction;
    }
    if (playerEffects.invisibilityCloak.active && keys["KeyI"] && playerEffects.invisibilityCloak.cooldown === 0) {
        playerEffects.invisibilityCloak.duration = 300;
        playerEffects.invisibilityCloak.cooldown = 600 * playerStats.cooldownReduction;
    }
    if (playerEffects.shieldOvercharge.active && keys["KeyO"] && playerEffects.shieldOvercharge.cooldown === 0) {
        takeDamage(playerStats.maxHealth * -0.2);
        playerEffects.shieldOvercharge.duration = 180;
        playerEffects.shieldOvercharge.cooldown = 600 * playerStats.cooldownReduction;
    }

    // Desenhar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    drawParticles();
    drawBullets();
    drawMissiles();
    drawXPOrbs();
    drawAsteroids();
    drawPlayer();
    
    if (playerEffects.orbitalDrones.active) {
        playerEffects.orbitalDrones.drones.forEach(drone => {
            drone.angleOffset += 0.05;
            const dX = player.x + Math.cos(drone.angleOffset) * drone.dist;
            const dY = player.y + Math.sin(drone.angleOffset) * drone.dist;
            ctx.fillStyle = "#8A2BE2"; ctx.beginPath(); ctx.arc(dX, dY, 5, 0, Math.PI * 2); ctx.fill();
            if(Date.now() - drone.lastFire > 1000 / drone.fireRate) {
                createBullet(dX, dY, Math.atan2(dY-player.y, dX-player.x), playerStats.projectileSpeed * 0.8, playerStats.baseDamage * 0.5);
                drone.lastFire = Date.now();
            }
        });
    }
    
     if (playerEffects.energyBlade && keys["KeyR"]) {
        const bladeLength = 50, bladeWidth = 10;
        const bladeX = player.x + Math.cos(player.angle) * (player.size + bladeLength / 2);
        const bladeY = player.y + Math.sin(player.angle) * (player.size + bladeLength / 2);
        ctx.save(); ctx.translate(bladeX, bladeY); ctx.rotate(player.angle);
        ctx.fillStyle = "#FF00FF"; ctx.fillRect(-bladeLength/2, -bladeWidth/2, bladeLength, bladeWidth); ctx.restore();
        for (let a of asteroids) if(Math.hypot(bladeX - a.x, bladeY - a.y) < a.radius + bladeLength/2) a.health -= playerStats.baseDamage * 0.2;
    }

    requestAnimationFrame(gameLoop);
}

window.addEventListener('load', () => {
    const videoPromise = introVideo.play();
    if (videoPromise !== undefined) {
        videoPromise.catch(error => {
            console.warn("Autoplay do vídeo foi bloqueado pelo navegador:", error);
        });
    }
});
