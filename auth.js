export const USER_STORAGE_KEY = 'agenda-recordatorios-usuario';

export function validateCredentials(username, password) {
  return (
    typeof username === 'string' &&
    username.trim().length > 0 &&
    typeof password === 'string' &&
    password.trim().length > 0
  );
}

export function createAccount(username, password) {
  return {
    username: username.trim(),
    password,
  };
}

export function credentialsMatch(account, username, password) {
  return (
    account !== null &&
    typeof account === 'object' &&
    account.username === username.trim() &&
    account.password === password
  );
}
