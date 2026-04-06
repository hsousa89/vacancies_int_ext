// Pure functions for string manipulation
export function parseSchool(schoolString?: string) {
  if (!schoolString) return { code: '', name: '' };
  const parts = schoolString.split(' - ');
  const code = parts[0];
  const name = parts.slice(1).join(' - ') || schoolString;
  return { code, name };
}

export function parseConcelho(concelhoString?: string) {
  if (!concelhoString) return '';
  return concelhoString.split(' (')[0];
}