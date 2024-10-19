// blackjack.js

// 카드 초기화
let playerCards = [];
let bankCards = [];

// 카드 뽑기 함수
function drawCard() {
    return Math.floor(Math.random() * 11) + 1; // 1~11 사이의 무작위 숫자
}

// 플레이어 카드 추가
playerCards.push(drawCard());
playerCards.push(drawCard());

// 플레이어 카드 합계 계산
let playerSum = playerCards.reduce((acc, card) => acc + card, 0);
console.log(`You have ${playerSum} points`);

// 블랙잭 또는 Bust 확인
if (playerSum > 21) {
    console.log('You bust! Bank wins.');
    return; // 게임 종료
} else if (playerSum === 21) {
    console.log('Blackjack! You win!');
    return; // 즉시 승리
}

// 딜러 카드 추가
bankCards.push(drawCard());
bankCards.push(drawCard());

// 딜러 카드 합계 계산
let bankSum = bankCards.reduce((acc, card) => acc + card, 0);
console.log(`Dealer has ${bankSum} points`);

// 딜러가 17점 이상이 될 때까지 카드 추가
while (bankSum < 17) {
    let newCard = drawCard(); // 새로운 카드 뽑기
    console.log(`Dealer draws a card: ${newCard}`);
    bankCards.push(newCard);
    bankSum += newCard;
}

console.log(`Dealer has ${bankSum} points`);

// 딜러의 Bust 또는 승패 결정
if (bankSum > 21) {
    console.log('Dealer bust! You win.');
} else if (bankSum === 21) {
    console.log('Dealer got Blackjack! Bank wins.');
} else {
    // 플레이어와 딜러의 합계를 비교하여 승패 결정
    if (playerSum > bankSum) {
        console.log('You win!');
    } else if (playerSum < bankSum) {
        console.log('Bank wins!');
    } else {
        console.log('It\'s a draw!');
    }
}
