(function() {
    const twemojiBase = "https://twemoji.maxcdn.com/v/latest/72x72";
    let currentGame = "tarik-lawan";
    let playerNames = ["Pemain 1", "Pemain 2"];
    let globalScores = [0, 0];
    let gamesCompleted = 0;
    const TOTAL_GAMES = 5;

    const gameArea = document.getElementById("game-main-area");
    const modal = document.getElementById("player-modal");
    const leaderboardModal = document.getElementById("leaderboard-modal");
    const finalModal = document.getElementById("final-winner-modal");
    const startBtn = document.getElementById("start-game-btn");
    const closeLeaderboard = document.getElementById("close-leaderboard");
    const resetAllBtn = document.getElementById("reset-all-btn");
    const globalScoreDisplay = document.getElementById("globalScoreDisplay");
    const globalScoreDisplay2 = document.getElementById("globalScoreDisplay2");

    function updateGlobalScoreUI() {
        globalScoreDisplay.innerText = globalScores[0];
        globalScoreDisplay2.innerText = globalScores[1];
    }

    function addWinToGlobal(playerIndex) {
        if (playerIndex === 0) globalScores[0]++;
        else globalScores[1]++;
        updateGlobalScoreUI();
        gamesCompleted++;
        if (gamesCompleted >= TOTAL_GAMES) showFinalWinner();
    }

    function showFinalWinner() {
        let winnerText = "";
        if (globalScores[0] > globalScores[1]) {
            winnerText = `🏆✨ ${playerNames[0]} adalah PEMENANG PETUALANGAN GAYA dengan skor ${globalScores[0]} - ${globalScores[1]}! ✨🏆`;
        } else if (globalScores[1] > globalScores[0]) {
            winnerText = `🏆✨ ${playerNames[1]} adalah PEMENANG PETUALANGAN GAYA dengan skor ${globalScores[1]} - ${globalScores[0]}! ✨🏆`;
        } else {
            winnerText = `🤝 Seri! Kedua pemain hebat dengan skor ${globalScores[0]} - ${globalScores[1]}! 🤝`;
        }
        document.getElementById("finalWinnerText").innerHTML = `<h2>${winnerText}</h2><p>Klik tombol di bawah untuk bermain lagi</p>`;
        finalModal.style.display = "flex";
    }

    function resetAllGames() {
        globalScores = [0, 0];
        gamesCompleted = 0;
        updateGlobalScoreUI();
        finalModal.style.display = "none";
        loadGame(currentGame);
    }
    resetAllBtn.onclick = resetAllGames;

    function showLeaderboard(gameId, winnerName) {
        document.getElementById("leaderboardTitle").innerHTML = `🏆 PEMENANG ${gameId.toUpperCase()} 🏆`;
        document.getElementById("leaderboard-list").innerHTML = `<p>🎉 ${winnerName} memenangkan game ini! 🎉</p>`;
        leaderboardModal.style.display = "flex";
    }
    closeLeaderboard.onclick = () => leaderboardModal.style.display = "none";
    window.addEventListener('click', (e) => {
        if (e.target === leaderboardModal) leaderboardModal.style.display = "none";
    });

    function setupPlayerModal() {
        document.getElementById("player-inputs-container").innerHTML = `
            <input type="text" id="pname_0" placeholder="Nama Pemain Kiri" value="Budi" autocomplete="off">
            <input type="text" id="pname_1" placeholder="Nama Pemain Kanan" value="Ani" autocomplete="off">
        `;
        startBtn.onclick = () => {
            for (let i = 0; i < 2; i++) {
                let val = document.getElementById(`pname_${i}`).value.trim();
                if (val === "") val = `Pemain ${i === 0 ? "Kiri" : "Kanan"}`;
                playerNames[i] = val;
            }
            modal.style.display = "none";
            loadGame(currentGame);
        };
        document.querySelectorAll('#player-inputs-container input').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') startBtn.click();
            });
        });
    }
    modal.style.display = "flex";
    setupPlayerModal();

    // Helper: panel fisika
    function createPhysicsPanel(title, paramsHtml, formulaHtml) {
        const panel = document.createElement("div");
        panel.className = "physics-panel";
        panel.innerHTML = `<h4>📐 ${title}</h4>${paramsHtml}<div class="formula">${formulaHtml}</div>`;
        return panel;
    }

    // ========== GAME 1: TARIK LAWAN (F = m × a)
function initTarikLawan() {
    let posisi = 50, leftScore = 0, rightScore = 0, gameActive = true;
    let lastClickLeft = 0, lastClickRight = 0;
    let massa = 5;
    const container = document.createElement("div");
    container.className = "game-container";
    container.innerHTML = `
        <div class="game-visual" style="background-image: url('background-lapangan-bola.jpg'); background-size: cover; background-position: center;">
            <div class="rope-line"></div>
            <div class="flag-left">🥅</div>
            <div class="flag-right">🥅</div>
            <div id="tarikBall" class="bola-sepak" style="left: calc(50% - 40px);">
                <img src="${twemojiBase}/26bd.png" alt="bola" style="width:80px; height:80px;">
            </div>
        </div>
        <div class="game-controls">
            <div class="player-zone"><div class="player-name">${playerNames[0]}</div><button class="action-btn" id="pullLeftBtn">Tendang!</button><div class="score" id="leftScore">0</div></div>
            <div class="player-zone"><div class="player-name">${playerNames[1]}</div><button class="action-btn" id="pullRightBtn">Tendang!</button><div class="score" id="rightScore">0</div></div>
        </div>
        <button class="reset-btn" id="resetTarik">🔄 Game Baru</button>
    `;
    const ball = container.querySelector("#tarikBall");
    const leftScoreEl = container.querySelector("#leftScore");
    const rightScoreEl = container.querySelector("#rightScore");

    const physicsHtml = `
        <div class="param-row"><label>⚖️ Massa Bola (kg):</label><input type="range" id="massSlider" min="1" max="20" step="0.5" value="5"><span id="massValue" class="live-value">5 kg</span></div>
        <div class="param-row"><span>💪 Gaya Dorong (N):</span><span id="forceLeft" class="live-value">0</span> / <span id="forceRight" class="live-value">0</span></div>
        <div class="param-row"><span>📈 Percepatan (m/s²):</span><span id="accLeft" class="live-value">0</span> / <span id="accRight" class="live-value">0</span></div>
    `;
    const formulaHtml = `🔬 <strong>Rumus Gaya Dorong/Tarik: F = m × a</strong><br>Gaya (F) dari kecepatan klik, massa (m) diatur siswa → a = F/m → gerak bola.`;
    const panel = createPhysicsPanel("GAYA & PERCEPATAN", physicsHtml, formulaHtml);
    container.appendChild(panel);

    const massSlider = panel.querySelector("#massSlider");
    const massValueSpan = panel.querySelector("#massValue");
    const forceLeftSpan = panel.querySelector("#forceLeft");
    const forceRightSpan = panel.querySelector("#forceRight");
    const accLeftSpan = panel.querySelector("#accLeft");
    const accRightSpan = panel.querySelector("#accRight");

    function hitungGayaDanPercepatan(kecepatanKlik, m) {
        let gaya = Math.min(kecepatanKlik * 40, 250);
        let a = gaya / m;
        return { gaya, a };
    }

    function updatePosition(power) {
        posisi = Math.min(Math.max(posisi + power, 0), 100);
        ball.style.left = `calc(${posisi}% - 40px)`;
        if (gameActive) {
            // Bola masuk gawang kanan (posisi >= 97) => Pemain kiri mendapat skor
            if (posisi >= 97) {
                gameActive = false;
                leftScore++;
                leftScoreEl.innerText = leftScore;
                addWinToGlobal(0);
                showLeaderboard("tarik-lawan", playerNames[0]);
                setTimeout(() => resetGame(), 2000);
            } 
            // Bola masuk gawang kiri (posisi <= 3) => Pemain kanan mendapat skor
            else if (posisi <= 3) {
                gameActive = false;
                rightScore++;
                rightScoreEl.innerText = rightScore;
                addWinToGlobal(1);
                showLeaderboard("tarik-lawan", playerNames[1]);
                setTimeout(() => resetGame(), 2000);
            }
        }
    }

    function resetGame() { posisi = 50; gameActive = true; ball.style.left = "calc(50% - 40px)"; }
    function fullReset() { leftScore = 0; rightScore = 0; gameActive = true; posisi = 50; leftScoreEl.innerText = "0"; rightScoreEl.innerText = "0"; ball.style.left = "calc(50% - 40px)"; }

    // Tombol kiri (Budi) -> tendang ke kanan (power positif)
    container.querySelector("#pullLeftBtn").addEventListener('click', () => {
        if (!gameActive) return;
        let now = Date.now();
        let delta = now - lastClickLeft;
        let kecepatanKlik = delta > 0 ? Math.min(1000 / delta, 15) : 5;
        lastClickLeft = now;
        let { gaya, a } = hitungGayaDanPercepatan(kecepatanKlik, massa);
        forceLeftSpan.innerText = gaya.toFixed(1);
        accLeftSpan.innerText = a.toFixed(2);
        let power = Math.min(a * 0.9, 18);   // POSITIF: ke kanan
        updatePosition(power);
    });

    // Tombol kanan (Ani) -> tendang ke kiri (power negatif)
    container.querySelector("#pullRightBtn").addEventListener('click', () => {
        if (!gameActive) return;
        let now = Date.now();
        let delta = now - lastClickRight;
        let kecepatanKlik = delta > 0 ? Math.min(1000 / delta, 15) : 5;
        lastClickRight = now;
        let { gaya, a } = hitungGayaDanPercepatan(kecepatanKlik, massa);
        forceRightSpan.innerText = gaya.toFixed(1);
        accRightSpan.innerText = a.toFixed(2);
        let power = -Math.min(a * 0.9, 18);  // NEGATIF: ke kiri
        updatePosition(power);
    });

    massSlider.addEventListener("input", (e) => {
        massa = parseFloat(e.target.value);
        massValueSpan.innerText = massa + " kg";
    });

    container.querySelector("#resetTarik").onclick = fullReset;
    return container;
}

    // ========== GAME 2: BALAP PERAHU (F_gesek = μ × N) ==========
    function initBalapPerahu() {
        let pos1 = 0, pos2 = 0, raceActive = true;
        let koefGesek = 0.3;
        let gayaNormal = 80;
        const container = document.createElement("div");
        container.className = "game-container";
        container.innerHTML = `
            <div class="game-visual" style="background-image: url('background-lautan.jpg'); background-size: cover; background-position: center;">
                <div id="boat1" class="boat" style="left:0%; bottom: 27%;">
                    <img src="${twemojiBase}/26f5.png" alt="perahu layar" style="width:100px;">
                </div>
                <div id="boat2" class="boat" style="left:0%; bottom: 5%;">
                    <img src="${twemojiBase}/26f5.png" alt="perahu motor" style="width:100px;">
                </div>
                <div style="position:absolute; right:3%; top:45%; background:#e74c3c; color:white; padding:4px 12px; border-radius:20px; z-index:3;">🏁</div>
            </div>
            <div class="game-controls">
                <div class="player-zone"><div class="player-name">${playerNames[0]}</div><button class="action-btn" id="rowLeftBtn">🚣 DAYUNG!</button><div class="score" id="scoreBoat1">0</div></div>
                <div class="player-zone"><div class="player-name">${playerNames[1]}</div><button class="action-btn" id="rowRightBtn">🚣 DAYUNG!</button><div class="score" id="scoreBoat2">0</div></div>
            </div>
            <button class="reset-btn" id="resetBoat">🔄 Balapan Baru</button>
        `;
        const boat1 = container.querySelector("#boat1"), boat2 = container.querySelector("#boat2");
        const score1 = container.querySelector("#scoreBoat1"), score2 = container.querySelector("#scoreBoat2");
        let click1 = 0, click2 = 0;

        const physicsHtml = `
            <div class="param-row"><label>🧴 Koefisien Gesek (μ):</label><input type="range" id="muSlider" min="0" max="1" step="0.01" value="0.3"><span id="muVal" class="live-value">0.30</span></div>
            <div class="param-row"><label>⚖️ Gaya Normal / Berat (N):</label><input type="range" id="normalSlider" min="20" max="200" step="5" value="80"><span id="normalVal" class="live-value">80 N</span></div>
            <div class="param-row"><span>🧲 Gaya Gesek (N):</span><span id="frictionForce" class="live-value">0</span></div>
        `;
        const formulaHtml = `🔬 <strong>Rumus Gaya Gesek: F_gesek = μ × N</strong><br>μ = koefisien gesek, N = gaya normal (berat perahu). Semakin besar F_gesek, perahu makin lambat.`;
        const panel = createPhysicsPanel("GAYA GESEK", physicsHtml, formulaHtml);
        container.appendChild(panel);

        const muSlider = panel.querySelector("#muSlider");
        const normalSlider = panel.querySelector("#normalSlider");
        const muVal = panel.querySelector("#muVal");
        const normalVal = panel.querySelector("#normalVal");
        const frictionSpan = panel.querySelector("#frictionForce");

        function hitungEfektivitas() {
            let gesek = koefGesek * gayaNormal;
            frictionSpan.innerText = gesek.toFixed(2) + " N";
            let efektif = Math.max(0.15, 1 - (gesek) / 120);
            return efektif;
        }

        function updateRace() {
            let p1 = Math.min(pos1, 92), p2 = Math.min(pos2, 92);
            boat1.style.left = `${p1}%`; boat2.style.left = `${p2}%`;
            if (raceActive && p1 >= 90) { raceActive = false; addWinToGlobal(0); showLeaderboard("balap-perahu", playerNames[0]); setTimeout(() => resetRace(), 2000); }
            if (raceActive && p2 >= 90) { raceActive = false; addWinToGlobal(1); showLeaderboard("balap-perahu", playerNames[1]); setTimeout(() => resetRace(), 2000); }
        }

        function resetRace() { pos1=0; pos2=0; click1=0; click2=0; raceActive=true; score1.innerText="0"; score2.innerText="0"; boat1.style.left="0%"; boat2.style.left="0%"; }

        function dayung(arah) {
            if (!raceActive) return;
            let efektif = hitungEfektivitas();
            let jarak = 7 * efektif;
            if (arah === 'kiri') { pos1 += jarak; click1++; score1.innerText = click1; }
            else { pos2 += jarak; click2++; score2.innerText = click2; }
            updateRace();
        }

        container.querySelector("#rowLeftBtn").addEventListener('click', () => dayung('kiri'));
        container.querySelector("#rowRightBtn").addEventListener('click', () => dayung('kanan'));

        muSlider.addEventListener("input", (e) => { koefGesek = parseFloat(e.target.value); muVal.innerText = koefGesek.toFixed(2); hitungEfektivitas(); });
        normalSlider.addEventListener("input", (e) => { gayaNormal = parseFloat(e.target.value); normalVal.innerText = gayaNormal + " N"; hitungEfektivitas(); });

        container.querySelector("#resetBoat").onclick = resetRace;
        hitungEfektivitas();
        return container;
    }

    // ========== GAME 3: TARIK SELUNCUR (F = m × a) ==========
    function initTarikSeluncur() {
        let posisi = 50, leftScore = 0, rightScore = 0, gameActive = true;
        let lastClickLeft = 0, lastClickRight = 0;
        let massa = 8;
        const container = document.createElement("div");
        container.className = "game-container";
        container.innerHTML = `
            <div class="game-visual" style="background-image: url('background-salju.jpg'); background-size: cover; background-position: center;">
                <div id="sled" class="sled" style="left:50%; transform:translateX(-50%);">
                    <img src="${twemojiBase}/1f6f7.png" alt="seluncur" style="width:100px;">
                </div>
                <div id="leftPerson" class="person-pulling" style="left:43%;"><img src="${twemojiBase}/1f9d1.png" style="width:55px;"></div>
                <div id="rightPerson" class="person-pulling" style="left:57%;"><img src="${twemojiBase}/1f9d1-1f3ff.png" style="width:55px;"></div>
                <div id="sledEffect" style="position:absolute; bottom:30px; font-size:28px; left:50%; transform:translateX(-50%); z-index:3;">💨</div>
            </div>
            <div class="game-controls">
                <div class="player-zone"><div class="player-name">${playerNames[0]}</div><button class="action-btn" id="pullLeftSled">⬅️ TARIK</button><div class="score" id="sledScoreLeft">0</div></div>
                <div class="player-zone"><div class="player-name">${playerNames[1]}</div><button class="action-btn" id="pullRightSled">➡️ TARIK</button><div class="score" id="sledScoreRight">0</div></div>
            </div>
            <button class="reset-btn" id="resetSled">🔄 Game Baru</button>
        `;
        const sled = container.querySelector("#sled"), leftPerson = container.querySelector("#leftPerson"), rightPerson = container.querySelector("#rightPerson");
        const effect = container.querySelector("#sledEffect"), leftScoreEl = container.querySelector("#sledScoreLeft"), rightScoreEl = container.querySelector("#sledScoreRight");

        const physicsHtml = `
            <div class="param-row"><label>🛷 Massa Seluncur (kg):</label><input type="range" id="massSled" min="2" max="30" step="1" value="8"><span id="massSledVal" class="live-value">8 kg</span></div>
            <div class="param-row"><span>💪 Gaya Tarik (N):</span><span id="forceLeftSled" class="live-value">0</span> / <span id="forceRightSled" class="live-value">0</span></div>
            <div class="param-row"><span>📈 Percepatan (m/s²):</span><span id="sledAccL" class="live-value">0</span> / <span id="sledAccR" class="live-value">0</span></div>
        `;
        const formulaHtml = `🔬 <strong>Rumus Gaya Dorong/Tarik: F = m × a</strong><br>Gaya (F) dari kecepatan klik, massa (m) diatur siswa → a = F/m → gerak seluncur.`;
        const panel = createPhysicsPanel("DINAMIKA SELUNCUR", physicsHtml, formulaHtml);
        container.appendChild(panel);

        const massSlider = panel.querySelector("#massSled");
        const massVal = panel.querySelector("#massSledVal");
        const forceLeftSpan = panel.querySelector("#forceLeftSled");
        const forceRightSpan = panel.querySelector("#forceRightSled");
        const accLspan = panel.querySelector("#sledAccL");
        const accRspan = panel.querySelector("#sledAccR");

        function hitungGayaDanPercepatan(kecepatanKlik, m) {
            let gaya = Math.min(kecepatanKlik * 45, 260);
            let a = gaya / m;
            return { gaya, a };
        }

        function updateSled(power) {
            posisi = Math.min(Math.max(posisi + power, 0), 100);
            sled.style.left = `${posisi}%`;
            leftPerson.style.left = `${Math.max(posisi-8,2)}%`;
            rightPerson.style.left = `${Math.min(posisi+8,95)}%`;
            if (gameActive) {
                if (posisi <= 5) { gameActive = false; leftScore++; leftScoreEl.innerText = leftScore; addWinToGlobal(0); showLeaderboard("tarik-seluncur", playerNames[0]); setTimeout(() => resetGame(), 2000); }
                if (posisi >= 95) { gameActive = false; rightScore++; rightScoreEl.innerText = rightScore; addWinToGlobal(1); showLeaderboard("tarik-seluncur", playerNames[1]); setTimeout(() => resetGame(), 2000); }
            }
        }

        function resetGame() { posisi=50; gameActive=true; effect.innerText="💨"; updateSled(0); }
        function fullReset() { leftScore=0; rightScore=0; gameActive=true; posisi=50; leftScoreEl.innerText="0"; rightScoreEl.innerText="0"; effect.innerText="💨"; updateSled(0); }

        container.querySelector("#pullLeftSled").addEventListener('click', () => {
            if(!gameActive) return;
            let now = Date.now();
            let delta = now - lastClickLeft;
            let kecepatanKlik = delta > 0 ? Math.min(1000 / delta, 14) : 4;
            lastClickLeft = now;
            let { gaya, a } = hitungGayaDanPercepatan(kecepatanKlik, massa);
            forceLeftSpan.innerText = gaya.toFixed(1);
            accLspan.innerText = a.toFixed(2);
            let power = -Math.min(a * 0.8, 16);
            updateSled(power);
            effect.innerText = "⬅️💨"; setTimeout(()=>effect.innerText="💨",400);
        });
        container.querySelector("#pullRightSled").addEventListener('click', () => {
            if(!gameActive) return;
            let now = Date.now();
            let delta = now - lastClickRight;
            let kecepatanKlik = delta > 0 ? Math.min(1000 / delta, 14) : 4;
            lastClickRight = now;
            let { gaya, a } = hitungGayaDanPercepatan(kecepatanKlik, massa);
            forceRightSpan.innerText = gaya.toFixed(1);
            accRspan.innerText = a.toFixed(2);
            let power = Math.min(a * 0.8, 16);
            updateSled(power);
            effect.innerText = "💨➡️"; setTimeout(()=>effect.innerText="💨",400);
        });
        massSlider.addEventListener("input", (e) => { massa = parseFloat(e.target.value); massVal.innerText = massa + " kg"; });
        container.querySelector("#resetSled").onclick = fullReset;
        updateSled(0);
        return container;
    }

// ========== GAME 4: TANGKAP APEL (Gravitasi lebih lambat, tidak lag) ==========
function initTangkapBuah() {
    let leftScore = 0, rightScore = 0, gameActive = true;
    let gravitasi = 9.8;
    let activeApples = [];
    let animationId = null;
    let lastFrame = 0;
    let spawnInterval = null;
    
    const container = document.createElement("div");
    container.className = "game-container";
    container.innerHTML = `
        <div class="game-visual" style="background-image: url('background-hutan.jpg'); background-size: 100%; background-position: center; position: relative;">
            <div style="position:absolute; left:0; width:50%; height:100%; border-right:3px dashed rgba(255,255,255,0.5); pointer-events:none; z-index:1;"></div>
            <div id="leftCatcher" class="apple-catcher" style="left:20%;"><img src="${twemojiBase}/1f9fa.png" style="width:55px;"></div>
            <div id="rightCatcher" class="apple-catcher" style="left:70%;"><img src="${twemojiBase}/1f9fa.png" style="width:55px;"></div>
            <div style="position:absolute; left:14%; top:6%; background:rgba(0,0,0,0.6); color:white; padding:4px 14px; border-radius:20px; font-weight:bold;">${playerNames[0]}</div>
            <div style="position:absolute; left:64%; top:6%; background:rgba(0,0,0,0.6); color:white; padding:4px 14px; border-radius:20px; font-weight:bold;">${playerNames[1]}</div>
        </div>
        <div class="game-controls">
            <div class="player-zone"><div class="player-name">${playerNames[0]}</div><div class="score" id="appleLeftScore">0</div><div>🍎</div></div>
            <div class="player-zone"><div class="player-name">${playerNames[1]}</div><div class="score" id="appleRightScore">0</div><div>🍏</div></div>
        </div>
        <button class="reset-btn" id="resetApple">🔄 Game Baru</button>
    `;

    const visual = container.querySelector(".game-visual");
    const leftScoreEl = container.querySelector("#appleLeftScore");
    const rightScoreEl = container.querySelector("#appleRightScore");
    const leftCatcher = container.querySelector("#leftCatcher");
    const rightCatcher = container.querySelector("#rightCatcher");
    
    let leftTargetPercent = 20;
    let rightTargetPercent = 70;
    let leftCurrentPercent = 20;
    let rightCurrentPercent = 70;
    let leftTouchId = null, rightTouchId = null;
    
    function updateCatcherPositions() {
        leftCatcher.style.left = leftCurrentPercent + "%";
        rightCatcher.style.left = rightCurrentPercent + "%";
    }
    
    let leftRAF = null, rightRAF = null;
    function setLeftPosition(percent) {
        leftTargetPercent = Math.min(48, Math.max(3, percent));
        if (leftRAF) return;
        leftRAF = requestAnimationFrame(() => {
            leftCurrentPercent = leftTargetPercent;
            updateCatcherPositions();
            leftRAF = null;
        });
    }
    function setRightPosition(percent) {
        rightTargetPercent = Math.min(97, Math.max(52, percent));
        if (rightRAF) return;
        rightRAF = requestAnimationFrame(() => {
            rightCurrentPercent = rightTargetPercent;
            updateCatcherPositions();
            rightRAF = null;
        });
    }
    
    visual.addEventListener("mousemove", (e) => {
        const rect = visual.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let percent = (x / rect.width) * 100;
        if (percent < 50) {
            setLeftPosition(percent);
        } else {
            setRightPosition(percent);
        }
    });
    
    visual.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const rect = visual.getBoundingClientRect();
        for (let t of e.changedTouches) {
            let x = t.clientX - rect.left;
            let percent = (x / rect.width) * 100;
            if (percent < 50 && leftTouchId === null) {
                leftTouchId = t.identifier;
                setLeftPosition(percent);
            } else if (percent >= 50 && rightTouchId === null) {
                rightTouchId = t.identifier;
                setRightPosition(percent);
            }
        }
    }, {passive: false});
    
    visual.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const rect = visual.getBoundingClientRect();
        for (let t of e.touches) {
            let x = t.clientX - rect.left;
            let percent = (x / rect.width) * 100;
            if (t.identifier === leftTouchId) {
                setLeftPosition(percent);
            } else if (t.identifier === rightTouchId) {
                setRightPosition(percent);
            }
        }
    }, {passive: false});
    
    visual.addEventListener("touchend", (e) => {
        for (let t of e.changedTouches) {
            if (t.identifier === leftTouchId) leftTouchId = null;
            if (t.identifier === rightTouchId) rightTouchId = null;
        }
    });
    
    const physicsHtml = `
        <div class="param-row"><label>🌍 Gravitasi (m/s²):</label><input type="range" id="gravSlider" min="2" max="25" step="0.5" value="9.8"><span id="gravVal" class="live-value">9.8 m/s²</span></div>
        <div class="param-row"><span>📉 Kecepatan Jatuh (px/s):</span><span id="fallSpeed" class="live-value">0</span></div>
    `;
    const formulaHtml = `🔬 <strong>Rumus Gerak Jatuh Bebas: h = ½·g·t², v = g·t</strong><br>Gravitasi (g) mempengaruhi kecepatan jatuh apel.`;
    const panel = createPhysicsPanel("GRAVITASI", physicsHtml, formulaHtml);
    container.appendChild(panel);
    const gravSlider = panel.querySelector("#gravSlider");
    const gravVal = panel.querySelector("#gravVal");
    const fallSpeedSpan = panel.querySelector("#fallSpeed");
    
    gravSlider.addEventListener("input", (e) => {
        gravitasi = parseFloat(e.target.value);
        gravVal.innerText = gravitasi + " m/s²";
    });
    
    function spawnApple() {
        if (!gameActive) return;
        const side = Math.random() < 0.5 ? "left" : "right";
        const appleDiv = document.createElement("div");
        appleDiv.className = "falling-ball";
        appleDiv.innerHTML = `<img src="${twemojiBase}/${side==='left'?'1f34e':'1f34f'}.png" style="width:100%;">`;
        const leftRange = side === "left" ? [5, 45] : [55, 95];
        const leftPos = leftRange[0] + Math.random() * (leftRange[1] - leftRange[0]);
        appleDiv.style.left = leftPos + "%";
        appleDiv.style.top = "0px";
        visual.appendChild(appleDiv);
        
        let y = 0, vy = 0;
        const updateApple = (deltaTimeSec) => {
            if (!appleDiv.parentNode) return false;
            vy += gravitasi * deltaTimeSec;
            // SKALA DITURUNKAN DARI 55 MENJADI 30 AGAR GRAVITASI NORMAL TIDAK TERLALU CEPAT
            y += vy * deltaTimeSec * 30;
            appleDiv.style.top = y + "px";
            
            const aRect = appleDiv.getBoundingClientRect();
            const catcher = side === "left" ? leftCatcher : rightCatcher;
            if (catcher) {
                const cRect = catcher.getBoundingClientRect();
                if (aRect.bottom >= cRect.top && aRect.right > cRect.left && aRect.left < cRect.right && aRect.top < cRect.bottom) {
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
            }
            if (y > visual.clientHeight - 60) {
                appleDiv.remove();
                return false;
            }
            return true;
        };
        activeApples.push({ div: appleDiv, update: updateApple, vy: vy });
    }
    
    let lastTimestamp = 0;
    function animateApples(nowMs) {
        if (!gameActive && activeApples.length === 0) {
            if (animationId) cancelAnimationFrame(animationId);
            animationId = null;
            return;
        }
        let deltaSec = Math.min(0.033, (nowMs - (lastTimestamp || nowMs)) / 1000);
        lastTimestamp = nowMs;
        if (deltaSec > 0.001) {
            for (let i = activeApples.length-1; i >= 0; i--) {
                const keep = activeApples[i].update(deltaSec);
                if (!keep) activeApples.splice(i,1);
            }
            if (activeApples.length > 0 && gameActive) {
                let sampleVy = activeApples[0].vy;
                fallSpeedSpan.innerText = (sampleVy * 30).toFixed(1) + " px/s"; // sesuaikan skala display
            }
        }
        animationId = requestAnimationFrame(animateApples);
    }
    
    function resetGame() {
        if (animationId) cancelAnimationFrame(animationId);
        activeApples.forEach(a => a.div.remove());
        activeApples = [];
        leftScore = 0;
        rightScore = 0;
        gameActive = true;
        leftScoreEl.innerText = "0";
        rightScoreEl.innerText = "0";
        leftCurrentPercent = 20;
        rightCurrentPercent = 70;
        updateCatcherPositions();
        leftTargetPercent = 20;
        rightTargetPercent = 70;
        lastTimestamp = 0;
        animationId = requestAnimationFrame(animateApples);
        if (spawnInterval) clearInterval(spawnInterval);
        spawnInterval = setInterval(() => {
            if (gameActive) spawnApple();
        }, 1000);
    }
    
    resetGame();
    container.querySelector("#resetApple").onclick = resetGame;
    return container;
}

// ========== GAME 5: LEMPAR BASKET (chance 50%, efek pantulan random) ==========
function initBasket() {
    let leftScore = 0, rightScore = 0, gameActive = true, shooting = false;
    const container = document.createElement("div");
    container.className = "game-container";
    container.innerHTML = `
        <div class="game-visual" style="background-image: url('background-lapangan-basket.jpg'); background-size: 55%; background-position: center;">
            <div id="leftBall" class="basketball-player" style="left:10%; bottom:20%;">
                <img src="${twemojiBase}/1f3c0.png" alt="bola" style="width:70px;">
            </div>
            <div id="rightBall" class="basketball-player" style="left:90%; bottom:20%;">
                <img src="${twemojiBase}/1f3c0.png" alt="bola" style="width:70px;">
            </div>
            <div style="position:absolute; bottom:8%; left:8%; background:rgba(255,255,255,0.9); padding:4px 16px; border-radius:30px; font-weight:bold;">${playerNames[0]}</div>
            <div style="position:absolute; bottom:8%; left:70%; background:rgba(255,255,255,0.9); padding:4px 16px; border-radius:30px; font-weight:bold;">${playerNames[1]}</div>
        </div>
        <div class="game-controls">
            <div class="player-zone"><div class="player-name">${playerNames[0]}</div><button class="action-btn" id="shootLeft">🏀 LEMPAR!</button><div class="score" id="basketLeftScore">0</div></div>
            <div class="player-zone"><div class="player-name">${playerNames[1]}</div><button class="action-btn" id="shootRight">🏀 LEMPAR!</button><div class="score" id="basketRightScore">0</div></div>
        </div>
        <button class="reset-btn" id="resetBasket">🔄 Game Baru</button>
    `;

    const leftBall = container.querySelector("#leftBall");
    const rightBall = container.querySelector("#rightBall");
    const leftScoreEl = container.querySelector("#basketLeftScore");
    const rightScoreEl = container.querySelector("#basketRightScore");
    const visual = container.querySelector(".game-visual");

    function showEffectText(text, isGood) {
        const div = document.createElement("div");
        div.textContent = text;
        div.style.position = "absolute";
        div.style.left = "50%";
        div.style.top = "40%";
        div.style.transform = "translate(-50%, -50%)";
        div.style.fontSize = "2.5rem";
        div.style.fontWeight = "bold";
        div.style.color = isGood ? "gold" : "red";
        div.style.textShadow = "2px 2px 4px black";
        div.style.zIndex = "100";
        div.style.pointerEvents = "none";
        div.style.whiteSpace = "nowrap";
        div.style.fontFamily = "monospace";
        visual.appendChild(div);
        setTimeout(() => div.remove(), 800);
    }

    function shoot(ball, isLeft) {
        if (shooting || !gameActive) return;
        shooting = true;
        // Reset posisi dan transisi
        ball.style.transition = "none";
        ball.style.bottom = "20%";
        ball.style.left = isLeft ? "10%" : "90%";
        ball.style.transform = "scale(1) rotate(0deg)";
        ball.offsetHeight; // force reflow
        // Animasi lemparan ke ring
        ball.style.transition = "all 0.45s cubic-bezier(0.18,0.89,0.32,1.15)";
        ball.style.bottom = "70%";
        ball.style.left = "calc(50% - 35px)";
        ball.style.transform = "scale(0.85) rotate(180deg)";
        ball.style.zIndex = "15";

        setTimeout(() => {
            // CHANCE 50%
            const isScore = Math.random() < 0.5;
            if (isScore) {
                // SKOR MASUK
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
                ball.style.transition = "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)";
                ball.style.bottom = "35%";
                ball.style.transform = "scale(0.6) rotate(360deg)";
                showEffectText("🏆 SWISH! 🏆", true);
                setTimeout(() => {
                    ball.style.transition = "all 0.25s ease-out";
                    ball.style.bottom = "20%";
                    ball.style.left = isLeft ? "10%" : "90%";
                    ball.style.transform = "scale(1) rotate(0deg)";
                    ball.style.zIndex = "8";
                    setTimeout(() => {
                        ball.style.transition = "all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)";
                        shooting = false;
                    }, 250);
                }, 400);
            } else {
                // MELESET: pantulan random
                showEffectText("❌ MELESET! ❌", false);
                const randomX = isLeft ? (Math.random() * 30 + 15) : (Math.random() * 30 + 55);
                const randomY = Math.random() * 40 + 30;
                // Pantulan pertama (kena ring)
                ball.style.transition = "all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1)";
                ball.style.left = randomX + "%";
                ball.style.bottom = randomY + "%";
                ball.style.transform = "scale(0.8) rotate(" + (Math.random() * 180 - 90) + "deg)";
                // Jatuh ke lantai
                setTimeout(() => {
                    ball.style.transition = "all 0.35s cubic-bezier(0.4, 0, 0.6, 1)";
                    ball.style.bottom = "10%";
                    ball.style.left = isLeft ? "10%" : "90%";
                    ball.style.transform = "scale(0.9) rotate(" + (Math.random() * 360) + "deg)";
                    // Kembali ke posisi awal
                    setTimeout(() => {
                        ball.style.transition = "all 0.25s ease-out";
                        ball.style.bottom = "20%";
                        ball.style.left = isLeft ? "10%" : "90%";
                        ball.style.transform = "scale(1) rotate(0deg)";
                        ball.style.zIndex = "8";
                        setTimeout(() => {
                            ball.style.transition = "all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)";
                            shooting = false;
                        }, 250);
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
        leftBall.style.cssText = "left:10%; bottom:20%; transform: scale(1) rotate(0deg); z-index:8; transition: all 0.5s;";
        rightBall.style.cssText = "left:90%; bottom:20%; transform: scale(1) rotate(0deg); z-index:8; transition: all 0.5s;";
        // Hapus efek teks yang tertinggal
        document.querySelectorAll("#game-main-area .game-visual > div:not(.basketball-player)").forEach(el => el.remove());
    }

    container.querySelector("#shootLeft").addEventListener('click', () => shoot(leftBall, true));
    container.querySelector("#shootRight").addEventListener('click', () => shoot(rightBall, false));
    container.querySelector("#resetBasket").onclick = resetGame;
    return container;
}

    function loadGame(gameId) {
        currentGame = gameId;
        gameArea.innerHTML = "";
        let gameElement;
        switch (gameId) {
            case "tarik-lawan": gameElement = initTarikLawan(); break;
            case "balap-perahu": gameElement = initBalapPerahu(); break;
            case "tarik-seluncur": gameElement = initTarikSeluncur(); break;
            case "tangkap-buah": gameElement = initTangkapBuah(); break;
            case "basket": gameElement = initBasket(); break;
        }
        if (gameElement) gameArea.appendChild(gameElement);
    }

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            loadGame(btn.dataset.game);
        });
    });

    loadGame("tarik-lawan");
})();
