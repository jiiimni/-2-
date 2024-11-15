function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    });
}

window.onload = async () => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    const heroImg = await loadTexture('assets/player.png');
    const enemyImg = await loadTexture('assets/enemyShip.png');
    const starBg = await loadTexture('assets/starBackground.png'); // 별 배경 이미지 로드

    drawBackground(ctx, canvas, starBg); // 별 배경 그리기
    ctx.drawImage(heroImg, canvas.width / 2 - 45, canvas.height - (canvas.height / 4)); // 플레이어 우주선
    drawPlayerAndAllies(ctx, canvas, heroImg); // 플레이어와 보조 우주선
    createEnemies2(ctx, canvas, enemyImg); // 피라미드 형태 적군 생성
};

function drawBackground(ctx, canvas, starBg) {
    // 배경 이미지를 패턴으로 설정
    const pattern = ctx.createPattern(starBg, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayerAndAllies(ctx, canvas, heroImg) {
    const playerWidth = heroImg.width;
    const playerHeight = heroImg.height;

    // 중앙 플레이어 우주선
    const playerX = canvas.width / 2 - playerWidth / 2;
    const playerY = canvas.height - canvas.height / 4;
    ctx.drawImage(heroImg, playerX, playerY);

    // 보조 우주선 크기 조정
    const allyWidth = playerWidth * 0.5;
    const allyHeight = playerHeight * 0.5;

    // 왼쪽 보조 우주선
    const leftAllyX = playerX - allyWidth - 20;
    ctx.drawImage(heroImg, leftAllyX, playerY + 20, allyWidth, allyHeight);

    // 오른쪽 보조 우주선
    const rightAllyX = playerX + playerWidth + 20;
    ctx.drawImage(heroImg, rightAllyX, playerY + 20, allyWidth, allyHeight);
}

function createEnemies(ctx, canvas, enemyImg) {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * enemyImg.width;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;

    for (let x = START_X; x < STOP_X; x += enemyImg.width) {
        for (let y = 0; y < enemyImg.height * 5; y += enemyImg.height) {
            ctx.drawImage(enemyImg, x, y);
        }
    }
}

function createEnemies2(ctx, canvas, enemyImg) {
    const ROWS = 5; // 피라미드 층 수
    const enemyWidth = enemyImg.width;
    const enemyHeight = enemyImg.height;

    for (let row = 0; row < ROWS; row++) {
        // 각 줄의 시작 X 위치 계산
        const startX = (canvas.width - enemyWidth * (ROWS - row)) / 2;

        for (let col = 0; col < ROWS - row; col++) {
            const x = startX + col * enemyWidth;
            const y = row * enemyHeight;
            ctx.drawImage(enemyImg, x, y);
        }
    }
}