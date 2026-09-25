import { useEffect } from 'react';

// 가로 스크롤 탭/필터 바 위에서 마우스 휠(세로 스크롤)을 사용하면
// 브라우저가 이를 가로 스크롤로 바꿔 버튼이 움직이는 것처럼 보이는 현상을 막는다.
// 세로 휠 입력은 그대로 페이지 스크롤로 전달한다.
// 요소를 인자로 받아, 조건부 렌더로 요소가 다시 마운트돼도 리스너가 새 요소에 붙는다.
export default function useHorizontalWheelGuard(el) {
  useEffect(() => {
    if (!el) return undefined;

    const handleWheel = (event) => {
      if (event.shiftKey) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      event.preventDefault();
      window.scrollBy(0, event.deltaY);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [el]);
}
