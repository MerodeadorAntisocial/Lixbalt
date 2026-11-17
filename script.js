document.addEventListener('DOMContentLoaded', () => {
    const htmlEl = document.documentElement;
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.nav-link');

    // 1. Gestión de Modo Oscuro / Claro con persistencia
    const savedTheme = localStorage.getItem('imperio-papu-theme') || 'dark';
    setTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    });

    function setTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        localStorage.setItem('imperio-papu-theme', theme);

        if (theme === 'dark') {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Modo Claro';
        } else {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Modo Oscuro';
        }
    }

    // 2. Menú móvil desplegable
    mobileMenuBtn.addEventListener('click', () => {
        mainNav.classList.toggle('open');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('open');
        });
    });

    // 3. Resaltado automático de la sección activa en el <nav>
    const sections = document.querySelectorAll('section[id], footer[id]');

    window.addEventListener('scroll', () => {
        let currentSection = '';
        const scrollY = window.scrollY + 140;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // =========================================================================
    // 4. LÓGICA DEL REPRODUCTOR MULTICANCIONES
    // =========================================================================
    const playlist = [
        { title: "1. Lamento Pajero", src: "music/Lamento_Pajero.mp3" },
        { title: "2. Marcha Imperial", src: "music/marcha_imperial.mpeg" },
        { title: "3. MrPapu Vs LinuxMan", src: "music/MrPapu vs LinuxMan.mp3" },
        { title: "4. Mclean vs Rey del Humo", src: "music/Mclean vs Rey del Humo.mp3" },
        { title: "5. Triple T", src: "music/Triple T.mp3" },
    ];

    let currentTrackIndex = parseInt(localStorage.getItem('imperio-papu-track')) || 0;
    if (currentTrackIndex >= playlist.length) currentTrackIndex = 0;

    const bgMusic = document.getElementById('bgMusic');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseIcon = document.getElementById('playPauseIcon');
    const playPauseText = document.getElementById('playPauseText');
    const prevTrackBtn = document.getElementById('prevTrackBtn');
    const nextTrackBtn = document.getElementById('nextTrackBtn');
    const trackSelector = document.getElementById('trackSelector');
    const currentTrackName = document.getElementById('currentTrackName');
    const volDownBtn = document.getElementById('volDownBtn');
    const volUpBtn = document.getElementById('volUpBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const eqBars = document.getElementById('eqBars');
    const musicPlayer = document.getElementById('musicPlayer');
    const minimizeMusicBtn = document.getElementById('minimizeMusicBtn');

    playlist.forEach((track, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = track.title;
        trackSelector.appendChild(option);
    });

    loadTrack(currentTrackIndex, false);
    const savedVolume = parseFloat(localStorage.getItem('imperio-papu-volume'));
    updateVolume(!isNaN(savedVolume) ? savedVolume : 0.5);

    function loadTrack(index, autoPlay = true) {
        currentTrackIndex = index;
        bgMusic.src = playlist[currentTrackIndex].src;
        currentTrackName.textContent = playlist[currentTrackIndex].title;
        trackSelector.value = currentTrackIndex;
        localStorage.setItem('imperio-papu-track', currentTrackIndex);

        if (autoPlay) {
            bgMusic.play().then(() => {
                setPlayingUI(true);
            }).catch(err => {
                console.warn('No se pudo reproducir:', playlist[currentTrackIndex].src, err);
                setPlayingUI(false);
            });
        }
    }

    playPauseBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play().then(() => setPlayingUI(true)).catch(console.warn);
        } else {
            bgMusic.pause();
            setPlayingUI(false);
        }
    });

    nextTrackBtn.addEventListener('click', () => {
        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(nextIndex, true);
    });

    prevTrackBtn.addEventListener('click', () => {
        const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(prevIndex, true);
    });

    trackSelector.addEventListener('change', (e) => {
        loadTrack(parseInt(e.target.value), true);
    });

    bgMusic.addEventListener('ended', () => {
        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(nextIndex, true);
    });

    volDownBtn.addEventListener('click', () => {
        updateVolume(Math.max(0, Math.round((bgMusic.volume - 0.1) * 100) / 100));
    });

    volUpBtn.addEventListener('click', () => {
        updateVolume(Math.min(1, Math.round((bgMusic.volume + 0.1) * 100) / 100));
    });

    volumeSlider.addEventListener('input', (e) => {
        updateVolume(parseFloat(e.target.value));
    });

    minimizeMusicBtn.addEventListener('click', () => {
        musicPlayer.classList.toggle('minimized');
        minimizeMusicBtn.textContent = musicPlayer.classList.contains('minimized') ? '+' : '−';
    });

    function updateVolume(val) {
        bgMusic.volume = val;
        volumeSlider.value = val;
        volumeValue.textContent = `${Math.round(val * 100)}%`;
        localStorage.setItem('imperio-papu-volume', val);
    }

    function setPlayingUI(isPlaying) {
        if (isPlaying) {
            playPauseIcon.textContent = '⏸';
            playPauseText.textContent = 'Pausar';
            playPauseBtn.classList.add('is-playing');
            eqBars.classList.add('playing');
        } else {
            playPauseIcon.textContent = '▶';
            playPauseText.textContent = 'Continuar';
            playPauseBtn.classList.remove('is-playing');
            eqBars.classList.remove('playing');
        }
    }

    // =========================================================================
    // 5. EFECTO PARALLAX 3D PARA TARJETAS DE BIOGRAFÍA
    // =========================================================================
    const bioCards = document.querySelectorAll('.bio-card');

    bioCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            const multiplier = 20; 
            const rotateX = (multiplier * (0.5 - y)).toFixed(2);
            const rotateY = (multiplier * (x - 0.5)).toFixed(2);

            const shineX = (x * 100).toFixed(2);
            const shineY = (y * 100).toFixed(2);

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.setProperty('--shine-x', `${shineX}%`);
            card.style.setProperty('--shine-y', `${shineY}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.setProperty('--shine-x', `50%`);
            card.style.setProperty('--shine-y', `50%`);
        });
    });

    // =========================================================================
    // 6. EASTER EGGS: PALABRAS SECRETAS "iceberg" Y "distant"
    // =========================================================================
    const icebergOverlay = document.getElementById('icebergEasterEgg');
    const staticCanvas = document.getElementById('staticCanvas');
    const closeIcebergBtn = document.getElementById('closeIcebergBtn');
    const cdDays = document.getElementById('cdDays');
    const cdHours = document.getElementById('cdHours');
    const cdMinutes = document.getElementById('cdMinutes');
    const cdSeconds = document.getElementById('cdSeconds');

    const distantOverlay = document.getElementById('distantEasterEgg');
    const closeDistantBtn = document.getElementById('closeDistantBtn');

    const ctx = staticCanvas.getContext('2d');
    let keyBuffer = '';
    const secretWord = 'iceberg';
    const distantWord = 'distant';
    const maxBufferLength = Math.max(secretWord.length, distantWord.length);
    let staticAnimId = null;
    let countdownInterval = null;
    const targetDate = new Date('2027-02-08T00:00:00').getTime();

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

        if (e.key === 'Escape') {
            if (!icebergOverlay.classList.contains('hidden')) {
                closeIcebergEasterEgg();
                return;
            }
            if (distantOverlay && !distantOverlay.classList.contains('hidden')) {
                closeDistantGame();
                return;
            }
        }

        const isIcebergHidden = icebergOverlay.classList.contains('hidden');
        const isDistantHidden = !distantOverlay || distantOverlay.classList.contains('hidden');

        if (isIcebergHidden && isDistantHidden && e.key.length === 1) {
            keyBuffer += e.key.toLowerCase();
            if (keyBuffer.length > maxBufferLength) {
                keyBuffer = keyBuffer.slice(-maxBufferLength);
            }
            if (keyBuffer.endsWith(secretWord)) {
                triggerIcebergTransition();
                keyBuffer = '';
            } else if (keyBuffer.endsWith(distantWord)) {
                openDistantGame();
                keyBuffer = '';
            }
        }
    });

    closeIcebergBtn.addEventListener('click', closeIcebergEasterEgg);
    if (closeDistantBtn) {
        closeDistantBtn.addEventListener('click', closeDistantGame);
    }

    function openDistantGame() {
        if (!distantOverlay) return;
        distantOverlay.classList.remove('hidden');
        distantOverlay.setAttribute('aria-hidden', 'false');

        if (bgMusic && !bgMusic.paused) {
            bgMusic.pause();
            setPlayingUI(false);
        }

        if (typeof window.unlockAchievement === 'function') {
            window.unlockAchievement('ach-hacker');
        }

        startDistantEngine();
    }

    function closeDistantGame() {
        if (!distantOverlay) return;
        distantOverlay.classList.add('hidden');
        distantOverlay.setAttribute('aria-hidden', 'true');
        stopDistantEngine();
    }

    function triggerIcebergTransition() {
        icebergOverlay.classList.remove('hidden', 'show-countdown');
        icebergOverlay.classList.add('heavy-static');

        startCanvasStatic();
        playStaticNoiseBurst(1.45);
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);

        setTimeout(() => {
            icebergOverlay.classList.remove('heavy-static');
            icebergOverlay.classList.add('show-countdown');
        }, 1450);
    }

    function closeIcebergEasterEgg() {
        icebergOverlay.classList.add('hidden');
        icebergOverlay.classList.remove('heavy-static', 'show-countdown');
        if (staticAnimId) cancelAnimationFrame(staticAnimId);
        if (countdownInterval) clearInterval(countdownInterval);
    }

    function startCanvasStatic() {
        staticCanvas.width = 360;
        staticCanvas.height = 220;

        function renderNoise() {
            const w = staticCanvas.width;
            const h = staticCanvas.height;
            const imgData = ctx.createImageData(w, h);
            const buffer32 = new Uint32Array(imgData.data.buffer);

            for (let i = 0; i < buffer32.length; i++) {
                const rand = Math.random();
                if (rand < 0.45) {
                    buffer32[i] = 0xff000000;
                } else if (rand < 0.88) {
                    const shade = (Math.random() * 255) | 0;
                    buffer32[i] = (255 << 24) | (shade << 16) | (shade << 8) | shade;
                } else {
                    buffer32[i] = 0xffffe500;
                }
            }
            ctx.putImageData(imgData, 0, 0);

            if (Math.random() > 0.3) {
                ctx.fillStyle = 'rgba(0, 229, 255, 0.45)';
                ctx.fillRect(0, Math.random() * h, w, Math.random() * 18 + 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillRect(0, Math.random() * h, w, Math.random() * 8 + 1);
            }

            staticAnimId = requestAnimationFrame(renderNoise);
        }

        renderNoise();
    }

    function playStaticNoiseBurst(durationSeconds) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioCtx();
            const bufferSize = audioCtx.sampleRate * durationSeconds;
            const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const output = noiseBuffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = audioCtx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;

            const gainNode = audioCtx.createGain();
            gainNode.gain.setValueAtTime(0.22, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationSeconds);

            whiteNoise.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            whiteNoise.start();
        } catch (e) {}
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const diff = Math.max(0, targetDate - now);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        cdDays.textContent = String(days).padStart(2, '0');
        cdHours.textContent = String(hours).padStart(2, '0');
        cdMinutes.textContent = String(minutes).padStart(2, '0');
        cdSeconds.textContent = String(seconds).padStart(2, '0');
    }

    // =========================================================================
    // 7. ANIMACIONES ESCALONADAS: TIERLIST Y CARACTERÍSTICAS
    // =========================================================================
    const animatedElements = document.querySelectorAll('.tier-row, .feature-item');

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const siblings = Array.from(entry.target.parentElement.children);
                const index = siblings.indexOf(entry.target);
                entry.target.style.transitionDelay = `${index * 0.1}s`;
                entry.target.classList.add('animate-in');

                setTimeout(() => {
                    entry.target.style.transitionDelay = '0s';
                }, (index * 100) + 650);

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    animatedElements.forEach(el => scrollObserver.observe(el));

    // =========================================================================
    // 8. CUADRADO EXPLICATIVO DE HISTORIA AL HACER CLICK EN LAS FACCIONES
    // =========================================================================
    const faccionCards = document.querySelectorAll('#facciones .info-card');
    const faccionModalBackdrop = document.getElementById('faccionModalBackdrop');
    const faccionSquareTitle = document.getElementById('faccionSquareTitle');
    const faccionSquareMembers = document.getElementById('faccionSquareMembers');
    const faccionSquareHistory = document.getElementById('faccionSquareHistory');
    const closeFaccionSquareBtn = document.getElementById('closeFaccionSquareBtn');

    const loremHistoryText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

    function openFaccionSquare(card) {
        const title = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Facción Imperial';
        const members = card.querySelector('p') ? card.querySelector('p').textContent : '';

        faccionSquareTitle.textContent = title;
        faccionSquareMembers.textContent = `Integrantes: ${members}`;
        faccionSquareHistory.textContent = loremHistoryText;

        faccionModalBackdrop.classList.remove('hidden');
        faccionModalBackdrop.setAttribute('aria-hidden', 'false');
    }

    function closeFaccionSquare() {
        faccionModalBackdrop.classList.add('hidden');
        faccionModalBackdrop.setAttribute('aria-hidden', 'true');
    }

    faccionCards.forEach(card => {
        card.addEventListener('click', () => openFaccionSquare(card));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openFaccionSquare(card);
            }
        });
    });

    closeFaccionSquareBtn.addEventListener('click', closeFaccionSquare);
    faccionModalBackdrop.addEventListener('click', (e) => {
        if (e.target === faccionModalBackdrop) closeFaccionSquare();
    });

    // =========================================================================
    // 9. CUADRADO EXPLICATIVO PARA LOS CÍRCULOS IMPERIALES (AL HACER CLIC)
    // =========================================================================
    const circleCards = document.querySelectorAll('.circles-grid .circle-card');
    const circleModalBackdrop = document.getElementById('circleModalBackdrop');
    const circleSquareTitle = document.getElementById('circleSquareTitle');
    const circleSquareMember = document.getElementById('circleSquareMember');
    const circleSquareDescription = document.getElementById('circleSquareDescription');
    const closeCircleSquareBtn = document.getElementById('closeCircleSquareBtn');

    const circleLoreData = {
        "I": { name: "Círculo I: Limbo", desc: "Aquí yacen aquellos que no conocieron la verdadera fe imperial ni los decretos del imperio, atrapados en una penumbra eterna sin tormentos físicos pero sin esperanza." },
        "II": { name: "Círculo II: Lujuria", desc: "Arrastrados por vientos huracanados perpetuos que simbolizan la pérdida de control ante las pasiones y deseos mundanos desatados." },
        "III": { name: "Círculo III: Gula", desc: "Sometidos bajo una lluvia helada, fango y granizo pesado, representando la insaciable necesidad de consumo y apetito voraz." },
        "IV": { name: "Círculo IV: Codicia", desc: "Almas que acumularon y desperdiciaron recursos en vida, condenadas a chocar rocas colosales empujándolas eternamente en direcciones opuestas." },
        "V": { name: "Círculo V: Ira", desc: "Sumergidos en las turbulentas y fangosas aguas del río Estigia, donde se golpean y desgarran rabiosamente por toda la eternidad." },
        "VI": { name: "Círculo VI: Herejía", desc: "Atrapados dentro de sepulcros ardientes y llamas abrasadoras por desafiar los dogmas fundamentales del Sagrado Lore." },
        "VII": { name: "Círculo VII: Violencia", desc: "Dividido en anillos donde los transgresores sufren en un río de sangre hirviendo o convertidos en vegetación seca bajo lluvias de fuego." },
        "VIII": { name: "Círculo VIII: Fraude", desc: "Fosas profundas y puentes de piedra donde los engañadores y estafadores sufren tormentos adaptados a sus múltiples mentiras." },
        "IX": { name: "Círculo IX: Traición", desc: "El círculo más profundo y helado del infierno imperial, reservado para aquellos que quebrantaron los lazos de confianza suprema." }
    };

    function openCircleSquare(card) {
        const numEl = card.querySelector('.circle-num');
        const titleEl = card.querySelector('h4');
        const memberEl = card.querySelector('p');

        const romanNum = numEl ? numEl.textContent.trim() : 'I';
        const circleName = titleEl ? titleEl.textContent : 'Círculo';
        const memberName = memberEl ? memberEl.textContent : '';

        const data = circleLoreData[romanNum] || { 
            name: `Círculo ${romanNum}: ${circleName}`, 
            desc: `Zona profunda del infierno imperial asignada a este sector de guardia.` 
        };

        circleSquareTitle.textContent = data.name;
        circleSquareMember.textContent = `Representante asignado: ${memberName}`;
        circleSquareDescription.textContent = data.desc;

        circleModalBackdrop.classList.remove('hidden');
        circleModalBackdrop.setAttribute('aria-hidden', 'false');
    }

    function closeCircleSquare() {
        circleModalBackdrop.classList.add('hidden');
        circleModalBackdrop.setAttribute('aria-hidden', 'true');
    }

    circleCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => openCircleSquare(card));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openCircleSquare(card);
            }
        });
    });

    closeCircleSquareBtn.addEventListener('click', closeCircleSquare);
    circleModalBackdrop.addEventListener('click', (e) => {
        if (e.target === circleModalBackdrop) closeCircleSquare();
    });

    // =========================================================================
    // 11. SISTEMA DE LOGROS DESBLOQUEABLES (GAMIFICATION)
    // =========================================================================
    const achievementsToggleBtn = document.getElementById('achievementsToggleBtn');
    const achievementsPanel = document.getElementById('achievementsPanel');
    const closeAchievementsBtn = document.getElementById('closeAchievementsBtn');
    const achievementsCount = document.getElementById('achievementsCount');
    const achievementToast = document.getElementById('achievementToast');
    const toastTitle = document.getElementById('toastTitle');

    const defaultAchievements = {
        'ach-explorer': false,
        'ach-hacker': false,
        'ach-audio': false,
        'ach-meme': false,
        'ach-distant': false,
        'ach-judge': false,
        'ach-inquisidor': false,
        'ach-cinema': false
    };

    const savedAchievements = JSON.parse(localStorage.getItem('imperio-papu-achievements')) || {};
    let achievements = { ...defaultAchievements, ...savedAchievements };

    updateAchievementsUI();

    achievementsToggleBtn.addEventListener('click', () => {
        achievementsPanel.classList.toggle('hidden');
    });

    closeAchievementsBtn.addEventListener('click', () => {
        achievementsPanel.classList.add('hidden');
    });

    window.unlockAchievement = function(achId) {
        if (achievements[achId]) return;

        achievements[achId] = true;
        localStorage.setItem('imperio-papu-achievements', JSON.stringify(achievements));
        updateAchievementsUI();

        const achElement = document.getElementById(achId);
        if (achElement && achievementToast) {
            const titleText = achElement.querySelector('h4').textContent;
            toastTitle.textContent = titleText;
            achievementToast.classList.remove('hidden');
            achievementToast.classList.add('show');

            setTimeout(() => {
                achievementToast.classList.remove('show');
            }, 3600);
        }
    };

    function updateAchievementsUI() {
        let unlockedCount = 0;
        const total = Object.keys(achievements).length;

        for (const [id, unlocked] of Object.entries(achievements)) {
            const el = document.getElementById(id);
            if (el) {
                const statusSpan = el.querySelector('.ach_status');
                if (unlocked) {
                    el.classList.add('unlocked');
                    if (statusSpan) statusSpan.textContent = '✅';
                    unlockedCount++;
                } else {
                    el.classList.remove('unlocked');
                    if (statusSpan) statusSpan.textContent = '🔒';
                }
            }
        }

        achievementsCount.textContent = `${unlockedCount}/${total}`;
    }

    const faccionCardsObserver = document.querySelectorAll('#facciones .info-card');
    let viewedFactions = new Set();

    faccionCardsObserver.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').textContent;
            viewedFactions.add(title);
            if (viewedFactions.size >= 3) {
                unlockAchievement('ach-explorer');
            }
        });
    });

    let viewedCircles = new Set();
    circleCards.forEach(card => {
        card.addEventListener('click', () => {
            const num = card.querySelector('.circle-num')?.textContent.trim();
            if (num) viewedCircles.add(num);
            if (viewedCircles.size >= 5) {
                unlockAchievement('ach-inquisidor');
            }
        });
    });

    const bgAudioEl = document.getElementById('bgMusic');
    if (bgAudioEl) {
        bgAudioEl.addEventListener('play', () => {
            unlockAchievement('ach-audio');
        });
    }

    const icebergOverlayEl = document.getElementById('icebergEasterEgg');
    if (icebergOverlayEl) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && !icebergOverlayEl.classList.contains('hidden')) {
                    unlockAchievement('ach-hacker');
                }
            });
        });
        observer.observe(icebergOverlayEl, { attributes: true });
    }

    // Tecla Escape general para modales
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!faccionModalBackdrop.classList.contains('hidden')) closeFaccionSquare();
            if (!circleModalBackdrop.classList.contains('hidden')) closeCircleSquare();
        }
    });

    // =========================================================================
    // 12. MOTOR DEL JUEGO "DISTANT" (CANVAS 2D AUTÓNOMO, SIN BLOQUEO DE P5)
    // =========================================================================
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

    // Creación de sprites con respaldo automático si falta algún archivo .png
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

    let px = width * 0.2;
    let py = height * 0.2;
    let speed = 3;
    let movingUp = false;
    let movingDown = false;
    let movingLeft = false;
    let movingRight = false;

    let enemigos = [];
    let projectiles = [];
    let parabolas = [];
    let ts = 8;
    let fx = 0;
    let currentImage = prota;
    let lastEnemySpawnTime = 0;
    let gameOver = false;
    let puntuacion = 0;
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

    let tripleShotActive = false;
    let tripleShotEndTime = 0;
    let powerups = [];
    let lastPowerupSpawnTime = 0;

    let bossHealth = 10;
    let bossMaxHealth = 10;
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
    let lastParabolaShotTime = 300;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let mouseIsPressed = false;
    let distantAnimId = null;
    let distantRunning = false;

    // Eventos del ratón escalados a 800x800
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
    }

    // Eventos de teclado del juego
    window.addEventListener('keydown', (e) => {
        if (!distantRunning) return;
        const key = e.key.toLowerCase();

        if (!gameOver && mostrarPantallaJuego) {
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
        }
        if (enMenu && key === "enter") {
            enMenu = false;
            mostrarPantallaJuego = true;
        }
        if ((mostrarPantallaVictory || mostrarPantallaFin) && key === "r") {
            restartGame();
        }
        if (key === "e") {
            shootParabola = true;
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

    function drawImageCenter(sprite, x, y) {
        gctx.drawImage(sprite.canvas, x - sprite.width / 2, y - sprite.height / 2, sprite.width, sprite.height);
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

    function drawButton(txt, x, y, xl, yl) {
        let fontSize = 57;
        let btnColor = gris;
        const inX = mouseX < x + xl / 2 && mouseX > x - xl / 2;
        const inY = mouseY < y + yl / 2 && mouseY > y - yl / 2;

        if (inX && inY) {
            fontSize = 67;
            btnColor = grisCLA;
            if (mouseIsPressed) {
                btnColor = "rgb(19, 0, 143)";
                if (txt === "Jugar") {
                    enMenu = false;
                    mostrarPantallaJuego = true;
                } else if (txt === "Historia") {
                    enMenu = false;
                    mostrarTextoHistoria = true;
                } else if (txt === "Creditos") {
                    enMenu = false;
                    mostrarTextoCreditos = true;
                } else if (txt === "Volver") {
                    enMenu = true;
                    mostrarTextoCreditos = false;
                    mostrarTextoHistoria = false;
                    mostrarPantallaJuego = false;
                }
            }
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
        drawImageCenter(menuImg, width / 2 - fx, height / 2);
        drawButton("Jugar", width / 2, height * 0.5, width * 0.3, height * 0.15);
        drawButton("Creditos", width / 2, height * 0.8, width * 0.3, height * 0.15);
        drawButton("Historia", width / 2, height * 0.2, width * 0.3, height * 0.15);
    }

    function showHistoria() {
        gctx.fillStyle = "#000000";
        gctx.fillRect(0, 0, width, height);
        gctx.fillStyle = "#ffffff";
        gctx.font = "22px sans-serif";
        gctx.textAlign = "center";
        gctx.textBaseline = "middle";
        const texto = "En un futuro lejano tras el año 9329, la humanidad enfrenta una era de conflicto y avance tecnológico desmedido, desencadenado por el descubrimiento de la energía Loraxius y la creación del opresivo Imperio Terrano. Divididos entre quienes abogan por la erradicación de los Inhumanos y aquellos que prefieren integrarlos o utilizarlos, la sociedad se sumerge en una devastadora guerra conocida como El llanto de cristo por sus inmensas pérdidas. En medio de este caos, el soldado Gustabo, decidido a evitar más sufrimiento tras perder a su hermano por un error de su superior, utiliza un prototipo de viaje en el tiempo para alterar el curso de la historia y buscar justicia.";
        drawWrappedText(texto, width / 2, height * 0.45, width * 0.7, 30);
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

    function drawGameScreen() {
        drawImageCenter(Fondo, width / 2 - fx, height / 2);
        drawImageCenter(currentImage, px, py);

        handleProjectiles();
        handleEnemies();
        handlePowerups();
        handleMovement();
        handleVillano();
        checkCollisions();
        checkParabolaCollisions();
        displayScore();
        showPantallaVictory();
    }

    function handleVillano() {
        if (puntuacion >= 20) {
            const dx = px - bossEnemy.x;
            const dy = py - bossEnemy.y;
            const mag = Math.hypot(dx, dy) || 1;

            bossEnemy.x += (dx / mag) * bossEnemy.speed;
            bossEnemy.y += (dy / mag) * bossEnemy.speed;

            drawImageCenter(VillanoImg, bossEnemy.x, bossEnemy.y);
            drawBossHealthBar();
            handleVillanoDisparo();
        }
    }

    function handleVillanoDisparo() {
        const currentTime = millis();
        const increasedCadenceInterval = bossEnemy.shotInterval * 0.5;

        if (currentTime - lastVillanoShotTime > increasedCadenceInterval) {
            const dx = px - bossEnemy.x;
            const dy = py - bossEnemy.y;
            const mag = Math.hypot(dx, dy) || 1;
            villanoProjectiles.push({
                x: bossEnemy.x,
                y: bossEnemy.y,
                vx: (dx / mag) * 4,
                vy: (dy / mag) * 4
            });
            lastVillanoShotTime = currentTime;
        }

        for (let i = villanoProjectiles.length - 1; i >= 0; i--) {
            const p = villanoProjectiles[i];
            gctx.fillStyle = "rgb(199, 69, 255)";
            gctx.strokeStyle = "#000000";
            gctx.lineWidth = 1;
            gctx.beginPath();
            gctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            gctx.fill();
            gctx.stroke();

            p.x += p.vx;
            p.y += p.vy;

            if (puntuacion >= 20 && Math.hypot(p.x - px, p.y - py) < 15) {
                gameOver = true;
                mostrarPantallaFin = true;
                mostrarPantallaJuego = false;
            }

            if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
                villanoProjectiles.splice(i, 1);
            }
        }
    }

    function drawBossHealthBar() {
        const healthBarWidth = 200;
        const healthBarHeight = 20;
        const x = bossEnemy.x - healthBarWidth / 2;
        const y = bossEnemy.y - VillanoImg.height / 2 - healthBarHeight - 10;

        const healthWidth = Math.max(0, (bossHealth / bossMaxHealth) * healthBarWidth);
        gctx.fillStyle = "#ff0000";
        gctx.fillRect(x, y, healthWidth, healthBarHeight);

        gctx.strokeStyle = "#000000";
        gctx.lineWidth = 2;
        gctx.strokeRect(x, y, healthBarWidth, healthBarHeight);
    }

    function checkCollisions() {
        for (let i = 0; i < enemigos.length; i++) {
            const e = enemigos[i];
            if (Math.hypot(px - e.x, py - e.y) < currentImage.width / 2) {
                gameOver = true;
                mostrarPantallaFin = true;
                mostrarPantallaJuego = false;
                break;
            }
        }
    }

    function checkParabolaCollisions() {
        for (let i = parabolas.length - 1; i >= 0; i--) {
            const p = parabolas[i];
            let removed = false;

            for (let j = enemigos.length - 1; j >= 0; j--) {
                const e = enemigos[j];
                if (Math.hypot(p.px - e.x, p.py - e.y) < 20) {
                    parabolas.splice(i, 1);
                    enemigos.splice(j, 1);
                    puntuacion++;
                    removed = true;
                    break;
                }
            }
            if (!removed && puntuacion >= 20) {
                if (Math.hypot(p.px - bossEnemy.x, p.py - bossEnemy.y) < bossHitboxWidth / 2) {
                    parabolas.splice(i, 1);
                    bossHealth -= 1;
                    if (bossHealth <= 0) {
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

            gctx.fillStyle = "#ffffff";
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
                    if (Math.hypot(p.tx - e.x, p.ty - e.y) < 20) {
                        projectiles.splice(i, 1);
                        enemigos.splice(j, 1);
                        puntuacion++;
                        hit = true;
                        break;
                    }
                }
                if (!hit && puntuacion >= 20) {
                    if (Math.hypot(p.tx - bossEnemy.x, p.ty - bossEnemy.y) < bossHitboxWidth / 2) {
                        projectiles.splice(i, 1);
                        bossHealth -= 1;
                    }
                }
            }
        }
    }

    function showPantallaVictory() {
        if (bossHealth <= 0) {
            mostrarPantallaVictory = true;

            if (typeof window.unlockAchievement === 'function') {
                window.unlockAchievement('ach-distant');
            }

            gctx.fillStyle = "#000000";
            gctx.fillRect(0, 0, width, height);
            gctx.fillStyle = "rgb(134, 255, 69)";
            gctx.textAlign = "center";
            gctx.textBaseline = "middle";
            gctx.font = "bold 50px sans-serif";
            gctx.fillText("Victory", width / 2, height / 2 - 100);
            gctx.font = "30px sans-serif";
            gctx.fillText("Puntuación: " + puntuacion, width / 2, height / 2);
            gctx.fillText("Presiona 'R' para reiniciar", width / 2, height / 2 + 100);
            mostrarPantallaFin = false;
            mostrarPantallaJuego = false;
        }
    }

    function handleEnemies() {
        if (puntuacion <= 20) {
            const currentTime = millis();
            if (currentTime - lastEnemySpawnTime > 2000) {
                let enemyX, enemyY;
                const edge = Math.floor(Math.random() * 4);

                switch (edge) {
                    case 0:
                        enemyX = Math.random() * width;
                        enemyY = -50;
                        break;
                    case 1:
                        enemyX = Math.random() * width;
                        enemyY = height + 50;
                        break;
                    case 2:
                        enemyX = -50;
                        enemyY = Math.random() * height;
                        break;
                    case 3:
                        enemyX = width + 50;
                        enemyY = Math.random() * height;
                        break;
                }

                enemigos.push({ x: enemyX, y: enemyY, speed: 1.8 });
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
            drawImageCenter(lana, e.x, e.y);

            if (e.x < -60 || e.x > width + 60 || e.y < -60 || e.y > height + 60) {
                enemigos.splice(i, 1);
            }
        }
    }

    function handlePowerups() {
        const currentTime = millis();
        if (currentTime - lastPowerupSpawnTime > 20000) {
            powerups.push({
                x: Math.random() * (width - 100) + 50,
                y: Math.random() * (height - 100) + 50
            });
            lastPowerupSpawnTime = currentTime;
        }

        for (let i = powerups.length - 1; i >= 0; i--) {
            const p = powerups[i];
            drawImageCenter(powerup, p.x, p.y);

            if (Math.hypot(px - p.x, py - p.y) < currentImage.width / 2) {
                tripleShotActive = true;
                tripleShotEndTime = millis() + 4000;
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
        gctx.fillText("Game Over", width / 2, height / 2 - 100);
        gctx.font = "30px sans-serif";
        gctx.fillText("Puntuación: " + puntuacion, width / 2, height / 2);
        gctx.fillText("Presiona 'R' para reiniciar", width / 2, height / 2 + 100);
    }

    function displayScore() {
        gctx.fillStyle = "#ffffff";
        gctx.font = "bold 20px sans-serif";
        gctx.textAlign = "left";
        gctx.textBaseline = "top";
        gctx.fillText("Score: " + puntuacion, 15, 15);
    }

    function handleMousePressed() {
        if (enMenu) {
            if (mouseX > width / 2 - (width * 0.3) / 2 && mouseX < width / 2 + (width * 0.3) / 2) {
                if (mouseY > height * 0.5 - (height * 0.15) / 2 && mouseY < height * 0.5 + (height * 0.15) / 2) {
                    enMenu = false;
                    mostrarPantallaJuego = true;
                } else if (mouseY > height * 0.8 - (height * 0.15) / 2 && mouseY < height * 0.8 + (height * 0.15) / 2) {
                    enMenu = false;
                    mostrarTextoCreditos = true;
                } else if (mouseY > height * 0.2 - (height * 0.15) / 2 && mouseY < height * 0.2 + (height * 0.15) / 2) {
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
        } else if (mostrarPantallaJuego && !gameOver) {
            const baseAngle = Math.atan2(mouseY - py, mouseX - px);
            if (tripleShotActive) {
                for (let i = 0; i < 3; i++) {
                    const angleOffset = (i - 1) * (Math.PI / 6);
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

    function handleMovement() {
        if (movingRight && px < width - currentImage.width / 2) px += speed;
        if (movingLeft && px > currentImage.width / 2) px -= speed;
        if (movingUp && py > currentImage.height / 2) py -= speed;
        if (movingDown && py < height - currentImage.height / 2) py += speed;
    }

    function restartGame() {
        gameOver = false;
        mostrarPantallaFin = false;
        mostrarPantallaVictory = false;
        px = width * 0.2;
        py = height * 0.2;
        projectiles = [];
        villanoProjectiles = [];
        parabolas = [];
        enemigos = [];
        currentImage = prota;
        puntuacion = 0;
        mostrarPantallaJuego = true;
        tripleShotActive = false;
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

        if (tripleShotActive && millis() > tripleShotEndTime) {
            tripleShotActive = false;
        }

        if (shootParabola && mostrarPantallaJuego && !gameOver) {
            const currentTime = millis();
            if (currentTime - lastParabolaShotTime >= parabolaInterval) {
                h = px + 10;
                f = py + 10;
                k = mouseX;
                const dir = (mouseX < px) ? -4 : 4;
                parabolas.push({ px: h, py: f, h: h, k: k, startY: f, dir: dir });
                lastParabolaShotTime = currentTime;
            }
            shootParabola = false;
        }

        for (let i = parabolas.length - 1; i >= 0; i--) {
            const p = parabolas[i];
            p.px += p.dir;
            p.py = p.startY + calculateParabolic(p.px, p.h);
            gctx.fillStyle = "rgb(0, 255, 0)";
            gctx.beginPath();
            gctx.arc(p.px, p.py, 5, 0, Math.PI * 2);
            gctx.fill();

            if (!onScreen(p.px, p.py)) {
                parabolas.splice(i, 1);
            }
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
});

// =========================================================================
// 13. NUEVAS FUNCIONES: VISUALIZADOR, BUSCADOR BIO, TEST INFIERNO Y MODO CINE
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------------------
    // A. VISUALIZADOR DE ONDAS DE AUDIO REAL PARA "RADIO LIXBALT"
    // -------------------------------------------------------------------------
    const bgMusic = document.getElementById('bgMusic');
    const musicControlsBody = document.getElementById('musicControlsBody');
    const currentTrackName = document.getElementById('currentTrackName');
    const musicPlayer = document.getElementById('musicPlayer');
    const eqBarsSpans = document.querySelectorAll('#eqBars span');

    let visCanvas = document.getElementById('audioVisualizerCanvas');
    if (!visCanvas && musicControlsBody) {
        visCanvas = document.createElement('canvas');
        visCanvas.id = 'audioVisualizerCanvas';
        visCanvas.className = 'audio-visualizer-canvas';
        visCanvas.width = 240;
        visCanvas.height = 46;
        if (currentTrackName && currentTrackName.nextSibling) {
            musicControlsBody.insertBefore(visCanvas, currentTrackName.nextSibling);
        } else {
            musicControlsBody.prepend(visCanvas);
        }
    }

    if (visCanvas && bgMusic) {
        const vctx = visCanvas.getContext('2d');
        let audioCtx = null;
        let analyser = null;
        let dataArray = null;
        let sourceConnected = false;
        let useFallbackSynth = (window.location.protocol === 'file:');

        function initAudioAnalyser() {
            if (sourceConnected || useFallbackSynth) return;
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                audioCtx = new AudioContextClass();
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 64;
                const source = audioCtx.createMediaElementSource(bgMusic);
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                dataArray = new Uint8Array(analyser.frequencyBinCount);
                sourceConnected = true;
            } catch (err) {
                useFallbackSynth = true;
            }
        }

        bgMusic.addEventListener('play', () => {
            initAudioAnalyser();
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume().catch(() => {});
            }
        });

        const barCount = 24;
        const smoothBars = new Array(barCount).fill(2);

        function renderAudioVisualizer() {
            const w = visCanvas.width;
            const h = visCanvas.height;
            vctx.clearRect(0, 0, w, h);

            let bassSum = 0;
            const isPlaying = !bgMusic.paused && !bgMusic.ended;

            if (isPlaying && sourceConnected && analyser && !useFallbackSynth) {
                analyser.getByteFrequencyData(dataArray);
                let totalEnergy = 0;
                for (let i = 0; i < barCount; i++) {
                    totalEnergy += dataArray[i];
                }
                // Si el navegador bloquea datos por CORS local, usar onda reactiva sincronizada
                if (totalEnergy === 0) {
                    useFallbackSynth = true;
                }
            }

            const t = performance.now() * 0.008;
            const vol = bgMusic.volume || 0.5;

            for (let i = 0; i < barCount; i++) {
                let targetHeight = 3;
                if (isPlaying) {
                    if (sourceConnected && !useFallbackSynth && dataArray) {
                        targetHeight = Math.max(3, (dataArray[i] / 255) * (h - 6));
                    } else {
                        const wave1 = Math.sin(t * 2.3 + i * 0.45) * 0.5 + 0.5;
                        const wave2 = Math.cos(t * 3.7 - i * 0.3) * 0.5 + 0.5;
                        const bassBoost = i < 6 ? 1.25 : 0.85;
                        targetHeight = Math.max(4, (wave1 * 0.65 + wave2 * 0.35) * (h - 8) * vol * bassBoost);
                    }
                }

                smoothBars[i] += (targetHeight - smoothBars[i]) * 0.28;
                if (i < 5) bassSum += smoothBars[i];

                const barW = (w / barCount) - 2;
                const x = i * (barW + 2) + 1;
                const barH = smoothBars[i];
                const y = h - barH;

                const grad = vctx.createLinearGradient(0, h, 0, 0);
                grad.addColorStop(0, '#16a34a');
                grad.addColorStop(0.6, '#22c55e');
                grad.addColorStop(1, '#ef233c');

                vctx.fillStyle = grad;
                vctx.fillRect(x, y, barW, barH);
            }

            // Pulso dinámico en el borde del reproductor y barras del icono
            if (isPlaying && musicPlayer) {
                const avgBass = bassSum / 5;
                const glowIntensity = Math.min(0.75, (avgBass / h) * 0.9);
                musicPlayer.style.boxShadow = `0 8px 32px rgba(0,0,0,0.45), 0 0 ${Math.round(avgBass * 0.7)}px rgba(34, 197, 94, ${glowIntensity.toFixed(2)})`;

                if (eqBarsSpans.length === 3) {
                    eqBarsSpans[0].style.height = `${Math.max(3, Math.min(14, smoothBars[1] * 0.35))}px`;
                    eqBarsSpans[1].style.height = `${Math.max(3, Math.min(14, smoothBars[4] * 0.35))}px`;
                    eqBarsSpans[2].style.height = `${Math.max(3, Math.min(14, smoothBars[8] * 0.35))}px`;
                }
            } else if (musicPlayer) {
                musicPlayer.style.boxShadow = '';
            }

            requestAnimationFrame(renderAudioVisualizer);
        }

        renderAudioVisualizer();
    }

    // -------------------------------------------------------------------------
    // B. BUSCADOR INSTANTÁNEO Y FILTRO POR RANGO EN BIOGRAFÍAS
    // -------------------------------------------------------------------------
    const bioSectionContainer = document.querySelector('#biografias .container');
    const bioGrid = document.querySelector('#biografias .bio-grid');
    const bioCardsList = Array.from(document.querySelectorAll('#biografias .bio-card'));

    if (bioSectionContainer && bioGrid && !document.getElementById('bioControlsWrapper')) {
        const controlsHTML = `
            <div class="bio-controls" id="bioControlsWrapper">
                <div class="bio-search-wrapper">
                    <span class="bio-search-icon">🔍</span>
                    <input type="search" id="bioSearchInput" class="bio-search-input" 
                        placeholder="Buscar por nombre, habilidad o debilidad (ej. MrPapu, nanomáquinas, furro)..." 
                        aria-label="Buscar biografías">
                    <span class="bio-count-badge" id="bioCountBadge">${bioCardsList.length} / ${bioCardsList.length}</span>
                </div>
                <div class="bio-tier-filters" id="bioTierFilters" role="group" aria-label="Filtrar por rango">
                    <button class="bio-filter-btn active" data-tier="all">Todos</button>
                    <button class="bio-filter-btn" data-tier="POR ENCIMA DE TODO">Por Encima de Todo</button>
                    <button class="bio-filter-btn" data-tier="The Best">The Best</button>
                    <button class="bio-filter-btn" data-tier="Superior">Superior</button>
                    <button class="bio-filter-btn" data-tier="Normal">Normal</button>
                    <button class="bio-filter-btn" data-tier="Pete">Pete</button>
                </div>
            </div>
            <div id="bioNoResults" class="bio-no-results hidden">
                <p>⚠️ No se encontraron integrantes que coincidan con tu búsqueda en los archivos imperiales.</p>
            </div>
        `;
        bioGrid.insertAdjacentHTML('beforebegin', controlsHTML);
    }

    const bioSearchInput = document.getElementById('bioSearchInput');
    const bioCountBadge = document.getElementById('bioCountBadge');
    const bioFilterBtns = document.querySelectorAll('.bio-filter-btn');
    const bioNoResults = document.getElementById('bioNoResults');
    let activeTierFilter = 'all';

    function normalizeStr(str) {
        return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function filterBiographies() {
        const query = normalizeStr(bioSearchInput ? bioSearchInput.value.trim() : '');
        let visibleCount = 0;

        bioCardsList.forEach(card => {
            const tierTag = card.querySelector('.bio-tier-tag');
            const cardTier = tierTag ? tierTag.textContent.trim() : '';
            const cardText = normalizeStr(card.textContent);

            const matchesTier = (activeTierFilter === 'all') || (normalizeStr(cardTier) === normalizeStr(activeTierFilter));
            const matchesQuery = !query || cardText.includes(query);

            if (matchesTier && matchesQuery) {
                card.classList.remove('bio-hidden');
                visibleCount++;
            } else {
                card.classList.add('bio-hidden');
            }
        });

        if (bioCountBadge) {
            bioCountBadge.textContent = `${visibleCount} / ${bioCardsList.length}`;
        }
        if (bioNoResults) {
            bioNoResults.classList.toggle('hidden', visibleCount > 0);
        }
    }

    if (bioSearchInput) {
        bioSearchInput.addEventListener('input', filterBiographies);
    }

    bioFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            bioFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTierFilter = btn.getAttribute('data-tier') || 'all';
            filterBiographies();
        });
    });

    // -------------------------------------------------------------------------
    // C. TEST DEL INFIERNO IMPERIAL ("¿A QUÉ CÍRCULO PERTENECES?")
    // -------------------------------------------------------------------------
    const circlesContainer = document.querySelector('#circulos .container');
    const circlesGrid = document.getElementById('circlesGrid');

    if (circlesContainer && circlesGrid && !document.getElementById('hellQuizSection')) {
        const quizHTML = `
            <div class="hell-quiz-box" id="hellQuizSection">
                <div class="hell-quiz-header">
                    <span class="faccion-square-badge" style="background: var(--imperial-red);">JUICIO IMPERIAL</span>
                    <h3>🔥 Test del Infierno Imperial: ¿A qué Círculo perteneces?</h3>
                    <p>Responde 5 preguntas del Tribunal para descubrir en qué capa del abismo estarías asignado y quién sería tu guardián.</p>
                </div>
                <div id="quizStartView" class="quiz-view">
                    <button id="startQuizBtn" class="btn btn-primary">Iniciar Juicio Imperial</button>
                </div>
                <div id="quizQuestionView" class="quiz-view hidden">
                    <div class="quiz-progress-bar">
                        <div id="quizProgressFill" class="quiz-progress-fill"></div>
                    </div>
                    <span id="quizStepCounter" class="quiz-step-counter">Pregunta 1 de 5</span>
                    <h4 id="quizQuestionText" class="quiz-question-text"></h4>
                    <div id="quizOptionsGrid" class="quiz-options-grid"></div>
                </div>
                <div id="quizResultView" class="quiz-view hidden">
                    <div class="quiz-result-card">
                        <span id="quizResultNum" class="quiz-result-num">VII</span>
                        <h4 id="quizResultTitle">Círculo VII: Violencia</h4>
                        <p id="quizResultGuardian" class="quiz-result-guardian"></p>
                        <p id="quizResultDesc" class="quiz-result-desc"></p>
                        <div class="quiz-result-actions">
                            <button id="highlightCircleBtn" class="btn btn-secondary">Ver en los Círculos</button>
                            <button id="retryQuizBtn" class="btn btn-primary">Repetir Juicio</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        circlesGrid.insertAdjacentHTML('afterend', quizHTML);
    }

    const QUESTIONS_PER_RUN = 5;

    const quizQuestionsPool = [
        {
            q: "Estalla una crisis interna en el Imperio Papu. ¿Cuál es tu primera reacción?",
            options: [
                { text: "Mantenerme al margen en las sombras sin tomar partido.", circles: ["I", "III"] },
                { text: "Aprovechar el caos para vender suministros y duplicar mi fortuna.", circles: ["IV", "VIII"] },
                { text: "Desatar mi furia y boxear hasta las computadoras si hace falta.", circles: ["V", "VII"] },
                { text: "Cuestionar los dogmas del Sagrado Lore y negociar con el bando rival.", circles: ["VI", "IX"] }
            ]
        },
        {
            q: "¿Qué reliquia prohibida elegirías para aumentar tu escala en la Tierlist?",
            options: [
                { text: "La espada láser Binary Eraser y una cuenta bancaria infinita.", circles: ["IV", "VII"] },
                { text: "El Yunque de Memes y los Momazos ancestrales de la SDLG.", circles: ["VIII", "II"] },
                { text: "Los manuscritos ocultos de Warhammer 40K, Terraria y el Mandela Catalogue.", circles: ["VI", "I"] },
                { text: "Un banquete eterno con Blue Label mientras el mundo arde.", circles: ["III", "II"] }
            ]
        },
        {
            q: "Un superior te desafía a un debate presidencial o combate 1v1:",
            options: [
                { text: "Lo destruyo con argumentos implacables y compro su casa.", circles: ["IV", "VI"] },
                { text: "Entreno la técnica patea-abuelas y voy directo al choque físico.", circles: ["VII", "V"] },
                { text: "Uso engaños, cambio mi foto de perfil y activo buena suerte.", circles: ["VIII", "II"] },
                { text: "Fingo lealtad hasta el último segundo y doy el golpe por la espalda.", circles: ["IX", "VIII"] }
            ]
        },
        {
            q: "¿Cuál sería tu mayor debilidad registrada en los archivos imperiales?",
            options: [
                { text: "Dejarme llevar por las pasiones mundanas o quedarme sin plata por regalar cositas.", circles: ["II", "III"] },
                { text: "Perder la paciencia al instante cuando alguien menciona un mal timing.", circles: ["V", "VII"] },
                { text: "Acumular demasiadas horas en silencio sin que nadie sepa cuándo hablaré.", circles: ["I", "III"] },
                { text: "Desafiar las leyes del Thio-Padre y romper alianzas históricas.", circles: ["VI", "IX"] }
            ]
        },
        {
            q: "Si fueras asignado como guardián del abismo, ¿qué castigo aplicarías?",
            options: [
                { text: "Un río hirviendo para quienes eligieron la fuerza bruta.", circles: ["VII", "V"] },
                { text: "Un hielo absoluto reservado a los que quebraron la confianza suprema.", circles: ["IX", "IV"] },
                { text: "Vientos huracanados, lluvia helada y sepulcros de fuego.", circles: ["II", "III", "VI"] },
                { text: "Una penumbra silenciosa o fosas llenas de acertijos y trampas.", circles: ["I", "VIII"] }
            ]
        },
        {
            q: "Te cruzas con Tiago patea-abuelas tras su entrenamiento de boxeo. ¿Qué haces?",
            options: [
                { text: "Aplico el arte marcial rodilla-breaker de Gabriel directo a su defensa baja.", circles: ["VII", "V"] },
                { text: "Le pregunto cuándo fue la última vez que Aparicio para desestabilizarlo.", circles: ["VIII", "IX"] },
                { text: "Invoco a Martiniano Base para imponer autoridad sin ensuciarme las manos.", circles: ["IV", "I"] },
                { text: "Le invito un Blue Label con El Porros para evitar el conflicto.", circles: ["III", "II"] }
            ]
        },
        {
            q: "Descubres la fábrica de protogems de Malavida en Muy Muy Lejano:",
            options: [
                { text: "Le robo su foto de perfil de furro para quitarle su buena suerte y chantajearlo.", circles: ["VIII", "IX"] },
                { text: "Compro toda la fábrica para monopolizar la economía del Imperio.", circles: ["IV", "III"] },
                { text: "Investigo las funciones 'raras' de los protogems prohibidas por el Lore.", circles: ["II", "VI"] },
                { text: "Destruyo sus computadoras vivas a puño limpio antes de que se multipliquen.", circles: ["VII", "V"] }
            ]
        },
        {
            q: "Durante la antigua guerra 'FURRY SUN', la máquina solar de 3 anillos se sobrecarga:",
            options: [
                { text: "Reclamo la corona de magma de KARLOS y tomo el antiguo trono infernal.", circles: ["VI", "IV"] },
                { text: "Escondo el celular bomba con el Warzone y la PC con el DMC 5.", circles: ["VIII", "I"] },
                { text: "Entreno a Santiago Hodar para desatar una ira digna del eclipse de Berserk.", circles: ["V", "VII"] },
                { text: "Salgo y entro del grupo repetidas veces para confundir a todas las facciones.", circles: ["IX", "II"] }
            ]
        },
        {
            q: "Tomas Alternador de Femboys desbloquea su fase 'The Intruder' a las 3:00 AM:",
            options: [
                { text: "Activo Love Train de MrPapu para desviar toda la mala fortuna a otro.", circles: ["VIII", "IX"] },
                { text: "Aguanto en silencio hasta que repita ataques y se canse solo.", circles: ["I", "IV"] },
                { text: "Salgo al cruce en un intercambio brutal de golpes sin retroceder.", circles: ["VII", "V"] },
                { text: "Lo distraigo con teorías del Mandela Catalogue y secretos de FNAF.", circles: ["II", "VI"] }
            ]
        },
        {
            q: "Encuentras a Lorentz The Wise King encapuchado recolectando reliquias:",
            options: [
                { text: "Me siento a absorber su sabiduría de Warhammer 40K, Bloons y Terraria.", circles: ["III", "I"] },
                { text: "Descifro sus coordenadas encriptadas para robar su mayor reliquia.", circles: ["IV", "VIII"] },
                { text: "Invoco a un ser solar para explotar su debilidad mortal a traición.", circles: ["IX", "VI"] },
                { text: "Lo obligo a romper su silencio eterno mediante un duelo directo.", circles: ["V", "VII"] }
            ]
        },
        {
            q: "Joseph McLean activa sus nanomáquinas de Senador e infla la economía un 1000%:",
            options: [
                { text: "Me asocio con él y el Humo Negro en 'Los Empresarios' para forrarme en oro.", circles: ["IV", "VIII"] },
                { text: "Esquivo sus ataques lentos mientras le confisco su estéreo Bose.", circles: ["VIII", "IX"] },
                { text: "Destruyo todas las camas a mi paso en una campaña de caos total.", circles: ["VII", "V"] },
                { text: "Derrocho todas las ganancias imperiales en excesos y festines.", circles: ["III", "II"] }
            ]
        },
        {
            q: "Te toca enfrentarte a Agustín Modo Epstein en la primera ronda del torneo:",
            options: [
                { text: "Lo derroto en un segundo usando su debilidad al vóley, básquet y fuerza.", circles: ["VII", "V"] },
                { text: "Llamo a la profe de inglés y le pongo un examen sorpresa para humillarlo.", circles: ["VIII", "IX"] },
                { text: "No muevo ni un dedo porque 'no dura nada' y cae por su propio peso.", circles: ["I", "III"] },
                { text: "Vendo entradas VIP para el espectáculo y me quedo con la recaudación.", circles: ["IV", "II"] }
            ]
        },
        {
            q: "La cuenta regresiva hacia el 08 / 02 / 27 está por llegar a cero:",
            options: [
                { text: "Reúno los Momazos antiguos de la SDLG para controlar el poder oculto.", circles: ["VIII", "IV"] },
                { text: "Me preparo para la guerra definitiva entrenando con el Trío Original.", circles: ["VII", "V"] },
                { text: "Rompo los sellos antiguos para forzar el retorno del Thio-Padre.", circles: ["VI", "IX"] },
                { text: "Sintonizo la Radio Lixbalt en la penumbra esperando el juicio final.", circles: ["I", "III"] }
            ]
        },
        {
            q: "MrPapu pierde el control y activa su poder final 'Como una vez fue':",
            options: [
                { text: "Uso el Divizinador para separar la fusión entre Martiniano y Tripalosky.", circles: ["VI", "VIII"] },
                { text: "Me planto frente a él para contener su furia a puño limpio.", circles: ["VII", "V"] },
                { text: "Aprovecho uno de sus malos timings para arrebatarle el trono imperial.", circles: ["IX", "IV"] },
                { text: "Forjo un meme de emergencia en el Yunque de Memes para calmarlo.", circles: ["II", "I"] }
            ]
        },
        {
            q: "Obtienes acceso total a los archivos clasificados del Sagrado Lore 3.2:",
            options: [
                { text: "Subasto los secretos más oscuros del grupo al mejor postor.", circles: ["IV", "IX"] },
                { text: "Reescribo las crónicas para declararme 'POR ENCIMA DE TODO'.", circles: ["VI", "VIII"] },
                { text: "Filtro las carpetas ocultas de videomemes para sembrar el caos.", circles: ["II", "V"] },
                { text: "Custodio el archivo en absoluto silencio desde las sombras del abismo.", circles: ["I", "III"] }
            ]
        }
    ];

    const circleResultsMeta = {
        "I":   { title: "Círculo I: Limbo", guardian: "Ema", desc: "Habitas en la penumbra serena de quienes observan el Imperio desde el silencio sin caer en tormentos extremos." },
        "II":  { title: "Círculo II: Lujuria", guardian: "Nicolas", desc: "Los vientos huracanados te rodean por dejarte llevar por los impulsos y las pasiones desatadas del Imperio." },
        "III": { title: "Círculo III: Gula", guardian: "Lorenzo", desc: "Bajo la lluvia helada del tercer círculo, tu apetito voraz de conocimiento, juegos y consumo nunca se detiene." },
        "IV":  { title: "Círculo IV: Codicia", guardian: "José", desc: "Tu mentalidad empresarial y ambición de recursos te sitúan junto a los grandes magnates del Imperio." },
        "V":   { title: "Círculo V: Ira", guardian: "Tomas I.", desc: "Las aguas turbulentas del río Estigia reflejan tu intensidad en combate y tu eterna búsqueda de pelea." },
        "VI":  { title: "Círculo VI: Herejía", guardian: "Lautaro G.", desc: "Desafías los dogmas establecidos entre sepulcros ardientes con el poder solar de las antiguas crónicas." },
        "VII": { title: "Círculo VII: Violencia", guardian: "Martiniano", desc: "La fuerza directa, el liderazgo implacable y el combate frontal te convierten en habitante del séptimo círculo." },
        "VIII":{ title: "Círculo VIII: Fraude", guardian: "Tomas R.", desc: "La astucia, las estrategias inesperadas y el dominio de los Momazos ocultos definen tu lugar en el octavo anillo." },
        "IX":  { title: "Círculo IX: Traición", guardian: "Tiago", desc: "En el lago helado más profundo del abismo, solo sobreviven quienes dominan las artes marciales más letales e impredecibles." }
    };

    const startQuizBtn = document.getElementById('startQuizBtn');
    const retryQuizBtn = document.getElementById('retryQuizBtn');
    const highlightCircleBtn = document.getElementById('highlightCircleBtn');
    const quizStartView = document.getElementById('quizStartView');
    const quizQuestionView = document.getElementById('quizQuestionView');
    const quizResultView = document.getElementById('quizResultView');
    const quizProgressFill = document.getElementById('quizProgressFill');
    const quizStepCounter = document.getElementById('quizStepCounter');
    const quizQuestionText = document.getElementById('quizQuestionText');
    const quizOptionsGrid = document.getElementById('quizOptionsGrid');

    function shuffleArray(arr) {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    let activeQuizQuestions = [];
    let currentQuestionIdx = 0;
    let circleScores = {};
    let winningRoman = "VII";

    function startHellQuiz() {
        currentQuestionIdx = 0;
        circleScores = { "I": 0, "II": 0, "III": 0, "IV": 0, "V": 0, "VI": 0, "VII": 0, "VIII": 0, "IX": 0 };

        activeQuizQuestions = shuffleArray(quizQuestionsPool)
            .slice(0, QUESTIONS_PER_RUN)
            .map(item => ({
                q: item.q,
                options: shuffleArray(item.options)
            }));

        quizStartView.classList.add('hidden');
        quizResultView.classList.add('hidden');
        quizQuestionView.classList.remove('hidden');
        renderQuizQuestion();
    }

    function renderQuizQuestion() {
        const item = activeQuizQuestions[currentQuestionIdx];
        const totalQ = activeQuizQuestions.length;
        const progressPct = ((currentQuestionIdx + 1) / totalQ) * 100;

        quizProgressFill.style.width = `${progressPct}%`;
        quizStepCounter.textContent = `Pregunta ${currentQuestionIdx + 1} de ${totalQ}`;
        quizQuestionText.textContent = `${currentQuestionIdx + 1}. ${item.q}`;
        quizOptionsGrid.innerHTML = '';

        item.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.textContent = opt.text;
            btn.addEventListener('click', () => {
                opt.circles.forEach((c, idx) => {
                    circleScores[c] = (circleScores[c] || 0) + (idx === 0 ? 2 : 1);
                });
                currentQuestionIdx++;
                if (currentQuestionIdx < totalQ) {
                    renderQuizQuestion();
                } else {
                    showQuizResult();
                }
            });
            quizOptionsGrid.appendChild(btn);
        });
    }

    function showQuizResult() {
        quizQuestionView.classList.add('hidden');
        quizResultView.classList.remove('hidden');

        winningRoman = Object.keys(circleScores).reduce((a, b) => circleScores[a] >= circleScores[b] ? a : b);
        const meta = circleResultsMeta[winningRoman];

        document.getElementById('quizResultNum').textContent = winningRoman;
        document.getElementById('quizResultTitle').textContent = meta.title;
        document.getElementById('quizResultGuardian').textContent = `Guardián / Representante: ${meta.guardian}`;
        document.getElementById('quizResultDesc').textContent = meta.desc;

        // Desbloquear logro "Sentenciado del Abismo"
        if (typeof window.unlockAchievement === 'function') {
            window.unlockAchievement('ach-judge');
        }
    }

    if (startQuizBtn) startQuizBtn.addEventListener('click', startHellQuiz);
    if (retryQuizBtn) retryQuizBtn.addEventListener('click', startHellQuiz);

    if (highlightCircleBtn) {
        highlightCircleBtn.addEventListener('click', () => {
            const allCircleCards = document.querySelectorAll('#circlesGrid .circle-card');
            allCircleCards.forEach(c => c.classList.remove('circle-highlighted'));

            allCircleCards.forEach(card => {
                const numSpan = card.querySelector('.circle-num');
                if (numSpan && numSpan.textContent.trim() === winningRoman) {
                    card.classList.add('circle-highlighted');
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => card.click(), 450);
                }
            });
        });
    }

    if (startQuizBtn) startQuizBtn.addEventListener('click', startHellQuiz);
    if (retryQuizBtn) retryQuizBtn.addEventListener('click', startHellQuiz);

    if (highlightCircleBtn) {
        highlightCircleBtn.addEventListener('click', () => {
            const allCircleCards = document.querySelectorAll('#circlesGrid .circle-card');
            allCircleCards.forEach(c => c.classList.remove('circle-highlighted'));

            allCircleCards.forEach(card => {
                const numSpan = card.querySelector('.circle-num');
                if (numSpan && numSpan.textContent.trim() === winningRoman) {
                    card.classList.add('circle-highlighted');
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => card.click(), 450);
                }
            });
        });
    }

    // -------------------------------------------------------------------------
    // D. MODO CINE INTEGRADO PARA EL ARCHIVO AUDIOVISUAL
    // -------------------------------------------------------------------------
    if (!document.getElementById('cinemaModalBackdrop')) {
        const cinemaHTML = `
            <div id="cinemaModalBackdrop" class="cinema-modal-backdrop hidden" aria-hidden="true">
                <div class="cinema-modal-box" role="dialog" aria-modal="true" aria-labelledby="cinemaVideoTitle">
                    <div class="cinema-modal-header">
                        <div class="cinema-title-wrap">
                            <span class="faccion-square-badge">🎬 MODO CINE IMPERIAL</span>
                            <h3 id="cinemaVideoTitle">Reproduciendo archivo...</h3>
                        </div>
                        <div class="cinema-header-actions">
                            <a id="cinemaExternalLink" href="#" target="_blank" rel="noopener noreferrer" class="cinema-ext-btn">
                                Abrir en YouTube ↗
                            </a>
                            <button id="closeCinemaBtn" class="faccion-square-close" aria-label="Cerrar modo cine">✕</button>
                        </div>
                    </div>
                    <div class="cinema-video-wrapper" id="cinemaVideoWrapper"></div>
                    <div class="cinema-playlist-bar" id="cinemaPlaylistBar"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', cinemaHTML);
    }

    const cinemaModalBackdrop = document.getElementById('cinemaModalBackdrop');
    const cinemaVideoTitle = document.getElementById('cinemaVideoTitle');
    const cinemaExternalLink = document.getElementById('cinemaExternalLink');
    const cinemaVideoWrapper = document.getElementById('cinemaVideoWrapper');
    const cinemaPlaylistBar = document.getElementById('cinemaPlaylistBar');
    const closeCinemaBtn = document.getElementById('closeCinemaBtn');
    const videoLinkCards = Array.from(document.querySelectorAll('.video-links-grid .video-link-card'));

    function extractYouTubeId(url) {
        try {
            const parsed = new URL(url);
            if (parsed.pathname.includes('/shorts/')) {
                return parsed.pathname.split('/shorts/')[1].split('/')[0];
            }
            return parsed.searchParams.get('v') || '';
        } catch (e) {
            return '';
        }
    }

    const videoItems = videoLinkCards.map((card, index) => {
        const href = card.getAttribute('href') || '';
        const titleSpans = card.querySelectorAll('span');
        const title = titleSpans.length > 1 ? titleSpans[1].textContent.trim() : card.textContent.trim();
        return {
            index,
            title,
            href,
            videoId: extractYouTubeId(href)
        };
    });

    if (cinemaPlaylistBar) {
        cinemaPlaylistBar.innerHTML = '';
        videoItems.forEach(item => {
            const chip = document.createElement('button');
            chip.className = 'cinema-track-chip';
            chip.textContent = `▶ ${item.title}`;
            chip.dataset.idx = item.index;
            chip.addEventListener('click', () => openCinemaVideo(item.index));
            cinemaPlaylistBar.appendChild(chip);
        });
    }

    function openCinemaVideo(idx) {
        const item = videoItems[idx];
        if (!item || !cinemaModalBackdrop) return;

        // Desbloquear trofeo "Cinéfilo Imperial"
        if (typeof window.unlockAchievement === 'function') {
            window.unlockAchievement('ach-cinema');
        }

        // Pausar música de Radio Lixbalt si está sonando
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (bgMusic && !bgMusic.paused && playPauseBtn) {
            playPauseBtn.click();
        }

        cinemaVideoTitle.textContent = item.title;
        cinemaExternalLink.href = item.href;

        if (item.videoId) {
            cinemaVideoWrapper.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${item.videoId}?autoplay=1&rel=0" 
                    title="${item.title}"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen>
                </iframe>
            `;
        } else {
            cinemaVideoWrapper.innerHTML = `<p style="color:#fff; padding:2rem;">No se pudo cargar la vista previa. Usa el botón "Abrir en YouTube".</p>`;
        }

        const chips = cinemaPlaylistBar.querySelectorAll('.cinema-track-chip');
        chips.forEach(c => c.classList.toggle('active', parseInt(c.dataset.idx) === idx));

        cinemaModalBackdrop.classList.remove('hidden');
        cinemaModalBackdrop.setAttribute('aria-hidden', 'false');
    }

    function closeCinemaModal() {
        if (!cinemaModalBackdrop) return;
        cinemaModalBackdrop.classList.add('hidden');
        cinemaModalBackdrop.setAttribute('aria-hidden', 'true');
        if (cinemaVideoWrapper) {
            cinemaVideoWrapper.innerHTML = '';
        }
    }

    videoLinkCards.forEach((card, idx) => {
        card.addEventListener('click', (e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;
            e.preventDefault();
            openCinemaVideo(idx);
        });
    });

    if (closeCinemaBtn) closeCinemaBtn.addEventListener('click', closeCinemaModal);
    if (cinemaModalBackdrop) {
        cinemaModalBackdrop.addEventListener('click', (e) => {
            if (e.target === cinemaModalBackdrop) closeCinemaModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cinemaModalBackdrop && !cinemaModalBackdrop.classList.contains('hidden')) {
            closeCinemaModal();
        }
    });

    // =========================================================================
    // CAMBIO DE LOGO AL TOCARLO 10 VECES
    // =========================================================================
    const brandLogo = document.querySelector('.brand-logo');
    let logoClickCount = 0;
    let isSecretLogoActive = false;

    const originalLogoSrc = 'img/logo.webp';
    const secretLogoSrc = 'img/Lautaro Gatto.png'; // Cambia esta ruta por tu nueva imagen

    if (brandLogo) {
        brandLogo.addEventListener('click', (e) => {
            // Evita que el enlace <a href="#inicio"> salte al inicio en cada toque
            e.preventDefault();
            e.stopPropagation();

            logoClickCount++;

            // Pequeño pulso visual en cada toque
            brandLogo.style.transform = 'scale(0.9)';
            setTimeout(() => {
                brandLogo.style.transform = '';
            }, 100);

            if (logoClickCount >= 10) {
                logoClickCount = 0;
                isSecretLogoActive = !isSecretLogoActive;

                if (isSecretLogoActive) {
                    brandLogo.onerror = function () {
                        this.src = 'https://placehold.co/60x60/16a34a/ffffff?text=SECRET';
                    };
                    brandLogo.src = secretLogoSrc;
                    brandLogo.alt = 'Logo Secreto del Imperio Papu';
                } else {
                    brandLogo.onerror = function () {
                        this.src = 'https://placehold.co/60x60/d60000/ffffff?text=IP';
                    };
                    brandLogo.src = originalLogoSrc;
                    brandLogo.alt = 'Logo Imperio Papu';
                }

                // Animación de giro al desbloquear el cambio
                brandLogo.classList.remove('logo-spin-effect');
                void brandLogo.offsetWidth; // Reinicia la animación CSS
                brandLogo.classList.add('logo-spin-effect');
            }
        });
    }
});
