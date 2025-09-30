import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

/**
 * Hash a password with bcrypt.
 */
export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

/**
 * Generate unique DNIs (8 digits) as strings.
 */
export function uniqueDniGenerator(count: number) {
  const set = new Set<string>();
  while (set.size < count) {
    const dni = faker.string.numeric(8);
    set.add(dni);
  }
  return Array.from(set);
}

/**
 * Generate unique emails for given count. Optionally pass domain.
 */
export function uniqueEmailGenerator(count: number, domain = 'example.com') {
  const set = new Set<string>();
  while (set.size < count) {
    const first = faker.person
      .firstName()
      .toLowerCase()
      .replace(/[^a-z]/g, '');
    const last = faker.person
      .lastName()
      .toLowerCase()
      .replace(/[^a-z]/g, '');
    const email = `${first}.${last}${faker.number.int({ min: 1, max: 999 })}@${domain}`;
    set.add(email);
  }
  return Array.from(set);
}

export const randomPhone = () => '9' + faker.string.numeric(7);

/**
 * Random name pair.
 */
export const randomFullName = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
});
