import { useEffect, useState } from 'react'

export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable — keep in-memory state */
  }
}

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => readStorage(key, initial))
  useEffect(() => writeStorage(key, value), [key, value])
  return [value, setValue]
}
