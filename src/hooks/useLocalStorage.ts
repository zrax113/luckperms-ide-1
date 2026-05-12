import { useEffect, useCallback, useRef } from "react";

/**
 * Auto-save store state to localStorage with debouncing
 */
export function useAutoSave<T>(
  data: T,
  storageKey: string,
  delayMs: number = 1000,
  enabled: boolean = true,
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(
    (dataToSave: T) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      } catch (e) {
        console.warn(`Failed to save ${storageKey} to localStorage:`, e);
      }
    },
    [storageKey],
  );

  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      save(data);
    }, delayMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delayMs, enabled, save]);
}

/**
 * Load data from localStorage with fallback
 */
export function useLocalStorage<T>(key: string, initialValue: T): T {
  try {
    const item = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return item ? JSON.parse(item) : initialValue;
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage:`, e);
    return initialValue;
  }
}

/**
 * Save data to localStorage
 */
export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
}

/**
 * Load data from localStorage without React
 */
export function loadFromLocalStorage<T>(key: string, initialValue: T): T {
  try {
    const item = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return item ? JSON.parse(item) : initialValue;
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage:`, e);
    return initialValue;
  }
}
