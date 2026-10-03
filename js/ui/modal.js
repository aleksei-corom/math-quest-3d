// Sistema de dialogo in-game - aparece como panel inferior estilo Minecraft NPC
const Modal = {
    currentCallback: null,
    timerInterval: null,
    timeRemaining: 0,
    selectedChoice: null,
    isDialogOpen: false,
    answered: false,

    init() {
        this.createDialog();
        this.setupEventListeners();
    },

    createDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'game-dialog';
        dialog.className = 'game-dialog hidden';
        dialog.innerHTML = `
            <div class="dialog-panel" id="dialog-panel">
                <div class="dialog-header">
                    <span class="dialog-npc-name">📚 Sabio del Mundo</span>
                    <span id="dialog-timer" class="dialog-timer hidden">30s</span>
                </div>
                <div class="dialog-body">
                    <p id="dialog-question-text" class="dialog-question"></p>
                    <div id="dialog-choices" class="dialog-choices hidden"></div>
                    <div id="dialog-input-area" class="dialog-input-area hidden">
                        <input type="text" id="dialog-answer-input" placeholder="Escribe tu respuesta...">
                        <button id="dialog-submit-btn">Verificar</button>
                    </div>
                    <div id="dialog-feedback" class="dialog-feedback"></div>
                    <div id="dialog-correct-answer" class="dialog-correct-answer hidden"></div>
                    <div id="dialog-hint-text" class="dialog-hint hidden"></div>
                    <div class="dialog-actions">
                        <button id="dialog-hint-btn" class="dialog-btn-secondary">💡 Pista</button>
                        <button id="dialog-continue-btn" class="dialog-btn-primary hidden">▶ Continuar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        this.dialogEl = dialog;
        this.panelEl = document.getElementById('dialog-panel');
    },

    setupEventListeners() {
        document.getElementById('dialog-submit-btn').addEventListener('click', () => this.verifyAnswer());
        document.getElementById('dialog-answer-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.verifyAnswer();
        });
        document.getElementById('dialog-hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('dialog-continue-btn').addEventListener('click', () => this.closeDialog());
    },

    showQuestion(question, callback) {
        this.currentCallback = callback;
        this.selectedChoice = null;
        this.isDialogOpen = true;
        this.answered = false;

        if (document.pointerLockElement) document.exitPointerLock();

        // Pregunta
        document.getElementById('dialog-question-text').textContent = question.q;

        // Limpiar estado
        const f = document.getElementById('dialog-feedback');
        f.textContent = '';
        f.className = 'dialog-feedback';
        f.style.display = 'none';
        document.getElementById('dialog-correct-answer').classList.add('hidden');
        document.getElementById('dialog-hint-text').classList.add('hidden');

        // Resetear panel borde
        if (this.panelEl) {
            this.panelEl.style.borderColor = 'rgba(74, 222, 128, 0.4)';
        }

        // Botones: solo mostrar Pista al inicio
        document.getElementById('dialog-continue-btn').classList.add('hidden');
        document.getElementById('dialog-hint-btn').classList.remove('hidden');

        const choicesEl = document.getElementById('dialog-choices');
        const inputArea = document.getElementById('dialog-input-area');

        if (question.type === 'choice' && question.options) {
            choicesEl.classList.remove('hidden');
            inputArea.classList.add('hidden');
            choicesEl.innerHTML = '';

            question.options.forEach((opt) => {
                const btn = document.createElement('button');
                btn.className = 'dialog-choice-btn';
                btn.textContent = opt;
                btn.dataset.value = opt;
                btn.onclick = () => {
                    if (this.answered) return;
                    choicesEl.querySelectorAll('.dialog-choice-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    this.selectedChoice = opt;
                    AudioSystem.play('click');
                    this.verifyAnswer(); // Fix: verificar automáticamente al elegir opción
                };
                choicesEl.appendChild(btn);
            });
        } else {
            choicesEl.classList.add('hidden');
            inputArea.classList.remove('hidden');
            document.getElementById('dialog-answer-input').value = '';
        }

        // Mostrar dialogo
        this.dialogEl.classList.remove('hidden');
        this.dialogEl.classList.add('dialog-enter');
        setTimeout(() => this.dialogEl.classList.remove('dialog-enter'), 400);

        // Timer
        if (window.GameState && GameState.mode === 'timed') {
            this.startTimer();
        }

        setTimeout(() => {
            if (question.type !== 'choice') {
                document.getElementById('dialog-answer-input').focus();
            }
        }, 100);

        AudioSystem.play('click');
    },

    startTimer() {
        this.clearTimer();
        this.timeRemaining = CONFIG.TIMED_MODE.TIME_PER_QUESTION;
        const t = document.getElementById('dialog-timer');
        if (t) {
            t.classList.remove('hidden');
            t.textContent = this.timeRemaining + 's';
            t.style.color = '#4ade80';
        }
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            if (t) t.textContent = this.timeRemaining + 's';
            if (this.timeRemaining <= 10 && t) t.style.color = '#fbbf24';
            if (this.timeRemaining <= 5 && t) t.style.color = '#ef4444';
            if (this.timeRemaining <= 0) {
                this.clearTimer();
                this.onTimeUp();
            }
        }, 1000);
    },

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        const t = document.getElementById('dialog-timer');
        if (t) { t.classList.add('hidden'); t.style.color = ''; }
    },

    onTimeUp() {
        if (this.answered) return;
        this.answered = true;

        const f = document.getElementById('dialog-feedback');
        f.textContent = '⏱️ ¡Tiempo agotado!';
        f.className = 'dialog-feedback incorrect';
        f.style.display = 'block';

        // Mostrar respuesta correcta
        if (QuestionManager.currentQuestion) {
            const ca = document.getElementById('dialog-correct-answer');
            ca.textContent = '💡 Respuesta correcta: ' + QuestionManager.currentQuestion.a;
            ca.classList.remove('hidden');
        }

        this.disableChoices();
        AudioSystem.play('wrong');
        TicketSystem.onWrongAnswer();

        // Cambiar borde del panel a rojo
        if (this.panelEl) this.panelEl.style.borderColor = '#ef4444';

        // SIEMPRE mostrar continuar
        document.getElementById('dialog-continue-btn').classList.remove('hidden');
        document.getElementById('dialog-hint-btn').classList.add('hidden');
    },

    verifyAnswer() {
        if (this.answered) return;

        const userAnswer = this.selectedChoice || document.getElementById('dialog-answer-input').value.trim();
        const f = document.getElementById('dialog-feedback');

        if (!userAnswer) {
            f.textContent = '⚠️ Selecciona o escribe una respuesta';
            f.className = 'dialog-feedback incorrect';
            f.style.display = 'block';
            return;
        }

        this.answered = true;

        if (QuestionManager.checkAnswer(userAnswer)) {
            // ========= CORRECTO =========
            f.textContent = '✅ ¡CORRECTO!';
            f.className = 'dialog-feedback correct';
            f.style.display = 'block';
            AudioSystem.play('correct');
            this.clearTimer();
            TicketSystem.onCorrectAnswer();
            this.spawnConfetti();

            if (window.GameState && GameState.mode === 'timed') {
                this.timeRemaining += CONFIG.TIMED_MODE.BONUS_TIME;
            }
            if (WorldManager.currentWorld === 'end') {
                End.damageDragon(20);
            }

            this.highlightCorrectChoice(userAnswer);

            // Cambiar borde del panel a verde brillante
            if (this.panelEl) this.panelEl.style.borderColor = '#4ade80';

            // SIEMPRE mostrar continuar
            document.getElementById('dialog-continue-btn').classList.remove('hidden');
            document.getElementById('dialog-hint-btn').classList.add('hidden');

        } else {
            // ========= INCORRECTO =========
            f.textContent = '❌ Incorrecto. La respuesta es: ' + (QuestionManager.currentQuestion ? QuestionManager.currentQuestion.a : '');
            f.className = 'dialog-feedback incorrect';
            f.style.display = 'block';
            AudioSystem.play('wrong');
            TicketSystem.onWrongAnswer();

            this.highlightWrongChoice(userAnswer);

            // Cambiar borde del panel a rojo
            if (this.panelEl) this.panelEl.style.borderColor = '#ef4444';

            // SIEMPRE mostrar continuar
            document.getElementById('dialog-continue-btn').classList.remove('hidden');
            document.getElementById('dialog-hint-btn').classList.add('hidden');
        }
    },

    highlightCorrectChoice(answer) {
        const choices = document.querySelectorAll('.dialog-choice-btn');
        choices.forEach(btn => {
            btn.disabled = true;
            btn.style.cursor = 'default';
            btn.style.opacity = '0.5';
            if (btn.dataset.value === answer) {
                btn.classList.add('correct');
                btn.style.opacity = '1';
            }
        });
    },

    highlightWrongChoice(answer) {
        const choices = document.querySelectorAll('.dialog-choice-btn');
        choices.forEach(btn => {
            btn.disabled = true;
            btn.style.cursor = 'default';
            btn.style.opacity = '0.5';
            if (btn.dataset.value === answer && btn.classList.contains('selected')) {
                btn.classList.add('incorrect');
                btn.style.opacity = '1';
            }
        });
    },

    disableChoices() {
        const choices = document.querySelectorAll('.dialog-choice-btn');
        choices.forEach(btn => {
            btn.disabled = true;
            btn.style.cursor = 'default';
            btn.style.opacity = '0.5';
        });
    },

    closeDialog() {
        this.clearTimer();
        this.isDialogOpen = false;
        this.answered = false;
        this.dialogEl.classList.add('dialog-exit');

        setTimeout(() => {
            this.dialogEl.classList.add('hidden');
            this.dialogEl.classList.remove('dialog-exit');

            // Resetear panel
            if (this.panelEl) this.panelEl.style.borderColor = '';

            if (this.currentCallback) {
                this.currentCallback();
                this.currentCallback = null;
            }

            setTimeout(() => {
                if (window.GameState && GameState.isPlaying && window.Player) {
                    Player.lockPointer();
                }
            }, 200);
        }, 300);
    },

    showHint() {
        const h = QuestionManager.getHint();
        if (h) {
            const hintEl = document.getElementById('dialog-hint-text');
            hintEl.textContent = '💡 Pista: ' + h;
            hintEl.classList.remove('hidden');
            AudioSystem.play('click');
        }
    },

    spawnConfetti() {
        const colors = ['#FFD700', '#4CAF50', '#2196F3', '#FF5722', '#9C27B0', '#FF4081'];
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'confetti-particle';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.top = '-10px';
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.animationDelay = Math.random() * 0.5 + 's';
            p.style.animationDuration = (1 + Math.random() * 2) + 's';
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 3000);
        }
    },

    showDimensionComplete(blocksMined, ticketsEarned, totalTickets, callback) {
        if (document.pointerLockElement) document.exitPointerLock();

        const dialog = document.createElement('div');
        dialog.className = 'dimension-dialog';
        dialog.innerHTML = `
            <div class="dimension-panel">
                <h2>🎉 ¡Dimensión Completada!</h2>
                <div class="dimension-stats">
                    <p>🧱 Bloques Minados: <strong>${blocksMined}</strong>/5</p>
                    <p>💎 Tickets Ganados: <strong>${ticketsEarned}</strong></p>
                    <p>📊 Total Tickets: <strong>${totalTickets}</strong></p>
                </div>
                <button class="dialog-btn-primary" id="dim-continue-btn">🌀 Siguiente Dimensión</button>
            </div>
        `;
        document.body.appendChild(dialog);
        AudioSystem.play('levelUp');

        document.getElementById('dim-continue-btn').onclick = () => {
            dialog.remove();
            callback();
            setTimeout(() => {
                if (window.Player) Player.lockPointer();
            }, 200);
        };
    },

    showVictory() {
        if (document.pointerLockElement) document.exitPointerLock();
        document.getElementById('victory-modal').classList.remove('hidden');
        setTimeout(() => Certificate.generate(), 500);
        document.getElementById('download-cert').onclick = () => Certificate.download();
        document.getElementById('print-cert').onclick = () => Certificate.print();
        document.getElementById('play-again').onclick = () => {
            document.getElementById('victory-modal').classList.add('hidden');
            MenuManager.returnToMenu();
        };
        document.getElementById('view-hall').onclick = () => {
            document.getElementById('victory-modal').classList.add('hidden');
            HallOfFame.renderTable();
            document.getElementById('hall-of-fame-modal').classList.remove('hidden');
        };
    },

    showHowToPlay() {
        const m = document.createElement('div');
        m.className = 'modal';
        const c = document.createElement('div');
        c.className = 'modal-content';
        c.innerHTML = '<h2>¿Cómo se juega?</h2>';
        const d = document.createElement('div');
        d.style.cssText = 'text-align:left;margin-top:20px;line-height:1.8;';
        d.innerHTML = `
            <p><b>Objetivo:</b> Recoge tickets completando 4 dimensiones.</p>
            <p><b>Controles:</b> WASD, Espacio, Ratón, E/Clic</p>
            <p><b>Modos:</b> Aventura (sin tiempo) | Contrarreloj (30s por pregunta, +5s bonus)</p>
            <p><b>Racha:</b> +1 ticket extra cada 3 aciertos seguidos</p>
            <p><b>Cámara:</b> Pulsa V para cambiar primera/tercera persona</p>
            <p><b>Dialogo:</b> Las preguntas aparecen abajo como un NPC hablándote</p>
        `;
        c.appendChild(d);
        m.appendChild(c);
        document.body.appendChild(m);
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-modal';
        closeBtn.style.cssText = 'position:absolute;top:15px;right:15px;';
        closeBtn.textContent = '✕';
        c.appendChild(closeBtn);
        c.style.position = 'relative';
        closeBtn.onclick = () => m.remove();
    },

    showNotification(message) {
        HUD.showNotification(message);
    }
};

window.Modal = Modal;
