// Configuração do canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elementos da tela de introdução
const introScreen = document.getElementById("introScreen");
const playButton = document.getElementById("playButton");
const introVideo = document.getElementById("introVideo");

// Elementos do jogo
const xpBarContainer = document.getElementById("xpBarContainer");
const levelUpScreen = document.getElementById("levelUpScreen");
const controls = document.getElementById("controls");

// Carregar imagens
const playerShipImage = new Image();
playerShipImage.src = "player_ship.png";

const projectileImage = new Image();
projectileImage.src = "projectile.png";

const asteroidImage = new Image();
asteroidImage.src = "asteroid.png";

const backgroundImage = new Image();
backgroundImage.src = "background.png";

// Função para carregar imagens com verificação de carregamento
function loadImages() {
    const images = [playerShipImage, projectileImage, asteroidImage, backgroundImage];
    let loadedCount = 0;
    const totalImages = images.length;
    
    return new Promise((resolve, reject) => {
        images.forEach(image => {
            if (image.complete) {
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            } else {
                image.onload = () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        resolve();
                    }
                };
                image.onerror = () => {
                    reject(new Error(`Falha ao carregar imagem: ${image.src}`));
                };
            }
        });
    });
}

// Ajustar tamanho do canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

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
        id: "bifurcated_shot",
        name: "Tiro Bifurcado",
        description: "Seus projéteis básicos se dividem em dois após uma curta distância, dobrando a área de cobertura.",
        type: "attack",
        effect: "bifurcated_shot"
    },
    {
        id: "plasma_cannon",
        name: "Canhão de Plasma",
        description: "Adiciona um tiro carregado. Mantenha o botão pressionado para carregar um orbe de plasma.",
        type: "attack",
        effect: "plasma_cannon"
    },
    {
        id: "missile_storm",
        name: "Tormenta de Mísseis",
        description: "A cada 10 tiros disparados, sua nave lança uma salva de pequenos mísseis teleguiados.",
        type: "attack",
        effect: "missile_storm"
    },
    {
        id: "orbital_drones",
        name: "Disparos Orbitais",
        description: "Gera dois pequenos drones que orbitam sua nave, disparando projéteis automaticamente.",
        type: "attack",
        effect: "orbital_drones"
    },
    {
        id: "energy_blade",
        name: "Lâmina de Energia",
        description: "Um ataque corpo a corpo de curto alcance. Uma lâmina de energia é projetada à frente da nave.",
        type: "attack",
        effect: "energy_blade"
    },
    {
        id: "ricochet_shot",
        name: "Tiro Ricochete",
        description: "Seus projéteis ricocheteiam nas bordas da tela e em asteroides maiores.",
        type: "attack",
        effect: "ricochet_shot"
    },
    {
        id: "chain_lightning",
        name: "Cadeia de Raios",
        description: "Seus tiros têm chance de gerar um raio elétrico que salta para até 3 inimigos próximos.",
        type: "attack",
        effect: "chain_lightning"
    },
    {
        id: "battle_frenzy",
        name: "Frenesi de Batalha",
        description: "A cada inimigo destruído, sua cadência de tiro aumenta temporariamente.",
        type: "attack",
        effect: "battle_frenzy"
    },
    {
        id: "static_pulse",
        name: "Pulso Estático",
        description: "Habilidade com recarga que emite uma onda de choque ao redor da nave.",
        type: "attack",
        effect: "static_pulse"
    },
    {
        id: "spectral_cannon",
        name: "Canhão Espectral",
        description: "Seus tiros têm chance de se tornarem espectrais, atravessando completamente os inimigos.",
        type: "attack",
        effect: "spectral_cannon"
    },
    // Cartas de Defesa
    {
        id: "reactive_shield",
        name: "Escudo Reativo",
        description: "Ao sofrer dano, sua nave gera um escudo temporário que absorve dano.",
        type: "defense",
        effect: "reactive_shield"
    },
    {
        id: "maneuver_thrusters",
        name: "Propulsores de Manobra",
        description: "Aumenta permanentemente sua velocidade de movimento e capacidade de resposta.",
        type: "defense",
        effect: "maneuver_thrusters"
    },
    {
        id: "adamantium_plating",
        name: "Placas de Adamântio",
        description: "Aumenta sua vida máxima e adiciona armadura, reduzindo o dano recebido.",
        type: "defense",
        effect: "adamantium_plating"
    },
    {
        id: "repulsion_field",
        name: "Campo de Repulsão",
        description: "Cria uma aura que desvia lentamente os projéteis inimigos próximos.",
        type: "defense",
        effect: "repulsion_field"
    },
    {
        id: "energy_reconversion",
        name: "Reconversão de Energia",
        description: "Uma porcentagem do dano sofrido é convertida em energia para habilidades especiais.",
        type: "defense",
        effect: "energy_reconversion"
    },
    {
        id: "emergency_teleport",
        name: "Teleporte de Emergência",
        description: "Habilidade com recarga que permite teleportar para uma curta distância.",
        type: "defense",
        effect: "emergency_teleport"
    },
    {
        id: "nanobot_regeneration",
        name: "Regeneração de Nanorobôs",
        description: "Sua nave regenera lentamente vida ao longo do tempo.",
        type: "defense",
        effect: "nanobot_regeneration"
    },
    {
        id: "scrap_attraction",
        name: "Atração de Sucata",
        description: "Aumenta o raio de coleta de XP e outros itens soltos pelos inimigos.",
        type: "defense",
        effect: "scrap_attraction"
    },
    {
        id: "invisibility_cloak",
        name: "Manto de Invisibilidade",
        description: "Permite ficar invisível por um curto período. Inimigos não o alvejam.",
        type: "defense",
        effect: "invisibility_cloak"
    },
    {
        id: "shield_overcharge",
        name: "Sobrecarga de Escudo",
        description: "Consome vida para sobrecarregar escudos, tornando-os invulneráveis temporariamente.",
        type: "defense",
        effect: "shield_overcharge"
    },
    // Cartas de Atributos
    {
        id: "fine_calibration",
        name: "Calibragem Fina",
        description: "Aumenta permanentemente a velocidade dos projéteis.",
        type: "attribute",
        effect: "fine_calibration"
    },
    {
        id: "combat_focus",
        name: "Foco de Combate",
        description: "Concede um aumento na chance de acerto crítico.",
        type: "attribute",
        effect: "combat_focus"
    },
    {
        id: "improved_reactor",
        name: "Reator Aprimorado",
        description: "Aumenta o ritmo de tiro da sua arma principal.",
        type: "attribute",
        effect: "improved_reactor"
    },
    {
        id: "optimized_thrusters",
        name: "Propulsores Otimizados",
        description: "Melhora a velocidade de movimento base da sua nave.",
        type: "attribute",
        effect: "optimized_thrusters"
    },
    {
        id: "expansion_modules",
        name: "Módulos de Expansão",
        description: "Aumenta o alcance dos tiros.",
        type: "attribute",
        effect: "expansion_modules"
    },
    {
        id: "target_analyzer",
        name: "Analisador de Alvos",
        description: "Concede um bônus de dano crítico.",
        type: "attribute",
        effect: "target_analyzer"
    },
    {
        id: "magnetic_collector",
        name: "Coletor Magnético",
        description: "Aumenta o raio de coleta de XP.",
        type: "attribute",
        effect: "magnetic_collector"
    },
    {
        id: "cooldown_reducer",
        name: "Redutor de Recarga",
        description: "Diminui o tempo de recarga de todas as habilidades ativas.",
        type: "attribute",
        effect: "cooldown_reducer"
    },
    {
        id: "flight_stabilizer",
        name: "Estabilizador de Voo",
        description: "Aumenta a velocidade de rotação e aceleração da nave.",
        type: "attribute",
        effect: "flight_stabilizer"
    },
    {
        id: "explorer_luck",
        name: "Sorte do Explorador",
        description: "Aumenta a chance de sorte, influenciando vários fatores do jogo.",
        type: "attribute",
        effect: "explorer_luck"
    },
    // Cartas de Vida/Defesa
    {
        id: "reinforced_chassis",
        name: "Chassi Reforçado",
        description: "Aumenta permanentemente a vida máxima da sua nave.",
        type: "health",
        effect: "reinforced_chassis"
    },
    {
        id: "armor_plating",
        name: "Placas de Blindagem",
        description: "Adiciona um ponto de armadura que reduz o dano recebido.",
        type: "health",
        effect: "armor_plating"
    },
    {
        id: "ablative_coating",
        name: "Revestimento Ablativo",
        description: "Concede bônus de vida e armadura, mas diminui ligeiramente a velocidade.",
        type: "health",
        effect: "ablative_coating"
    },
    {
        id: "structural_integrity",
        name: "Integridade Estrutural",
        description: "Aumenta a vida máxima e melhora a eficácia dos itens de cura.",
        type: "health",
        effect: "structural_integrity"
    },
    {
        id: "hull_shield",
        name: "Escudo de Fuselagem",
        description: "Converte uma porcentagem da vida máxima em um escudo que se regenera.",
        type: "health",
        effect: "hull_shield"
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
document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code === "Space") {
        e.preventDefault();
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
    if (e.code === "Space") {
        e.preventDefault();
    }
});

document.addEventListener("mousedown", () => {
    mouseDown = true;
});

document.addEventListener("mouseup", () => {
    mouseDown = false;
    chargeTime = 0;
});

// Inicialização do jogo
function initGame() {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    
    // Criar asteroides iniciais
    for (let i = 0; i < 5; i++) {
        createAsteroid("large");
    }
    
    updateUI();
    gameLoop(); // Inicia o loop do jogo
}

// Função para iniciar o jogo após a tela de introdução
playButton.addEventListener("click", () => {
    introScreen.classList.add("hidden");
    canvas.classList.remove("hidden");
    xpBarContainer.classList.remove("hidden");
    controls.classList.remove("hidden");
    // levelUpScreen.classList.remove(


        // levelUpScreen.classList.remove("hidden"); // Remova o comentário se quiser que a tela de level up apareça no início
    introVideo.pause();
    initGame();
});

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
        case "small":
            asteroid.radius = 15;
            asteroid.health = 10;
            asteroid.maxHealth = 10;
            asteroid.damage = 15;
            asteroid.xpReward = 5;
            asteroid.vx *= 2;
            asteroid.vy *= 2;
            break;
        case "medium":
            asteroid.radius = 30;
            asteroid.health = 40;
            asteroid.maxHealth = 40;
            asteroid.damage = 30;
            asteroid.xpReward = 20;
            break;
        case "large":
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
function createParticles(x, y, count, color = "#fff") {
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
    if (keys["KeyA"] || keys["ArrowLeft"]) {
        moveX = -1;
    }
    if (keys["KeyD"] || keys["ArrowRight"]) {
        moveX = 1;
    }
    
    // Movimento vertical
    if (keys["KeyW"] || keys["ArrowUp"]) {
        moveY = -1;
    }
    if (keys["KeyS"] || keys["ArrowDown"]) {
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

    // Atualizar efeitos
    if (playerEffects.battleFrenzy.active) {
        playerEffects.battleFrenzy.timer--;
        if (playerEffects.battleFrenzy.timer <= 0) {
            playerEffects.battleFrenzy.active = false;
            playerEffects.battleFrenzy.stacks = 0;
        }
    }

    if (playerEffects.staticPulse.cooldown > 0) {
        playerEffects.staticPulse.cooldown--;
    }

    if (playerEffects.reactiveShield.cooldown > 0) {
        playerEffects.reactiveShield.cooldown--;
    }

    if (playerEffects.emergencyTeleport.cooldown > 0) {
        playerEffects.emergencyTeleport.cooldown--;
    }

    if (playerEffects.invisibilityCloak.active) {
        playerEffects.invisibilityCloak.duration--;
        if (playerEffects.invisibilityCloak.duration <= 0) {
            playerEffects.invisibilityCloak.active = false;
            player.invisible = false;
        }
    }

    if (playerEffects.shieldOvercharge.cooldown > 0) {
        playerEffects.shieldOvercharge.cooldown--;
    }

    if (playerEffects.nanobotRegeneration) {
        if (playerStats.health < playerStats.maxHealth) {
            playerStats.health += 0.05; // Regenera 3 de vida por segundo (0.05 * 60fps)
            if (playerStats.health > playerStats.maxHealth) {
                playerStats.health = playerStats.maxHealth;
            }
        }
    }

    if (playerEffects.hullShield.active) {
        if (playerEffects.hullShield.shield < playerEffects.hullShield.maxShield) {
            playerEffects.hullShield.shield += 0.1; // Regenera escudo
            if (playerEffects.hullShield.shield > playerEffects.hullShield.maxShield) {
                playerEffects.hullShield.shield = playerEffects.hullShield.maxShield;
            }
        }
    }
}

// Atualização de projéteis
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.life--;

        // Ricochete
        if (playerEffects.ricochetShot) {
            if (bullet.x < 0 || bullet.x > canvas.width) {
                bullet.vx *= -1;
            }
            if (bullet.y < 0 || bullet.y > canvas.height) {
                bullet.vy *= -1;
            }
        }

        if (bullet.life <= 0) {
            bullets.splice(i, 1);
        }
    }
}

// Atualização de mísseis
function updateMissiles() {
    for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        if (!missile.target || missile.target.health <= 0) {
            // Encontrar novo alvo
            missile.target = findClosestAsteroid(missile.x, missile.y);
        }

        if (missile.target) {
            const angleToTarget = Math.atan2(missile.target.y - missile.y, missile.target.x - missile.x);
            missile.vx = Math.cos(angleToTarget) * missile.speed;
            missile.vy = Math.sin(angleToTarget) * missile.speed;
            missile.angle = angleToTarget;
        }

        missile.x += missile.vx;
        missile.y += missile.vy;
        missile.life--;

        if (missile.life <= 0) {
            missiles.splice(i, 1);
        }
    }
}

// Atualização de asteroides
function updateAsteroids() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.x += asteroid.vx;
        asteroid.y += asteroid.vy;
        asteroid.angle += asteroid.angularVelocity;

        // Wrap around screen
        if (asteroid.x < -asteroid.radius) asteroid.x = canvas.width + asteroid.radius;
        if (asteroid.x > canvas.width + asteroid.radius) asteroid.x = -asteroid.radius;
        if (asteroid.y < -asteroid.radius) asteroid.y = canvas.height + asteroid.radius;
        if (asteroid.y > canvas.height + asteroid.radius) asteroid.y = -asteroid.radius;

        // Colisão com projéteis
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            const dist = Math.sqrt((bullet.x - asteroid.x) ** 2 + (bullet.y - asteroid.y) ** 2);
            if (dist < asteroid.radius) {
                asteroid.health -= bullet.damage;
                createParticles(bullet.x, bullet.y, 5, "#FFD700"); // Partículas de impacto

                if (!bullet.special.spectral) {
                    bullets.splice(j, 1);
                }

                if (asteroid.health <= 0) {
                    handleAsteroidDestruction(asteroid, i);
                    break;
                }
            }
        }

        // Colisão com mísseis
        for (let j = missiles.length - 1; j >= 0; j--) {
            const missile = missiles[j];
            const dist = Math.sqrt((missile.x - asteroid.x) ** 2 + (missile.y - asteroid.y) ** 2);
            if (dist < asteroid.radius) {
                asteroid.health -= missile.damage;
                createParticles(missile.x, missile.y, 10, "#FF4500"); // Partículas de explosão de míssil
                missiles.splice(j, 1);

                if (asteroid.health <= 0) {
                    handleAsteroidDestruction(asteroid, i);
                    break;
                }
            }
        }

        // Colisão com o jogador
        const distToPlayer = Math.sqrt((player.x - asteroid.x) ** 2 + (player.y - asteroid.y) ** 2);
        if (distToPlayer < asteroid.radius + player.size && !player.invisible) {
            if (playerEffects.shieldOvercharge.active) {
                // Ignora dano se escudo sobrecarregado
            } else if (playerEffects.reactiveShield.active) {
                playerEffects.reactiveShield.shieldAmount -= asteroid.damage;
                if (playerEffects.reactiveShield.shieldAmount <= 0) {
                    playerEffects.reactiveShield.active = false;
                }
            } else if (playerEffects.hullShield.active) {
                playerEffects.hullShield.shield -= asteroid.damage;
                if (playerEffects.hullShield.shield <= 0) {
                    playerEffects.hullShield.active = false;
                    playerStats.health += playerEffects.hullShield.shield; // Dano excedente vai para a vida
                    playerEffects.hullShield.shield = 0;
                }
            } else {
                takeDamage(asteroid.damage);
            }
            handleAsteroidDestruction(asteroid, i);
            break;
        }
    }
}

function handleAsteroidDestruction(asteroid, index) {
    createParticles(asteroid.x, asteroid.y, 20, "#A9A9A9"); // Partículas de asteroide destruído
    createXPOrb(asteroid.x, asteroid.y, asteroid.xpReward);
    gameState.score += asteroid.xpReward; // Adiciona pontuação

    if (asteroid.size === "large") {
        createAsteroid("medium", asteroid.x + 20, asteroid.y);
        createAsteroid("medium", asteroid.x - 20, asteroid.y);
    } else if (asteroid.size === "medium") {
        createAsteroid("small", asteroid.x + 10, asteroid.y);
        createAsteroid("small", asteroid.x - 10, asteroid.y);
    }
    asteroids.splice(index, 1);

    // Battle Frenzy
    if (playerEffects.battleFrenzy.active) {
        playerEffects.battleFrenzy.stacks++;
        playerStats.fireRate = 2 * (1 + playerEffects.battleFrenzy.stacks * 0.1); // Aumenta fireRate
        playerEffects.battleFrenzy.timer = 300; // Reseta timer (5 segundos)
    }
}

// Atualização de partículas
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Atualização de orbes de XP
function updateXPOrbs() {
    for (let i = xpOrbs.length - 1; i >= 0; i--) {
        const orb = xpOrbs[i];
        orb.life--;

        // Movimento em direção ao jogador se estiver dentro do raio de coleta
        const dist = Math.sqrt((player.x - orb.x) ** 2 + (player.y - orb.y) ** 2);
        if (dist < playerStats.xpCollectionRadius) {
            const angleToPlayer = Math.atan2(player.y - orb.y, player.x - orb.x);
            orb.vx = Math.cos(angleToPlayer) * 5; // Velocidade de atração
            orb.vy = Math.sin(angleToPlayer) * 5;
        } else {
            // Movimento aleatório inicial
            orb.vx *= 0.98;
            orb.vy *= 0.98;
        }

        orb.x += orb.vx;
        orb.y += orb.vy;

        // Coleta
        if (dist < 10 && !orb.collected) {
            gainXP(orb.amount);
            orb.collected = true;
            xpOrbs.splice(i, 1);
        } else if (orb.life <= 0) {
            xpOrbs.splice(i, 1);
        }
    }
}

// Funções de desenho
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.drawImage(playerShipImage, -player.size, -player.size, player.size * 2, player.size * 2);
    ctx.restore();

    // Desenhar escudo reativo
    if (playerEffects.reactiveShield.active) {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Desenhar escudo de fuselagem
    if (playerEffects.hullShield.active) {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size * 1.2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(135, 206, 250, 0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function drawBullets() {
    for (const bullet of bullets) {
        ctx.drawImage(projectileImage, bullet.x - 5, bullet.y - 5, 10, 10);
    }
}

function drawAsteroids() {
    for (const asteroid of asteroids) {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.angle);
        ctx.drawImage(asteroidImage, -asteroid.radius, -asteroid.radius, asteroid.radius * 2, asteroid.radius * 2);
        ctx.restore();

        // Desenhar barra de vida do asteroide
        const healthBarWidth = asteroid.radius * 2;
        const healthBarHeight = 5;
        const healthBarX = asteroid.x - asteroid.radius;
        const healthBarY = asteroid.y - asteroid.radius - 10;
        ctx.fillStyle = "red";
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        ctx.fillStyle = "lime";
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * (asteroid.health / asteroid.maxHealth), healthBarHeight);
    }
}

function drawParticles() {
    for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawMissiles() {
    for (const missile of missiles) {
        ctx.save();
        ctx.translate(missile.x, missile.y);
        ctx.rotate(missile.angle);
        ctx.fillStyle = "orange";
        ctx.fillRect(-5, -2, 10, 4);
        ctx.restore();
    }
}

function drawXPOrbs() {
    for (const orb of xpOrbs) {
        ctx.fillStyle = "#00FF00"; // Verde
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Funções de jogo
let lastFireTime = 0;
function fireBullet() {
    const now = Date.now();
    const fireDelay = 1000 / playerStats.fireRate;

    if (now - lastFireTime > fireDelay) {
        createBullet(player.x, player.y, player.angle);
        lastFireTime = now;

        // Missile Storm
        if (playerEffects.missileStorm.active) {
            playerEffects.missileStorm.shotCount++;
            if (playerEffects.missileStorm.shotCount >= 10) {
                createMissile(player.x, player.y);
                playerEffects.missileStorm.shotCount = 0;
            }
        }
    }
}

function takeDamage(amount) {
    playerStats.health -= amount;
    if (playerStats.health <= 0) {
        playerStats.health = 0;
        gameOver();
    }
    updateUI();
}

function gainXP(amount) {
    gameState.xp += amount;
    if (gameState.xp >= gameState.xpRequired) {
        levelUp();
    }
    updateUI();
}

function levelUp() {
    gameState.level++;
    gameState.xp -= gameState.xpRequired;
    gameState.xpRequired = Math.floor(gameState.xpRequired * 1.5); // Aumenta XP necessário
    playerStats.health = playerStats.maxHealth; // Cura total
    updateUI();
    showLevelUpScreen();
}

function showLevelUpScreen() {
    gameState.paused = true;
    levelUpScreen.classList.remove("hidden");
    const cardContainer = document.getElementById("cardContainer");
    cardContainer.innerHTML = ""; // Limpa cartas anteriores

    const availableCards = getRandomCards(3); // Pega 3 cartas aleatórias

    availableCards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.innerHTML = `
            <h3>${card.name}</h3>
            <p>${card.description}</p>
            <button data-card-id="${card.id}">Escolher</button>
        `;
        cardContainer.appendChild(cardElement);

        cardElement.querySelector("button").addEventListener("click", () => {
            applyCardEffect(card);
            levelUpScreen.classList.add("hidden");
            gameState.paused = false;
            gameLoop(); // Retoma o loop do jogo
        });
    });
}

function getRandomCards(count) {
    const shuffled = cardDatabase.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function applyCardEffect(card) {
    // Aplica os efeitos da carta nos playerStats ou playerEffects
    switch (card.id) {
        case "bifurcated_shot":
            playerEffects.bifurcatedShot = true;
            break;
        case "plasma_cannon":
            playerEffects.plasmaCannon = true;
            break;
        case "missile_storm":
            playerEffects.missileStorm.active = true;
            break;
        case "orbital_drones":
            playerEffects.orbitalDrones.active = true;
            // Criar drones
            for (let i = 0; i < 2; i++) {
                playerEffects.orbitalDrones.drones.push({
                    angleOffset: i * Math.PI, // Um de cada lado
                    distance: 50,
                    fireRate: 1 // Tiro por segundo
                });
            }
            break;
        case "energy_blade":
            playerEffects.energyBlade = true;
            break;
        case "ricochet_shot":
            playerEffects.ricochetShot = true;
            break;
        case "chain_lightning":
            playerEffects.chainLightning = true;
            break;
        case "battle_frenzy":
            playerEffects.battleFrenzy.active = true;
            break;
        case "static_pulse":
            playerEffects.staticPulse.active = true;
            playerEffects.staticPulse.cooldown = 0; // Pronto para usar
            break;
        case "spectral_cannon":
            playerEffects.spectralCannon = true;
            break;
        case "reactive_shield":
            playerEffects.reactiveShield.active = true;
            playerEffects.reactiveShield.cooldown = 0;
            playerEffects.reactiveShield.shieldAmount = 50; // Escudo inicial
            break;
        case "maneuver_thrusters":
            playerStats.moveSpeed *= 1.2; // Aumenta 20%
            break;
        case "adamantium_plating":
            playerStats.maxHealth += 50;
            playerStats.health += 50;
            playerStats.armor += 5;
            break;
        case "repulsion_field":
            playerEffects.repulsionField = true;
            break;
        case "energy_reconversion":
            // Implementar lógica de reconversão de energia
            break;
        case "emergency_teleport":
            playerEffects.emergencyTeleport.active = true;
            playerEffects.emergencyTeleport.cooldown = 0;
            break;
        case "nanobot_regeneration":
            playerEffects.nanobotRegeneration = true;
            break;
        case "scrap_attraction":
            playerStats.xpCollectionRadius *= 1.5;
            break;
        case "invisibility_cloak":
            playerEffects.invisibilityCloak.active = true;
            playerEffects.invisibilityCloak.cooldown = 0;
            break;
        case "shield_overcharge":
            playerEffects.shieldOvercharge.active = true;
            playerEffects.shieldOvercharge.cooldown = 0;
            break;
        case "fine_calibration":
            playerStats.projectileSpeed *= 1.2;
            break;
        case "combat_focus":
            playerStats.critChance += 0.05;
            break;
        case "improved_reactor":
            playerStats.fireRate *= 1.2;
            break;
        case "optimized_thrusters":
            playerStats.moveSpeed *= 1.1;
            break;
        case "expansion_modules":
            playerStats.projectileRange *= 1.2;
            break;
        case "target_analyzer":
            playerStats.critDamage *= 1.2;
            break;
        case "magnetic_collector":
            playerStats.xpCollectionRadius *= 1.2;
            break;
        case "cooldown_reducer":
            playerStats.cooldownReduction *= 0.9; // Reduz em 10%
            break;
        case "flight_stabilizer":
            playerStats.rotationSpeed *= 1.2;
            // Aceleração também pode ser ajustada aqui se houver uma variável para isso
            break;
        case "explorer_luck":
            playerStats.luck += 0.01; // Aumenta a sorte em 1%
            break;
        case "reinforced_chassis":
            playerStats.maxHealth += 25;
            playerStats.health += 25;
            break;
        case "armor_plating":
            playerStats.armor += 1;
            break;
        case "ablative_coating":
            playerStats.maxHealth += 30;
            playerStats.health += 30;
            playerStats.armor += 2;
            playerStats.moveSpeed *= 0.9; // Reduz velocidade em 10%
            break;
        case "structural_integrity":
            playerStats.maxHealth += 40;
            // Implementar eficácia de cura
            break;
        case "hull_shield":
            playerEffects.hullShield.active = true;
            playerEffects.hullShield.maxShield = playerStats.maxHealth * 0.3; // 30% da vida máxima
            playerEffects.hullShield.shield = playerEffects.hullShield.maxShield;
            break;
    }
    updateUI();
}

function gameOver() {
    gameState.paused = true;
    alert("Game Over! Pontuação: " + gameState.score);
    // Reiniciar jogo ou mostrar tela de game over
    location.reload(); // Por enquanto, recarrega a página
}

function updateUI() {
    document.getElementById("xpText").textContent = `XP: ${gameState.xp}/${gameState.xpRequired} (Nível ${gameState.level})`;
    const xpBarFill = document.getElementById("xpBarFill");
    xpBarFill.style.width = `${(gameState.xp / gameState.xpRequired) * 100}%`;
}

// Loop principal do jogo
function gameLoop() {
    if (gameState.paused) return;

    // Atualizar
    updatePlayer();
    updateBullets();
    updateMissiles();
    updateAsteroids();
    updateParticles();
    updateXPOrbs();

    // Disparar se o mouse estiver pressionado
    if (mouseDown) {
        if (playerEffects.plasmaCannon) {
            chargeTime++;
            // Feedback visual de carregamento
        } else {
            fireBullet();
        }
    }

    // Disparar plasma cannon ao soltar o mouse
    if (!mouseDown && playerEffects.plasmaCannon && chargeTime > 0) {
        // Disparar orbe de plasma com base no chargeTime
        const plasmaDamage = playerStats.baseDamage * (1 + chargeTime / 60); // 1 segundo de carga = dobro de dano
        createBullet(player.x, player.y, player.angle, playerStats.projectileSpeed * 0.7, plasmaDamage, { plasma: true });
        chargeTime = 0;
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

    // Desenhar drones orbitais
    if (playerEffects.orbitalDrones.active) {
        playerEffects.orbitalDrones.drones.forEach(drone => {
            drone.angleOffset += 0.05; // Velocidade de órbita
            const droneX = player.x + Math.cos(player.angle + drone.angleOffset) * drone.distance;
            const droneY = player.y + Math.sin(player.angle + drone.angleOffset) * drone.distance;
            ctx.fillStyle = "#8A2BE2"; // Azul violeta
            ctx.beginPath();
            ctx.arc(droneX, droneY, 5, 0, Math.PI * 2);
            ctx.fill();

            // Disparar
            const now = Date.now();
            if (!drone.lastFireTime) drone.lastFireTime = now;
            const fireDelay = 1000 / drone.fireRate;
            if (now - drone.lastFireTime > fireDelay) {
                createBullet(droneX, droneY, player.angle + drone.angleOffset);
                drone.lastFireTime = now;
            }
        });
    }

    // Desenhar lâmina de energia
    if (playerEffects.energyBlade && keys["KeyR"]) {
        const bladeLength = 50;
        const bladeWidth = 10;
        const bladeX = player.x + Math.cos(player.angle) * (player.size + bladeLength / 2);
        const bladeY = player.y + Math.sin(player.angle) * (player.size + bladeLength / 2);

        ctx.save();
        ctx.translate(bladeX, bladeY);
        ctx.rotate(player.angle);
        ctx.fillStyle = "#FF00FF"; // Magenta
        ctx.fillRect(-bladeLength / 2, -bladeWidth / 2, bladeLength, bladeWidth);
        ctx.restore();

        // Detectar colisão com asteroides
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const asteroid = asteroids[i];
            // Simplificação: colisão circular com o centro da lâmina
            const dist = Math.sqrt((bladeX - asteroid.x) ** 2 + (bladeY - asteroid.y) ** 2);
            if (dist < asteroid.radius + bladeLength / 2) {
                asteroid.health -= playerStats.baseDamage * 2; // Dano da lâmina
                createParticles(asteroid.x, asteroid.y, 10, "#FF00FF");
                if (asteroid.health <= 0) {
                    handleAsteroidDestruction(asteroid, i);
                }
            }
        }
    }

    // Pulso Estático
    if (playerEffects.staticPulse.active && keys["KeyQ"] && playerEffects.staticPulse.cooldown === 0) {
        const pulseRadius = 200;
        ctx.beginPath();
        ctx.arc(player.x, player.y, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
        ctx.lineWidth = 5;
        ctx.stroke();

        // Aplicar dano aos asteroides dentro do raio
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const asteroid = asteroids[i];
            const dist = Math.sqrt((player.x - asteroid.x) ** 2 + (player.y - asteroid.y) ** 2);
            if (dist < pulseRadius) {
                asteroid.health -= playerStats.baseDamage * 3; // Dano do pulso
                createParticles(asteroid.x, asteroid.y, 15, "#FFFF00");
                if (asteroid.health <= 0) {
                    handleAsteroidDestruction(asteroid, i);
                }
            }
        }
        playerEffects.staticPulse.cooldown = 300; // 5 segundos de recarga
    }

    // Teleporte de Emergência
    if (playerEffects.emergencyTeleport.active && keys["KeyE"] && playerEffects.emergencyTeleport.cooldown === 0) {
        const teleportDistance = 150;
        player.x += Math.cos(player.angle) * teleportDistance;
        player.y += Math.sin(player.angle) * teleportDistance;
        createParticles(player.x, player.y, 20, "#00FFFF"); // Partículas de teleporte
        playerEffects.emergencyTeleport.cooldown = 180; // 3 segundos de recarga
    }

    // Manto de Invisibilidade
    if (playerEffects.invisibilityCloak.active && keys["KeyI"] && playerEffects.invisibilityCloak.cooldown === 0) {
        player.invisible = true;
        playerEffects.invisibilityCloak.duration = 300; // 5 segundos de invisibilidade
        playerEffects.invisibilityCloak.cooldown = 600; // 10 segundos de recarga
    }

    // Sobrecarga de Escudo
    if (playerEffects.shieldOvercharge.active && keys["KeyO"] && playerEffects.shieldOvercharge.cooldown === 0) {
        playerStats.health -= playerStats.maxHealth * 0.1; // Custa 10% da vida
        playerEffects.shieldOvercharge.cooldown = 600; // 10 segundos de recarga
        // Efeito visual de invulnerabilidade
    }

    requestAnimationFrame(gameLoop);
}

// Inicia o carregamento das imagens e depois o jogo
loadImages().then(() => {
    console.log("Imagens carregadas!");
    // Certifica-se de que o vídeo está pronto para tocar
    introVideo.load();
    introVideo.play().catch(error => {
        console.log("Erro ao reproduzir vídeo automaticamente:", error);
        // Fallback: mostrar apenas o botão sem vídeo
    });
}).catch(error => {
    console.error("Erro ao carregar imagens:", error);
    // Mesmo com erro nas imagens, permite continuar
    introVideo.load();
    introVideo.play().catch(error => {
        console.log("Erro ao reproduzir vídeo automaticamente:", error);
    });
});

// Função auxiliar para encontrar o asteroide mais próximo
function findClosestAsteroid(x, y) {
    let closest = null;
    let minDistance = Infinity;
    
    for (const asteroid of asteroids) {
        const distance = Math.sqrt((x - asteroid.x) ** 2 + (y - asteroid.y) ** 2);
        if (distance < minDistance) {
            minDistance = distance;
            closest = asteroid;
        }
    }
    
    return closest;
}


