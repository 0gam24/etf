'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  /** 최종 숫자 (예: 12.34, 84500) */
  value: number;
  /** 소수점 자리수 (기본 0) */
  decimals?: number;
  /** 단위 접미사 (예: '%', '주') */
  suffix?: string;
  /** 부호 표시 (등락률용) */
  sign?: boolean;
  /** 천 단위 콤마 (기본 true) */
  comma?: boolean;
  /** 애니메이션 시간(ms) (기본 900) */
  durationMs?: number;
  /** prefix 텍스트 (예: '+') */
  prefix?: string;
}

/**
 * 화면 진입 시 숫자가 0(또는 음수면 0보다 큰 쪽)에서 최종값으로 카운트업.
 * IntersectionObserver로 1회만 작동하며, prefers-reduced-motion 감지 시 즉시 표시.
 */
export default function CountUpNumber({
  value,
  decimals = 0,
  suffix = '',
  sign = false,
  comma = true,
  durationMs = 900,
  prefix = '',
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState<number>(value);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduced) {
      setDisplay(value);
      return;
    }
    setDisplay(0);
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          setArmed(true);
          io.disconnect();
          break;
        }
      }
    }, { threshold: 0.4 });
    io.observe(node);
    return () => io.disconnect();
  }, [value]);

  useEffect(() => {
    if (!armed) return;
    const start = performance.now();
    const from = 0;
    const to = value;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (to - from) * eased;
      setDisplay(v);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [armed, value, durationMs]);

  const formatted = (() => {
    const fixed = display.toFixed(decimals);
    if (!comma) return fixed;
    const [int, dec] = fixed.split('.');
    const withComma = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return dec ? `${withComma}.${dec}` : withComma;
  })();

  const signStr = sign && value > 0 ? '+' : '';

  return (
    <span ref={ref}>
      {prefix}{signStr}{formatted}{suffix}
    </span>
  );
}
