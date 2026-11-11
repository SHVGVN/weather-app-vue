export interface Debounced<A extends unknown[]> {
  (...args: A): void
  cancel: () => void
}

export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number,
): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | undefined

  const debounced = (...args: A) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }

  debounced.cancel = () => clearTimeout(timer)
  return debounced
}
