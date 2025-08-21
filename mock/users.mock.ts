// create mock users using faker
import { CreateUserSchema } from '@/schemas';
import { faker } from '@faker-js/faker';

export function createMockUser(seed?: number): CreateUserSchema {
  if (typeof seed === 'number') {
    faker.seed(seed);
  }

  return {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: faker.internet.password(),
  };
}

export function createMockUsers(count: number): CreateUserSchema[] {
  return Array.from({ length: count }, createMockUser);
}
