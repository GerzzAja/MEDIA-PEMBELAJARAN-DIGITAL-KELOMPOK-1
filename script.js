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

    // ========== GAME 1: TARIK LAWAN (Lapangan Bola) ==========
    function initTarikLawan() {
        let posisi = 50, leftScore = 0, rightScore = 0, gameActive = true, power = 0;
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
                <div class="player-zone"><div class="player-name">${playerNames[1]}</div><button class="action-btn" id="pullRightBtn">Te!</button><div class="score" id="rightScore">0</div></div>
            </div>
            <button class="reset-btn" id="resetTarik">🔄 Game Baru</button>
        `;

        const ball = container.querySelector("#tarikBall");
        const leftScoreEl = container.querySelector("#leftScore");
        const rightScoreEl = container.querySelector("#rightScore");

        function updatePosition() {
            posisi = Math.min(Math.max(posisi + power, 0), 100);
            ball.style.left = `calc(${posisi}% - 40px)`;
            if (gameActive) {
                if (posisi <= 3) {
                    gameActive = false; leftScore++; leftScoreEl.innerText = leftScore;
                    addWinToGlobal(0); showLeaderboard("tarik-lawan", playerNames[0]);
                    setTimeout(() => resetGame(), 2000);
                } else if (posisi >= 97) {
                    gameActive = false; rightScore++; rightScoreEl.innerText = rightScore;
                    addWinToGlobal(1); showLeaderboard("tarik-lawan", playerNames[1]);
                    setTimeout(() => resetGame(), 2000);
                }
            }
            power = 0;
        }

        function resetGame() { posisi = 50; gameActive = true; ball.style.left = "calc(50% - 40px)"; }
        function fullReset() { leftScore = 0; rightScore = 0; gameActive = true; posisi = 50; leftScoreEl.innerText = "0"; rightScoreEl.innerText = "0"; ball.style.left = "calc(50% - 40px)"; }

        container.querySelector("#pullLeftBtn").addEventListener('click', () => { if(gameActive){ power = -12; updatePosition(); } });
        container.querySelector("#pullRightBtn").addEventListener('click', () => { if(gameActive){ power = 12; updatePosition(); } });
        container.querySelector("#resetTarik").onclick = fullReset;
        return container;
    }

    // ========== GAME 2: BALAP PERAHU (Lautan) ==========
    function initBalapPerahu() {
        let pos1 = 0, pos2 = 0, raceActive = true;
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
        function updateRace() {
            let p1 = Math.min(pos1, 92), p2 = Math.min(pos2, 92);
            boat1.style.left = `${p1}%`; boat2.style.left = `${p2}%`;
            if (raceActive && p1 >= 90) { raceActive = false; addWinToGlobal(0); showLeaderboard("balap-perahu", playerNames[0]); setTimeout(() => resetRace(), 2000); }
            if (raceActive && p2 >= 90) { raceActive = false; addWinToGlobal(1); showLeaderboard("balap-perahu", playerNames[1]); setTimeout(() => resetRace(), 2000); }
        }
        function resetRace() { pos1=0; pos2=0; click1=0; click2=0; raceActive=true; score1.innerText="0"; score2.innerText="0"; boat1.style.left="0%"; boat2.style.left="0%"; }
        container.querySelector("#rowLeftBtn").addEventListener('click', () => { if(raceActive){ pos1+=6; click1++; score1.innerText=click1; updateRace(); } });
        container.querySelector("#rowRightBtn").addEventListener('click', () => { if(raceActive){ pos2+=6; click2++; score2.innerText=click2; updateRace(); } });
        container.querySelector("#resetBoat").onclick = resetRace;
        return container;
    }

    // ========== GAME 3: TARIK SELUNCUR (Salju) ==========
    function initTarikSeluncur() {
        let posisi = 50, leftScore = 0, rightScore = 0, gameActive = true;
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
        function updateSled() {
            sled.style.left = `${posisi}%`;
            leftPerson.style.left = `${Math.max(posisi-8,2)}%`;
            rightPerson.style.left = `${Math.min(posisi+8,95)}%`;
            if (gameActive) {
                if (posisi <= 5) { gameActive = false; leftScore++; leftScoreEl.innerText = leftScore; addWinToGlobal(0); showLeaderboard("tarik-seluncur", playerNames[0]); setTimeout(() => resetGame(), 2000); }
                if (posisi >= 95) { gameActive = false; rightScore++; rightScoreEl.innerText = rightScore; addWinToGlobal(1); showLeaderboard("tarik-seluncur", playerNames[1]); setTimeout(() => resetGame(), 2000); }
            }
        }
        function resetGame() { posisi=50; gameActive=true; effect.innerText="💨"; updateSled(); }
        function fullReset() { leftScore=0; rightScore=0; gameActive=true; posisi=50; leftScoreEl.innerText="0"; rightScoreEl.innerText="0"; effect.innerText="💨"; updateSled(); }
        container.querySelector("#pullLeftSled").addEventListener('click', () => { if(gameActive){ posisi=Math.max(0,posisi-9); effect.innerText="⬅️💨"; updateSled(); setTimeout(()=>effect.innerText="💨",400); } });
        container.querySelector("#pullRightSled").addEventListener('click', () => { if(gameActive){ posisi=Math.min(100,posisi+9); effect.innerText="💨➡️"; updateSled(); setTimeout(()=>effect.innerText="💨",400); } });
        container.querySelector("#resetSled").onclick = fullReset;
        updateSled();
        return container;
    }

    // ========== GAME 4: TANGKAP APEL (Hutan) ==========
    function initTangkapBuah() {
        let leftScore = 0, rightScore = 0, gameActive = true, spawnInterval, activeIntervals = [];
        const container = document.createElement("div");
        container.className = "game-container";
        container.innerHTML = `
            <div class="game-visual" style="background-image: url('background-hutan.jpg'); background-size: 100%; background-position: center;">
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
        const visual = container.querySelector(".game-visual"), leftScoreEl = container.querySelector("#appleLeftScore"), rightScoreEl = container.querySelector("#appleRightScore");
        const leftCatcher = container.querySelector("#leftCatcher"), rightCatcher = container.querySelector("#rightCatcher");
        let leftX = 20, rightX = 70, leftTouchId = null, rightTouchId = null;
        function moveLeft(x) { leftX = Math.min(48, Math.max(3, (x / visual.clientWidth) * 100)); leftCatcher.style.left = `${leftX}%`; }
        function moveRight(x) { rightX = Math.min(97, Math.max(52, (x / visual.clientWidth) * 100)); rightCatcher.style.left = `${rightX}%`; }
        visual.addEventListener("mousemove", (e) => { let x = e.clientX - visual.getBoundingClientRect().left; x < visual.clientWidth/2 ? moveLeft(x) : moveRight(x); });
        visual.addEventListener("touchstart", (e) => { e.preventDefault(); for (let t of e.changedTouches) { let x = t.clientX - visual.getBoundingClientRect().left; if (x < visual.clientWidth/2 && leftTouchId===null) { leftTouchId=t.identifier; moveLeft(x); } else if (x >= visual.clientWidth/2 && rightTouchId===null) { rightTouchId=t.identifier; moveRight(x); } } }, {passive: false});
        visual.addEventListener("touchmove", (e) => { e.preventDefault(); for (let t of e.touches) { let x = t.clientX - visual.getBoundingClientRect().left; if (t.identifier === leftTouchId) moveLeft(x); else if (t.identifier === rightTouchId) moveRight(x); } }, {passive: false});
        visual.addEventListener("touchend", (e) => { for (let t of e.changedTouches) { if (t.identifier === leftTouchId) leftTouchId=null; if (t.identifier === rightTouchId) rightTouchId=null; } });
        function spawnApple() {
            if (!gameActive) return;
            const side = Math.random() < 0.5 ? "left" : "right";
            const apple = document.createElement("div");
            apple.className = "falling-ball";
            apple.innerHTML = `<img src="${twemojiBase}/${side==='left'?'1f34e':'1f34f'}.png" style="width:100%;">`;
            apple.style.left = (side==="left" ? Math.random()*40+5 : Math.random()*40+55) + "%";
            apple.style.top = "0px";
            visual.appendChild(apple);
            let y = 0;
            const fall = setInterval(() => {
                y += 4; apple.style.top = y + "px";
                const aR = apple.getBoundingClientRect(), cR = (side==="left"?leftCatcher:rightCatcher).getBoundingClientRect();
                if (aR.bottom >= cR.top && aR.right > cR.left && aR.left < cR.right && aR.top < cR.bottom) {
                    clearInterval(fall); apple.remove();
                    if (side === "left") { leftScore++; leftScoreEl.innerText = leftScore; if (leftScore>=8 && gameActive) { gameActive=false; addWinToGlobal(0); showLeaderboard("tangkap-buah", playerNames[0]); setTimeout(()=>resetGame(),2000); } }
                    else { rightScore++; rightScoreEl.innerText = rightScore; if (rightScore>=8 && gameActive) { gameActive=false; addWinToGlobal(1); showLeaderboard("tangkap-buah", playerNames[1]); setTimeout(()=>resetGame(),2000); } }
                }
                if (y > visual.clientHeight - 60) { clearInterval(fall); apple.remove(); }
            }, 28);
            activeIntervals.push(fall);
        }
        function resetGame() {
            activeIntervals.forEach(clearInterval); activeIntervals = [];
            if (spawnInterval) clearInterval(spawnInterval);
            document.querySelectorAll(".falling-ball").forEach(a => a.remove());
            leftScore = 0; rightScore = 0; gameActive = true;
            leftScoreEl.innerText = "0"; rightScoreEl.innerText = "0";
            leftTouchId = null; rightTouchId = null;
            spawnInterval = setInterval(() => { if(gameActive) spawnApple(); }, 850);
            activeIntervals.push(spawnInterval);
        }
        resetGame();
        container.querySelector("#resetApple").onclick = resetGame;
        return container;
    }

    // ========== GAME 5: LEMPAR BASKET (Lapangan Basket dengan ring dari gambar) ==========
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
        const leftBall = container.querySelector("#leftBall"), rightBall = container.querySelector("#rightBall");
        const leftScoreEl = container.querySelector("#basketLeftScore"), rightScoreEl = container.querySelector("#basketRightScore");

        function shoot(ball, isLeft) {
            if (shooting || !gameActive) return;
            shooting = true;
            ball.style.transition = "all 0.45s cubic-bezier(0.18,0.89,0.32,1.15)";
            ball.style.bottom = "70%";
            ball.style.left = "calc(50% - 35px)";
            ball.style.transform = "scale(0.85) rotate(180deg)";
            ball.style.zIndex = "15";

            setTimeout(() => {
                const isScore = Math.random() < 0.6;
                if (isScore) {
                    if (isLeft) { leftScore++; leftScoreEl.innerText = leftScore; if (leftScore>=5 && gameActive) { gameActive=false; addWinToGlobal(0); showLeaderboard("basket", playerNames[0]); setTimeout(()=>resetGame(),2000); } }
                    else { rightScore++; rightScoreEl.innerText = rightScore; if (rightScore>=5 && gameActive) { gameActive=false; addWinToGlobal(1); showLeaderboard("basket", playerNames[1]); setTimeout(()=>resetGame(),2000); } }
                    ball.style.bottom = "35%";
                    ball.style.transform = "scale(0.6) rotate(360deg)";
                } else {
                    ball.style.bottom = "10%";
                    ball.style.left = isLeft ? "16%" : "72%";
                    ball.style.transform = "scale(0.9) rotate(90deg)";
                }
                setTimeout(() => {
                    ball.style.transition = "all 0.25s ease-out";
                    ball.style.bottom = "20%";
                    ball.style.left = isLeft ? "10%" : "90%";
                    ball.style.transform = "scale(1) rotate(0deg)";
                    ball.style.zIndex = "8";
                    setTimeout(() => { ball.style.transition = "all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)"; shooting = false; }, 250);
                }, 400);
            }, 450);
        }

        function resetGame() {
            leftScore = 0; rightScore = 0; gameActive = true; shooting = false;
            leftScoreEl.innerText = "0"; rightScoreEl.innerText = "0";
            leftBall.style.cssText = "left:10%; bottom:20%; transform: scale(1) rotate(0deg); z-index:8; transition: all 0.5s;";
            rightBall.style.cssText = "left:90%; bottom:20%; transform: scale(1) rotate(0deg); z-index:8; transition: all 0.5s;";
        }

        container.querySelector("#shootLeft").addEventListener('click', () => shoot(leftBall, true));
        container.querySelector("#shootRight").addEventListener('click', () => shoot(rightBall, false));
        container.querySelector("#resetBasket").onclick = resetGame;
        return container;
    }

    // ========== LOAD GAME ==========
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