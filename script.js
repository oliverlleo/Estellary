// Configuração do canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Carregar imagens
const playerShipImage = new Image();
playerShipImage.src = 'player_ship.png';

const projectileImage = new Image();
projectileImage.src = 'projectile.png';

const asteroidImage = new Image();
asteroidImage.src = 'asteroid.png';

const backgroundImage = new Image();
backgroundImage.src = 'background.png';

// Ajustar tamanho do canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Estado do jogo
const gameState = {
    paused: false,
    level: 1,
    xp: 0,
    xpRequired: 10,
    sector: 1,
    time: 0,
    score: 0
};

// Atributos da nave (valores iniciais)
const playerStats = {
    maxHealth: 100,
    health: 100,
    baseDamage: 10,
    armor: 0,
    fireRate: 2, // tiros por segundo
    moveSpeed: 1.5,
    critChance: 0.05,
    critDamage: 1.5,
    projectileSpeed: 8,
    projectileRange: 1000,
    xpCollectionRadius: 50,
    cooldownReduction: 1,
    rotationSpeed: 5,
    luck: 0
};

// Cartas disponíveis
const cardDatabase = [
    // Cartas de Ataque
    {
        id: 'bifurcated_shot',
        name: 'Tiro Bifurcado',
        description: 'Seus projéteis básicos se dividem em dois após uma curta distância, dobrando a área de cobertura.',
        type: 'attack',
        effect: 'bifurcated_shot'
    },
    {
        id: 'plasma_cannon',
        name: 'Canhão de Plasma',
        description: 'Adiciona um tiro carregado. Mantenha o botão pressionado para carregar um orbe de plasma.',
        type: 'attack',
        effect: 'plasma_cannon'
    },
    {
        id: 'missile_storm',
        name: 'Tormenta de Mísseis',
        description: 'A cada 10 tiros disparados, sua nave lança uma salva de pequenos mísseis teleguiados.',
        type: 'attack',
        effect: 'missile_storm'
    },
    {
        id: 'orbital_drones',
        name: 'Disparos Orbitais',
        description: 'Gera dois pequenos drones que orbitam sua nave, disparando projéteis automaticamente.',
        type: 'attack',
        effect: 'orbital_drones'
    },
    {
        id: 'energy_blade',
        name: 'Lâmina de Energia',
        description: 'Um ataque corpo a corpo de curto alcance. Uma lâmina de energia é projetada à frente da nave.',
        type: 'attack',
        effect: 'energy_blade'
    },
    {
        id: 'ricochet_shot',
        name: 'Tiro Ricochete',
        description: 'Seus projéteis ricocheteiam nas bordas da tela e em asteroides maiores.',
        type: 'attack',
        effect: 'ricochet_shot'
    },
    {
        id: 'chain_lightning',
        name: 'Cadeia de Raios',
        description: 'Seus tiros têm chance de gerar um raio elétrico que salta para até 3 inimigos próximos.',
        type: 'attack',
        effect: 'chain_lightning'
    },
    {
        id: 'battle_frenzy',
        name: 'Frenesi de Batalha',
        description: 'A cada inimigo destruído, sua cadência de tiro aumenta temporariamente.',
        type: 'attack',
        effect: 'battle_frenzy'
    },
    {
        id: 'static_pulse',
        name: 'Pulso Estático',
        description: 'Habilidade com recarga que emite uma onda de choque ao redor da nave.',
        type: 'attack',
        effect: 'static_pulse'
    },
    {
        id: 'spectral_cannon',
        name: 'Canhão Espectral',
        description: 'Seus tiros têm chance de se tornarem espectrais, atravessando completamente os inimigos.',
        type: 'attack',
        effect: 'spectral_cannon'
    },
    // Cartas de Defesa
    {
        id: 'reactive_shield',
        name: 'Escudo Reativo',
        description: 'Ao sofrer dano, sua nave gera um escudo temporário que absorve dano.',
        type: 'defense',
        effect: 'reactive_shield'
    },
    {
        id: 'maneuver_thrusters',
        name: 'Propulsores de Manobra',
        description: 'Aumenta permanentemente sua velocidade de movimento e capacidade de resposta.',
        type: 'defense',
        effect: 'maneuver_thrusters'
    },
    {
        id: 'adamantium_plating',
        name: 'Placas de Adamântio',
        description: 'Aumenta sua vida máxima e adiciona armadura, reduzindo o dano recebido.',
        type: 'defense',
        effect: 'adamantium_plating'
    },
    {
        id: 'repulsion_field',
        name: 'Campo de Repulsão',
        description: 'Cria uma aura que desvia lentamente os projéteis inimigos próximos.',
        type: 'defense',
        effect: 'repulsion_field'
    },
    {
        id: 'energy_reconversion',
        name: 'Reconversão de Energia',
        description: 'Uma porcentagem do dano sofrido é convertida em energia para habilidades especiais.',
        type: 'defense',
        effect: 'energy_reconversion'
    },
    {
        id: 'emergency_teleport',
        name: 'Teleporte de Emergência',
        description: 'Habilidade com recarga que permite teleportar para uma curta distância.',
        type: 'defense',
        effect: 'emergency_teleport'
    },
    {
        id: 'nanobot_regeneration',
        name: 'Regeneração de Nanorobôs',
        description: 'Sua nave regenera lentamente vida ao longo do tempo.',
        type: 'defense',
        effect: 'nanobot_regeneration'
    },
    {
        id: 'scrap_attraction',
        name: 'Atração de Sucata',
        description: 'Aumenta o raio de coleta de XP e outros itens soltos pelos inimigos.',
        type: 'defense',
        effect: 'scrap_attraction'
    },
    {
        id: 'invisibility_cloak',
        name: 'Manto de Invisibilidade',
        description: 'Permite ficar invisível por um curto período. Inimigos não o alvejam.',
        type: 'defense',
        effect: 'invisibility_cloak'
    },
    {
        id: 'shield_overcharge',
        name: 'Sobrecarga de Escudo',
        description: 'Consome vida para sobrecarregar escudos, tornando-os invulneráveis temporariamente.',
        type: 'defense',
        effect: 'shield_overcharge'
    },
    // Cartas de Atributos
    {
        id: 'fine_calibration',
        name: 'Calibragem Fina',
        description: 'Aumenta permanentemente a velocidade dos projéteis.',
        type: 'attribute',
        effect: 'fine_calibration'
    },
    {
        id: 'combat_focus',
        name: 'Foco de Combate',
        description: 'Concede um aumento na chance de acerto crítico.',
        type: 'attribute',
        effect: 'combat_focus'
    },
    {
        id: 'improved_reactor',
        name: 'Reator Aprimorado',
        description: 'Aumenta o ritmo de tiro da sua arma principal.',
        type: 'attribute',
        effect: 'improved_reactor'
    },
    {
        id: 'optimized_thrusters',
        name: 'Propulsores Otimizados',
        description: 'Melhora a velocidade de movimento base da sua nave.',
        type: 'attribute',
        effect: 'optimized_thrusters'
    },
    {
        id: 'expansion_modules',
        name: 'Módulos de Expansão',
        description: 'Aumenta o alcance dos tiros.',
        type: 'attribute',
        effect: 'expansion_modules'
    },
    {
        id: 'target_analyzer',
        name: 'Analisador de Alvos',
        description: 'Concede um bônus de dano crítico.',
        type: 'attribute',
        effect: 'target_analyzer'
    },
    {
        id: 'magnetic_collector',
        name: 'Coletor Magnético',
        description: 'Aumenta o raio de coleta de XP.',
        type: 'attribute',
        effect: 'magnetic_collector'
    },
    {
        id: 'cooldown_reducer',
        name: 'Redutor de Recarga',
        description: 'Diminui o tempo de recarga de todas as habilidades ativas.',
        type: 'attribute',
        effect: 'cooldown_reducer'
    },
    {
        id: 'flight_stabilizer',
        name: 'Estabilizador de Voo',
        description: 'Aumenta a velocidade de rotação e aceleração da nave.',
        type: 'attribute',
        effect: 'flight_stabilizer'
    },
    {
        id: 'explorer_luck',
        name: 'Sorte do Explorador',
        description: 'Aumenta a chance de sorte, influenciando vários fatores do jogo.',
        type: 'attribute',
        effect: 'explorer_luck'
    },
    // Cartas de Vida/Defesa
    {
        id: 'reinforced_chassis',
        name: 'Chassi Reforçado',
        description: 'Aumenta permanentemente a vida máxima da sua nave.',
        type: 'health',
        effect: 'reinforced_chassis'
    },
    {
        id: 'armor_plating',
        name: 'Placas de Blindagem',
        description: 'Adiciona um ponto de armadura que reduz o dano recebido.',
        type: 'health',
        effect: 'armor_plating'
    },
    {
        id: 'ablative_coating',
        name: 'Revestimento Ablativo',
        description: 'Concede bônus de vida e armadura, mas diminui ligeiramente a velocidade.',
        type: 'health',
        effect: 'ablative_coating'
    },
    {
        id: 'structural_integrity',
        name: 'Integridade Estrutural',
        description: 'Aumenta a vida máxima e melhora a eficácia dos itens de cura.',
        type: 'health',
        effect: 'structural_integrity'
    },
    {
        id: 'hull_shield',
        name: 'Escudo de Fuselagem',
        description: 'Converte uma porcentagem da vida máxima em um escudo que se regenera.',
        type: 'health',
        effect: 'hull_shield'
    }
];

// Efeitos ativos do jogador
const playerEffects = {
    bifurcatedShot: false,
    plasmaCannon: false,
    missileStorm: { active: false, shotCount: 0 },
    orbitalDrones: { active: false, drones: [] },
    energyBlade: false,
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
    shieldOvercharge: { active: false, cooldown: 0 },
    hullShield: { active: false, shield: 0, maxShield: 0 }
};

// Objetos do jogo
const player = {
    x: 0,
    y: 0,
    angle: 0,
    vx: 0,
    vy: 0,
    size: 15,
    thrust: false,
    invisible: false
};

const bullets = [];
const asteroids = [];
const particles = [];
const missiles = [];
const xpOrbs = [];

// Controles
const keys = {};
let mouseDown = false;
let chargeTime = 0;

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if (e.code === 'Space') {
        e.preventDefault();
    }
});

document.addEventListener('mousedown', () => {
    mouseDown = true;
});

document.addEventListener('mouseup', () => {
    mouseDown = false;
    chargeTime = 0;
});

// Inicialização
function init() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    
    // Criar asteroides iniciais
    for (let i = 0; i < 5; i++) {
        createAsteroid('large');
    }
    
    updateUI();
}

// Função para criar asteroides
function createAsteroid(size, x, y) {
    const asteroid = {
        x: x || Math.random() * canvas.width,
        y: y || Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.1,
        size: size
    };
    
    // Definir propriedades baseadas no tamanho
    switch (size) {
        case 'small':
            asteroid.radius = 15;
            asteroid.health = 10;
            asteroid.maxHealth = 10;
            asteroid.damage = 15;
            asteroid.xpReward = 5;
            asteroid.vx *= 2;
            asteroid.vy *= 2;
            break;
        case 'medium':
            asteroid.radius = 30;
            asteroid.health = 40;
            asteroid.maxHealth = 40;
            asteroid.damage = 30;
            asteroid.xpReward = 20;
            break;
        case 'large':
            asteroid.radius = 50;
            asteroid.health = 100;
            asteroid.maxHealth = 100;
            asteroid.damage = 60;
            asteroid.xpReward = 50;
            asteroid.vx *= 0.5;
            asteroid.vy *= 0.5;
            break;
    }
    
    // Evitar spawn muito próximo do jogador
    const distToPlayer = Math.sqrt((asteroid.x - player.x) ** 2 + (asteroid.y - player.y) ** 2);
    if (distToPlayer < 100) {
        asteroid.x = player.x + (Math.random() > 0.5 ? 150 : -150);
        asteroid.y = player.y + (Math.random() > 0.5 ? 150 : -150);
    }
    
    asteroids.push(asteroid);
}

// Função para criar projétil
function createBullet(x, y, angle, speed = playerStats.projectileSpeed, damage = playerStats.baseDamage, special = {}) {
    const bullet = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: damage,
        life: playerStats.projectileRange / speed,
        maxLife: playerStats.projectileRange / speed,
        special: special
    };
    
    bullets.push(bullet);
    return bullet;
}

// Função para criar míssil
function createMissile(x, y) {
    const missile = {
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        target: null,
        speed: 6,
        damage: playerStats.baseDamage * 0.8,
        life: 300,
        angle: 0
    };
    
    missiles.push(missile);
}

// Função para criar orbe de XP
function createXPOrb(x, y, amount) {
    const orb = {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        amount: amount,
        life: 600, // 10 segundos a 60fps
        collected: false
    };
    
    xpOrbs.push(orb);
}

// Função para criar partículas
function createParticles(x, y, count, color = '#fff') {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30 + Math.random() * 30,
            maxLife: 30 + Math.random() * 30,
            color: color,
            size: 2 + Math.random() * 3
        });
    }
}

// Atualização do jogador
function updatePlayer() {
    // Sistema de movimento direto com WASD
    let moveX = 0;
    let moveY = 0;
    
    // Movimento horizontal
    if (keys['KeyA'] || keys['ArrowLeft']) {
        moveX = -1;
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
        moveX = 1;
    }
    
    // Movimento vertical
    if (keys['KeyW'] || keys['ArrowUp']) {
        moveY = -1;
    }
    if (keys['KeyS'] || keys['ArrowDown']) {
        moveY = 1;
    }
    
    // Normalizar movimento diagonal
    if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.707; // sqrt(2)/2 para manter velocidade consistente
        moveY *= 0.707;
    }
    
    // Aplicar movimento
    if (moveX !== 0 || moveY !== 0) {
        player.thrust = true;
        const thrustPower = 0.4 * playerStats.moveSpeed;
        player.vx += moveX * thrustPower;
        player.vy += moveY * thrustPower;
        
        // Atualizar ângulo da nave para a direção do movimento
        if (moveX !== 0 || moveY !== 0) {
            player.angle = Math.atan2(moveY, moveX);
        }
    } else {
        player.thrust = false;
    }
    
    // Atrito
    player.vx *= 0.95;
    player.vy *= 0.95;
    
    // Limitar velocidade
    const maxSpeed = playerStats.moveSpeed * 1.5;
    const speed = Math.sqrt(player.vx ** 2 + player.vy ** 2);
    if (speed > maxSpeed) {
        player.vx = (player.vx / speed) * maxSpeed;
        player.vy = (player.vy / speed) * maxSpeed;
    }
    
    // Movimento
    player.x += player.vx;
    player.y += player.vy;
    
    // Wrap around screen
    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height;
    if (player.y > canvas.height) player.y = 0;
    
    // Tiro
    if (keys['Space'] || mouseDown) {
        if (playerEffects.plasmaCannon) {
            chargeTime++;
            if (chargeTime >= 60) { // 1 segundo de carga
                // Tiro carregado
                const damage = playerStats.baseDamage * 3;
                createBullet(player.x, player.y, player.angle, playerStats.projectileSpeed * 1.5, damage, { plasma: true, piercing: true });
                chargeTime = 0;
                mouseDown = false;
                keys['Space'] = false;
            }
        } else {
            shoot();
        }
    }
    
    // Habilidades especiais
    if (keys['KeyQ'] && playerEffects.staticPulse.active && playerEffects.staticPulse.cooldown <= 0) {
        activateStaticPulse();
    }
    
    if (keys['KeyE'] && playerEffects.emergencyTeleport.active && playerEffects.emergencyTeleport.cooldown <= 0) {
        activateEmergencyTeleport();
    }
    
    if (keys['KeyR'] && playerEffects.energyBlade) {
        activateEnergyBlade();
    }
    
    // Regeneração de nanorobôs
    if (playerEffects.nanobotRegeneration) {
        if (Math.random() < 0.01) { // 1% de chance por frame
            playerStats.health = Math.min(playerStats.health + 1, playerStats.maxHealth);
        }
    }
    
    // Atualizar cooldowns
    updateCooldowns();
    
    // Atualizar efeitos temporários
    updateTemporaryEffects();
}

let lastShotTime = 0;

function shoot() {
    const now = Date.now();
    const fireInterval = 1000 / playerStats.fireRate;
    
    if (now - lastShotTime < fireInterval) return;
    
    lastShotTime = now;
    
    // Calcular dano com crítico
    let damage = playerStats.baseDamage;
    let isCrit = Math.random() < playerStats.critChance;
    if (isCrit) {
        damage *= playerStats.critDamage;
    }
    
    // Tiro principal
    const bullet = createBullet(player.x, player.y, player.angle, playerStats.projectileSpeed, damage, { critical: isCrit });
    
    // Efeitos especiais
    if (playerEffects.bifurcatedShot) {
        // Criar tiros bifurcados após uma distância
        setTimeout(() => {
            if (bullets.includes(bullet)) {
                const angle1 = bullet.vx / playerStats.projectileSpeed;
                const angle2 = bullet.vy / playerStats.projectileSpeed;
                const baseAngle = Math.atan2(angle2, angle1);
                
                createBullet(bullet.x, bullet.y, baseAngle - 0.3, playerStats.projectileSpeed, damage * 0.8);
                createBullet(bullet.x, bullet.y, baseAngle + 0.3, playerStats.projectileSpeed, damage * 0.8);
            }
        }, 200);
    }
    
    if (playerEffects.missileStorm.active) {
        playerEffects.missileStorm.shotCount++;
        if (playerEffects.missileStorm.shotCount >= 10) {
            // Lançar mísseis
            for (let i = 0; i < 3; i++) {
                setTimeout(() => createMissile(player.x, player.y), i * 100);
            }
            playerEffects.missileStorm.shotCount = 0;
        }
    }
    
    if (playerEffects.battleFrenzy.active) {
        // Será ativado quando destruir inimigos
    }
}

function activateStaticPulse() {
    playerEffects.staticPulse.cooldown = 300 / playerStats.cooldownReduction; // 5 segundos
    
    // Criar onda de choque
    const pulseRadius = 150;
    
    // Empurrar asteroides
    asteroids.forEach(asteroid => {
        const dist = Math.sqrt((asteroid.x - player.x) ** 2 + (asteroid.y - player.y) ** 2);
        if (dist < pulseRadius) {
            const angle = Math.atan2(asteroid.y - player.y, asteroid.x - player.x);
            const force = (pulseRadius - dist) / pulseRadius * 10;
            asteroid.vx += Math.cos(angle) * force;
            asteroid.vy += Math.sin(angle) * force;
            asteroid.health -= 20; // Dano da onda
        }
    });
    
    // Efeito visual
    createParticles(player.x, player.y, 20, '#00ffff');
}

function activateEmergencyTeleport() {
    playerEffects.emergencyTeleport.cooldown = 600 / playerStats.cooldownReduction; // 10 segundos
    
    // Teleportar para frente
    const teleportDistance = 200;
    const newX = player.x + Math.cos(player.angle) * teleportDistance;
    const newY = player.y + Math.sin(player.angle) * teleportDistance;
    
    // Wrap around screen
    player.x = ((newX % canvas.width) + canvas.width) % canvas.width;
    player.y = ((newY % canvas.height) + canvas.height) % canvas.height;
    
    // Efeito visual
    createParticles(player.x, player.y, 15, '#ff00ff');
}

function activateEnergyBlade() {
    const bladeLength = 80;
    const bladeWidth = 30;
    
    // Detectar inimigos na frente da nave
    asteroids.forEach((asteroid, index) => {
        const dx = asteroid.x - player.x;
        const dy = asteroid.y - player.y;
        const dist = Math.sqrt(dx ** 2 + dy ** 2);
        
        if (dist < bladeLength) {
            const angleToAsteroid = Math.atan2(dy, dx);
            const angleDiff = Math.abs(angleToAsteroid - player.angle);
            
            if (angleDiff < 0.5 || angleDiff > Math.PI * 2 - 0.5) {
                // Asteroide está na frente da lâmina
                asteroid.health -= playerStats.baseDamage * 2;
                createParticles(asteroid.x, asteroid.y, 10, '#ffff00');
                
                if (asteroid.health <= 0) {
                    destroyAsteroid(index);
                }
            }
        }
    });
    
    // Efeito visual da lâmina
    createParticles(
        player.x + Math.cos(player.angle) * bladeLength / 2,
        player.y + Math.sin(player.angle) * bladeLength / 2,
        8,
        '#ffff00'
    );
}

function updateCooldowns() {
    if (playerEffects.staticPulse.cooldown > 0) {
        playerEffects.staticPulse.cooldown--;
    }
    if (playerEffects.emergencyTeleport.cooldown > 0) {
        playerEffects.emergencyTeleport.cooldown--;
    }
    if (playerEffects.reactiveShield.cooldown > 0) {
        playerEffects.reactiveShield.cooldown--;
    }
    if (playerEffects.invisibilityCloak.cooldown > 0) {
        playerEffects.invisibilityCloak.cooldown--;
    }
    if (playerEffects.shieldOvercharge.cooldown > 0) {
        playerEffects.shieldOvercharge.cooldown--;
    }
}

function updateTemporaryEffects() {
    // Battle Frenzy
    if (playerEffects.battleFrenzy.timer > 0) {
        playerEffects.battleFrenzy.timer--;
        if (playerEffects.battleFrenzy.timer <= 0) {
            playerEffects.battleFrenzy.stacks = 0;
        }
    }
    
    // Invisibility Cloak
    if (playerEffects.invisibilityCloak.duration > 0) {
        playerEffects.invisibilityCloak.duration--;
        player.invisible = true;
        if (playerEffects.invisibilityCloak.duration <= 0) {
            player.invisible = false;
        }
    }
}

// Atualização dos projéteis
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.life--;
        
        // Ricochet nas bordas
        if (playerEffects.ricochetShot) {
            if (bullet.x <= 0 || bullet.x >= canvas.width) {
                bullet.vx = -bullet.vx;
                bullet.x = Math.max(0, Math.min(canvas.width, bullet.x));
            }
            if (bullet.y <= 0 || bullet.y >= canvas.height) {
                bullet.vy = -bullet.vy;
                bullet.y = Math.max(0, Math.min(canvas.height, bullet.y));
            }
        } else {
            // Wrap around screen
            if (bullet.x < 0) bullet.x = canvas.width;
            if (bullet.x > canvas.width) bullet.x = 0;
            if (bullet.y < 0) bullet.y = canvas.height;
            if (bullet.y > canvas.height) bullet.y = 0;
        }
        
        // Remover se vida acabou
        if (bullet.life <= 0) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Colisão com asteroides
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const asteroid = asteroids[j];
            const dist = Math.sqrt((bullet.x - asteroid.x) ** 2 + (bullet.y - asteroid.y) ** 2);
            
            if (dist < asteroid.radius) {
                // Aplicar dano
                asteroid.health -= bullet.damage;
                
                // Efeitos especiais
                if (playerEffects.chainLightning && Math.random() < 0.3) {
                    createChainLightning(asteroid.x, asteroid.y, bullet.damage * 0.5);
                }
                
                // Ricochet em asteroides grandes
                if (playerEffects.ricochetShot && asteroid.size === 'large') {
                    const angle = Math.atan2(bullet.vy, bullet.vx);
                    const newAngle = angle + Math.PI + (Math.random() - 0.5) * 0.5;
                    bullet.vx = Math.cos(newAngle) * playerStats.projectileSpeed;
                    bullet.vy = Math.sin(newAngle) * playerStats.projectileSpeed;
                } else if (!bullet.special.piercing && !bullet.special.spectral) {
                    bullets.splice(i, 1);
                }
                
                // Verificar se asteroide foi destruído
                if (asteroid.health <= 0) {
                    destroyAsteroid(j);
                    
                    // Battle Frenzy
                    if (playerEffects.battleFrenzy.active) {
                        playerEffects.battleFrenzy.stacks = Math.min(playerEffects.battleFrenzy.stacks + 1, 10);
                        playerEffects.battleFrenzy.timer = 300; // 5 segundos
                    }
                }
                
                createParticles(bullet.x, bullet.y, 5, bullet.special.critical ? '#ffff00' : '#fff');
                break;
            }
        }
    }
}

function createChainLightning(x, y, damage) {
    const targets = [];
    
    // Encontrar até 3 alvos próximos
    asteroids.forEach(asteroid => {
        const dist = Math.sqrt((asteroid.x - x) ** 2 + (asteroid.y - y) ** 2);
        if (dist < 200) {
            targets.push({ asteroid, dist });
        }
    });
    
    targets.sort((a, b) => a.dist - b.dist);
    targets.splice(3); // Máximo 3 alvos
    
    targets.forEach((target, index) => {
        target.asteroid.health -= damage * Math.pow(0.7, index); // Dano reduzido a cada salto
        createParticles(target.asteroid.x, target.asteroid.y, 8, '#00ffff');
    });
}

// Atualização dos mísseis
function updateMissiles() {
    for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        
        // Encontrar alvo mais próximo
        if (!missile.target || missile.target.health <= 0) {
            let closestDist = Infinity;
            missile.target = null;
            
            asteroids.forEach(asteroid => {
                const dist = Math.sqrt((missile.x - asteroid.x) ** 2 + (missile.y - asteroid.y) ** 2);
                if (dist < closestDist) {
                    closestDist = dist;
                    missile.target = asteroid;
                }
            });
        }
        
        // Mover em direção ao alvo
        if (missile.target) {
            const dx = missile.target.x - missile.x;
            const dy = missile.target.y - missile.y;
            const dist = Math.sqrt(dx ** 2 + dy ** 2);
            
            if (dist > 0) {
                missile.angle = Math.atan2(dy, dx);
                missile.vx = Math.cos(missile.angle) * missile.speed;
                missile.vy = Math.sin(missile.angle) * missile.speed;
            }
            
            // Colisão com alvo
            if (dist < missile.target.radius) {
                missile.target.health -= missile.damage;
                createParticles(missile.x, missile.y, 10, '#ff6600');
                
                if (missile.target.health <= 0) {
                    const targetIndex = asteroids.indexOf(missile.target);
                    if (targetIndex !== -1) {
                        destroyAsteroid(targetIndex);
                    }
                }
                
                missiles.splice(i, 1);
                continue;
            }
        }
        
        missile.x += missile.vx;
        missile.y += missile.vy;
        missile.life--;
        
        if (missile.life <= 0) {
            missiles.splice(i, 1);
        }
    }
}

// Atualização dos asteroides
function updateAsteroids() {
    asteroids.forEach(asteroid => {
        asteroid.x += asteroid.vx;
        asteroid.y += asteroid.vy;
        asteroid.angle += asteroid.angularVelocity;
        
        // Wrap around screen
        if (asteroid.x < -asteroid.radius) asteroid.x = canvas.width + asteroid.radius;
        if (asteroid.x > canvas.width + asteroid.radius) asteroid.x = -asteroid.radius;
        if (asteroid.y < -asteroid.radius) asteroid.y = canvas.height + asteroid.radius;
        if (asteroid.y > canvas.height + asteroid.radius) asteroid.y = -asteroid.radius;
        
        // Colisão com jogador
        if (!player.invisible) {
            const dist = Math.sqrt((asteroid.x - player.x) ** 2 + (asteroid.y - player.y) ** 2);
            if (dist < asteroid.radius + player.size) {
                takeDamage(asteroid.damage);
                createParticles(player.x, player.y, 15, '#ff0000');
            }
        }
    });
}

// Atualização dos orbes de XP
function updateXPOrbs() {
    for (let i = xpOrbs.length - 1; i >= 0; i--) {
        const orb = xpOrbs[i];
        
        orb.x += orb.vx;
        orb.y += orb.vy;
        orb.vx *= 0.98;
        orb.vy *= 0.98;
        orb.life--;
        
        // Atração magnética
        const dist = Math.sqrt((orb.x - player.x) ** 2 + (orb.y - player.y) ** 2);
        if (dist < playerStats.xpCollectionRadius) {
            const angle = Math.atan2(player.y - orb.y, player.x - orb.x);
            const force = (playerStats.xpCollectionRadius - dist) / playerStats.xpCollectionRadius * 0.5;
            orb.vx += Math.cos(angle) * force;
            orb.vy += Math.sin(angle) * force;
            
            // Coleta
            if (dist < 20) {
                gainXP(orb.amount);
                xpOrbs.splice(i, 1);
                continue;
            }
        }
        
        // Remover se vida acabou
        if (orb.life <= 0) {
            xpOrbs.splice(i, 1);
        }
    }
}

// Atualização das partículas
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.life--;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Função para destruir asteroide
function destroyAsteroid(index) {
    const asteroid = asteroids[index];
    
    // Criar orbe de XP
    createXPOrb(asteroid.x, asteroid.y, asteroid.xpReward);
    
    // Criar partículas
    createParticles(asteroid.x, asteroid.y, 15, '#888');
    
    // Dividir asteroide se for grande ou médio
    if (asteroid.size === 'large') {
        for (let i = 0; i < 2; i++) {
            createAsteroid('medium', 
                asteroid.x + (Math.random() - 0.5) * 50,
                asteroid.y + (Math.random() - 0.5) * 50
            );
        }
    } else if (asteroid.size === 'medium') {
        for (let i = 0; i < 2; i++) {
            createAsteroid('small',
                asteroid.x + (Math.random() - 0.5) * 30,
                asteroid.y + (Math.random() - 0.5) * 30
            );
        }
    }
    
    asteroids.splice(index, 1);
    gameState.score += asteroid.xpReward * 10;
    
    // Spawn novos asteroides se necessário
    if (asteroids.length < 3) {
        createAsteroid('large');
    }
}

// Função para receber dano
function takeDamage(damage) {
    // Aplicar armadura
    const finalDamage = Math.max(1, damage - playerStats.armor);
    
    // Escudo reativo
    if (playerEffects.reactiveShield.active && playerEffects.reactiveShield.cooldown <= 0) {
        playerEffects.reactiveShield.shieldAmount = 30;
        playerEffects.reactiveShield.cooldown = 600; // 10 segundos
    }
    
    // Aplicar dano ao escudo primeiro
    if (playerEffects.reactiveShield.shieldAmount > 0) {
        const shieldDamage = Math.min(finalDamage, playerEffects.reactiveShield.shieldAmount);
        playerEffects.reactiveShield.shieldAmount -= shieldDamage;
        damage -= shieldDamage;
    }
    
    // Escudo de fuselagem
    if (playerEffects.hullShield.shield > 0 && damage > 0) {
        const hullDamage = Math.min(damage, playerEffects.hullShield.shield);
        playerEffects.hullShield.shield -= hullDamage;
        damage -= hullDamage;
    }
    
    // Aplicar dano restante à vida
    if (damage > 0) {
        playerStats.health -= damage;
        
        // Reconversão de energia
        if (playerEffects.energyReconversion) {
            const energyGain = damage * 0.2;
            // Implementar sistema de energia se necessário
        }
    }
    
    // Verificar morte
    if (playerStats.health <= 0) {
        gameOver();
    }
    
    updateUI();
}

// Função para ganhar XP
function gainXP(amount) {
    gameState.xp += amount;
    
    if (gameState.xp >= gameState.xpRequired) {
        levelUp();
    }
    
    updateUI();
}

// Função para subir de nível
function levelUp() {
    gameState.level++;
    gameState.xp -= gameState.xpRequired;
    gameState.xpRequired = Math.floor(gameState.xpRequired * 1.1); // 10% a mais
    
    // Pausar jogo e mostrar cartas
    gameState.paused = true;
    showCardSelection();
}

// Função para mostrar seleção de cartas
function showCardSelection() {
    const levelUpScreen = document.getElementById('levelUpScreen');
    const cardContainer = document.getElementById('cardContainer');
    
    // Limpar cartas anteriores
    cardContainer.innerHTML = '';
    
    // Selecionar 3 cartas aleatórias
    const availableCards = cardDatabase.filter(card => !hasCard(card.id));
    const selectedCards = [];
    
    for (let i = 0; i < 3 && availableCards.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        selectedCards.push(availableCards.splice(randomIndex, 1)[0]);
    }
    
    // Criar elementos das cartas
    selectedCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <div class="card-title">${card.name}</div>
            <div class="card-description">${card.description}</div>
        `;
        
        cardElement.addEventListener('click', () => {
            selectCard(card);
            levelUpScreen.classList.add('hidden');
            gameState.paused = false;
        });
        
        cardContainer.appendChild(cardElement);
    });
    
    levelUpScreen.classList.remove('hidden');
}

// Função para verificar se já tem uma carta
function hasCard(cardId) {
    // Implementar lógica para verificar cartas já obtidas
    return false; // Por simplicidade, permitir cartas duplicadas por enquanto
}

// Função para selecionar carta
function selectCard(card) {
    applyCardEffect(card);
}

// Função para aplicar efeito da carta
function applyCardEffect(card) {
    switch (card.effect) {
        case 'bifurcated_shot':
            playerEffects.bifurcatedShot = true;
            break;
        case 'plasma_cannon':
            playerEffects.plasmaCannon = true;
            break;
        case 'missile_storm':
            playerEffects.missileStorm.active = true;
            break;
        case 'orbital_drones':
            playerEffects.orbitalDrones.active = true;
            // Implementar drones orbitais
            break;
        case 'energy_blade':
            playerEffects.energyBlade = true;
            break;
        case 'ricochet_shot':
            playerEffects.ricochetShot = true;
            break;
        case 'chain_lightning':
            playerEffects.chainLightning = true;
            break;
        case 'battle_frenzy':
            playerEffects.battleFrenzy.active = true;
            break;
        case 'static_pulse':
            playerEffects.staticPulse.active = true;
            break;
        case 'spectral_cannon':
            playerEffects.spectralCannon = true;
            break;
        case 'reactive_shield':
            playerEffects.reactiveShield.active = true;
            break;
        case 'maneuver_thrusters':
            playerStats.moveSpeed += 1;
            playerStats.rotationSpeed += 1;
            break;
        case 'adamantium_plating':
            playerStats.maxHealth += 30;
            playerStats.health += 30;
            playerStats.armor += 2;
            break;
        case 'repulsion_field':
            playerEffects.repulsionField = true;
            break;
        case 'energy_reconversion':
            playerEffects.energyReconversion = true;
            break;
        case 'emergency_teleport':
            playerEffects.emergencyTeleport.active = true;
            break;
        case 'nanobot_regeneration':
            playerEffects.nanobotRegeneration = true;
            break;
        case 'scrap_attraction':
            playerStats.xpCollectionRadius += 30;
            break;
        case 'invisibility_cloak':
            playerEffects.invisibilityCloak.active = true;
            break;
        case 'shield_overcharge':
            playerEffects.shieldOvercharge.active = true;
            break;
        case 'fine_calibration':
            playerStats.projectileSpeed += 2;
            break;
        case 'combat_focus':
            playerStats.critChance += 0.1;
            break;
        case 'improved_reactor':
            playerStats.fireRate += 0.5;
            break;
        case 'optimized_thrusters':
            playerStats.moveSpeed += 1;
            break;
        case 'expansion_modules':
            playerStats.projectileRange += 200;
            break;
        case 'target_analyzer':
            playerStats.critDamage += 0.25;
            break;
        case 'magnetic_collector':
            playerStats.xpCollectionRadius += 20;
            break;
        case 'cooldown_reducer':
            playerStats.cooldownReduction += 0.2;
            break;
        case 'flight_stabilizer':
            playerStats.rotationSpeed += 2;
            break;
        case 'explorer_luck':
            playerStats.luck += 0.1;
            break;
        case 'reinforced_chassis':
            playerStats.maxHealth += 25;
            playerStats.health += 25;
            break;
        case 'armor_plating':
            playerStats.armor += 3;
            break;
        case 'ablative_coating':
            playerStats.maxHealth += 20;
            playerStats.health += 20;
            playerStats.armor += 2;
            playerStats.moveSpeed -= 0.5;
            break;
        case 'structural_integrity':
            playerStats.maxHealth += 30;
            playerStats.health += 30;
            // Implementar melhoria de cura
            break;
        case 'hull_shield':
            playerEffects.hullShield.active = true;
            playerEffects.hullShield.maxShield = playerStats.maxHealth * 0.2;
            playerEffects.hullShield.shield = playerEffects.hullShield.maxShield;
            break;
    }
    
    updateUI();
}

// Função para atualizar UI
function updateUI() {
    // Barra de XP
    const xpBarFill = document.getElementById('xpBarFill');
    const xpText = document.getElementById('xpText');
    
    const xpPercentage = (gameState.xp / gameState.xpRequired) * 100;
    xpBarFill.style.width = `${xpPercentage}%`;
    xpText.textContent = `Nível ${gameState.level} - XP: ${gameState.xp}/${gameState.xpRequired}`;
    
    // Barra de vida
    let healthBar = document.querySelector('.health-bar');
    if (!healthBar) {
        healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        healthBar.innerHTML = `
            <div class="health-fill"></div>
            <div class="health-text"></div>
        `;
        document.body.appendChild(healthBar);
    }
    
    const healthFill = healthBar.querySelector('.health-fill');
    const healthText = healthBar.querySelector('.health-text');
    
    const healthPercentage = (playerStats.health / playerStats.maxHealth) * 100;
    healthFill.style.width = `${healthPercentage}%`;
    healthText.textContent = `${Math.ceil(playerStats.health)}/${playerStats.maxHealth}`;
    
    // Stats display
    let statsDisplay = document.querySelector('.stats-display');
    if (!statsDisplay) {
        statsDisplay = document.createElement('div');
        statsDisplay.className = 'stats-display';
        document.body.appendChild(statsDisplay);
    }
    
    statsDisplay.innerHTML = `
        Setor: ${gameState.sector}<br>
        Score: ${gameState.score}<br>
        Dano: ${playerStats.baseDamage}<br>
        Armadura: ${playerStats.armor}<br>
        Velocidade: ${playerStats.moveSpeed.toFixed(1)}<br>
        Taxa de Tiro: ${playerStats.fireRate.toFixed(1)}/s
    `;
}

// Função de game over
function gameOver() {
    alert(`Game Over! Score: ${gameState.score}`);
    location.reload();
}

// Função de renderização
function render() {
    // Desenhar background
    if (backgroundImage.complete) {
        // Calcular escala para cobrir toda a tela mantendo proporção
        const scaleX = canvas.width / backgroundImage.width;
        const scaleY = canvas.height / backgroundImage.height;
        const scale = Math.max(scaleX, scaleY);
        
        const scaledWidth = backgroundImage.width * scale;
        const scaledHeight = backgroundImage.height * scale;
        
        const offsetX = (canvas.width - scaledWidth) / 2;
        const offsetY = (canvas.height - scaledHeight) / 2;
        
        ctx.drawImage(backgroundImage, offsetX, offsetY, scaledWidth, scaledHeight);
    } else {
        // Fallback para fundo preto se a imagem não carregou
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar estrelas de fundo como fallback
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 100; i++) {
            const x = (i * 37) % canvas.width;
            const y = (i * 73) % canvas.height;
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Desenhar jogador
    if (!player.invisible || Math.floor(Date.now() / 100) % 2) { // Piscar quando invisível
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);
        
        // Desenhar imagem da nave
        const shipWidth = 30;
        const shipHeight = 30;
        ctx.drawImage(playerShipImage, -shipWidth / 2, -shipHeight / 2, shipWidth, shipHeight);
        
        // Propulsão
        if (player.thrust) {
            ctx.strokeStyle = '#ff6600';
            ctx.beginPath();
            ctx.moveTo(-5, 0);
            ctx.lineTo(-15, 0);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // Desenhar asteroides
    asteroids.forEach(asteroid => {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.angle);
        
        // Desenhar imagem do asteroide
        const asteroidSize = asteroid.radius * 2;
        ctx.drawImage(asteroidImage, -asteroidSize / 2, -asteroidSize / 2, asteroidSize, asteroidSize);
        
        // Barra de vida do asteroide
        if (asteroid.health < asteroid.maxHealth) {
            const barWidth = asteroid.radius * 1.5;
            const barHeight = 4;
            const healthPercent = asteroid.health / asteroid.maxHealth;
            
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth/2, -asteroid.radius - 15, barWidth, barHeight);
            
            ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
            ctx.fillRect(-barWidth/2, -asteroid.radius - 15, barWidth * healthPercent, barHeight);
        }
        
        ctx.restore();
    });
    
    // Desenhar projéteis
    bullets.forEach(bullet => {
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.rotate(Math.atan2(bullet.vy, bullet.vx));
        
        const projWidth = 20;
        const projHeight = 5;
        ctx.drawImage(projectileImage, -projWidth / 2, -projHeight / 2, projWidth, projHeight);
        
        ctx.restore();
    });
    
    // Desenhar mísseis
    missiles.forEach(missile => {
        ctx.save();
        ctx.translate(missile.x, missile.y);
        ctx.rotate(missile.angle);
        
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(-8, -2, 16, 4);
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(-8, -1, 6, 2);
        
        ctx.restore();
    });
    
    // Desenhar orbes de XP
    xpOrbs.forEach(orb => {
        const alpha = orb.life / 600;
        ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Brilho
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Desenhar partículas
    particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Desenhar escudos
    if (playerEffects.reactiveShield.shieldAmount > 0) {
        ctx.strokeStyle = `rgba(0, 255, 255, 0.7)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size + 10, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    if (playerEffects.hullShield.shield > 0) {
        const shieldPercent = playerEffects.hullShield.shield / playerEffects.hullShield.maxShield;
        ctx.strokeStyle = `rgba(0, 100, 255, ${shieldPercent * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size + 15, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Loop principal do jogo
function gameLoop() {
    if (!gameState.paused) {
        updatePlayer();
        updateBullets();
        updateMissiles();
        updateAsteroids();
        updateXPOrbs();
        updateParticles();
        
        gameState.time++;
        
        // Aumentar dificuldade ao longo do tempo
        if (gameState.time % 1800 === 0) { // A cada 30 segundos
            gameState.sector++;
            // Adicionar mais asteroides
            createAsteroid('large');
            if (gameState.sector > 2) {
                createAsteroid('medium');
            }
        }
    }
    
    render();
    requestAnimationFrame(gameLoop);
}

// Iniciar jogo
init();
gameLoop();

