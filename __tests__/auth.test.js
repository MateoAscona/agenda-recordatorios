import {
  createAccount,
  credentialsMatch,
  validateCredentials,
} from '../auth';

describe('validación de usuario', () => {
  test('no acepta usuario o contraseña vacíos', () => {
    expect(validateCredentials('', 'clave123')).toBe(false);
    expect(validateCredentials('mateo', '   ')).toBe(false);
  });

  test('crea una cuenta quitando espacios del usuario y conservando la contraseña', () => {
    expect(createAccount(' mateo ', ' clave123 ')).toEqual({
      username: 'mateo',
      password: ' clave123 ',
    });
  });

  test('comprueba usuario y contraseña', () => {
    const account = createAccount('mateo', 'clave123');

    expect(credentialsMatch(account, 'mateo', 'clave123')).toBe(true);
    expect(credentialsMatch(account, 'mateo', 'otra-clave')).toBe(false);
    expect(credentialsMatch(null, 'mateo', 'clave123')).toBe(false);
  });
});
