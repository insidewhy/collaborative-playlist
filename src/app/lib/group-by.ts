export default function groupBy<T, K>(vals: T[], mapper: (T)=>K): Map<K, T[]> {
  const map = new Map<K, T[]>()
  vals.forEach(val => {
    const key = mapper(val)
    const existing = map.get(key)
    if (existing)
      existing.push(val)
    else
      map.set(key, [val])
  })
  return map
}
