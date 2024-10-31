const quotes = [
    'When you have eliminated the impossible, whatever remains, however improbable, must be the truth.',
    'There is nothing more deceptive than an obvious fact.',
    'I ought to know by this time that when a fact appears to be opposed to a long train of deductions it invariably proves to be capable of bearing some other interpretation.',
    'I never make exceptions. An exception disproves the rule.',
    'What one man can invent another can discover.',
    'Nothing clears up a case so much as stating it to another person.',
    'Education never ends, Watson. It is a series of lessons, with the greatest for the last.'
];

let words = [];
let wordIndex = 0;
let startTime = Date.now();
let gameCompleted = false;

const quoteElement = document.getElementById('quote');
const messageElement = document.getElementById('message');
const typedValueElement = document.getElementById('typed-value');
const startButton = document.getElementById('start');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const closeModalButton = document.getElementById('close-modal');

let scoreList = JSON.parse(localStorage.getItem('scoreList')) || [];

// 게임 시작 시 리스너 활성화 및 초기화
document.getElementById('start').addEventListener('click', () => {
    const quoteIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[quoteIndex];
    words = quote.split(' ');
    wordIndex = 0;

    const spanWords = words.map(function (word) {
        return `<span>${word} </span>`;
    });
    quoteElement.innerHTML = spanWords.join('');
    quoteElement.childNodes[0].className = 'highlight';
    messageElement.innerText = '';

    typedValueElement.className = ''; // 모든 스타일 초기화
    typedValueElement.value = '';
    typedValueElement.disabled = false; // 입력 상자 활성화
    typedValueElement.focus();
    startTime = new Date().getTime(); // 시작 시간 기록
    gameCompleted = false; // 게임 완료 상태 초기화
    startButton.disabled = true; // 시작 버튼 비활성화
});

// 타이핑 입력 이벤트 리스너
typedValueElement.addEventListener('input', () => {
    if (gameCompleted) return; // 게임이 완료된 경우 입력 무시

    const currentWord = words[wordIndex];
    const typedValue = typedValueElement.value;

    // 마지막 단어까지 타이핑을 완료한 경우
    if (typedValue === currentWord && wordIndex === words.length - 1) {
        typedValueElement.className = '';
        const elapsedTime = new Date().getTime() - startTime;
        const timeInSeconds = (elapsedTime / 1000).toFixed(2);
                // 새로운 점수 추가 및 정렬
                scoreList.push(parseFloat(timeInSeconds));
                scoreList.sort((a, b) => a - b);
                
                // 상위 5개의 점수만 저장
                scoreList = scoreList.slice(0, 5);
                
                // 로컬 저장소에 점수 리스트 업데이트
                localStorage.setItem('scoreList', JSON.stringify(scoreList));
       // 최고 점수 및 순위별 점수 출력
        const bestScore = scoreList[0]; // 최고 점수는 첫 번째 항목
        const rankMessage = scoreList
           .map((score, index) => `<p>${index + 1}위: ${score}초</p>`)
           .join('');
       
       // 모달 창에 결과 표시
       modalMessage.innerHTML = `
        <p>현재 게임 기록: ${timeInSeconds}초</p>
           <p> 최고 기록: ${bestScore}초</p>
           <p>Your Ranking:</p>
           ${rankMessage}
       `;
       modal.style.display = 'block';

        messageElement.innerText = `CONGRATULATIONS! You finished in ${timeInSeconds} seconds.`;
        messageElement.className = 'result';
        gameCompleted = true; // 게임 완료 상태로 전환
        typedValueElement.disabled = true; // 입력 상자 비활성화
        startButton.disabled = false; // 시작 버튼 다시 활성화
    }
    // 현재 단어가 맞고 다음 단어로 넘어가는 경우
    else if (typedValue.endsWith(' ') && typedValue.trim() === currentWord) {
        typedValueElement.value = ''; // 입력 상자 비우기
        wordIndex++; // 다음 단어로 이동
        for (const wordElement of quoteElement.childNodes) {
            wordElement.className = ''; // 모든 단어의 하이라이트 제거
        }
        quoteElement.childNodes[wordIndex].className = 'highlight'; // 다음 단어 하이라이트
        
    }
    // 현재 입력이 맞는 부분일 경우
    else if (currentWord.startsWith(typedValue)) {
        typedValueElement.className = ''; // 정상 입력
    }
    // 입력이 틀린 경우
    else {
        typedValueElement.className = 'error'; // 오류 표시
    }
});
closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
});
