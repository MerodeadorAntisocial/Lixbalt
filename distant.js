// =========================================================================
// MOTOR DEL JUEGO "DISTANT" — VERSIÓN MEJORADA (15 MEJORAS INTEGRADAS)
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('distantCanvasContainer');
    let gameCanvas = document.getElementById('distantGameCanvas');
    if (!gameCanvas && container) {
        gameCanvas = document.createElement('canvas');
        gameCanvas.id = 'distantGameCanvas';
        gameCanvas.width = 800;
        gameCanvas.height = 800;
        container.innerHTML = '';
        container.appendChild(gameCanvas);
    }

    const gctx = gameCanvas ? gameCanvas.getContext('2d') : null;
    const width = 800;
    const height = 800;
    const startTime = performance.now();
    function millis() {
        return performance.now() - startTime;
    }

    // =========================================================================
    // SISTEMA DE SONIDO SINTETIZADO (WEB AUDIO API) - MEJORA #14
    // =========================================================================
    let audioCtx = null;
    function getAudioCtx() {
        if (localStorage.getItem('imperio-papu-sfx') === 'off') return null;
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        return audioCtx;
    }

    const GameSFX = {
        shoot() {
            const ctx = getAudioCtx();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(580, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.06);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.065);
        },
        parabola() {
            const ctx = getAudioCtx();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.11);
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
        },
        hit() {
            const ctx = getAudioCtx();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.09);
            gain.gain.setValueAtTime(0.07, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.095);
        },
        playerHurt() {
            const ctx = getAudioCtx();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.22);
            gain.gain.setValueAtTime(0.11, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.23);
        },
        dash() {
            const ctx = getAudioCtx();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(260, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.07, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.085);
        },
        powerup() {
            const ctx = getAudioCtx();
            if (!ctx) return;
            [440, 554.37, 659.25].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const start = ctx.currentTime + idx * 0.05;
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0.07, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(start);
                osc.stop(start + 0.15);
            });
        }
    };

    // =========================================================================
    // CREACIÓN DE SPRITES CON RESPALDO AUTOMÁTICO
    // =========================================================================
    function crearSprite(src, w, h, colorFondo, etiqueta) {
        const off = document.createElement('canvas');
        off.width = w;
        off.height = h;
        const octx = off.getContext('2d');

        octx.fillStyle = colorFondo;
        octx.fillRect(0, 0, w, h);
        octx.strokeStyle = '#ffffff';
        octx.lineWidth = 2;
        octx.strokeRect(2, 2, w - 4, h - 4);
        if (etiqueta) {
            octx.fillStyle = '#ffffff';
            octx.font = `bold ${Math.max(11, Math.floor(w / 4))}px sans-serif`;
            octx.textAlign = 'center';
            octx.textBaseline = 'middle';
            octx.fillText(etiqueta, w / 2, h / 2);
        }

        const sprite = { canvas: off, width: w, height: h };
        const img = new Image();
        img.onload = () => {
            octx.clearRect(0, 0, w, h);
            octx.drawImage(img, 0, 0, w, h);
        };
        img.src = src;
        return sprite;
    }

    let prota = crearSprite("distant/gato.png", 60, 60, "#22c55e", "GATO");
    let prota1 = crearSprite("distant/gato1.png", 60, 60, "#16a34a", "GATO");
    let lana = crearSprite("distant/enemigos.png", 50, 50, "#e63946", "LANA");
    let powerup = crearSprite("distant/power-up.png", 50, 50, "#eab308", "PWR");
    let Fondo = crearSprite("distant/Fondo.png", 800, 800, "#10161d", "");
    let menuImg = crearSprite("distant/Menu.png", 800, 800, "#0b0f14", "");
    let VillanoImg = crearSprite("distant/Villano.png", 100, 100, "#8b5cf6", "BOSS");

    // =========================================================================
    // VARIABLES DE ESTADO DEL JUGADOR, VIDAS, DASH Y CÁMARA
    // =========================================================================
    let px = width * 0.2;
    let py = height * 0.2;
    let speed = 3.2;
    let movingUp = false;
    let movingDown = false;
    let movingLeft = false;
    let movingRight = false;

    // Mejora #6: Sistema de Vidas e Invulnerabilidad
    let playerLives = 3;
    const playerMaxLives = 3;
    let invulnerableUntil = 0;

    // Mejora #7: Mecánica de Esquive (Dash)
    let dashActiveUntil = 0;
    let lastDashTime = -2000;
    const dashDuration = 180;
    const dashCooldown = 1600;
    const dashSpeedMultiplier = 3.2;
    let dashTrail = [];

    // Mejora #10: Cámara dinámica (fx, fy)
    let fx = 0;
    let fy = 0;

    let enemigos = [];
    let projectiles = [];
    let parabolas = [];
    let particles = []; // Mejora #13: Partículas de impacto
    let ts = 8.5;
    let currentImage = prota;
    let lastEnemySpawnTime = 0;
    let gameOver = false;
    let isPaused = false; // Mejora #14: Pausa con tecla P
    let puntuacion = 0;

    // Mejora #12: Guardado de Récord (High Score)
    let highScore = parseInt(localStorage.getItem('distant-high-score')) || 0;

    const gris = "#323232";
    const grisCLA = "#434343";
    const blanco = "#FFFFFF";

    let h = 0, k = 0, f = 0;
    let enMenu = true;
    let mostrarPantallaJuego = false;
    let mostrarTextoHistoria = false;
    let mostrarTextoCreditos = false;
    let mostrarPantallaFin = false;
    let mostrarPantallaVictory = false;

    // Mejora #9: Power-ups variados (Triple disparo, Escudo, Curación)
    let tripleShotActive = false;
    let tripleShotEndTime = 0;
    const tripleShotDuration = 5000;

    let shieldActive = false;
    let shieldEndTime = 0;
    const shieldDuration = 5000;

    let powerups = [];
    let lastPowerupSpawnTime = 0;

    // Mejora #1: Vida del jefe unificada en 50 desde la primera partida
    let bossHealth = 50;
    let bossMaxHealth = 50;
    let bossSpeed = 1.5;
    let bossHitboxWidth = 100;
    let villanoProjectiles = [];
    let lastVillanoShotTime = 0;

    let bossEnemy = {
        x: width / 2,
        y: height / 2,
        speed: bossSpeed,
        lastShotTime: 0,
        shotInterval: 1000
    };

    let shootParabola = false;
    let parabolaInterval = 500;
    let lastParabolaShotTime = 0;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let mouseIsPressed = false;
    let distantAnimId = null;
    let distantRunning = false;

    // =========================================================================
    // SISTEMA DE PARTÍCULAS (MEJORA #13)
    // =========================================================================
    function spawnParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 3.8 + 0.8;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                life: 1.0,
                decay: Math.random() * 0.03 + 0.025,
                size: Math.random() * 4 + 2,
                color
            });
        }
    }

    function updateAndDrawParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const pt = particles[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.life -= pt.decay;

            if (pt.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            gctx.save();
            gctx.globalAlpha = Math.max(0, pt.life);
            gctx.fillStyle = pt.color;
            gctx.beginPath();
            gctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            gctx.fill();
            gctx.restore();
        }
    }

    function saveHighScore() {
        if (puntuacion > highScore) {
            highScore = puntuacion;
            localStorage.setItem('distant-high-score', String(highScore));
        }
    }

    // =========================================================================
    // EVENTOS DE RATÓN, TECLADO Y PANTALLA TÁCTIL (MEJORA #15)
    // =========================================================================
    if (gameCanvas) {
        gameCanvas.addEventListener('mousemove', (e) => {
            const rect = gameCanvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) * (width / rect.width);
            mouseY = (e.clientY - rect.top) * (height / rect.height);
        });

        gameCanvas.addEventListener('mousedown', (e) => {
            if (!distantRunning) return;
            const rect = gameCanvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) * (width / rect.width);
            mouseY = (e.clientY - rect.top) * (height / rect.height);
            mouseIsPressed = true;
            handleMousePressed();
        });

        window.addEventListener('mouseup', () => {
            mouseIsPressed = false;
        });

        // Mejora #15: Soporte táctil para dispositivos móviles
        gameCanvas.addEventListener('touchstart', (e) => {
            if (!distantRunning) return;
            e.preventDefault();
            const rect = gameCanvas.getBoundingClientRect();
            const touch = e.touches[0];
            mouseX = (touch.clientX - rect.left) * (width / rect.width);
            mouseY = (touch.clientY - rect.top) * (height / rect.height);
            mouseIsPressed = true;
            handleMousePressed();
        }, { passive: false });

        gameCanvas.addEventListener('touchmove', (e) => {
            if (!distantRunning) return;
            e.preventDefault();
            const rect = gameCanvas.getBoundingClientRect();
            const touch = e.touches[0];
            const tx = (touch.clientX - rect.left) * (width / rect.width);
            const ty = (touch.clientY - rect.top) * (height / rect.height);
            mouseX = tx;
            mouseY = ty;

            if (mostrarPantallaJuego && !gameOver && !isPaused) {
                const dx = tx - px;
                const dy = ty - py;
                movingRight = dx > 18;
                movingLeft = dx < -18;
                movingDown = dy > 18;
                movingUp = dy < -18;
                if (movingRight) currentImage = prota;
                if (movingLeft) currentImage = prota1;
            }
        }, { passive: false });

        gameCanvas.addEventListener('touchend', () => {
            mouseIsPressed = false;
            movingUp = false;
            movingDown = false;
            movingLeft = false;
            movingRight = false;
        });
    }

    function triggerDash() {
        const now = millis();
        if (now - lastDashTime < dashCooldown) return;
        lastDashTime = now;
        dashActiveUntil = now + dashDuration;
        invulnerableUntil = Math.max(invulnerableUntil, now + dashDuration + 80);
        GameSFX.dash();
        spawnParticles(px, py, "#38bdf8", 12);
    }

    window.addEventListener('keydown', (e) => {
        if (!distantRunning) return;
        const key = e.key.toLowerCase();

        // Mejora #14: Pausa con tecla P
        if (key === "p" && mostrarPantallaJuego && !gameOver) {
            isPaused = !isPaused;
            return;
        }

        if (!gameOver && mostrarPantallaJuego && !isPaused) {
            if (key === "d") {
                movingRight = true;
                currentImage = prota;
            }
            if (key === "a") {
                movingLeft = true;
                currentImage = prota1;
            }
            if (key === "w") {
                movingUp = true;
            }
            if (key === "s") {
                movingDown = true;
            }
            if (key === "shift" || e.code === "Space") {
                e.preventDefault();
                triggerDash();
            }
            if (key === "e") {
                shootParabola = true;
            }
        }
        if (enMenu && key === "enter") {
            enMenu = false;
            mostrarPantallaJuego = true;
        }
        if ((mostrarPantallaVictory || mostrarPantallaFin) && key === "r") {
            restartGame();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (!distantRunning) return;
        const key = e.key.toLowerCase();
        if (key === "e") shootParabola = false;
        if (key === "d") movingRight = false;
        if (key === "a") movingLeft = false;
        if (key === "w") movingUp = false;
        if (key === "s") movingDown = false;
    });

    function drawImageCenter(sprite, x, y, customSize = null) {
        const w = customSize ? customSize : sprite.width;
        const h = customSize ? customSize : sprite.height;
        gctx.drawImage(sprite.canvas, x - w / 2, y - h / 2, w, h);
    }

    function drawWrappedText(texto, cx, cy, maxWidth, lineHeight) {
        const words = texto.split(' ');
        let line = '';
        const lines = [];

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = gctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                lines.push(line.trim());
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());

        const totalHeight = lines.length * lineHeight;
        let startY = cy - totalHeight / 2 + lineHeight / 2;

        for (let i = 0; i < lines.length; i++) {
            gctx.fillText(lines[i], cx, startY + i * lineHeight);
        }
    }

    // Mejora #4: drawButton solo dibuja y aplica estilo hover; la navegación ocurre en handleMousePressed()
    function drawButton(txt, x, y, xl, yl) {
        let fontSize = 54;
        let btnColor = gris;
        const inX = mouseX < x + xl / 2 && mouseX > x - xl / 2;
        const inY = mouseY < y + yl / 2 && mouseY > y - yl / 2;

        if (inX && inY) {
            fontSize = 62;
            btnColor = mouseIsPressed ? "rgb(19, 0, 143)" : grisCLA;
        }

        gctx.fillStyle = btnColor;
        gctx.strokeStyle = "#ffffff";
        gctx.lineWidth = 2;
        gctx.fillRect(x - xl / 2, y - yl / 2, xl, yl);
        gctx.strokeRect(x - xl / 2, y - yl / 2, xl, yl);

        gctx.fillStyle = blanco;
        gctx.font = `bold ${fontSize}px sans-serif`;
        gctx.textAlign = "center";
        gctx.textBaseline = "middle";
        gctx.fillText(txt, x, y);
    }

    function showMenu() {
        drawImageCenter(menuImg, width / 2, height / 2);

        // Mejora #12: Mostrar Récord en el menú principal
        gctx.fillStyle = "#eab308";
        gctx.font = "bold 22px sans-serif";
        gctx.textAlign = "center";
        gctx.fillText(`🏆 Récord Imperial: ${highScore} pts`, width / 2, height * 0.07);

        drawButton("Historia", width / 2, height * 0.22, width * 0.34, height * 0.14);
        drawButton("Jugar", width / 2, height * 0.5, width * 0.34, height * 0.14);
        drawButton("Creditos", width / 2, height * 0.78, width * 0.34, height * 0.14);
    }

    function showHistoria() {
        gctx.fillStyle = "#000000";
        gctx.fillRect(0, 0, width, height);
        gctx.fillStyle = "#ffffff";
        gctx.font = "22px sans-serif";
        gctx.textAlign = "center";
        gctx.textBaseline = "middle";
        const texto = "En un futuro lejano tras el año 9329, la humanidad enfrenta una era de conflicto y avance tecnológico desmedido, desencadenado por el descubrimiento de la energía Loraxius y la creación del opresivo Imperio Terrano. Divididos entre quienes abogan por la erradicación de los Inhumanos y aquellos que prefieren integrarlos o utilizarlos, la sociedad se sumerge en una devastadora guerra conocida como El llanto de cristo por sus inmensas pérdidas. En medio de este caos, el soldado Gustabo, decidido a evitar más sufrimiento tras perder a su hermano por un error de su superior, utiliza un prototipo de viaje en el tiempo para alterar el curso de la historia y buscar justicia.";
        drawWrappedText(texto, width / 2, height * 0.45, width * 0.72, 30);
        drawButton("Volver", width / 2, height * 0.9, width * 0.6, height * 0.1);
    }

    function showCreditos() {
        gctx.fillStyle = "#000000";
        gctx.fillRect(0, 0, width, height);
        gctx.fillStyle = "rgb(0, 255, 242)";
        gctx.font = "bold 29px sans-serif";
        gctx.textAlign = "center";
        gctx.textBaseline = "middle";
        const texto = "CREADO POR: Martiniano Enzo Diele y Juan Emanuel Valdez";
        drawWrappedText(texto, width / 2, height / 2, width * 0.7, 38);
        drawButton("Volver", width / 2, height * 0.10, width * 0.6, height * 0.1);
    }

    // Mejora #10: Dibujar fondo con desplazamiento parallax (fx, fy)
    function drawDynamicBackground() {
        const targetFx = (px - width / 2) * 0.08;
        const targetFy = (py - height / 2) * 0.08;
        fx += (targetFx - fx) * 0.12;
        fy += (targetFy - fy) * 0.12;

        gctx.fillStyle = "#0b0f14";
        gctx.fillRect(0, 0, width, height);
        drawImageCenter(Fondo, width / 2 - fx, height / 2 - fy);

        // Rejilla táctica sutil con parallax para percibir el movimiento de cámara
        gctx.strokeStyle = "rgba(34, 197, 94, 0.07)";
        gctx.lineWidth = 1;
        const gridStep = 80;
        const offsetX = (-fx * 1.5) % gridStep;
        const offsetY = (-fy * 1.5) % gridStep;

        for (let x = offsetX; x < width; x += gridStep) {
            gctx.beginPath();
            gctx.moveTo(x, 0);
            gctx.lineTo(x, height);
            gctx.stroke();
        }
        for (let y = offsetY; y < height; y += gridStep) {
            gctx.beginPath();
            gctx.moveTo(0, y);
            gctx.lineTo(width, y);
            gctx.stroke();
        }
    }

    function drawPlayer() {
        const now = millis();

        // Estela del Dash (Mejora #7)
        for (let i = dashTrail.length - 1; i >= 0; i--) {
            const tr = dashTrail[i];
            tr.alpha -= 0.08;
            if (tr.alpha <= 0) {
                dashTrail.splice(i, 1);
                continue;
            }
            gctx.save();
            gctx.globalAlpha = tr.alpha * 0.45;
            drawImageCenter(currentImage, tr.x, tr.y);
            gctx.restore();
        }

        // Parpadeo cuando el jugador es invulnerable tras recibir daño (Mejora #6)
        const isInvuln = now < invulnerableUntil;
        if (isInvuln && Math.floor(now / 80) % 2 === 0) {
            gctx.save();
            gctx.globalAlpha = 0.4;
            drawImageCenter(currentImage, px, py);
            gctx.restore();
        } else {
            drawImageCenter(currentImage, px, py);
        }

        // Aura de escudo si está activo (Mejora #9)
        if (shieldActive) {
            gctx.save();
            gctx.strokeStyle = "#38bdf8";
            gctx.lineWidth = 3;
            gctx.beginPath();
            gctx.arc(px, py, currentImage.width * 0.62, 0, Math.PI * 2);
            gctx.stroke();
            gctx.fillStyle = "rgba(56, 189, 248, 0.15)";
            gctx.fill();
            gctx.restore();
        }
    }

    function drawGameScreen() {
        drawDynamicBackground();

        if (!isPaused) {
            handleMovement();
            handleProjectiles();
            handleParabolas(); // Mejora #5: Parábola encapsulada dentro de la pantalla de juego
            handleEnemies();
            handlePowerups();
            handleVillano();
            checkCollisions();
            checkParabolaCollisions();
        }

        drawPlayer();
        updateAndDrawParticles();
        displayHUD();

        if (bossHealth <= 0) {
            showPantallaVictory();
        }

        // Mejora #14: Overlay de Pausa
        if (isPaused) {
            gctx.fillStyle = "rgba(0, 0, 0, 0.68)";
            gctx.fillRect(0, 0, width, height);
            gctx.fillStyle = "#22c55e";
            gctx.font = "bold 46px sans-serif";
            gctx.textAlign = "center";
            gctx.textBaseline = "middle";
            gctx.fillText("⏸ JUEGO EN PAUSA", width / 2, height / 2 - 20);
            gctx.fillStyle = "#ffffff";
            gctx.font = "22px sans-serif";
            gctx.fillText("Presiona 'P' para continuar", width / 2, height / 2 + 35);
        }
    }

    function damagePlayer() {
        const now = millis();
        if (now < invulnerableUntil) return;

        if (shieldActive) {
            shieldActive = false;
            invulnerableUntil = now + 800;
            spawnParticles(px, py, "#38bdf8", 16);
            GameSFX.hit();
            return;
        }

        playerLives -= 1;
        invulnerableUntil = now + 1400;
        GameSFX.playerHurt();
        spawnParticles(px, py, "#ff0033", 18);

        if (playerLives <= 0) {
            saveHighScore();
            gameOver = true;
            mostrarPantallaFin = true;
            mostrarPantallaJuego = false;
        }
    }

    // Mejora #8: Segunda fase del jefe (Enrage al <= 50% de vida)
    function handleVillano() {
        if (puntuacion >= 20) {
            const isEnraged = bossHealth <= bossMaxHealth * 0.5;
            bossEnemy.speed = isEnraged ? 2.25 : bossSpeed;

            const dx = px - bossEnemy.x;
            const dy = py - bossEnemy.y;
            const mag = Math.hypot(dx, dy) || 1;

            bossEnemy.x += (dx / mag) * bossEnemy.speed;
            bossEnemy.y += (dy / mag) * bossEnemy.speed;

            if (isEnraged) {
                gctx.save();
                gctx.strokeStyle = "rgba(255, 0, 51, 0.75)";
                gctx.lineWidth = 4;
                gctx.beginPath();
                gctx.arc(bossEnemy.x, bossEnemy.y, 60 + Math.sin(millis() * 0.015) * 6, 0, Math.PI * 2);
                gctx.stroke();
                gctx.restore();
            }

            drawImageCenter(VillanoImg, bossEnemy.x, bossEnemy.y);
            drawBossHealthBar(isEnraged);
            handleVillanoDisparo(isEnraged);
        }
    }

    function handleVillanoDisparo(isEnraged) {
        const currentTime = millis();
        const cadence = isEnraged ? bossEnemy.shotInterval * 0.42 : bossEnemy.shotInterval * 0.55;

        if (currentTime - lastVillanoShotTime > cadence) {
            const baseAngle = Math.atan2(py - bossEnemy.y, px - bossEnemy.x);

            if (isEnraged) {
                // En Fase 2 dispara un abanico de 3 proyectiles
                for (let offset = -1; offset <= 1; offset++) {
                    const ang = baseAngle + offset * 0.24;
                    villanoProjectiles.push({
                        x: bossEnemy.x,
                        y: bossEnemy.y,
                        vx: Math.cos(ang) * 4.5,
                        vy: Math.sin(ang) * 4.5
                    });
                }
            } else {
                villanoProjectiles.push({
                    x: bossEnemy.x,
                    y: bossEnemy.y,
                    vx: Math.cos(baseAngle) * 4,
                    vy: Math.sin(baseAngle) * 4
                });
            }
            lastVillanoShotTime = currentTime;
        }

        for (let i = villanoProjectiles.length - 1; i >= 0; i--) {
            const p = villanoProjectiles[i];
            gctx.fillStyle = isEnraged ? "#ff0055" : "rgb(199, 69, 255)";
            gctx.strokeStyle = "#000000";
            gctx.lineWidth = 1;
            gctx.beginPath();
            gctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            gctx.fill();
            gctx.stroke();

            p.x += p.vx;
            p.y += p.vy;

            if (puntuacion >= 20 && Math.hypot(p.x - px, p.y - py) < 20) {
                villanoProjectiles.splice(i, 1);
                damagePlayer();
                continue;
            }

            if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
                villanoProjectiles.splice(i, 1);
            }
        }
    }

    function drawBossHealthBar(isEnraged) {
        const healthBarWidth = 220;
        const healthBarHeight = 18;
        const x = bossEnemy.x - healthBarWidth / 2;
        const y = bossEnemy.y - VillanoImg.height / 2 - healthBarHeight - 12;

        gctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        gctx.fillRect(x, y, healthBarWidth, healthBarHeight);

        const healthWidth = Math.max(0, (bossHealth / bossMaxHealth) * healthBarWidth);
        gctx.fillStyle = isEnraged ? "#ff0033" : "#eab308";
        gctx.fillRect(x, y, healthWidth, healthBarHeight);

        gctx.strokeStyle = "#ffffff";
        gctx.lineWidth = 2;
        gctx.strokeRect(x, y, healthBarWidth, healthBarHeight);

        gctx.fillStyle = "#ffffff";
        gctx.font = "bold 11px sans-serif";
        gctx.textAlign = "center";
        gctx.textBaseline = "middle";
        gctx.fillText(
            `${isEnraged ? "🔥 FASE 2" : "JEFE"}: ${Math.max(0, bossHealth)} / ${bossMaxHealth}`,
            bossEnemy.x,
            y + healthBarHeight / 2
        );
    }

    // Mejora #2 y #6: Colisiones con enemigos y cuerpo del jefe usando el sistema de vidas
    function checkCollisions() {
        for (let i = enemigos.length - 1; i >= 0; i--) {
            const e = enemigos[i];
            const hitRadius = (currentImage.width / 2) + (e.size / 2) - 10;
            if (Math.hypot(px - e.x, py - e.y) < hitRadius) {
                enemigos.splice(i, 1);
                damagePlayer();
                if (gameOver) return;
            }
        }

        // Mejora #2: Colisión directa con el cuerpo del jefe
        if (puntuacion >= 20 && bossHealth > 0) {
            const bossDist = Math.hypot(px - bossEnemy.x, py - bossEnemy.y);
            if (bossDist < (currentImage.width / 2 + bossHitboxWidth / 2 - 12)) {
                damagePlayer();
            }
        }
    }

    // Mejora #5: Manejo completo de proyectiles parabólicos dentro de drawGameScreen
    function handleParabolas() {
        if (shootParabola && !gameOver) {
            const currentTime = millis();
            if (currentTime - lastParabolaShotTime >= parabolaInterval) {
                h = px + 10;
                f = py + 10;
                k = mouseX;
                const dir = (mouseX < px) ? -4.5 : 4.5;
                parabolas.push({ px: h, py: f, h: h, k: k, startY: f, dir: dir });
                lastParabolaShotTime = currentTime;
                GameSFX.parabola();
            }
            shootParabola = false;
        }

        for (let i = parabolas.length - 1; i >= 0; i--) {
            const p = parabolas[i];
            p.px += p.dir;
            p.py = p.startY + calculateParabolic(p.px, p.h);
            gctx.fillStyle = "rgb(0, 255, 0)";
            gctx.beginPath();
            gctx.arc(p.px, p.py, 6, 0, Math.PI * 2);
            gctx.fill();

            if (!onScreen(p.px, p.py)) {
                parabolas.splice(i, 1);
            }
        }
    }

    function checkParabolaCollisions() {
        for (let i = parabolas.length - 1; i >= 0; i--) {
            const p = parabolas[i];
            let removed = false;

            for (let j = enemigos.length - 1; j >= 0; j--) {
                const e = enemigos[j];
                if (Math.hypot(p.px - e.x, p.py - e.y) < e.size / 2) {
                    parabolas.splice(i, 1);
                    e.hp -= 2; // La parábola hace doble daño
                    spawnParticles(e.x, e.y, "#22c55e", 8);
                    GameSFX.hit();
                    if (e.hp <= 0) {
                        puntuacion += e.points;
                        saveHighScore();
                        spawnParticles(e.x, e.y, e.color, 14);
                        enemigos.splice(j, 1);
                    }
                    removed = true;
                    break;
                }
            }
            if (!removed && puntuacion >= 20) {
                if (Math.hypot(p.px - bossEnemy.x, p.py - bossEnemy.y) < bossHitboxWidth / 2) {
                    parabolas.splice(i, 1);
                    bossHealth -= 2;
                    spawnParticles(p.px, p.py, "#22c55e", 10);
                    GameSFX.hit();
                    if (bossHealth <= 0) {
                        saveHighScore();
                        mostrarPantallaVictory = true;
                    }
                }
            }
        }
    }

    function handleProjectiles() {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            if (p.tx === undefined || p.ty === undefined) {
                projectiles.splice(i, 1);
                continue;
            }

            gctx.fillStyle = tripleShotActive ? "#fde047" : "#ffffff";
            gctx.strokeStyle = "#000000";
            gctx.lineWidth = 1;
            gctx.beginPath();
            gctx.arc(p.tx, p.ty, 5, 0, Math.PI * 2);
            gctx.fill();
            gctx.stroke();

            p.tx += p.vx * ts;
            p.ty += p.vy * ts;

            if (p.tx < 0 || p.tx > width || p.ty < 0 || p.ty > height) {
                projectiles.splice(i, 1);
            } else {
                let hit = false;
                for (let j = enemigos.length - 1; j >= 0; j--) {
                    const e = enemigos[j];
                    if (Math.hypot(p.tx - e.x, p.ty - e.y) < e.size / 2) {
                        projectiles.splice(i, 1);
                        e.hp -= 1;
                        GameSFX.hit();
                        spawnParticles(p.tx, p.ty, "#ffffff", 6);
                        if (e.hp <= 0) {
                            puntuacion += e.points;
                            saveHighScore();
                            spawnParticles(e.x, e.y, e.color, 14);
                            enemigos.splice(j, 1);
                        }
                        hit = true;
                        break;
                    }
                }
                if (!hit && puntuacion >= 20) {
                    if (Math.hypot(p.tx - bossEnemy.x, p.ty - bossEnemy.y) < bossHitboxWidth / 2) {
                        projectiles.splice(i, 1);
                        bossHealth -= 1;
                        GameSFX.hit();
                        spawnParticles(p.tx, p.ty, "#a855f7", 8);
                    }
                }
            }
        }
    }

    function showPantallaVictory() {
        if (bossHealth <= 0) {
            mostrarPantallaVictory = true;
            saveHighScore();

            if (typeof window.unlockAchievement === 'function') {
                window.unlockAchievement('ach-distant');
            }

            gctx.fillStyle = "#000000";
            gctx.fillRect(0, 0, width, height);
            gctx.fillStyle = "rgb(134, 255, 69)";
            gctx.textAlign = "center";
            gctx.textBaseline = "middle";
            gctx.font = "bold 50px sans-serif";
            gctx.fillText("¡VICTORIA IMPERIAL!", width / 2, height / 2 - 110);
            gctx.fillStyle = "#ffffff";
            gctx.font = "30px sans-serif";
            gctx.fillText("Puntuación: " + puntuacion, width / 2, height / 2 - 30);
            gctx.fillStyle = "#eab308";
            gctx.fillText("🏆 Récord: " + highScore, width / 2, height / 2 + 20);
            gctx.fillStyle = "#94a3b8";
            gctx.font = "24px sans-serif";
            gctx.fillText("Presiona 'R' o toca aquí para reiniciar", width / 2, height / 2 + 100);
            mostrarPantallaFin = false;
            mostrarPantallaJuego = false;
        }
    }

    // Mejora #9: Variedad de enemigos (Normal, Veloz, Tanque)
    function handleEnemies() {
        if (puntuacion < 20) {
            const currentTime = millis();
            if (currentTime - lastEnemySpawnTime > 1850) {
                let enemyX, enemyY;
                const edge = Math.floor(Math.random() * 4);

                switch (edge) {
                    case 0: enemyX = Math.random() * width; enemyY = -50; break;
                    case 1: enemyX = Math.random() * width; enemyY = height + 50; break;
                    case 2: enemyX = -50; enemyY = Math.random() * height; break;
                    case 3: enemyX = width + 50; enemyY = Math.random() * height; break;
                }

                const roll = Math.random();
                let type = "normal";
                let spd = 1.8;
                let hp = 1;
                let maxHp = 1;
                let size = 50;
                let points = 1;
                let color = "#e63946";

                if (roll > 0.8) {
                    type = "tanque";
                    spd = 1.15;
                    hp = 3;
                    maxHp = 3;
                    size = 66;
                    points = 3;
                    color = "#f97316";
                } else if (roll > 0.55) {
                    type = "veloz";
                    spd = 3.0;
                    hp = 1;
                    maxHp = 1;
                    size = 38;
                    points = 2;
                    color = "#06b6d4";
                }

                enemigos.push({ x: enemyX, y: enemyY, speed: spd, hp, maxHp, size, points, type, color });
                lastEnemySpawnTime = currentTime;
            }
        }

        for (let i = enemigos.length - 1; i >= 0; i--) {
            const e = enemigos[i];
            const dx = px - e.x;
            const dy = py - e.y;
            const mag = Math.hypot(dx, dy) || 1;
            e.x += (dx / mag) * e.speed;
            e.y += (dy / mag) * e.speed;

            drawImageCenter(lana, e.x, e.y, e.size);

            // Indicador visual de tipo de enemigo
            if (e.type !== "normal") {
                gctx.strokeStyle = e.color;
                gctx.lineWidth = 2;
                gctx.strokeRect(e.x - e.size / 2, e.y - e.size / 2, e.size, e.size);
            }
            if (e.maxHp > 1) {
                const bw = e.size;
                gctx.fillStyle = "#000";
                gctx.fillRect(e.x - bw / 2, e.y - e.size / 2 - 8, bw, 5);
                gctx.fillStyle = e.color;
                gctx.fillRect(e.x - bw / 2, e.y - e.size / 2 - 8, (e.hp / e.maxHp) * bw, 5);
            }

            if (e.x < -80 || e.x > width + 80 || e.y < -80 || e.y > height + 80) {
                enemigos.splice(i, 1);
            }
        }
    }

    // Mejora #9: Power-ups variados (Triple Disparo, Curación +1, Escudo)
    function handlePowerups() {
        const currentTime = millis();
        if (currentTime - lastPowerupSpawnTime > 15000) {
            const types = ["triple", "shield", "heal"];
            const kind = types[Math.floor(Math.random() * types.length)];
            powerups.push({
                x: Math.random() * (width - 120) + 60,
                y: Math.random() * (height - 120) + 60,
                kind
            });
            lastPowerupSpawnTime = currentTime;
        }

        for (let i = powerups.length - 1; i >= 0; i--) {
            const p = powerups[i];
            drawImageCenter(powerup, p.x, p.y);

            const badgeColor = p.kind === "triple" ? "#eab308" : (p.kind === "shield" ? "#38bdf8" : "#22c55e");
            const badgeText = p.kind === "triple" ? "3X" : (p.kind === "shield" ? "SHD" : "+1♥");

            gctx.fillStyle = badgeColor;
            gctx.font = "bold 12px sans-serif";
            gctx.textAlign = "center";
            gctx.fillText(badgeText, p.x, p.y - 30);

            if (Math.hypot(px - p.x, py - p.y) < currentImage.width / 2 + 12) {
                GameSFX.powerup();
                spawnParticles(p.x, p.y, badgeColor, 15);
                if (p.kind === "triple") {
                    tripleShotActive = true;
                    tripleShotEndTime = millis() + tripleShotDuration;
                } else if (p.kind === "shield") {
                    shieldActive = true;
                    shieldEndTime = millis() + shieldDuration;
                } else if (p.kind === "heal") {
                    playerLives = Math.min(playerMaxLives, playerLives + 1);
                }
                powerups.splice(i, 1);
            }
        }
    }

    function showGameOverScreen() {
        gctx.fillStyle = "#000000";
        gctx.fillRect(0, 0, width, height);
        gctx.fillStyle = "#ff0000";
        gctx.textAlign = "center";
        gctx.textBaseline = "middle";
        gctx.font = "bold 50px sans-serif";
        gctx.fillText("Game Over", width / 2, height / 2 - 110);
        gctx.fillStyle = "#ffffff";
        gctx.font = "30px sans-serif";
        gctx.fillText("Puntuación: " + puntuacion, width / 2, height / 2 - 30);
        gctx.fillStyle = "#eab308";
        gctx.fillText("🏆 Récord: " + highScore, width / 2, height / 2 + 20);
        gctx.fillStyle = "#94a3b8";
        gctx.font = "24px sans-serif";
        gctx.fillText("Presiona 'R' o toca aquí para reiniciar", width / 2, height / 2 + 100);
    }

    // Mejora #6, #11 y #12: HUD completo con Vidas, Récord y Barras de enfriamiento/duración
    function displayHUD() {
        const now = millis();

        // Fondo translúcido superior
        gctx.fillStyle = "rgba(11, 15, 20, 0.72)";
        gctx.fillRect(10, 10, width - 20, 48);
        gctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        gctx.lineWidth = 1;
        gctx.strokeRect(10, 10, width - 20, 48);

        // Puntaje y Récord
        gctx.fillStyle = "#ffffff";
        gctx.font = "bold 18px sans-serif";
        gctx.textAlign = "left";
        gctx.textBaseline = "middle";
        gctx.fillText(`Score: ${puntuacion}`, 22, 34);

        gctx.fillStyle = "#eab308";
        gctx.fillText(`🏆 Hi: ${highScore}`, 135, 34);

        // Vidas en corazones
        let hearts = "";
        for (let i = 0; i < playerMaxLives; i++) {
            hearts += i < playerLives ? "❤️ " : "🖤 ";
        }
        gctx.font = "18px sans-serif";
        gctx.fillText(hearts, 260, 34);

        // Barra de enfriamiento del Dash (Shift / Espacio)
        const dashPct = Math.min(1, (now - lastDashTime) / dashCooldown);
        gctx.fillStyle = "#334155";
        gctx.fillRect(390, 22, 110, 10);
        gctx.fillStyle = dashPct >= 1 ? "#38bdf8" : "#0284c7";
        gctx.fillRect(390, 22, 110 * dashPct, 10);
        gctx.fillStyle = "#cbd5e1";
        gctx.font = "bold 10px sans-serif";
        gctx.fillText("DASH [SHIFT]", 390, 44);

        // Barra de enfriamiento de Parábola (E)
        const paraPct = Math.min(1, (now - lastParabolaShotTime) / parabolaInterval);
        gctx.fillStyle = "#334155";
        gctx.fillRect(520, 22, 110, 10);
        gctx.fillStyle = paraPct >= 1 ? "#22c55e" : "#15803d";
        gctx.fillRect(520, 22, 110 * paraPct, 10);
        gctx.fillStyle = "#cbd5e1";
        gctx.fillText("PARÁBOLA [E]", 520, 44);

        // Barra de duración de Power-up activo (Triple o Escudo)
        if (tripleShotActive) {
            const rem = Math.max(0, (tripleShotEndTime - now) / tripleShotDuration);
            gctx.fillStyle = "#334155";
            gctx.fillRect(650, 22, 125, 10);
            gctx.fillStyle = "#eab308";
            gctx.fillRect(650, 22, 125 * rem, 10);
            gctx.fillStyle = "#fde047";
            gctx.fillText("TRIPLE SHOT", 650, 44);
        } else if (shieldActive) {
            const rem = Math.max(0, (shieldEndTime - now) / shieldDuration);
            gctx.fillStyle = "#334155";
            gctx.fillRect(650, 22, 125, 10);
            gctx.fillStyle = "#38bdf8";
            gctx.fillRect(650, 22, 125 * rem, 10);
            gctx.fillStyle = "#7dd3fc";
            gctx.fillText("ESCUDO ACTIVO", 650, 44);
        }
    }

    // Mejora #4: Clics unificados en un solo manejador
    function handleMousePressed() {
        if (enMenu) {
            const bw = width * 0.34;
            const bh = height * 0.14;
            if (mouseX > width / 2 - bw / 2 && mouseX < width / 2 + bw / 2) {
                if (mouseY > height * 0.5 - bh / 2 && mouseY < height * 0.5 + bh / 2) {
                    enMenu = false;
                    mostrarPantallaJuego = true;
                } else if (mouseY > height * 0.78 - bh / 2 && mouseY < height * 0.78 + bh / 2) {
                    enMenu = false;
                    mostrarTextoCreditos = true;
                } else if (mouseY > height * 0.22 - bh / 2 && mouseY < height * 0.22 + bh / 2) {
                    enMenu = false;
                    mostrarTextoHistoria = true;
                }
            }
        } else if (mostrarTextoHistoria) {
            if (mouseX > width / 2 - (width * 0.6) / 2 && mouseX < width / 2 + (width * 0.6) / 2) {
                if (mouseY > height * 0.9 - (height * 0.1) / 2 && mouseY < height * 0.9 + (height * 0.1) / 2) {
                    enMenu = true;
                    mostrarTextoHistoria = false;
                }
            }
        } else if (mostrarTextoCreditos) {
            if (mouseX > width / 2 - (width * 0.6) / 2 && mouseX < width / 2 + (width * 0.6) / 2) {
                if (mouseY > height * 0.1 - (height * 0.1) / 2 && mouseY < height * 0.1 + (height * 0.1) / 2) {
                    enMenu = true;
                    mostrarTextoCreditos = false;
                }
            }
        } else if (mostrarPantallaFin || mostrarPantallaVictory) {
            restartGame();
        } else if (mostrarPantallaJuego && !gameOver && !isPaused) {
            GameSFX.shoot();
            const baseAngle = Math.atan2(mouseY - py, mouseX - px);
            if (tripleShotActive) {
                for (let i = 0; i < 3; i++) {
                    const angleOffset = (i - 1) * (Math.PI / 8);
                    projectiles.push({
                        tx: px,
                        ty: py,
                        vx: Math.cos(baseAngle + angleOffset),
                        vy: Math.sin(baseAngle + angleOffset)
                    });
                }
            } else {
                projectiles.push({
                    tx: px,
                    ty: py,
                    vx: Math.cos(baseAngle),
                    vy: Math.sin(baseAngle)
                });
            }
        }
    }

    // Mejora #3 y #7: Movimiento diagonal normalizado y soporte de Dash
    function handleMovement() {
        let vx = 0;
        let vy = 0;
        if (movingRight) vx += 1;
        if (movingLeft) vx -= 1;
        if (movingDown) vy += 1;
        if (movingUp) vy -= 1;

        if (vx !== 0 && vy !== 0) {
            vx *= Math.SQRT1_2;
            vy *= Math.SQRT1_2;
        }

        const now = millis();
        const isDashing = now < dashActiveUntil;
        const currentSpeed = isDashing ? speed * dashSpeedMultiplier : speed;

        if (isDashing && (vx !== 0 || vy !== 0)) {
            dashTrail.push({ x: px, y: py, alpha: 1.0 });
        }

        const halfW = currentImage.width / 2;
        const halfH = currentImage.height / 2;
        px = Math.max(halfW, Math.min(width - halfW, px + vx * currentSpeed));
        py = Math.max(halfH + 55, Math.min(height - halfH, py + vy * currentSpeed));
    }

    // Mejora #1: Vida del jefe consistente (50 HP) al iniciar y al reiniciar
    function restartGame() {
        gameOver = false;
        isPaused = false;
        mostrarPantallaFin = false;
        mostrarPantallaVictory = false;
        px = width * 0.2;
        py = height * 0.2;
        playerLives = playerMaxLives;
        invulnerableUntil = millis() + 1000;
        projectiles = [];
        villanoProjectiles = [];
        parabolas = [];
        enemigos = [];
        powerups = [];
        particles = [];
        dashTrail = [];
        currentImage = prota;
        puntuacion = 0;
        mostrarPantallaJuego = true;
        tripleShotActive = false;
        shieldActive = false;
        bossHealth = 50;
        bossMaxHealth = 50;
        bossEnemy.x = width / 2;
        bossEnemy.y = height / 2;
    }

    function calculateParabolic(x, hVal) {
        return ((x - hVal) * (x - hVal)) / 200;
    }

    function onScreen(x, y) {
        return x > 0 && x < width && y > 0 && y < height;
    }

    function distantLoop() {
        if (!distantRunning || !gctx) return;

        const now = millis();
        if (tripleShotActive && now > tripleShotEndTime) {
            tripleShotActive = false;
        }
        if (shieldActive && now > shieldEndTime) {
            shieldActive = false;
        }

        if (enMenu) {
            showMenu();
        } else if (mostrarPantallaJuego) {
            drawGameScreen();
        } else if (mostrarTextoHistoria) {
            showHistoria();
        } else if (mostrarTextoCreditos) {
            showCreditos();
        } else if (mostrarPantallaFin) {
            showGameOverScreen();
        } else if (mostrarPantallaVictory) {
            showPantallaVictory();
        }

        distantAnimId = requestAnimationFrame(distantLoop);
    }

    function startDistantEngine() {
        if (distantRunning) return;
        distantRunning = true;
        lastEnemySpawnTime = millis();
        lastPowerupSpawnTime = millis();
        distantAnimId = requestAnimationFrame(distantLoop);
    }

    function stopDistantEngine() {
        distantRunning = false;
        isPaused = false;
        movingUp = false;
        movingDown = false;
        movingLeft = false;
        movingRight = false;
        shootParabola = false;
        if (distantAnimId) {
            cancelAnimationFrame(distantAnimId);
            distantAnimId = null;
        }
    }

    // Exponer las funciones globalmente para que script.js pueda abrir/cerrar el juego
    window.startDistantEngine = startDistantEngine;
    window.stopDistantEngine = stopDistantEngine;
});