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

    

    // 3. Resaltado automático de la página activa en el <nav>
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href') || '';
        if (linkHref === currentFile || (currentFile === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
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

        if (typeof window.startDistantEngine === 'function') {
            window.startDistantEngine();
        }
    }

    function closeDistantGame() {
        if (!distantOverlay) return;
        distantOverlay.classList.add('hidden');
        distantOverlay.setAttribute('aria-hidden', 'true');

        if (typeof window.stopDistantEngine === 'function') {
            window.stopDistantEngine();
        }
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

    if (closeFaccionSquareBtn) {
        closeFaccionSquareBtn.addEventListener('click', closeFaccionSquare);
    }
    if (faccionModalBackdrop) {
        faccionModalBackdrop.addEventListener('click', (e) => {
            if (e.target === faccionModalBackdrop) closeFaccionSquare();
        });
    }

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

    if (closeCircleSquareBtn) {
        closeCircleSquareBtn.addEventListener('click', closeCircleSquare);
    }
    if (circleModalBackdrop) {
        circleModalBackdrop.addEventListener('click', (e) => {
            if (e.target === circleModalBackdrop) closeCircleSquare();
        });
    }

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
    
    

    let viewedFactions = new Set(JSON.parse(localStorage.getItem('imperio-papu-factions') || '[]'));
    faccionCardsObserver.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').textContent;
            viewedFactions.add(title);
            localStorage.setItem('imperio-papu-factions', JSON.stringify([...viewedFactions]));
            if (viewedFactions.size >= 3) unlockAchievement('ach-explorer');
        });
    });

    let viewedCircles = new Set(JSON.parse(localStorage.getItem('imperio-papu-circles') || '[]'));
    circleCards.forEach(card => {
        card.addEventListener('click', () => {
            const num = card.querySelector('.circle-num')?.textContent.trim();
            if (num) viewedCircles.add(num);
            localStorage.setItem('imperio-papu-circles', JSON.stringify([...viewedCircles]));
            if (viewedCircles.size >= 5) unlockAchievement('ach-inquisidor');
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
            if (faccionModalBackdrop && !faccionModalBackdrop.classList.contains('hidden')) closeFaccionSquare();
            if (circleModalBackdrop && !circleModalBackdrop.classList.contains('hidden')) closeCircleSquare();
        }
    });

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
                            <button id="downloadCertBtn" class="btn btn-cert" type="button">📜 Descargar Certificado</button>
                            <button id="highlightCircleBtn" class="btn btn-secondary" type="button">Ver en los Círculos</button>
                            <button id="retryQuizBtn" class="btn btn-primary" type="button">Repetir Juicio</button>
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
                    <div class="cinema-search-bar">
                        <span class="cinema-search-icon">🔍</span>
                        <input type="search" id="cinemaSearchInput" class="cinema-search-input"
                            placeholder="Buscar video en el archivo..." aria-label="Buscar video en Modo Cine">
                        <span id="cinemaSearchCount" class="cinema-search-count">0 / 0</span>
                    </div>
                    <div class="cinema-playlist-bar" id="cinemaPlaylistBar"></div>
                    <p id="cinemaNoResults" class="cinema-no-results hidden">No se encontraron videos con ese título.</p>
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

    if (cinemaPlaylistBar && !document.getElementById('cinemaSearchInput')) {
        cinemaPlaylistBar.insertAdjacentHTML('beforebegin', `
            <div class="cinema-search-bar">
                <span class="cinema-search-icon">🔍</span>
                <input type="search" id="cinemaSearchInput" class="cinema-search-input"
                    placeholder="Buscar video en el archivo..." aria-label="Buscar video en Modo Cine">
                <span id="cinemaSearchCount" class="cinema-search-count">0 / 0</span>
            </div>
        `);
        cinemaPlaylistBar.insertAdjacentHTML('afterend', `
            <p id="cinemaNoResults" class="cinema-no-results hidden">No se encontraron videos con ese título.</p>
        `);
    }

    const cinemaSearchInput = document.getElementById('cinemaSearchInput');
    const cinemaSearchCount = document.getElementById('cinemaSearchCount');
    const cinemaNoResults = document.getElementById('cinemaNoResults');

    function extractYouTubeId(url) {
        try {
            const parsed = new URL(url);
            if (parsed.hostname.includes('youtu.be')) {
                return parsed.pathname.slice(1).split('/')[0];
            }
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
        const videoId = extractYouTubeId(href);
        const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
        const miniThumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';

        if (thumbUrl && !card.querySelector('.video-thumb-box')) {
            card.innerHTML = '';

            const thumbBox = document.createElement('div');
            thumbBox.className = 'video-thumb-box';

            const img = document.createElement('img');
            img.className = 'video-thumb-img';
            img.src = thumbUrl;
            img.alt = title;
            img.loading = 'lazy';
            img.onerror = function () {
                this.onerror = null;
                this.src = 'https://placehold.co/480x270/111822/22c55e?text=Video+Imperial';
            };

            const overlay = document.createElement('div');
            overlay.className = 'video-thumb-overlay';

            const playIcon = document.createElement('span');
            playIcon.className = 'play-icon';
            playIcon.textContent = '▶';

            overlay.appendChild(playIcon);
            thumbBox.appendChild(img);
            thumbBox.appendChild(overlay);

            const info = document.createElement('div');
            info.className = 'video-card-info';

            const titleEl = document.createElement('span');
            titleEl.className = 'video-card-title';
            titleEl.textContent = title;

            info.appendChild(titleEl);
            card.appendChild(thumbBox);
            card.appendChild(info);
        }

        return {
            index,
            title,
            href,
            videoId,
            thumbUrl,
            miniThumbUrl
        };
    });

    function filterCinemaPlaylist() {
        if (!cinemaPlaylistBar) return;
        const query = normalizeStr(cinemaSearchInput ? cinemaSearchInput.value.trim() : '');
        const chips = Array.from(cinemaPlaylistBar.querySelectorAll('.cinema-track-chip'));
        let visibleCount = 0;

        chips.forEach(chip => {
            const matches = !query || normalizeStr(chip.dataset.title).includes(query);
            chip.classList.toggle('hidden', !matches);
            if (matches) visibleCount++;
        });

        if (cinemaSearchCount) {
            cinemaSearchCount.textContent = `${visibleCount} / ${videoItems.length}`;
        }
        if (cinemaNoResults) {
            cinemaNoResults.classList.toggle('hidden', visibleCount > 0 || videoItems.length === 0);
        }
    }

    if (cinemaPlaylistBar) {
        cinemaPlaylistBar.innerHTML = '';
        videoItems.forEach(item => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'cinema-track-chip';
            chip.dataset.idx = item.index;
            chip.dataset.title = item.title;

            if (item.miniThumbUrl) {
                const thumb = document.createElement('img');
                thumb.className = 'cinema-chip-thumb';
                thumb.src = item.miniThumbUrl;
                thumb.alt = '';
                thumb.loading = 'lazy';
                chip.appendChild(thumb);
            }

            const label = document.createElement('span');
            label.textContent = item.title;
            chip.appendChild(label);

            chip.addEventListener('click', () => openCinemaVideo(item.index));
            cinemaPlaylistBar.appendChild(chip);
        });
        filterCinemaPlaylist();
    }

    if (cinemaSearchInput) {
        cinemaSearchInput.addEventListener('input', filterCinemaPlaylist);
    }

    function openCinemaVideo(idx) {
        const item = videoItems[idx];
        if (!item || !cinemaModalBackdrop) return;

        if (typeof window.unlockAchievement === 'function') {
            window.unlockAchievement('ach-cinema');
        }

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
        if (cinemaSearchInput) {
            cinemaSearchInput.value = '';
            filterCinemaPlaylist();
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

    // =========================================================================
    // E. VISOR DE MEMES DINÁMICO Y DESBLOQUEO DE TROFEO "CRÍTICO DE MOMAZOS"
    // =========================================================================
    const memeCards = Array.from(document.querySelectorAll('#memeGrid .meme-card'));
    const memeLightbox = document.getElementById('memeLightbox');
    const lightboxMemeImg = document.getElementById('lightboxMemeImg');
    const lightboxMemeTitle = document.getElementById('lightboxMemeTitle');
    const memeCounterText = document.getElementById('memeCounterText');
    const closeMemeLightboxBtn = document.getElementById('closeMemeLightboxBtn');
    const prevMemeBtn = document.getElementById('prevMemeBtn');
    const nextMemeBtn = document.getElementById('nextMemeBtn');

    let currentMemeIndex = 0;

    // Abrir Lightbox y desbloquear el logro 'ach-meme'
    function openMemeLightbox(index) {
        if (!memeLightbox || !memeCards[index]) return;
        currentMemeIndex = index;

        const card = memeCards[currentMemeIndex];
        const imgEl = card.querySelector('img');
        const titleEl = card.querySelector('h4');

        if (imgEl && lightboxMemeImg) {
            lightboxMemeImg.src = imgEl.src;
            lightboxMemeImg.alt = imgEl.alt || 'Momazo Imperial';
        }
        if (titleEl && lightboxMemeTitle) {
            lightboxMemeTitle.textContent = titleEl.textContent;
        }
        if (memeCounterText) {
            memeCounterText.textContent = `${currentMemeIndex + 1} / ${memeCards.length}`;
        }

        memeLightbox.classList.remove('hidden');
        memeLightbox.setAttribute('aria-hidden', 'false');

        // Desbloquear trofeo "Crítico de Momazos"
        if (typeof window.unlockAchievement === 'function') {
            window.unlockAchievement('ach-meme');
        }
    }

    function closeMemeLightbox() {
        if (!memeLightbox) return;
        memeLightbox.classList.add('hidden');
        memeLightbox.setAttribute('aria-hidden', 'true');
    }

    function showNextMeme() {
        if (!memeCards.length) return;
        const nextIdx = (currentMemeIndex + 1) % memeCards.length;
        openMemeLightbox(nextIdx);
    }

    function showPrevMeme() {
        if (!memeCards.length) return;
        const prevIdx = (currentMemeIndex - 1 + memeCards.length) % memeCards.length;
        openMemeLightbox(prevIdx);
    }

    memeCards.forEach((card, idx) => {
        card.addEventListener('click', () => openMemeLightbox(idx));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openMemeLightbox(idx);
            }
        });
    });

    if (closeMemeLightboxBtn) closeMemeLightboxBtn.addEventListener('click', closeMemeLightbox);
    if (nextMemeBtn) nextMemeBtn.addEventListener('click', showNextMeme);
    if (prevMemeBtn) prevMemeBtn.addEventListener('click', showPrevMeme);

    if (memeLightbox) {
        memeLightbox.addEventListener('click', (e) => {
            if (e.target === memeLightbox) closeMemeLightbox();
        });
    }

    // Navegación con teclado (Flechas y Escape)
    document.addEventListener('keydown', (e) => {
        if (!memeLightbox || memeLightbox.classList.contains('hidden')) return;
        if (e.key === 'Escape') closeMemeLightbox();
        if (e.key === 'ArrowRight') showNextMeme();
        if (e.key === 'ArrowLeft') showPrevMeme();
    });
}); // <-- Cierre correcto de la Sección 13

// =========================================================================
// 14. EXPANSIÓN IMPERIAL: SFX, PROGRESO DE RADIO, REINICIO, CERTIFICADO Y ECLIPSE
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const htmlEl = document.documentElement;
    const bgMusic = document.getElementById('bgMusic');
    const achievementsCount = document.getElementById('achievementsCount');
    const achievementToast = document.getElementById('achievementToast');
    const toastTitle = document.getElementById('toastTitle');

    // -------------------------------------------------------------------------
    // A. EFECTOS DE SONIDO DE INTERFAZ (WEB AUDIO API)
    // -------------------------------------------------------------------------
    let sfxEnabled = localStorage.getItem('imperio-papu-sfx') !== 'off';
    let sfxCtx = null;

    function getSfxContext() {
        if (!sfxEnabled) return null;
        if (!sfxCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) sfxCtx = new AudioCtx();
        }
        if (sfxCtx && sfxCtx.state === 'suspended') {
            sfxCtx.resume().catch(() => {});
        }
        return sfxCtx;
    }

    const ImperialSFX = {
        hover() {
            const ctx = getSfxContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(260, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(360, ctx.currentTime + 0.04);
            gain.gain.setValueAtTime(0.03, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.045);
        },
        click() {
            const ctx = getSfxContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(540, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(170, ctx.currentTime + 0.07);
            gain.gain.setValueAtTime(0.09, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.075);
        },
        modal() {
            const ctx = getSfxContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(190, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.16);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.17);
        },
        unlock() {
            const ctx = getSfxContext();
            if (!ctx) return;
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const start = ctx.currentTime + idx * 0.08;
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0.12, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(start);
                osc.stop(start + 0.25);
            });
        },
        reset() {
            const ctx = getSfxContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(380, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(95, ctx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.26);
        }
    };

    document.querySelectorAll('.bio-card, .info-card, .circle-card, .meme-card, .video-link-card').forEach(el => {
        el.addEventListener('mouseenter', () => ImperialSFX.hover());
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('#sfxToggleBtn, #resetAchievementsBtn')) return;
        if (e.target.closest('button, .btn, .nav-link, .video-link-card')) {
            ImperialSFX.click();
        } else if (e.target.closest('.info-card, .circle-card, .meme-card')) {
            ImperialSFX.modal();
        }
    });

    const achievementsPanelEl = document.getElementById('achievementsPanel');
    if (achievementsPanelEl && !document.getElementById('sfxToggleBtn')) {
        achievementsPanelEl.insertAdjacentHTML('beforeend', `
            <div class="ach_panel_footer">
                <button id="sfxToggleBtn" class="ach_sfx_btn" type="button" title="Activar o silenciar efectos de sonido">🔊 SFX: ON</button>
                <button id="resetAchievementsBtn" class="ach_reset_btn" type="button" title="Reiniciar todas las condecoraciones">🔄 Reiniciar</button>
            </div>
        `);
    }

    const sfxToggleBtn = document.getElementById('sfxToggleBtn');
    if (sfxToggleBtn) {
        const updateSfxUI = () => {
            sfxToggleBtn.textContent = sfxEnabled ? '🔊 SFX: ON' : '🔇 SFX: OFF';
            sfxToggleBtn.style.opacity = sfxEnabled ? '1' : '0.6';
        };
        updateSfxUI();

        sfxToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sfxEnabled = !sfxEnabled;
            localStorage.setItem('imperio-papu-sfx', sfxEnabled ? 'on' : 'off');
            updateSfxUI();
            if (sfxEnabled) ImperialSFX.unlock();
        });
    }

    // -------------------------------------------------------------------------
    // B. BARRA DE PROGRESO INTERACTIVA EN RADIO LIXBALT
    // -------------------------------------------------------------------------
    let trackSeekSlider = document.getElementById('trackSeekSlider');
    let trackCurrentTime = document.getElementById('trackCurrentTime');
    let trackDuration = document.getElementById('trackDuration');
    const musicControlsBodyEl = document.getElementById('musicControlsBody');

    if (!trackSeekSlider && musicControlsBodyEl) {
        const progressHTML = `
            <div class="track-progress-container">
                <span id="trackCurrentTime" class="track-time">0:00</span>
                <input type="range" id="trackSeekSlider" class="track-seek-slider" min="0" max="100" step="0.1" value="0" aria-label="Progreso de la canción">
                <span id="trackDuration" class="track-time">0:00</span>
            </div>
        `;
        const volumeControls = musicControlsBodyEl.querySelector('.volume-controls');
        if (volumeControls) {
            volumeControls.insertAdjacentHTML('beforebegin', progressHTML);
        } else {
            musicControlsBodyEl.insertAdjacentHTML('beforeend', progressHTML);
        }
        trackSeekSlider = document.getElementById('trackSeekSlider');
        trackCurrentTime = document.getElementById('trackCurrentTime');
        trackDuration = document.getElementById('trackDuration');
    }

    let isSeekingTrack = false;
    let pendingSeekPct = null;

    function formatAudioTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }

    function setSliderVisualProgress(percent) {
        if (!trackSeekSlider) return;
        const clamped = Math.max(0, Math.min(100, percent));
        trackSeekSlider.style.setProperty('--seek-percent', `${clamped}%`);
    }

    function syncProgressUI() {
        if (!bgMusic || !trackSeekSlider || isSeekingTrack) return;
        const cur = bgMusic.currentTime || 0;
        const dur = bgMusic.duration || 0;
        if (trackCurrentTime) trackCurrentTime.textContent = formatAudioTime(cur);
        if (isFinite(dur) && dur > 0) {
            const pct = (cur / dur) * 100;
            if (trackDuration) trackDuration.textContent = formatAudioTime(dur);
            trackSeekSlider.value = pct.toFixed(2);
            setSliderVisualProgress(pct);
        } else {
            if (trackDuration) trackDuration.textContent = '0:00';
            trackSeekSlider.value = 0;
            setSliderVisualProgress(0);
        }
    }

    if (bgMusic && trackSeekSlider) {
        const seekToSliderValue = (value) => {
            const pct = parseFloat(value) || 0;
            setSliderVisualProgress(pct);
            const dur = bgMusic.duration;
            if (isFinite(dur) && dur > 0) {
                const newTime = (pct / 100) * dur;
                bgMusic.currentTime = newTime;
                if (trackCurrentTime) trackCurrentTime.textContent = formatAudioTime(newTime);
                sessionStorage.setItem('imperio-papu-time', String(newTime));
            }
        };

        bgMusic.addEventListener('loadedmetadata', syncProgressUI);
        bgMusic.addEventListener('durationchange', syncProgressUI);
        bgMusic.addEventListener('timeupdate', syncProgressUI);
        bgMusic.addEventListener('seeked', syncProgressUI);
        bgMusic.addEventListener('emptied', () => {
            isSeekingTrack = false;
            pendingSeekPct = null;
            syncProgressUI();
        });

        trackSeekSlider.addEventListener('pointerdown', () => {
            isSeekingTrack = true;
            pendingSeekPct = null;
        });

        trackSeekSlider.addEventListener('input', (e) => {
            const pct = parseFloat(e.target.value) || 0;
            setSliderVisualProgress(pct);
            const dur = bgMusic.duration;
            if (isFinite(dur) && dur > 0) {
                const targetTime = (pct / 100) * dur;
                if (trackCurrentTime) trackCurrentTime.textContent = formatAudioTime(targetTime);
                if (isSeekingTrack) {
                    pendingSeekPct = pct;
                } else {
                    bgMusic.currentTime = targetTime;
                    sessionStorage.setItem('imperio-papu-time', String(targetTime));
                }
            }
        });

        const finishSeek = () => {
            if (!isSeekingTrack) return;
            if (pendingSeekPct !== null) {
                seekToSliderValue(pendingSeekPct);
                pendingSeekPct = null;
            }
            isSeekingTrack = false;
        };

        trackSeekSlider.addEventListener('change', (e) => {
            if (pendingSeekPct !== null) {
                seekToSliderValue(e.target.value);
                pendingSeekPct = null;
            }
            isSeekingTrack = false;
        });

        window.addEventListener('pointerup', finishSeek);
        window.addEventListener('pointercancel', () => {
            pendingSeekPct = null;
            isSeekingTrack = false;
            syncProgressUI();
        });

        if (bgMusic.readyState >= 1) {
            syncProgressUI();
        }
    }

    // -------------------------------------------------------------------------
    // B2. CONTINUIDAD ININTERRUMPIDA DE MÚSICA ENTRE PÁGINAS
    // -------------------------------------------------------------------------
    if (bgMusic) {
        // 1. Restaurar el segundo exacto y el estado de reproducción al cargar la página
        const savedTime = parseFloat(sessionStorage.getItem('imperio-papu-time')) || 0;
        const wasPlaying = sessionStorage.getItem('imperio-papu-playing') === 'true';
        const savedTrack = sessionStorage.getItem('imperio-papu-last-track');
        const currentTrack = localStorage.getItem('imperio-papu-track') || '0';

        const restorePlaybackPosition = () => {
            if (savedTrack === currentTrack && savedTime > 0 && isFinite(bgMusic.duration)) {
                bgMusic.currentTime = Math.min(savedTime, bgMusic.duration - 0.5);
                syncProgressUI();
            }
            
            if (wasPlaying && bgMusic.paused) {
                bgMusic.play().then(() => {
                    const playPauseBtn = document.getElementById('playPauseBtn');
                    const playPauseIcon = document.getElementById('playPauseIcon');
                    const playPauseText = document.getElementById('playPauseText');
                    const eqBars = document.getElementById('eqBars');
                    if (playPauseIcon) playPauseIcon.textContent = '⏸';
                    if (playPauseText) playPauseText.textContent = 'Pausar';
                    if (playPauseBtn) playPauseBtn.classList.add('is-playing');
                    if (eqBars) eqBars.classList.add('playing');
                }).catch(() => {});
            }
        };

        if (bgMusic.readyState >= 1) {
            restorePlaybackPosition();
        } else {
            bgMusic.addEventListener('loadedmetadata', restorePlaybackPosition, { once: true });
        }

        // 2. Guardar segundo exacto y estado en tiempo real
        const saveAudioState = () => {
            sessionStorage.setItem('imperio-papu-time', String(bgMusic.currentTime || 0));
            sessionStorage.setItem('imperio-papu-playing', (!bgMusic.paused && !bgMusic.ended) ? 'true' : 'false');
            sessionStorage.setItem('imperio-papu-last-track', localStorage.getItem('imperio-papu-track') || '0');
        };

        bgMusic.addEventListener('timeupdate', saveAudioState);
        bgMusic.addEventListener('play', saveAudioState);
        bgMusic.addEventListener('pause', saveAudioState);
        window.addEventListener('beforeunload', saveAudioState);
        window.addEventListener('pagehide', saveAudioState);

        // Si el usuario cambia de canción manualmente, reiniciar el tiempo guardado a 0
        const prevBtn = document.getElementById('prevTrackBtn');
        const nextBtn = document.getElementById('nextTrackBtn');
        const selector = document.getElementById('trackSelector');
        const resetSavedTime = () => sessionStorage.setItem('imperio-papu-time', '0');

        if (prevBtn) prevBtn.addEventListener('click', resetSavedTime);
        if (nextBtn) nextBtn.addEventListener('click', resetSavedTime);
        if (selector) selector.addEventListener('change', resetSavedTime);
    }

    // -------------------------------------------------------------------------
    // C. MODO ECLIPSE (EN EL BOTÓN DE TEMA) Y REINICIO DE CONDECORACIONES
    // -------------------------------------------------------------------------
    const allAchievementIds = [
        'ach-explorer', 'ach-hacker', 'ach-audio', 'ach-meme',
        'ach-distant', 'ach-judge', 'ach-inquisidor', 'ach-cinema'
    ];

    // Clonamos el botón de tema para eliminar el listener antiguo de la Sección 1
    // y permitir alternar entre los 3 modos: Oscuro -> Claro -> Eclipse -> Oscuro
    const oldThemeBtn = document.getElementById('themeToggle');
    let activeThemeBtn = oldThemeBtn;
    if (oldThemeBtn && oldThemeBtn.parentNode) {
        activeThemeBtn = oldThemeBtn.cloneNode(true);
        oldThemeBtn.parentNode.replaceChild(activeThemeBtn, oldThemeBtn);
    }

    const themeIconEl = document.getElementById('themeIcon');
    const themeTextEl = document.getElementById('themeText');

    function applyImperialTheme(theme) {
        const validThemes = ['dark', 'light', 'eclipse'];
        const chosen = validThemes.includes(theme) ? theme : 'dark';
        htmlEl.setAttribute('data-theme', chosen);
        localStorage.setItem('imperio-papu-theme', chosen);

        if (!themeIconEl || !themeTextEl) return;
        if (chosen === 'dark') {
            themeIconEl.textContent = '☀️';
            themeTextEl.textContent = 'Modo Claro';
        } else if (chosen === 'light') {
            themeIconEl.textContent = '🌑';
            themeTextEl.textContent = 'Modo Eclipse';
        } else if (chosen === 'eclipse') {
            themeIconEl.textContent = '🌙';
            themeTextEl.textContent = 'Modo Oscuro';
        }
    }

    if (activeThemeBtn) {
        applyImperialTheme(localStorage.getItem('imperio-papu-theme') || 'dark');

        activeThemeBtn.addEventListener('click', () => {
            ImperialSFX.click();
            const current = htmlEl.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : (current === 'light' ? 'eclipse' : 'dark');
            applyImperialTheme(next);
        });
    }

    // Sonido al desbloquear logros y activación automática del Modo Eclipse al llegar a 8/8
    const baseUnlockAchievement = window.unlockAchievement;
    if (typeof baseUnlockAchievement === 'function') {
        window.unlockAchievement = function(achId) {
            const prevStored = JSON.parse(localStorage.getItem('imperio-papu-achievements')) || {};
            const wasUnlocked = prevStored[achId] === true;

            baseUnlockAchievement(achId);

            const nowStored = JSON.parse(localStorage.getItem('imperio-papu-achievements')) || {};
            if (!wasUnlocked && nowStored[achId] === true) {
                ImperialSFX.unlock();
                const allDone = allAchievementIds.every(id => nowStored[id] === true);
                if (allDone) {
                    applyImperialTheme('eclipse');
                    setTimeout(() => {
                        if (achievementToast && toastTitle) {
                            toastTitle.textContent = '🌑 ¡MODO ECLIPSE ACTIVADO!';
                            achievementToast.classList.remove('hidden');
                            achievementToast.classList.add('show');
                            ImperialSFX.unlock();
                            setTimeout(() => achievementToast.classList.remove('show'), 4000);
                        }
                    }, 3800);
                }
            }
        };
    }

    // Botón de Reinicio de Condecoraciones
    const resetAchievementsBtn = document.getElementById('resetAchievementsBtn');
    if (resetAchievementsBtn) {
        resetAchievementsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            ImperialSFX.reset();
            
            localStorage.removeItem('imperio-papu-achievements');
            localStorage.removeItem('imperio-papu-factions');
            localStorage.removeItem('imperio-papu-circles');

            allAchievementIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.remove('unlocked');
                    const statusSpan = el.querySelector('.ach_status');
                    if (statusSpan) statusSpan.textContent = '🔒';
                }
            });

            if (achievementsCount) {
                achievementsCount.textContent = `0/${allAchievementIds.length}`;
            }

            if (achievementToast && toastTitle) {
                toastTitle.textContent = 'Condecoraciones reiniciadas a 0/8';
                achievementToast.classList.remove('hidden');
                achievementToast.classList.add('show');
            }

            setTimeout(() => window.location.reload(), 550);
        });
    }

    // -------------------------------------------------------------------------
    // D. CERTIFICADO DESCARGABLE DEL TEST DEL INFIERNO (CANVAS PNG)
    // -------------------------------------------------------------------------
    let downloadCertBtn = document.getElementById('downloadCertBtn');
    const quizResultActionsEl = document.querySelector('#quizResultView .quiz-result-actions');
    if (!downloadCertBtn && quizResultActionsEl) {
        quizResultActionsEl.insertAdjacentHTML('afterbegin', '<button id="downloadCertBtn" class="btn btn-cert" type="button">📜 Descargar Certificado</button>');
        downloadCertBtn = document.getElementById('downloadCertBtn');
    }

    function wrapCanvasParagraph(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            if (ctx.measureText(testLine).width > maxWidth && i > 0) {
                ctx.fillText(line.trim(), x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), x, currentY);
    }

    if (downloadCertBtn) {
        downloadCertBtn.addEventListener('click', () => {
            const romanNum = document.getElementById('quizResultNum')?.textContent.trim() || 'VII';
            const circleTitle = document.getElementById('quizResultTitle')?.textContent.trim() || 'Círculo VII: Violencia';
            const guardianText = document.getElementById('quizResultGuardian')?.textContent.trim() || 'Representante asignado: Martiniano';
            const descText = document.getElementById('quizResultDesc')?.textContent.trim() || '';

            const certCanvas = document.createElement('canvas');
            certCanvas.width = 900;
            certCanvas.height = 560;
            const cctx = certCanvas.getContext('2d');

            const bgGrad = cctx.createRadialGradient(450, 280, 50, 450, 280, 520);
            bgGrad.addColorStop(0, '#1f070d');
            bgGrad.addColorStop(1, '#090b10');
            cctx.fillStyle = bgGrad;
            cctx.fillRect(0, 0, 900, 560);

            cctx.strokeStyle = '#e63946';
            cctx.lineWidth = 4;
            cctx.strokeRect(24, 24, 852, 512);

            cctx.strokeStyle = '#eab308';
            cctx.lineWidth = 1.5;
            cctx.strokeRect(36, 36, 828, 488);

            cctx.fillStyle = '#eab308';
            cctx.font = 'bold 16px sans-serif';
            cctx.textAlign = 'center';
            cctx.fillText('TRIBUNAL SUPREMO DEL IMPERIO PAPU // ARCHIVO OFICIAL 3.2', 450, 82);

            cctx.fillStyle = '#ffffff';
            cctx.font = 'bold 28px sans-serif';
            cctx.fillText('SENTENCIA DEL JUICIO IMPERIAL', 450, 122);

            cctx.beginPath();
            cctx.arc(450, 205, 52, 0, Math.PI * 2);
            cctx.fillStyle = 'rgba(230, 57, 70, 0.2)';
            cctx.fill();
            cctx.lineWidth = 3;
            cctx.strokeStyle = '#e63946';
            cctx.stroke();

            cctx.fillStyle = '#ff4d6d';
            cctx.font = 'bold 44px serif';
            cctx.textBaseline = 'middle';
            cctx.fillText(romanNum, 450, 207);

            cctx.textBaseline = 'alphabetic';
            cctx.fillStyle = '#ffffff';
            cctx.font = 'bold 34px sans-serif';
            cctx.fillText(circleTitle.toUpperCase(), 450, 305);

            cctx.fillStyle = '#22c55e';
            cctx.font = 'bold 21px sans-serif';
            cctx.fillText(guardianText, 450, 342);

            cctx.fillStyle = '#cbd5e1';
            cctx.font = 'italic 18px sans-serif';
            wrapCanvasParagraph(cctx, `"${descText}"`, 450, 392, 700, 28);

            const dateStr = new Date().toLocaleDateString('es-AR', {
                year: 'numeric', month: '2-digit', day: '2-digit'
            });
            cctx.fillStyle = '#94a3b8';
            cctx.font = 'bold 14px monospace';
            cctx.textAlign = 'left';
            cctx.fillText(`FECHA DE SENTENCIA: ${dateStr}`, 60, 495);

            cctx.fillStyle = '#eab308';
            cctx.textAlign = 'right';
            cctx.fillText('SELLO DEL SAGRADO LORE IMPERIAL ★', 840, 495);

            ImperialSFX.unlock();
            const link = document.createElement('a');
            link.download = `certificado-imperio-papu-circulo-${romanNum}.png`;
            link.href = certCanvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            link.remove();
        });
    }
});