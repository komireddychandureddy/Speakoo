export function toApplicationReference(submissionId: string): string {
  const compact = submissionId.replace(/-/g, '').slice(0, 8);
  const code = Number.parseInt(compact, 16)
    .toString(36)
    .toUpperCase()
    .padStart(6, '0')
    .slice(-6);
  return `TUT-${code}`;
}
