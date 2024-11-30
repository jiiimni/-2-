// EventEmitter 클래스
class EventEmitter {
    constructor() {
        this.listeners = {};
    }
    on(message, listener) {
        if (!this.listeners[message]) {
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener);
    }
    emit(message, payload = null) {
        if (this.listeners[message]) {
            this.listeners[message].forEach((listener) => listener(message, payload));
        }
    }
}

// GameObject 클래스
class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dead = false;
        this.type = "";
        this.width = 0;
        this.height = 0;
        this.img = undefined;
    }
    rectFromGameObject() {
        return {
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width,
        };
    }
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}

// Hero 클래스
class Hero extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 99;
        this.height = 75;
        this.type = 'Hero';
        this.cooldown = 0; // 초기화
        this.supportShips = []; // 보조 비행선
        this.createSupportShips();
    }

    createSupportShips() {
        // 보조 비행선 크기 계산 (50% 크기)
        const allyWidth = this.width * 0.5;
        const allyHeight = this.height * 0.5;

        // 보조 비행선 2대 생성
        const leftAlly = new SupportShip(this.x - allyWidth - 20, this.y + 20, allyWidth, allyHeight);
        const rightAlly = new SupportShip(this.x + this.width + 20, this.y + 20, allyWidth, allyHeight);

        this.supportShips.push(leftAlly, rightAlly);
        gameObjects.push(leftAlly, rightAlly);
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;

        // 보조 비행선도 함께 움직임
        this.supportShips.forEach((ship) => {
            ship.x += dx;
            ship.y += dy;
        });
    }

    fire() {
        if (this.canFire()) { // 쿨다운 확인
            gameObjects.push(new Laser(this.x + 45, this.y - 10)); // 레이저 생성
            this.cooldown = 500; // 쿨다운 500ms 설정

            let id = setInterval(() => {
                if (this.cooldown > 0) {
                    this.cooldown -= 100;
                } else {
                    clearInterval(id); // 쿨다운 완료 후 타이머 종료
                }
            }, 100);
        }
    }

    canFire() {
        return this.cooldown === 0; // 쿨다운 상태 확인
    }
}

// SupportShip 클래스 (보조 비행선)
class SupportShip extends GameObject {
    constructor(x, y, width, height) {
        super(x, y);
        this.width = width;
        this.height = height;
        this.type = "SupportShip";
        this.img = heroImg; // 플레이어와 동일한 이미지
        this.autoFire();
    }

    autoFire() {
        // 1초마다 작은 레이저 발사
        setInterval(() => {
            if (!this.dead) {
                gameObjects.push(new SmallLaser(this.x + this.width / 2 - 2.5, this.y - 10));
            }
        }, 1000);
    }
}

// Enemy 클래스
class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = "Enemy";
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 5; // 아래로 이동
            } else {
                console.log('Stopped at', this.y);
                clearInterval(id); // 화면 끝에 도달하면 정지
            }
        }, 300);
    }
}

// Laser 클래스
class Laser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = 'Laser';
        this.img = laserImg;
        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

// SmallLaser 클래스 (작은 레이저)
class SmallLaser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 5;
        this.height = 15;
        this.type = 'SmallLaser';
        this.img = laserImg; // 작은 레이저 이미지
        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 10;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

// Explosion 클래스 (폭발)
class Explosion extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = 'Explosion';
        this.img = explosionImg;
        setTimeout(() => (this.dead = true), 500); // 0.5초 후 제거
    }
}

// 전역 변수 설정
const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
};

let heroImg, enemyImg, laserImg, explosionImg, canvas, ctx;
let gameObjects = [], hero;
let eventEmitter = new EventEmitter();


// 이미지 로드 함수
function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
    });
}

// 배경 그리기
function drawBackground(ctx, canvas, starBg) {
    const pattern = ctx.createPattern(starBg, "repeat");
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function createHero() {
    hero = new Hero(
        canvas.width / 2 - 45,
        canvas.height - canvas.height / 4
    );
    hero.img = heroImg;
    gameObjects.push(hero);
}

function createEnemies() {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;

    for (let x = START_X; x < STOP_X; x += 98) {
        for (let y = 0; y < 50 * 5; y += 50) {
            const enemy = new Enemy(x, y);
            enemy.img = enemyImg;
            gameObjects.push(enemy);
        }
    }
}

function initGame() {
    gameObjects = [];
    createEnemies();
    createHero();
    eventEmitter.on(Messages.KEY_EVENT_UP, () => {
        hero.move(0, -5);
    });
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
        hero.move(0, 5);
    });
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
        hero.move(-5, 0);
    });
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
        hero.move(5, 0);
    });
    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (hero.canFire()) {
            hero.fire();
        }
    });
    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        first.dead = true;
        second.dead = true;

        // 폭발 효과 추가
        gameObjects.push(new Explosion(second.x, second.y));
    });
}

function drawGameObjects(ctx) {
    gameObjects.forEach((obj) => obj.draw(ctx));
}

function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}

function updateGameObjects() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy");
    const lasers = gameObjects.filter((go) => go.type === "Laser" || go.type === "SmallLaser");
    lasers.forEach((l) => {
        enemies.forEach((m) => {
            if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                    first: l,
                    second: m,
                });
            }
        });
    });
    gameObjects = gameObjects.filter((go) => !go.dead);
}

// 키보드 이벤트
let onKeyDown = function (e) {
    console.log(e.keyCode);
    switch (e.keyCode) {
        case 37: // 왼쪽 화살표
        case 39: // 오른쪽 화살표
        case 38: // 위쪽 화살표
        case 40: // 아래쪽 화살표
        case 32: // 스페이스바
            e.preventDefault();
            break;
        default:
            break;
    }
};

window.onload = async () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    // 이미지 로드
    heroImg = await loadTexture("assets/player.png");
    enemyImg = await loadTexture("assets/enemyShip.png");
    laserImg = await loadTexture("assets/laserRed.png");
    explosionImg = await loadTexture("assets/laserGreenShot.png");

    // 게임 초기화
    initGame();

    // 게임 루프
    setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGameObjects(ctx);
        updateGameObjects();
    }, 100);
};

window.addEventListener('keydown', onKeyDown);
window.addEventListener("keyup", (evt) => {
    if (evt.key === "ArrowUp") {
        eventEmitter.emit(Messages.KEY_EVENT_UP);
    } else if (evt.key === "ArrowDown") {
        eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    } else if (evt.key === "ArrowLeft") {
        eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    } else if (evt.key === "ArrowRight") {
        eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    } else if (evt.keyCode === 32) {
        eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    }
});
