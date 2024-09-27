// blackjack.js
// 카드 초기화
let cardOne = 7;
let cardTwo = 5;
let cardThree = 7; // 추가 카드

let cardOneBank = 7;
let cardTwoBank = 5;
let cardThreeBank = 6; // 딜러의 추가 카드
let cardFourBank = 4;

// 플레이어 카드 합계
let playerSum = cardOne + cardTwo + cardThree;

// 플레이어 합계 출력
console.log(`You have ${playerSum} points`);

// 블랙잭 또는 Bust 확인
if (playerSum > 21) {
  console.log('You bust! Bank wins.');
  return; // 게임 종료
} else if (playerSum === 21) {
  console.log('Blackjack! You win!');
  return; // 즉시 승리
}

// 딜러 카드 합계
let bankSum = cardOneBank + cardTwoBank + cardThreeBank + cardFourBank;

// 딜러가 17점 이상이 될 때까지 카드 추가
while (bankSum < 17) {
  let newCard = Math.floor(Math.random() * 11) + 1; // 새로운 카드 뽑기 (1~11 사이 무작위 숫자)
  console.log(`Dealer draws a card: ${newCard}`);
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
