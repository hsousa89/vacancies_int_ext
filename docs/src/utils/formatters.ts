// Pure functions for string manipulation
export function parseSchool(schoolString?: string) {
  if (!schoolString) return { code: '', name: '' };
  const parts = schoolString.split(' - ');
  const code = parts[0];
  const name = parts.slice(1).join(' - ') || schoolString;
  return { code, name };
}

export function parseConcelho(concelhoString?: string) {
  if (!concelhoString) return { name: '', code: '' };
  const match = concelhoString.match(/^([^(]+)\s*\((\d{4})\)\s*$/);
  const name = match ? match[1].trim() : concelhoString.split(' (')[0].trim();
  const code = match ? match[2].trim() : concelhoString.split(' (')[1].replace(')', '').trim();
  return { name, code };
}

export function parseSubject(subjectString?: string) {
  if (!subjectString) return { code: '', name: '' };
  const parts = subjectString.split(' - ');
  const code = parts[0];
  const name = parts.slice(1).join(' - ') || subjectString;
  return { code, name };
}