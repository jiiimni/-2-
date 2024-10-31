let highestZIndex = 1;

console.log(document.getElementById('plant1'));
dragElement(document.getElementById('plant1'));
dragElement(document.getElementById('plant2'));
dragElement(document.getElementById('plant3'));
dragElement(document.getElementById('plant4'));
dragElement(document.getElementById('plant5'));
dragElement(document.getElementById('plant6'));
dragElement(document.getElementById('plant7'));
dragElement(document.getElementById('plant8'));
dragElement(document.getElementById('plant9'));
dragElement(document.getElementById('plant10'));
dragElement(document.getElementById('plant11'));
dragElement(document.getElementById('plant12'));
dragElement(document.getElementById('plant13'));
dragElement(document.getElementById('plant14'));

function dragElement(terrariumElement) {
    let offsetX = 0,
        offsetY = 0;

    terrariumElement.draggable = true; // Drag and Drop API 적용
    terrariumElement.ondblclick = bringToFront; // 더블 클릭 시 z-index 조정

    terrariumElement.addEventListener("dragstart", dragStart);
    terrariumElement.addEventListener("drag", drag);
    terrariumElement.addEventListener("dragend", dragEnd);

    function dragStart(e) {
        // 드래그 시작 시, 요소의 현재 위치와 마우스 좌표의 차이를 저장
        offsetX = e.clientX - terrariumElement.offsetLeft;
        offsetY = e.clientY - terrariumElement.offsetTop;

        // 기본 드래그 미리보기 이미지를 완전히 비활성화
        const emptyImage = new Image();
        emptyImage.src = "";
        e.dataTransfer.setDragImage(emptyImage, 0, 0);

        // 드래그하는 요소의 위치를 절대 위치로 설정
        terrariumElement.style.position = "absolute";
    }

    function drag(e) {
        if (e.clientX === 0 && e.clientY === 0) return; // 드래그가 끝난 후 이벤트 무시

        // 요소 위치 업데이트
        terrariumElement.style.left = (e.clientX - offsetX) + "px";
        terrariumElement.style.top = (e.clientY - offsetY) + "px";
    }

    function dragEnd(e) {
        // 드래그 종료 시 최종 위치를 고정
        terrariumElement.style.left = (e.clientX - offsetX) + "px";
        terrariumElement.style.top = (e.clientY - offsetY) + "px";
    }

    function bringToFront() {
        highestZIndex++;
        terrariumElement.style.zIndex = highestZIndex;
    }
}
