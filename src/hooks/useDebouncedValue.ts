import { useEffect, useState } from "react";

// Returns `value` only after it has stopped changing for `delay` ms.
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    // Cleanup runs before the next effect and on unmount: each new keystroke cancels the
    // pending timeout, so only the last value wins and no timer outlives the component.
    return () => clearTimeout(id);
  }, [value, delay]); // both are read inside the effect, so both belong in the array

  return debounced;
}
