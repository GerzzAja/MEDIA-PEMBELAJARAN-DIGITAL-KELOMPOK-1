(function() {

    const twemojiBase = "https://twemoji.maxcdn.com/v/latest/72x72";

    let currentGame = null;
    let playerNames = ["Pemain 1", "Pemain 2"];
    let globalScores = [0, 0];
    let gamesCompleted = 0;
    const TOTAL_GAMES = 5;
    let currentGameCleanup = null;

    // DOM elements
    const menuContainer = document.getElementById("menuContainer");
    const gameWrapper = document.getElementById("gameWrapper");
    const gameArea = document.getElementById("game-main-area");
    const modal = document.getElementById("player-modal");
    const leaderboardModal = document.getElementById("leaderboard-modal");
    const finalModal = document.getElementById("final-winner-modal");
    const startBtn = document.getElementById("start-game-btn");
    const closeLeaderboard = document.getElementById("close-leaderboard");
    const resetAllBtn = document.getElementById("reset-all-btn");
    const backToMenuBtn = document.getElementById("backToMenuBtn");
    const globalScoreDisplay = document.getElementById("globalScoreDisplay");
    const globalScoreDisplay2 = document.getElementById("globalScoreDisplay2");
    const gameTitleBadge = document.getElementById("gameTitleBadge");

    // ========== UTILITY FUNCTIONS ==========
    function updateGlobalScoreUI() {
        globalScoreDisplay.innerText = globalScores[0];
        globalScoreDisplay2.innerText = globalScores[1];
    }

    function addWinToGlobal(playerIndex) {
        if (playerIndex === 0) {
            globalScores[0]++;
        } else {
            globalScores[1]++;
        }
        updateGlobalScoreUI();
        gamesCompleted++;
        if (gamesCompleted >= TOTAL_GAMES) {
            showFinalWinner();
        }
    }

    function showFinalWinner() {
        let winnerText = "";
        if (globalScores[0] > globalScores[1]) {
            winnerText = `🏆✨ ${playerNames[0]} PEMENANG! ${globalScores[0]} - ${globalScores[1]} ✨🏆`;
        } else if (globalScores[1] > globalScores[0]) {
            winnerText = `🏆✨ ${playerNames[1]} PEMENANG! ${globalScores[1]} - ${globalScores[0]} ✨🏆`;
        } else {
            winnerText = `🤝 Seri! ${globalScores[0]} - ${globalScores[1]}! 🤝`;
        }
        document.getElementById("finalWinnerText").innerHTML = `<h2>${winnerText}</h2><p>Klik tombol untuk bermain lagi</p>`;
        finalModal.style.display = "flex";
    }

    function resetAllGames() {
        globalScores = [0, 0];
        gamesCompleted = 0;
        updateGlobalScoreUI();
        finalModal.style.display = "none";
        showMenu();
    }
    resetAllBtn.onclick = resetAllGames;

    function showLeaderboard(gameId, winnerName) {
        document.getElementById("leaderboardTitle").innerHTML = `🏆 PEMENANG ${gameId.toUpperCase()} 🏆`;
        document.getElementById("leaderboard-list").innerHTML = `<p>🎉 ${winnerName} menang! 🎉</p>`;
        leaderboardModal.style.display = "flex";
    }
    closeLeaderboard.onclick = () => leaderboardModal.style.display = "none";
    window.addEventListener('click', (e) => {
        if (e.target === leaderboardModal) {
            leaderboardModal.style.display = "none";
        }
    });

    function setupPlayerModal() {
        const container = document.getElementById("player-inputs-container");
        container.innerHTML = `
            <input type="text" id="pname_0" placeholder="Nama Pemain Kiri" value="Budi" autocomplete="off">
            <input type="text" id="pname_1" placeholder="Nama Pemain Kanan" value="Ani" autocomplete="off">
        `;
        // Hapus event listener lama jika ada, lalu pasang yang baru
        startBtn.removeEventListener("click", startGameHandler);
        startBtn.addEventListener("click", startGameHandler);
    }

    function startGameHandler() {
        const input0 = document.getElementById("pname_0");
        const input1 = document.getElementById("pname_1");
        let name0 = input0 ? input0.value.trim() : "";
        let name1 = input1 ? input1.value.trim() : "";
        if (name0 === "") name0 = "Pemain Kiri";
        if (name1 === "") name1 = "Pemain Kanan";
        playerNames[0] = name0;
        playerNames[1] = name1;
        modal.style.display = "none";
        showMenu();
    }

    modal.style.display = "flex";
    setupPlayerModal();

    function createPhysicsPanel(title, paramsHtml, formulaHtml) {
        const panel = document.createElement("div");
        panel.className = "physics-panel";
        panel.innerHTML = `<h4>📐 ${title}</h4>${paramsHtml}<div class="formula">${formulaHtml}</div>`;
        return panel;
    }

    // ========== GAME 1: TARIK LAWAN ==========
    function initTarikLawan() {
        let posisi = 50,
            leftScore = 0,
            rightScore = 0,
            gameActive = true;
        let lastClickLeft = 0,
            lastClickRight = 0;
        let massa = 5;

        const container = document.createElement("div");
        container.className = "game-container";
        container.innerHTML = `
            <div class="game-visual" style="background-image: url('background-lapangan-bola.jpg'); background-size: cover; background-position: center;">
                <div class="rope-line"></div>
                <div class="flag-left">🥅</div>
                <div class="flag-right">🥅</div>
                <div id="tarikBall" class="bola-sepak" style="left: calc(50% - 40px);">
                    <img src="${twemojiBase}/26bd.png" style="width:80px;">
                </div>
            </div>
            <div class="game-controls">
                <div class="player-zone">
                    <div class="player-name">${playerNames[0]}</div>
                    <button class="action-btn" id="pullLeftBtn">⚡ TENDANG!</button>
                    <div class="score" id="leftScore">0</div>
                </div>
                <div class="player-zone">
                    <div class="player-name">${playerNames[1]}</div>
                    <button class="action-btn" id="pullRightBtn">⚡ TENDANG!</button>
                    <div class="score" id="rightScore">0</div>
                </div>
            </div>
            <button class="reset-btn" id="resetTarik">🔄 Game Baru</button>
        `;

        const ball = container.querySelector("#tarikBall");
        const leftScoreEl = container.querySelector("#leftScore");
        const rightScoreEl = container.querySelector("#rightScore");

        const physicsHtml = `
            <div class="param-row">
                <label>⚖️ Massa Bola (kg):</label>
                <input type="range" id="massSlider" min="1" max="20" step="0.5" value="5">
                <span id="massValue" class="live-value">5 kg</span>
            </div>
            <div class="param-row">
                <span>💪 Gaya (N):</span>
                <span id="forceLeft" class="live-value">0</span> / <span id="forceRight" class="live-value">0</span>
            </div>
            <div class="param-row">
                <span>📈 Percepatan (m/s²):</span>
                <span id="accLeft" class="live-value">0</span> / <span id="accRight" class="live-value">0</span>
            </div>
        `;
        const panel = createPhysicsPanel("GAYA & PERCEPATAN", physicsHtml, "🔬 F = m × a");
        container.appendChild(panel);

        const massSlider = panel.querySelector("#massSlider");
        const massValueSpan = panel.querySelector("#massValue");
        const forceLeftSpan = panel.querySelector("#forceLeft");
        const forceRightSpan = panel.querySelector("#forceRight");
        const accLeftSpan = panel.querySelector("#accLeft");
        const accRightSpan = panel.querySelector("#accRight");

        function hitungGaya(kecepatanKlik, m) {
            let gaya = Math.min(kecepatanKlik * 40, 250);
            let a = gaya / m;
            return { gaya, a };
        }

        function updatePosition(power) {
            posisi = Math.min(Math.max(posisi + power, 0), 100);
            ball.style.left = `calc(${posisi}% - 40px)`;
            if (gameActive) {
                if (posisi >= 97) {
                    gameActive = false;
                    leftScore++;
                    leftScoreEl.innerText = leftScore;
                    addWinToGlobal(0);
                    showLeaderboard("tarik-lawan", playerNames[0]);
                    setTimeout(() => resetGame(), 2000);
                } else if (posisi <= 3) {
                    gameActive = false;
                    rightScore++;
                    rightScoreEl.innerText = rightScore;
                    addWinToGlobal(1);
                    showLeaderboard("tarik-lawan", playerNames[1]);
                    setTimeout(() => resetGame(), 2000);
                }
            }
        }

        function resetGame() {
            posisi = 50;
            gameActive = true;
            ball.style.left = "calc(50% - 40px)";
        }

        function fullReset() {
            leftScore = 0;
            rightScore = 0;
            gameActive = true;
            posisi = 50;
            leftScoreEl.innerText = "0";
            rightScoreEl.innerText = "0";
            ball.style.left = "calc(50% - 40px)";
        }

        container.querySelector("#pullLeftBtn").onclick = () => {
            if (!gameActive) return;
            let now = Date.now();
            let delta = now - lastClickLeft;
            let kecepatan = delta > 0 ? Math.min(1000 / delta, 15) : 5;
            lastClickLeft = now;
            let { gaya, a } = hitungGaya(kecepatan, massa);
            forceLeftSpan.innerText = gaya.toFixed(1);
            accLeftSpan.innerText = a.toFixed(2);
            updatePosition(Math.min(a * 0.9, 18));
        };

        container.querySelector("#pullRightBtn").onclick = () => {
            if (!gameActive) return;
            let now = Date.now();
            let delta = now - lastClickRight;
            let kecepatan = delta > 0 ? Math.min(1000 / delta, 15) : 5;
            lastClickRight = now;
            let { gaya, a } = hitungGaya(kecepatan, massa);
            forceRightSpan.innerText = gaya.toFixed(1);
            accRightSpan.innerText = a.toFixed(2);
            updatePosition(-Math.min(a * 0.9, 18));
        };

        massSlider.oninput = (e) => {
            massa = parseFloat(e.target.value);
            massValueSpan.innerText = massa + " kg";
        };

        container.querySelector("#resetTarik").onclick = fullReset;
        return container;
    }

    // ========== GAME 2: BALAP PERAHU ==========
    function initBalapPerahu() {
        let pos1 = 0,
            pos2 = 0,
            raceActive = true;
        let koefGesek = 0.3,
            gayaNormal = 80;

        const container = document.createElement("div");
        container.className = "game-container";
        container.innerHTML = `
            <div class="game-visual" style="background-image: url('background-lautan.jpg'); background-size: cover; background-position: center;">
                <div id="boat1" class="boat" style="left:0%; bottom: 27%;">
                    <img src="${twemojiBase}/26f5.png" style="width:100px;">
                </div>
                <div id="boat2" class="boat" style="left:0%; bottom: 5%;">
                    <img src="${twemojiBase}/26f5.png" style="width:100px;">
                </div>
                <div style="position:absolute; right:3%; top:45%; background:#e74c3c; color:white; padding:4px 12px; border-radius:20px;">🏁</div>
            </div>
            <div class="game-controls">
                <div class="player-zone">
                    <div class="player-name">${playerNames[0]}</div>
                    <button class="action-btn" id="rowLeftBtn">🚣 DAYUNG!</button>
                    <div class="score" id="scoreBoat1">0</div>
                </div>
                <div class="player-zone">
                    <div class="player-name">${playerNames[1]}</div>
                    <button class="action-btn" id="rowRightBtn">🚣 DAYUNG!</button>
                    <div class="score" id="scoreBoat2">0</div>
                </div>
            </div>
            <button class="reset-btn" id="resetBoat">🔄 Balapan Baru</button>
        `;

        const boat1 = container.querySelector("#boat1");
        const boat2 = container.querySelector("#boat2");
        const score1 = container.querySelector("#scoreBoat1");
        const score2 = container.querySelector("#scoreBoat2");
        let click1 = 0,
            click2 = 0;

        const physicsHtml = `
            <div class="param-row">
                <label>🧴 Koefisien Gesek (μ):</label>
                <input type="range" id="muSlider" min="0" max="1" step="0.01" value="0.3">
                <span id="muVal" class="live-value">0.30</span>
            </div>
            <div class="param-row">
                <label>⚖️ Gaya Normal (N):</label>
                <input type="range" id="normalSlider" min="20" max="200" step="5" value="80">
                <span id="normalVal" class="live-value">80 N</span>
            </div>
            <div class="param-row">
                <span>🧲 Gaya Gesek (N):</span>
                <span id="frictionForce" class="live-value">0</span>
            </div>
        `;
        const panel = createPhysicsPanel("GAYA GESEK", physicsHtml, "🔬 F_gesek = μ × N");
        container.appendChild(panel);

        const muSlider = panel.querySelector("#muSlider");
        const normalSlider = panel.querySelector("#normalSlider");
        const muVal = panel.querySelector("#muVal");
        const normalVal = panel.querySelector("#normalVal");
        const frictionSpan = panel.querySelector("#frictionForce");

        function hitungEfektivitas() {
            let gesek = koefGesek * gayaNormal;
            frictionSpan.innerText = gesek.toFixed(2) + " N";
            return Math.max(0.15, 1 - (gesek) / 120);
        }

        function updateRace() {
            let p1 = Math.min(pos1, 92);
            let p2 = Math.min(pos2, 92);
            boat1.style.left = `${p1}%`;
            boat2.style.left = `${p2}%`;
            if (raceActive && p1 >= 90) {
                raceActive = false;
                addWinToGlobal(0);
                showLeaderboard("balap-perahu", playerNames[0]);
                setTimeout(() => resetRace(), 2000);
            }
            if (raceActive && p2 >= 90) {
                raceActive = false;
                addWinToGlobal(1);
                showLeaderboard("balap-perahu", playerNames[1]);
                setTimeout(() => resetRace(), 2000);
            }
        }

        function resetRace() {
            pos1 = 0;
            pos2 = 0;
            click1 = 0;
            click2 = 0;
            raceActive = true;
            score1.innerText = "0";
            score2.innerText = "0";
            boat1.style.left = "0%";
            boat2.style.left = "0%";
        }

        function dayung(arah) {
            if (!raceActive) return;
            let efektif = hitungEfektivitas();
            let jarak = 7 * efektif;
            if (arah === 'kiri') {
                pos1 += jarak;
                click1++;
                score1.innerText = click1;
            } else {
                pos2 += jarak;
                click2++;
                score2.innerText = click2;
            }
            updateRace();
        }

        container.querySelector("#rowLeftBtn").onclick = () => dayung('kiri');
        container.querySelector("#rowRightBtn").onclick = () => dayung('kanan');

        muSlider.oninput = (e) => {
            koefGesek = parseFloat(e.target.value);
            muVal.innerText = koefGesek.toFixed(2);
            hitungEfektivitas();
        };
        normalSlider.oninput = (e) => {
            gayaNormal = parseFloat(e.target.value);
            normalVal.innerText = gayaNormal + " N";
            hitungEfektivitas();
        };
        container.querySelector("#resetBoat").onclick = resetRace;
        return container;
    }

    // ========== GAME 3: TARIK SELUNCUR ==========
    function initTarikSeluncur() {
        let posisi = 50,
            leftScore = 0,
            rightScore = 0,
            gameActive = true;
        let lastClickLeft = 0,
            lastClickRight = 0;
        let massa = 8;

        const container = document.createElement("div");
        container.className = "game-container";
        container.innerHTML = `
            <div class="game-visual" style="background-image: url('background-salju.jpg'); background-size: cover; background-position: center;">
                <div id="sled" class="sled" style="left:50%;">
                    <img src="${twemojiBase}/1f6f7.png" style="width:100px;">
                </div>
                <div id="leftPerson" class="person-pulling" style="left:43%;">
                    <img src="${twemojiBase}/1f9d1.png" style="width:55px;">
                </div>
                <div id="rightPerson" class="person-pulling" style="left:57%;">
                    <img src="${twemojiBase}/1f9d1-1f3ff.png" style="width:55px;">
                </div>
            </div>
            <div class="game-controls">
                <div class="player-zone">
                    <div class="player-name">${playerNames[0]}</div>
                    <button class="action-btn" id="pullLeftSled">⬅️ TARIK</button>
                    <div class="score" id="sledScoreLeft">0</div>
                </div>
                <div class="player-zone">
                    <div class="player-name">${playerNames[1]}</div>
                    <button class="action-btn" id="pullRightSled">➡️ TARIK</button>
                    <div class="score" id="sledScoreRight">0</div>
                </div>
            </div>
            <button class="reset-btn" id="resetSled">🔄 Game Baru</button>
        `;

        const sled = container.querySelector("#sled");
        const leftPerson = container.querySelector("#leftPerson");
        const rightPerson = container.querySelector("#rightPerson");
        const leftScoreEl = container.querySelector("#sledScoreLeft");
        const rightScoreEl = container.querySelector("#sledScoreRight");

        const physicsHtml = `
            <div class="param-row">
                <label>🛷 Massa Seluncur (kg):</label>
                <input type="range" id="massSled" min="2" max="30" step="1" value="8">
                <span id="massSledVal" class="live-value">8 kg</span>
            </div>
            <div class="param-row">
                <span>💪 Gaya Tarik (N):</span>
                <span id="forceLeftSled" class="live-value">0</span> / <span id="forceRightSled" class="live-value">0</span>
            </div>
        `;
        const panel = createPhysicsPanel("DINAMIKA SELUNCUR", physicsHtml, "F = m × a");
        container.appendChild(panel);

        const massSlider = panel.querySelector("#massSled");
        const massVal = panel.querySelector("#massSledVal");
        const forceLeftSpan = panel.querySelector("#forceLeftSled");
        const forceRightSpan = panel.querySelector("#forceRightSled");

        function hitung(kecepatan, m) {
            let gaya = Math.min(kecepatan * 45, 260);
            let a = gaya / m;
            return { gaya, a };
        }

        function updateSled(power) {
            posisi = Math.min(Math.max(posisi + power, 0), 100);
            sled.style.left = `${posisi}%`;
            leftPerson.style.left = `${Math.max(posisi - 8, 2)}%`;
            rightPerson.style.left = `${Math.min(posisi + 8, 95)}%`;
            if (gameActive) {
                if (posisi <= 5) {
                    gameActive = false;
                    leftScore++;
                    leftScoreEl.innerText = leftScore;
                    addWinToGlobal(0);
                    showLeaderboard("tarik-seluncur", playerNames[0]);
                    setTimeout(() => resetGame(), 2000);
                }
                if (posisi >= 95) {
                    gameActive = false;
                    rightScore++;
                    rightScoreEl.innerText = rightScore;
                    addWinToGlobal(1);
                    showLeaderboard("tarik-seluncur", playerNames[1]);
                    setTimeout(() => resetGame(), 2000);
                }
            }
        }

        function resetGame() {
            posisi = 50;
            gameActive = true;
            updateSled(0);
        }

        function fullReset() {
            leftScore = 0;
            rightScore = 0;
            gameActive = true;
            posisi = 50;
            leftScoreEl.innerText = "0";
            rightScoreEl.innerText = "0";
            updateSled(0);
        }

        container.querySelector("#pullLeftSled").onclick = () => {
            if (!gameActive) return;
            let now = Date.now();
            let delta = now - lastClickLeft;
            let kecepatan = delta > 0 ? Math.min(1000 / delta, 14) : 4;
            lastClickLeft = now;
            let { gaya, a } = hitung(kecepatan, massa);
            forceLeftSpan.innerText = gaya.toFixed(1);
            updateSled(-Math.min(a * 0.8, 16));
        };

        container.querySelector("#pullRightSled").onclick = () => {
            if (!gameActive) return;
            let now = Date.now();
            let delta = now - lastClickRight;
            let kecepatan = delta > 0 ? Math.min(1000 / delta, 14) : 4;
            lastClickRight = now;
            let { gaya, a } = hitung(kecepatan, massa);
            forceRightSpan.innerText = gaya.toFixed(1);
            updateSled(Math.min(a * 0.8, 16));
        };

        massSlider.oninput = (e) => {
            massa = parseFloat(e.target.value);
            massVal.innerText = massa + " kg";
        };

        container.querySelector("#resetSled").onclick = fullReset;
        return container;
    }

    // ========== GAME 4: TANGKAP BUAH (deteksi tabrakan akurat) ==========
    function initTangkapBuah() {
        let leftScore = 0,
            rightScore = 0,
            gameActive = true,
            gravitasi = 9.8;
        let activeApples = [],
            animationId = null,
            spawnInterval = null;

        let leftTarget = 20,
            rightTarget = 70;
        let leftCurrent = 20,
            rightCurrent = 70;
        let rafLeft = null,
            rafRight = null;
        let leftTouchId = null,
            rightTouchId = null;

        const container = document.createElement("div");
        container.className = "game-container";
        container.innerHTML = `
            <div class="game-visual" style="background-image: url('background-hutan.jpg'); background-size: 100%; background-position: center;">
                <div id="leftCatcher" class="apple-catcher" style="left:20%;">
                    <img src="${twemojiBase}/1f9fa.png" style="width:55px;">
                </div>
                <div id="rightCatcher" class="apple-catcher" style="left:70%;">
                    <img src="${twemojiBase}/1f9fa.png" style="width:55px;">
                </div>
            </div>
            <div class="game-controls">
                <div class="player-zone">
                    <div class="player-name">${playerNames[0]}</div>
                    <div class="score" id="appleLeftScore">0</div>
                    <div>🍎</div>
                </div>
                <div class="player-zone">
                    <div class="player-name">${playerNames[1]}</div>
                    <div class="score" id="appleRightScore">0</div>
                    <div>🍏</div>
                </div>
            </div>
            <button class="reset-btn" id="resetApple">🔄 Game Baru</button>
        `;

        const visual = container.querySelector(".game-visual");
        const leftScoreEl = container.querySelector("#appleLeftScore");
        const rightScoreEl = container.querySelector("#appleRightScore");
        const leftCatcher = container.querySelector("#leftCatcher");
        const rightCatcher = container.querySelector("#rightCatcher");

        function setLeftPosition(percent) {
            leftTarget = Math.min(48, Math.max(3, percent));
            if (rafLeft) return;
            rafLeft = requestAnimationFrame(() => {
                leftCurrent = leftTarget;
                leftCatcher.style.left = leftCurrent + "%";
                rafLeft = null;
            });
        }

        function setRightPosition(percent) {
            rightTarget = Math.min(97, Math.max(52, percent));
            if (rafRight) return;
            rafRight = requestAnimationFrame(() => {
                rightCurrent = rightTarget;
                rightCatcher.style.left = rightCurrent + "%";
                rafRight = null;
            });
        }

        visual.addEventListener("mousemove", (e) => {
            if (!gameActive) return;
            const rect = visual.getBoundingClientRect();
            let percent = (e.clientX - rect.left) / rect.width * 100;
            if (percent < 50) {
                setLeftPosition(percent);
            } else {
                setRightPosition(percent);
            }
        });

        visual.addEventListener("touchstart", (e) => {
            if (!gameActive) return;
            e.preventDefault();
            const rect = visual.getBoundingClientRect();
            for (let t of e.changedTouches) {
                let percent = (t.clientX - rect.left) / rect.width * 100;
                if (percent < 50 && leftTouchId === null) {
                    leftTouchId = t.identifier;
                    setLeftPosition(percent);
                } else if (percent >= 50 && rightTouchId === null) {
                    rightTouchId = t.identifier;
                    setRightPosition(percent);
                }
            }
        }, { passive: false });

        visual.addEventListener("touchmove", (e) => {
            if (!gameActive) return;
            e.preventDefault();
            const rect = visual.getBoundingClientRect();
            for (let t of e.touches) {
                let percent = (t.clientX - rect.left) / rect.width * 100;
                if (t.identifier === leftTouchId) {
                    setLeftPosition(percent);
                } else if (t.identifier === rightTouchId) {
                    setRightPosition(percent);
                }
            }
        }, { passive: false });

        visual.addEventListener("touchend", (e) => {
            for (let t of e.changedTouches) {
                if (t.identifier === leftTouchId) leftTouchId = null;
                if (t.identifier === rightTouchId) rightTouchId = null;
            }
        });

        const physicsHtml = `
            <div class="param-row">
                <label>🌍 Gravitasi (m/s²):</label>
                <input type="range" id="gravSlider" min="2" max="25" step="0.5" value="9.8">
                <span id="gravVal" class="live-value">9.8 m/s²</span>
            </div>
        `;
        const panel = createPhysicsPanel("GRAVITASI", physicsHtml, "🔬 h = ½·g·t², v = g·t");
        container.appendChild(panel);

        const gravSlider = panel.querySelector("#gravSlider");
        const gravVal = panel.querySelector("#gravVal");
        gravSlider.addEventListener("input", (e) => {
            if (gameActive) gravitasi = parseFloat(e.target.value);
            gravVal.innerText = gravitasi + " m/s²";
        });

        function checkCollision(appleDiv, catcherDiv) {
            const appleRect = appleDiv.getBoundingClientRect();
            const catcherRect = catcherDiv.getBoundingClientRect();
            return (appleRect.bottom >= catcherRect.top &&
                    appleRect.top <= catcherRect.bottom &&
                    appleRect.right >= catcherRect.left &&
                    appleRect.left <= catcherRect.right);
        }

        function spawnApple() {
            if (!gameActive) return;
            const side = Math.random() < 0.5 ? "left" : "right";
            const appleDiv = document.createElement("div");
            appleDiv.className = "falling-ball";
            appleDiv.innerHTML = `<img src="${twemojiBase}/${side === 'left' ? '1f34e' : '1f34f'}.png" style="width:100%;">`;
            const leftRange = side === "left" ? [5, 45] : [55, 95];
            const leftPos = leftRange[0] + Math.random() * (leftRange[1] - leftRange[0]);
            appleDiv.style.left = leftPos + "%";
            appleDiv.style.top = "0px";
            visual.appendChild(appleDiv);
            let y = 0,
                vy = 0;
            let alreadyCaught = false;

            const updateApple = (dt) => {
                if (!gameActive) return false;
                if (alreadyCaught) return false;
                vy += gravitasi * dt;
                y += vy * dt * 30;
                appleDiv.style.top = y + "px";
                const catcher = side === "left" ? leftCatcher : rightCatcher;
                if (catcher && checkCollision(appleDiv, catcher)) {
                    alreadyCaught = true;
                    appleDiv.remove();
                    if (side === "left") {
                        leftScore++;
                        leftScoreEl.innerText = leftScore;
                        if (leftScore >= 8 && gameActive) {
                            gameActive = false;
                            addWinToGlobal(0);
                            showLeaderboard("tangkap-buah", playerNames[0]);
                            setTimeout(() => resetGame(), 2000);
                        }
                    } else {
                        rightScore++;
                        rightScoreEl.innerText = rightScore;
                        if (rightScore >= 8 && gameActive) {
                            gameActive = false;
                            addWinToGlobal(1);
                            showLeaderboard("tangkap-buah", playerNames[1]);
                            setTimeout(() => resetGame(), 2000);
                        }
                    }
                    return false;
                }
                if (y > visual.clientHeight - 60) {
                    appleDiv.remove();
                    return false;
                }
                return true;
            };
            activeApples.push({ div: appleDiv, update: updateApple });
        }

        let lastTimestamp = 0;
        function animate(now) {
            if (!gameActive && activeApples.length === 0) return;
            let delta = Math.min(0.033, (now - (lastTimestamp || now)) / 1000);
            lastTimestamp = now;
            for (let i = activeApples.length - 1; i >= 0; i--) {
                if (!activeApples[i].update(delta)) {
                    activeApples.splice(i, 1);
                }
            }
            if (gameActive || activeApples.length > 0) {
                animationId = requestAnimationFrame(animate);
            } else {
                animationId = null;
            }
        }

        function resetGame() {
            if (animationId) cancelAnimationFrame(animationId);
            if (spawnInterval) clearInterval(spawnInterval);
            activeApples.forEach(a => a.div.remove());
            activeApples = [];
            leftScore = 0;
            rightScore = 0;
            gameActive = true;
            leftScoreEl.innerText = "0";
            rightScoreEl.innerText = "0";
            setLeftPosition(20);
            setRightPosition(70);
            lastTimestamp = 0;
            spawnInterval = setInterval(() => {
                if (gameActive) spawnApple();
            }, 1000);
            animationId = requestAnimationFrame(animate);
        }

        function fullCleanup() {
            if (animationId) cancelAnimationFrame(animationId);
            if (spawnInterval) clearInterval(spawnInterval);
            activeApples.forEach(a => a.div.remove());
            activeApples = [];
            gameActive = false;
        }

        resetGame();
        container.querySelector("#resetApple").onclick = () => {
            fullCleanup();
            resetGame();
        };
        container.cleanup = fullCleanup;
        return container;
    }

    // ========== GAME 5: BASKET ==========
    function initBasket() {
        let leftScore = 0,
            rightScore = 0,
            gameActive = true,
            shooting = false;

        const container = document.createElement("div");
        container.className = "game-container";
        container.innerHTML = `
            <div class="game-visual" style="background-image: url('background-lapangan-basket.jpg'); background-size: 55%; background-position: center;">
                <div id="leftBall" class="basketball-player" style="left:10%; bottom:20%;">
                    <img src="${twemojiBase}/1f3c0.png" style="width:70px;">
                </div>
                <div id="rightBall" class="basketball-player" style="left:90%; bottom:20%;">
                    <img src="${twemojiBase}/1f3c0.png" style="width:70px;">
                </div>
            </div>
            <div class="game-controls">
                <div class="player-zone">
                    <div class="player-name">${playerNames[0]}</div>
                    <button class="action-btn" id="shootLeft">🏀 LEMPAR!</button>
                    <div class="score" id="basketLeftScore">0</div>
                </div>
                <div class="player-zone">
                    <div class="player-name">${playerNames[1]}</div>
                    <button class="action-btn" id="shootRight">🏀 LEMPAR!</button>
                    <div class="score" id="basketRightScore">0</div>
                </div>
            </div>
            <button class="reset-btn" id="resetBasket">🔄 Game Baru</button>
        `;

        const leftBall = container.querySelector("#leftBall");
        const rightBall = container.querySelector("#rightBall");
        const leftScoreEl = container.querySelector("#basketLeftScore");
        const rightScoreEl = container.querySelector("#basketRightScore");

        function shoot(ball, isLeft) {
            if (shooting || !gameActive) return;
            shooting = true;
            ball.style.transition = "all 0.45s cubic-bezier(0.18,0.89,0.32,1.15)";
            ball.style.bottom = "70%";
            ball.style.left = "calc(50% - 35px)";
            ball.style.transform = "scale(0.85) rotate(180deg)";

            setTimeout(() => {
                const isScore = Math.random() < 0.5;
                if (isScore) {
                    if (isLeft) {
                        leftScore++;
                        leftScoreEl.innerText = leftScore;
                        if (leftScore >= 5 && gameActive) {
                            gameActive = false;
                            addWinToGlobal(0);
                            showLeaderboard("basket", playerNames[0]);
                            setTimeout(() => resetGame(), 2000);
                        }
                    } else {
                        rightScore++;
                        rightScoreEl.innerText = rightScore;
                        if (rightScore >= 5 && gameActive) {
                            gameActive = false;
                            addWinToGlobal(1);
                            showLeaderboard("basket", playerNames[1]);
                            setTimeout(() => resetGame(), 2000);
                        }
                    }
                    ball.style.transition = "all 0.3s";
                    ball.style.bottom = "35%";
                    ball.style.transform = "scale(0.6) rotate(360deg)";
                    setTimeout(() => {
                        ball.style.transition = "all 0.25s";
                        ball.style.bottom = "20%";
                        ball.style.left = isLeft ? "10%" : "90%";
                        ball.style.transform = "scale(1)";
                        setTimeout(() => shooting = false, 250);
                    }, 400);
                } else {
                    ball.style.transition = "all 0.2s";
                    ball.style.left = (isLeft ? 20 : 70) + Math.random() * 15 + "%";
                    ball.style.bottom = Math.random() * 40 + 30 + "%";
                    setTimeout(() => {
                        ball.style.transition = "all 0.35s";
                        ball.style.bottom = "10%";
                        ball.style.left = isLeft ? "10%" : "90%";
                        setTimeout(() => {
                            ball.style.transition = "all 0.25s";
                            ball.style.bottom = "20%";
                            ball.style.transform = "scale(1)";
                            setTimeout(() => shooting = false, 250);
                        }, 300);
                    }, 220);
                }
            }, 450);
        }

        function resetGame() {
            leftScore = 0;
            rightScore = 0;
            gameActive = true;
            shooting = false;
            leftScoreEl.innerText = "0";
            rightScoreEl.innerText = "0";
            leftBall.style.cssText = "left:10%; bottom:20%; transform:scale(1); transition: all 0.5s;";
            rightBall.style.cssText = "left:90%; bottom:20%; transform:scale(1); transition: all 0.5s;";
        }

        container.querySelector("#shootLeft").onclick = () => shoot(leftBall, true);
        container.querySelector("#shootRight").onclick = () => shoot(rightBall, false);
        container.querySelector("#resetBasket").onclick = resetGame;
        return container;
    }

    // ========== LOAD GAME & NAVIGASI ==========
    function loadGame(gameId) {
        if (currentGameCleanup) {
            currentGameCleanup();
            currentGameCleanup = null;
        }
        gameArea.innerHTML = "";
        let gameElement;
        switch (gameId) {
            case "tarik-lawan":
                gameElement = initTarikLawan();
                break;
            case "balap-perahu":
                gameElement = initBalapPerahu();
                break;
            case "tarik-seluncur":
                gameElement = initTarikSeluncur();
                break;
            case "tangkap-buah":
                gameElement = initTangkapBuah();
                break;
            case "basket":
                gameElement = initBasket();
                break;
            default:
                return;
        }
        if (gameElement) {
            if (gameElement.cleanup) currentGameCleanup = gameElement.cleanup;
            gameArea.appendChild(gameElement);
        }
        const titles = {
            "tarik-lawan": "⚽ Dorong Bola",
            "balap-perahu": "⛵ Balap Perahu",
            "tarik-seluncur": "🛷 Tarik Seluncur",
            "tangkap-buah": "🍎 Gravitasi Apel",
            "basket": "🏀 Lempar Basket"
        };
        gameTitleBadge.innerText = titles[gameId] || "BERMAIN";
    }

    function showMenu() {
        if (currentGameCleanup) {
            currentGameCleanup();
            currentGameCleanup = null;
        }
        menuContainer.style.display = "flex";
        gameWrapper.style.display = "none";
        if (gameArea) gameArea.innerHTML = "";
        currentGame = null;
    }

    function openGame(gameId) {
        if (currentGameCleanup) {
            currentGameCleanup();
            currentGameCleanup = null;
        }
        currentGame = gameId;
        menuContainer.style.display = "none";
        gameWrapper.style.display = "flex";
        loadGame(gameId);
    }

    function attachGridEvents() {
        document.querySelectorAll(".game-card").forEach(card => {
            card.removeEventListener("click", cardHandler);
            card.addEventListener("click", cardHandler);
        });
    }
    function cardHandler(e) {
        const gameId = this.dataset.game;
        if (gameId) openGame(gameId);
    }
    backToMenuBtn.addEventListener("click", () => showMenu());

    const checkModal = setInterval(() => {
        if (modal.style.display !== "flex") {
            clearInterval(checkModal);
            attachGridEvents();
            showMenu();
        }
    }, 200);
})();
