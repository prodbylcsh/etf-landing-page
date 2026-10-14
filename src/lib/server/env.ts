// Serverové proměnné prostředí. Na Vercelu je čteme z process.env (runtime), lokálně i z import.meta.env.
export function env(name: string): string | undefined {
  const v = (typeof process !== 'undefined' ? process.env?.[name] : undefined) ?? (import.meta.env as Record<string, string | undefined>)[name];
  return v && v.trim() ? v.trim() : undefined;
}
