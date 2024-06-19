export function snakeCase(key: string) {
  return key.replace(/[A-Z]/g, (s) => '-' + s.toLowerCase());
}
