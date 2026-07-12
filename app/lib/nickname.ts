export const NICKNAME_MAX_WEIGHT = 12;
export const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9_]+$/;

export function getNicknameWeight(value: string): number {
  return Array.from(value).reduce(
    (weight, character) => weight + (/[가-힣]/.test(character) ? 2 : 1),
    0
  );
}

export function isNicknameValid(value: string): boolean {
  return (
    value.length >= 2 &&
    getNicknameWeight(value) <= NICKNAME_MAX_WEIGHT &&
    NICKNAME_PATTERN.test(value)
  );
}
