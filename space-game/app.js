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
    clear() {
        this.listeners = {};
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
        if(this.img){
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }
}

// Hero 클래스
class Hero extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.invincible = false; // 무적 상태
        this.width = 99;
        this.height = 75;
        this.type = 'Hero';
        this.cooldown = 0; // 초기화
        this.supportShips = []; // 보조 비행선
        this.createSupportShips();
        this.life = 3; //생명 초기화
        this.points = 0; //점수 초기화
        this.shield = false; // 실드 상태
        this.chargeLevel = 0; // 차지 레벨
        this.maxCharge = 3; // 최대 차지 단계
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

    decrementLife() {
        if (!this.shield && !this.invincible) { // 무적 상태가 아닐 때만 처리
            this.life--; // 목숨 감소
            if (this.life === 0) {
                this.dead = true; // 목숨이 0이면 죽음 처리
            } else {
                this.invincible = true; // 무적 상태 활성화
                setTimeout(() => (this.invincible = false), 2000); // 2초간 무적
            }
        }
    }
    

    incrementPoints(points = 100) {
        this.points += points; // 점수 증가
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
        if (this.canFire()) {
            if (this.chargeLevel >= this.maxCharge) {
                gameObjects.push(new Laser(this.x + 45, this.y - 10, true)); // 강력한 레이저
                this.chargeLevel = 0;
            } else {
                gameObjects.push(new Laser(this.x + 45, this.y - 10)); // 일반 레이저
            }
            this.cooldown = 500;

            let id = setInterval(() => {
                if (this.cooldown > 0) {
                    this.cooldown -= 100;
                } else {
                    clearInterval(id);
                }
            }, 100);
        }
    }

    canFire() {
        return this.cooldown === 0; // 쿨다운 상태 확인
    }
    activateShield() {
        if (!this.shield) {
            this.shield = true;
            this.img = shieldImg; // 쉴드 이미지 적용
            setTimeout(() => {
                this.shield = false;
                this.img = heroImg; // 원래 이미지 복구
            }, 5000); // 5초 동안 유지
        }
    }
    
    

    charge() {
        if (this.chargeLevel < this.maxCharge) {
            this.chargeLevel++;
        }
    }
    
}
// Boss 클래스
class Boss extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 200;
        this.height = 200;
        this.type = "Boss";
        this.life = 20; // 보스 생명력
        this.img = bossImg;
        this.attackCooldown = 0;

    }

    decrementLife() {
        this.life--;
        if (this.life === 0) {
            this.dead = true;
        }
    }

    attack() {
        if (this.attackCooldown === 0) {
            // 다방향 레이저 발사
            for (let angle = -30; angle <= 30; angle += 15) {
                const laser = new Laser(this.x + this.width / 2, this.y + this.height, false);
                laser.setAngle(angle); // 각도 설정
                laser.speed = angle === 0 ? 10 : 7; // 가운데 레이저는 더 빠르게 이동
                gameObjects.push(laser);
            }
            this.attackCooldown = 100; // 공격 쿨다운
        } else {
            this.attackCooldown--;
        }
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
        setInterval(() => {
            if (!this.dead && gameObjects.includes(this)) {
                gameObjects.push(new SmallLaser(this.x + this.width / 2 - 2.5, this.y - 10));
            }
        }, 1000);
    }
}

// Enemy 클래스
class Enemy extends GameObject {
    constructor(x, y, stage) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = "Enemy";
        this.img = stage === 2 ? enemyImg2 : enemyImg; // 스테이지별 적 이미지
        this.speed = stage; // 스테이지별 속도 증가
        this.pattern = Math.random() > 0.5 ? "zigzag" : "straight"; // 이동 패턴 랜덤 선택
        this.intervalId = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.updatePosition(); // 패턴에 따라 위치 업데이트
            } else {
                console.log('Stopped at', this.y);
                clearInterval(this.intervalId); // 화면 끝에 도달하면 정지
            }
        }, 300);
    }

    updatePosition() {
        if (this.pattern === "zigzag") {
            this.x += Math.sin(this.y / 20) * 5; // 지그재그 이동
        }
        this.y += this.speed; // 아래로 이동
    }
    attack() {
        if (!this.dead) {
            // 적의 위치에서 레이저 생성
            const laser = new Laser(this.x + this.width / 2 - 4.5, this.y + this.height, false); // false는 적의 레이저
            gameObjects.push(laser);
        }
    }
}

 ㅇ
// Laser 클래스
class Laser extends GameObject {
    constructor(x, y, isHeroLaser = true) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = 'Laser';
        this.img = laserImg;
        this.speed = 15; // 이동 속도
        this.angle = 0; // 초기 각도 (0도는 직선)
        this.isHeroLaser = isHeroLaser; // 플레이어 레이저인지 여부

        let id = setInterval(() => {
            if (this.angle !== 0) {
                // 각도 기반 이동
                this.x += Math.sin(this.angle * Math.PI / 180) * this.speed;
                this.y += this.isHeroLaser ? -this.speed : this.speed;
            } else {
                // 직선 이동
                this.y += this.isHeroLaser ? -this.speed : this.speed;
            }

            // 화면 밖으로 나가면 제거
            if (this.y < 0 || this.y > canvas.height || this.x < 0 || this.x > canvas.width) {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }

    // 각도 설정 메서드
    setAngle(angle) {
        this.angle = angle;
    }
}


class Meteor extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 50;
        this.height = 50;
        this.type = "Meteor";
        this.img = meteorImg; // meteorImg 확인 필요
        this.speed = 15; // 떨어지는 속도
        let id = setInterval(() => {
            if (this.y < canvas.height) {
                this.y += this.speed;
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
    GAME_END_LOSS: "GAME_END_LOSS",
    GAME_END_WIN: "GAME_END_WIN",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
    KEY_EVENT_SHIELD: "KEY_EVENT_SHIELD",
    KEY_EVENT_CHARGE: "KEY_EVENT_CHARGE",
    COLLISION_ENEMY_METEOR: "COLLISION_ENEMY_METEOR", // 메테오와 적 충돌


};

let heroImg, enemyImg, laserImg, explosionImg, lifeImg, bossImg, shieldImg, meteorImg, canvas, ctx;
let gameObjects = [], hero;
let stage = 1; // 스테이지 초기화
let eventEmitter = new EventEmitter();
let stageScores = []; // 각 스테이지 점수를 저장
let achievements = []; // 업적 목록


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
    hero.points = 0; // 초기 점수를 0으로 설정
    hero.life = 3;   // 초기 목숨 설정
    gameObjects.push(hero);
}


function createEnemies() {
    const ENEMIES_PER_ROW = 5; // 한 줄에 적 5개
    const ROWS = 5; // 총 5줄
    const ENEMY_SPACING = 10; // 적 간의 간격
    const START_X = (canvas.width - (ENEMIES_PER_ROW * 98 + (ENEMIES_PER_ROW - 1) * ENEMY_SPACING)) / 2; // 중앙 정렬
    const START_Y = 50; // 적의 시작 Y 위치

    for (let row = 0; row < ROWS; row++) { // 총 ROWS 줄
        for (let col = 0; col < ENEMIES_PER_ROW; col++) { // 한 줄에 ENEMIES_PER_ROW 개의 적 생성
            const x = START_X + col * (98 + ENEMY_SPACING); // x 위치 계산
            const y = START_Y + row * (50 + ENEMY_SPACING); // y 위치 계산
            const enemy = new Enemy(x, y);
            enemy.img = stage === 2 ? enemyImg2 : enemyImg; // 스테이지별 적 이미지 적용
            enemy.speed = stage; // 스테이지별 속도 적용
            gameObjects.push(enemy);
        

            // 적 공격 루프 설정 (2초 간격)
            setInterval(() => {
                if (!enemy.dead) {
                    enemy.attack();
                }
            }, 2000);
        }
    }
}

function createBoss() {
    if (stage === 3) { // 3번째 스테이지에서 보스 등장
        const boss = new Boss(canvas.width / 2 - 100, 50);
        boss.img = bossImg;
        gameObjects.push(boss);
        setInterval(() => boss.attack(), 2000); // 보스 공격
    }
}

function isEnemiesDead() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead); // 남은 적
    const boss = gameObjects.find((go) => go.type === "Boss" && !go.dead);       // 보스

    if (enemies.length === 0 && !boss) {
        stageScores[stage - 1] = hero.points; // 스테이지 점수 저장
        return true; // 적과 보스가 모두 제거되었음
    }

    return false; // 아직 적 또는 보스가 남아 있음
}


function initGame() {
    gameObjects = [];
    createEnemies();
    createHero();
    if (stage === 3) createBoss();

    eventEmitter.on(Messages.KEY_EVENT_UP, () => hero.move(0, -5));
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => hero.move(0, 5));
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => hero.move(-5, 0));
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => hero.move(5, 0));
    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => hero.canFire() && hero.fire());
    eventEmitter.on(Messages.KEY_EVENT_METEOR, () => {
        const meteor = new Meteor(Math.random() * canvas.width, -50);
        meteor.img = meteorImg;
        gameObjects.push(meteor);
    });

    // 공격 이벤트 리스너
    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (hero.canFire()) {
            hero.fire();
        }
    });
    eventEmitter.on(Messages.KEY_EVENT_METEOR, () => {
        const meteor = new Meteor(Math.random() * canvas.width, -50);
        meteor.img = meteorImg; // 메테오 이미지 설정
        gameObjects.push(meteor); // 메테오를 게임 오브젝트 배열에 추가
    });
    
    
    eventEmitter.on(Messages.COLLISION_ENEMY_METEOR, (_, { meteor, enemy }) => {
        // 메테오 충돌 효과 생성
        const shotEffect = new GameObject(enemy.x, enemy.y);
        shotEffect.img = laserRedshotImg; // laserRedShot.png 사용
        shotEffect.width = enemy.width;
        shotEffect.height = enemy.height;
        gameObjects.push(shotEffect);

        // 효과 제거 및 적과 메테오 삭제
        setTimeout(() => {
            shotEffect.dead = true; // 효과 제거
            gameObjects.push(new Explosion(enemy.x, enemy.y)); // 폭발 애니메이션
            enemy.dead = true; // 적 제거
            meteor.dead = true; // 메테오 제거
        }, 200); // 200ms 동안 효과 유지
    });

    eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
        gameObjects.push(new Explosion(enemy.x, enemy.y)); // 충돌 애니메이션
        enemy.dead = true;
    
        hero.decrementLife();
    
        if (isHeroDead()) {
            eventEmitter.emit(Messages.GAME_END_LOSS); // 패배 이벤트
        }
    });

    // 적과 레이저 충돌 이벤트
    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        const shotEffect = new GameObject(second.x, second.y);
        shotEffect.img = laserGreenShotImg;
        shotEffect.width = second.width;
        shotEffect.height = second.height;
        gameObjects.push(shotEffect);
    
        setTimeout(() => {
            shotEffect.dead = true;
            gameObjects.push(new Explosion(second.x, second.y));
        }, 200);
    
        first.dead = true; // 레이저 제거
    
        if (second.type === "Boss") {
            second.decrementLife();
            if (second.life <= 0) {
                second.dead = true; // 보스 제거
            }
        } else {
            second.dead = true; // 적 제거
            hero.incrementPoints();
        }
    
        // 적과 보스가 모두 제거되었는지 확인
        if (isEnemiesDead()) {
            if (stage === 3) {
                eventEmitter.emit(Messages.GAME_END_WIN); // 최종 스테이지 클리어
            } else {
                stage++;
                initGame(); // 다음 스테이지 초기화
            }
        }
    });
    

    // 승리 및 패배 이벤트 리스너
    eventEmitter.on(Messages.GAME_END_WIN, () => {
        endGame(true); // 승리 메시지 표시
    });
    eventEmitter.on(Messages.GAME_END_LOSS, () => {
        endGame(false); // 패배 메시지 표시
    });

    // 게임 재시작 이벤트
    eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
        resetGame(); // 게임 초기화
    });

    eventEmitter.on(Messages.KEY_EVENT_SHIELD, () => {
        if (!hero.shield) {
            hero.activateShield(); // 쉴드 활성화
        }
    });    
    
    eventEmitter.on(Messages.KEY_EVENT_CHARGE, () => {
        hero.charge(); // 차지 기능 활성화
        console.log(`Charge Level: ${hero.chargeLevel}`); // 디버깅용 로그
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
    checkAchievements(hero); // 업적 체크
    const enemies = gameObjects.filter((go) => go.type === "Enemy");
    const lasers = gameObjects.filter((go) => go.type === "Laser" || go.type === "SmallLaser");
    const bossLasers = gameObjects.filter((go) => go.type === "Laser" && go.img === laserRedshotImg); 
    const boss = gameObjects.find((obj) => obj.type === "Boss" && !obj.dead);
    const meteors = gameObjects.filter((go) => go.type === "Meteor"); // 메테오 필터링

    if (boss) {
    drawBossLife(boss); // 보스 목숨바 갱신
    }

     // 메테오와 적 충돌 처리
     meteors.forEach((meteor) => {
        enemies.forEach((enemy) => {
            if (intersectRect(meteor.rectFromGameObject(), enemy.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_METEOR, { meteor, enemy });
            }
        });
    });
    // 레이저와 적의 충돌 처리
    lasers.forEach((laser) => {
        gameObjects.forEach((target) => {
            if (target.type === "Enemy" || target.type === "Boss") {
                if (intersectRect(laser.rectFromGameObject(), target.rectFromGameObject())) {
                    eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                        first: laser,
                        second: target,
                    });
                }
            }
        });
    });

    // 보스 레이저와 플레이어의 충돌 처리
    bossLasers.forEach((laser) => {
        if (intersectRect(laser.rectFromGameObject(), hero.rectFromGameObject())) {
            if (!hero.shield && !hero.invincible) {
                hero.decrementLife(); // 플레이어 목숨 감소
                laser.dead = true; // 레이저 제거
                if (isHeroDead()) {
                    eventEmitter.emit(Messages.GAME_END_LOSS); // 패배 처리
                }
            }
        }
    });
    // 적과 플레이어의 충돌 처리
    enemies.forEach((enemy) => {
        if (intersectRect(enemy.rectFromGameObject(), hero.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
        }
    });

    // 게임 오브젝트 업데이트 및 삭제 처리
    gameObjects = gameObjects.filter((obj) => !obj.dead); // 제거된 오브젝트 필터링
}
function drawBossLife(boss) {
    if (boss && boss.type === "Boss" && !boss.dead) { // 보스가 살아 있을 때만 실행
        const lifeBarWidth = 200; // 보스 목숨바 너비
        const lifeBarHeight = 20; // 보스 목숨바 높이
        const x = (canvas.width - lifeBarWidth) / 2; // 화면 중앙
        const y = 20; // 화면 상단

        ctx.fillStyle = "gray";
        ctx.fillRect(x, y, lifeBarWidth, lifeBarHeight);

        const currentWidth = (boss.life / boss.maxLife) * lifeBarWidth;
        ctx.fillStyle = "red";
        ctx.fillRect(x, y, currentWidth, lifeBarHeight);

        ctx.strokeStyle = "white";
        ctx.strokeRect(x, y, lifeBarWidth, lifeBarHeight);
    }
}

function createBoss() {
    if (stage === 3) { // 3번째 스테이지에서 보스 등장
        const boss = new Boss(canvas.width / 2 - 100, 50);
        boss.img = bossImg;
        gameObjects.push(boss);
        setInterval(() => boss.attack(), 2000); // 보스가 2초마다 공격
    }
}


function drawLife() {
    const START_POS = canvas.width - 180;
    for(let i=0; i < hero.life; i++ ) {
      ctx.drawImage(
        lifeImg,
        START_POS + (45 * (i+1) ), canvas.height - 37);
    }
  }

function drawPoints() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    drawText("Points: " + hero.points, 10, canvas.height-20);
  }

function drawText(message, x, y) {
    ctx.fillText(message, x, y);
  }

function isHeroDead() {
    return hero.life <= 0;
}

function displayMessage(message, color = "red") {
    ctx.font = "30px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
   }

function checkAchievements(hero) {
       if (hero.points >= 1000 && !achievements.includes("1000_points")) {
           achievements.push("1000_points");
           displayAchievement("1000점 달성!");
       }
       if (stage === 3 && !achievements.includes("reached_boss")) {
           achievements.push("reached_boss");
           displayAchievement("보스 도달!");
       }
   }
   
function displayAchievement(message) {
       ctx.font = "30px Arial";
       ctx.fillStyle = "yellow";
       ctx.textAlign = "center";
       ctx.fillText(message, canvas.width / 2, 50);
       setTimeout(() => {
           ctx.clearRect(0, 0, canvas.width, 100); // 메시지 제거
       }, 3000);
   }
   

function endGame(win) {
    clearInterval(gameLoopId);

    const totalScore = stageScores.reduce((acc, score) => acc + score, 0);

    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const message = win
            ? "Victory!!! Press [Enter] to restart"
            : "You died!!! Press [Enter] to restart";

        ctx.font = "30px Arial";
        ctx.fillStyle = win ? "green" : "red";
        ctx.textAlign = "center";
        ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 50);

        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        stageScores.forEach((score, index) => {
            ctx.fillText(`Stage ${index + 1} Score: ${score}`, canvas.width / 2, canvas.height / 2 + index * 30);
        });
        ctx.fillText(`Total Score: ${totalScore}`, canvas.width / 2, canvas.height / 2 + stageScores.length * 30 + 30);
    }, 200);
}  
function resetGame() {
    if (gameLoopId) {
        clearInterval(gameLoopId); // 기존 루프 중지
    }
    gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        drawPoints();
        drawLife();
        const boss = gameObjects.find((obj) => obj.type === "Boss");
        if (boss) {
            drawBossLife(boss); // 보스 목숨바
        }
        updateGameObjects();
        drawGameObjects(ctx);
    }, 100); 
}
function drawGameObjects(ctx) {
    gameObjects.forEach((obj) => obj.draw(ctx));
    const boss = gameObjects.find((obj) => obj.type === "Boss" && !obj.dead);
    if (boss) {
        drawBossLife(boss); // 보스 목숨바 그리기
    }
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

    heroImg = await loadTexture("assets/player.png");
    leftheroImg = await loadTexture("assets/playerLeft.png"); // Load left hero image
    rightheroImg = await loadTexture("assets/playerRight.png"); // Load right hero image
    heroDamagedImg = await loadTexture("assets/playerDamaged.png"); // Load damaged hero image
    enemyImg = await loadTexture("assets/enemyShip.png");
    laserImg = await loadTexture("assets/laserRed.png");
    laserGreenImg = await loadTexture("assets/laserGreen.png");
    laserGreenShotImg = await loadTexture("assets/laserGreenShot.png");
    laserRedshotImg = await loadTexture("assets/laserRedShot.png");
    lifeImg = await loadTexture("assets/life.png");
    backgroundImg = await loadTexture("assets/starBackground.png");
    bossImg = await loadTexture("assets/enemyUFO.png");
    shieldImg = await loadTexture("assets/shield.png"); // 쉴드 이미지
    meteorImg = await loadTexture("assets/meteorBig.png"); // 메테오 이미지 경로 설정
    meteorSmallImg = await loadTexture("assets/meteorSmall.png"); // 작은 메테오

    // 게임 초기화
    initGame();

    // 게임 루프
    setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawPoints();
        drawLife();
        const boss = gameObjects.find((obj) => obj.type === "Boss");
        if (boss) {
        drawBossLife(boss); // 보스 목숨바 그리기
        }
        updateGameObjects();
        drawGameObjects(ctx);
    }, 100);
};

window.addEventListener('keydown', onKeyDown);
window.addEventListener("keyup", (evt) => {
    if (evt.key === "ArrowUp") {
        eventEmitter.emit(Messages.KEY_EVENT_UP); // 위로 이동
    } else if (evt.key === "ArrowDown") {
        eventEmitter.emit(Messages.KEY_EVENT_DOWN); // 아래로 이동
    } else if (evt.key === "ArrowLeft") {
        eventEmitter.emit(Messages.KEY_EVENT_LEFT); // 왼쪽으로 이동
    } else if (evt.key === "ArrowRight") {
        eventEmitter.emit(Messages.KEY_EVENT_RIGHT); // 오른쪽으로 이동
    } else if (evt.keyCode === 32) {
        eventEmitter.emit(Messages.KEY_EVENT_SPACE); // 스페이스바(공격)
    } else if (evt.key === "Enter") {
        eventEmitter.emit(Messages.KEY_EVENT_ENTER); // Enter(게임 재시작)
    } else if (evt.key === "c") {
        eventEmitter.emit(Messages.KEY_EVENT_CHARGE); // c(차지 공격 - 기 모으기)
    } else if (evt.key === "m") {
        eventEmitter.emit(Messages.KEY_EVENT_METEOR); // m(메테오 필살기)
    } else if (evt.key === "s") {
        eventEmitter.emit(Messages.KEY_EVENT_SHIELD); // s(실드 활성화)
    }
});

