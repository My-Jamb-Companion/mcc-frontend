let _token: string | null = null;

export const tokenManager = {
  get: (): string | null => _token,
  set: (token: string | null): void => {
    _token = token;
  },
  clear: (): void => {
    _token = null;
  },
};
