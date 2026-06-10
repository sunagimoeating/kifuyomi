document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('shogi-board');
    const startBtn = document.getElementById('start-btn');
    const guideToggle = document.getElementById('guide-toggle');
    const turnToggle = document.getElementById('turn-toggle');
    const boardContainer = document.getElementById('board-container');
    const hGuide = document.getElementById('h-guide');
    const vGuide = document.getElementById('v-guide');

    const inputColDisplay = document.getElementById('input-col');
    const inputRowDisplay = document.getElementById('input-row');
    const inputDisplay = document.getElementById('input-display');
    const numKeys = document.querySelectorAll('.num-key');
    const clearBtn = document.getElementById('clear-btn');

    // 将棋の漢数字変換用配列（インデックス1〜9を使用）
    const kanjiNums = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

    // ゲームのステート
    let isPlaying = false;
    let isSente = true; // true: 先手, false: 後手
    let targetCell = null; // 現在の正解マス {col, row}
    let currentInput = { col: null, row: null };

    // 1. 盤面の生成 (9x9)
    function createBoard() {
        board.innerHTML = '';
        const rows = isSente ? [1,2,3,4,5,6,7,8,9] : [9,8,7,6,5,4,3,2,1];
        const cols = isSente ? [9,8,7,6,5,4,3,2,1] : [1,2,3,4,5,6,7,8,9];

        for (let row of rows) {
            for (let col of cols) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.col = col;
                cell.dataset.row = row;
                board.appendChild(cell);
            }
        }
    }

    // 目盛りの更新（先手/後手切り替え時）
    function updateGuides() {
        const cols = isSente ? [9,8,7,6,5,4,3,2,1] : [1,2,3,4,5,6,7,8,9];
        const rows = isSente ? [1,2,3,4,5,6,7,8,9] : [9,8,7,6,5,4,3,2,1];

        if (hGuide) {
            hGuide.innerHTML = cols.map(c => `<span>${convertToFullWidth(c.toString())}</span>`).join('');
        }
        if (vGuide) {
            vGuide.innerHTML = rows.map(r => `<span>${kanjiNums[r]}</span>`).join('');
        }
    }

    // 2. ゲーム開始処理
    function startGame() {
        isPlaying = true;
        setNumKeysDisabled(false);
        if (clearBtn) clearBtn.disabled = false;

        startBtn.textContent = 'ストップ';
        startBtn.classList.add('stop-btn');

        clearInput();
        setNextTarget();
    }

    // 3. ゲーム終了（ストップ）処理
    function stopGame() {
        isPlaying = false;
        setNumKeysDisabled(true);
        if (clearBtn) clearBtn.disabled = true;

        startBtn.textContent = 'スタート';
        startBtn.classList.remove('stop-btn');

        clearTarget();
        clearInput();
    }

    // キーの有効/無効を切り替え
    function setNumKeysDisabled(disabled) {
        numKeys.forEach(btn => btn.disabled = disabled);
    }

    // 4. 次のターゲットを設定する
    function setNextTarget() {
        clearTarget();

        const col = Math.floor(Math.random() * 9) + 1;
        const row = Math.floor(Math.random() * 9) + 1;
        targetCell = { col, row };

        const cell = document.querySelector(`.cell[data-col="${col}"][data-row="${row}"]`);
        if (cell) {
            cell.classList.add('target');
        }
    }

    function clearTarget() {
        const currentTarget = document.querySelector('.cell.target');
        if (currentTarget) {
            currentTarget.classList.remove('target');
        }
    }

    // キーパッドのラベルを更新
    // 横（筋）入力済みなら漢数字、それ以外は全角数字
    function updateKeypadLabels() {
        const isKanji = (currentInput.col !== null && currentInput.row === null);
        numKeys.forEach(btn => {
            const val = parseInt(btn.dataset.val);
            btn.textContent = isKanji ? kanjiNums[val] : convertToFullWidth(val.toString());
        });
    }

    // 5. 入力処理
    function handleNumInput(val) {
        if (!isPlaying) return;

        // エラー表示クリア
        inputColDisplay.classList.remove('wrong');
        inputRowDisplay.classList.remove('wrong');

        if (currentInput.col === null) {
            // 横（筋）の入力
            currentInput.col = val;
            inputColDisplay.textContent = convertToFullWidth(val.toString());
            inputColDisplay.classList.remove('placeholder');
            inputColDisplay.classList.add('filled');

            // キーパッドを漢数字表示に切り替え
            updateKeypadLabels();
        } else if (currentInput.row === null) {
            // 縦（段）の入力
            currentInput.row = val;
            inputRowDisplay.textContent = kanjiNums[val];
            inputRowDisplay.classList.remove('placeholder');
            inputRowDisplay.classList.add('filled');

            checkAnswer();
        }
    }

    // 半角数字を全角数字に変換する補助関数
    function convertToFullWidth(numStr) {
        return String.fromCharCode(numStr.charCodeAt(0) + 0xFEE0);
    }

    // 6. 答え合わせ処理
    function checkAnswer() {
        const isCorrect = (
            parseInt(currentInput.col) === targetCell.col &&
            parseInt(currentInput.row) === targetCell.row
        );

        if (isCorrect) {
            // 正解：緑ハイライト
            inputColDisplay.classList.add('correct');
            inputRowDisplay.classList.add('correct');

            setTimeout(() => {
                clearInput();
                setNextTarget();
            }, 300);
        } else {
            // 不正解：入力欄をシェイクして知らせる
            inputColDisplay.classList.add('wrong');
            inputRowDisplay.classList.add('wrong');

            // inputDisplay全体をシェイク
            inputDisplay.classList.add('shake');
            inputDisplay.addEventListener('animationend', () => {
                inputDisplay.classList.remove('shake');
            }, { once: true });

            // 表示後に入力をリセット
            setTimeout(() => {
                clearInput();
            }, 500);
        }
    }

    function clearInput() {
        currentInput = { col: null, row: null };

        inputColDisplay.textContent = '筋';
        inputRowDisplay.textContent = '段';

        inputColDisplay.className = 'input-char placeholder';
        inputRowDisplay.className = 'input-char placeholder';

        updateKeypadLabels();
    }

    // イベントリスナーの登録
    startBtn.addEventListener('click', () => {
        if (isPlaying) {
            stopGame();
        } else {
            startGame();
        }
    });

    // 目盛りトグル（デフォルトOFF）
    if (guideToggle) {
        guideToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                hGuide && hGuide.classList.remove('hidden');
                vGuide && vGuide.classList.remove('hidden');
            } else {
                hGuide && hGuide.classList.add('hidden');
                vGuide && vGuide.classList.add('hidden');
            }
        });
    }

    // 先手/後手トグル
    if (turnToggle) {
        turnToggle.addEventListener('change', (e) => {
            isSente = !e.target.checked;

            // 後手時は .gote クラスを付与 → CSS グリッドで目盛り位置が切り替わる
            // 先手: 列目盛り=上辺, 行目盛り=右辺
            // 後手: 列目盛り=下辺, 行目盛り=左辺
            if (isSente) {
                boardContainer.classList.remove('gote');
            } else {
                boardContainer.classList.add('gote');
            }

            createBoard();
            updateGuides();

            // プレイ中ならターゲットを再ハイライト
            if (isPlaying && targetCell) {
                const cell = document.querySelector(`.cell[data-col="${targetCell.col}"][data-row="${targetCell.row}"]`);
                if (cell) cell.classList.add('target');
            }
        });
    }

    // 数字ボタン
    numKeys.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.dataset.val;

            btn.classList.add('active');
            setTimeout(() => btn.classList.remove('active'), 150);

            handleNumInput(val);
        });
    });

    // 取消ボタン
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (!isPlaying) return;
            clearBtn.classList.add('active');
            setTimeout(() => clearBtn.classList.remove('active'), 150);
            clearInput();
        });
    }

    // キーボード入力対応（PC向け）
    document.addEventListener('keydown', (e) => {
        if (!isPlaying) return;

        if (/^[1-9]$/.test(e.key)) {
            handleNumInput(e.key);
        } else if (e.key === 'Backspace' || e.key === 'Escape' || e.key === 'Delete') {
            clearInput();
        }
    });

    // 初期化
    setNumKeysDisabled(true);
    if (clearBtn) clearBtn.disabled = true;
    createBoard();
    updateGuides();
});
