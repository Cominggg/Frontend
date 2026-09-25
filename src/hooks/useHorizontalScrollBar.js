import { useState } from 'react';
import useHorizontalWheelGuard from './useHorizontalWheelGuard';
import useEdgeFade from './useEdgeFade';

// 가로 스크롤 탭/필터 바 공용 훅 — 휠 가드와 엣지 페이드를 한 요소에 함께 건다.
// ref는 callback ref라서 요소가 조건부로 다시 렌더돼도 새 요소에 다시 붙는다.
export default function useHorizontalScrollBar() {
  const [el, setEl] = useState(null);
  useHorizontalWheelGuard(el);
  const style = useEdgeFade(el);
  return { ref: setEl, style };
}
