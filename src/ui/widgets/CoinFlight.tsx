import { useEffect, useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';
import type { CoinEvent } from '../../store/useGameStore';

type Props = {
  event: CoinEvent | null;
  fromRef: RefObject<HTMLElement | null> | null;
  toRef: RefObject<HTMLElement | null> | null;
  onDone: (id: string) => void;
};

type CoinStyle = CSSProperties & {
  '--coin-from-x': string;
  '--coin-from-y': string;
  '--coin-to-x': string;
  '--coin-to-y': string;
};

export const CoinFlight = ({ event, fromRef, toRef, onDone }: Props) => {
  const [style, setStyle] = useState<CoinStyle | null>(null);

  useLayoutEffect(() => {
    if (!event || !fromRef?.current || !toRef?.current) {
      setStyle(null);
      return;
    }
    const from = fromRef.current.getBoundingClientRect();
    const to = toRef.current.getBoundingClientRect();
    setStyle({
      '--coin-from-x': `${from.left + from.width / 2}px`,
      '--coin-from-y': `${from.top + from.height / 2}px`,
      '--coin-to-x': `${to.left + to.width / 2}px`,
      '--coin-to-y': `${to.top + to.height / 2}px`,
    });
  }, [event, fromRef, toRef]);

  useEffect(() => {
    if (!event) return undefined;
    const timer = window.setTimeout(() => onDone(event.id), 620);
    return () => window.clearTimeout(timer);
  }, [event, onDone]);

  if (!event || !style) {
    return null;
  }

  const count = Math.min(5, Math.max(1, event.amount));

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={`${event.id}-${index}`}
          className="coin-disc coin-flight absolute left-0 top-0 h-4 w-4 rounded-full"
          style={{
            ...style,
            animationDelay: `${index * 55}ms`,
          }}
        />
      ))}
    </div>
  );
};
