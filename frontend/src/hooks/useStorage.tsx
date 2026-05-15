// import { useState, useEffect } from "react";

// export default function useLocalStorage<T>(
//   key: string,
//   initialValue: T
// ): [T, (value: T) => void] {
//   // State to store  value
//   const [storedValue, setStoredValue] = useState<T>(() => {
//     // Return initial value during SSR
//     if (typeof window === "undefined") {
//       return initialValue;
//     }

//     try {
//       const item = window.localStorage.getItem(key);
//       return item ? JSON.parse(item) : initialValue;
//     } catch (error) {
//       console.error(`Error reading localStorage key "${key}":`, error);
//       return initialValue;
//     }
//   });

//   // Return a wrapped version of useState's setter function that persists the new value to localStorage
//   const setValue = (value: T) => {
//     try {
//       setStoredValue(value);

//       // Only save to localStorage in browser
//       if (typeof window !== "undefined") {
//         window.localStorage.setItem(key, JSON.stringify(value));
//       }
//     } catch (error) {
//       console.error(`Error setting localStorage key "${key}":`, error);
//     }
//   };

//   // Sync with localStorage after hydration
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       try {
//         const item = window.localStorage.getItem(key);
//         if (item) {
//           const parsedItem = JSON.parse(item);
//           if (parsedItem !== storedValue) {
//             setStoredValue(parsedItem);
//           }
//         }
//       } catch (error) {
//         console.error(`Error syncing localStorage key "${key}":`, error);
//       }
//     }
//   }, [key]);

//   return [storedValue, setValue];
// }

import { useCallback, useEffect, useMemo, useState } from 'react'

type ReturnType<T> = [T, (value: T | ((val: T) => T)) => void, () => void]

const readStorageValue = <T,>(
  key: string,
  defaultValue: T,
  storageObject: Storage | null
) => {
  if (!storageObject) {
    return defaultValue
  }

  try {
    const jsonValue = storageObject.getItem(key)
    return jsonValue != null ? (JSON.parse(jsonValue) as T) : defaultValue
  } catch (error) {
    console.error(`Error reading storage key "${key}":`, error)
    return defaultValue
  }
}

export default function useLocalStorage<T>(key: string, defaultValue: T) {
  // Check if we're in the browser before accessing window
  const storage = typeof window !== 'undefined' ? window.localStorage : null
  return useStorage(key, defaultValue, storage)
}

export function useSessionStorage<T>(key: string, defaultValue: T) {
  // Check if we're in the browser before accessing window
  const storage = typeof window !== 'undefined' ? window.sessionStorage : null
  return useStorage(key, defaultValue, storage)
}

function useStorage<T>(
  key: string,
  defaultValue: T,
  storageObject: Storage | null
): ReturnType<T> {
  const [value, setValue] = useState<T>(() =>
    readStorageValue(key, defaultValue, storageObject)
  )

  useEffect(() => {
    // Only run effects in the browser
    if (!storageObject) return

    if (value === undefined) return storageObject.removeItem(key)
    storageObject.setItem(key, JSON.stringify(value))
  }, [key, value, storageObject])

  const remove = useCallback(() => {
    setValue(defaultValue)
    // Only remove from storage if available
    if (storageObject) {
      storageObject.removeItem(key)
    }
  }, [defaultValue, key, storageObject])

  const setValueWithFunction = useCallback((nextValue: T | ((val: T) => T)) => {
    if (typeof nextValue === 'function') {
      setValue((currentValue) => (nextValue as (val: T) => T)(currentValue))
    } else {
      setValue(nextValue)
    }
  }, [])

  return useMemo(
    () => [value, setValueWithFunction, remove],
    [value, setValueWithFunction, remove]
  )
}
