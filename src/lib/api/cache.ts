const cache = new Map<string, unknown>();

export const cachedFetch = async <T>(
  url: string,
  parse: (json: unknown) => T,
  fetchFn: typeof fetch = fetch
): Promise<T> => {
  const cached = cache.get(url);
  if (cached !== undefined) {
    return cached as T;
  }

  const response = await fetchFn(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }

  const json = await response.json();
  const parsed = parse(json);
  cache.set(url, parsed);
  return parsed;
};

export const clearCache = (): void => {
  cache.clear();
};
