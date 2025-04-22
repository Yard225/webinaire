export const extractToken = (header: string): string | null => {
  const parts = header.split(' ');
  return parts[0] !== 'Basic' ? null : parts[1];
};
