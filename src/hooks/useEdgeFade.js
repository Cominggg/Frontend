import { useEffect, useRef, useState } from 'react';

const FADE_SIZE = 28;

// 가로 스크롤 컨테이너의 실제 스크롤 위치를 읽어 mask-image 페이드를
// 좌/우 중 "더 스크롤할 내용이 남은 쪽"에만 동적으로 적용한다.
// 정적인 mask-image는 끝까지 스크롤해도 마지막 항목이 계속 잘려 보이는 문제가 있다.
export default function useEdgeFade() {
  const ref = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const update = () => {
      setAtStart(el.scrollLeft <= 0);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const maskImage = `linear-gradient(to right, ${atStart ? 'black' : 'transparent'}, black ${FADE_SIZE}px, black calc(100% - ${FADE_SIZE}px), ${atEnd ? 'black' : 'transparent'})`;

  return { ref, style: { maskImage, WebkitMaskImage: maskImage } };
}
