import { useEffect, useState, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const handlerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (handlerRef.current) {
      clearTimeout(handlerRef.current);
    }

    handlerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (handlerRef.current) {
        clearTimeout(handlerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
