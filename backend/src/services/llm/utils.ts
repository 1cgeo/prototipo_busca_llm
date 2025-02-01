/**
 * Calcula a distância de Levenshtein entre duas strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Normaliza uma string removendo acentos e caracteres especiais
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Encontra a string mais próxima em uma lista de opções válidas
 */
export function findClosestMatch(
  value: string,
  validOptions: readonly string[],
): string | undefined {
  if (validOptions.includes(value)) {
    return value;
  }

  const normalizedValue = normalizeString(value);
  const normalizedOptions = validOptions.map(opt => ({
    original: opt,
    normalized: normalizeString(opt),
  }));

  let bestMatch = undefined;
  let minDistance = Infinity;
  const maxAllowedDistance = Math.floor(normalizedValue.length * 0.3);

  for (const option of normalizedOptions) {
    const distance = levenshteinDistance(normalizedValue, option.normalized);
    const maxLength = Math.max(
      normalizedValue.length,
      option.normalized.length,
    );
    const score = 1 - distance / maxLength;

    if (distance < minDistance && score >= 0.7) {
      minDistance = distance;
      bestMatch = option.original;
    }
  }

  return minDistance <= maxAllowedDistance ? bestMatch : undefined;
}
