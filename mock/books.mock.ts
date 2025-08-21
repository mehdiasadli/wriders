import { CreateBookSchema, CreateSeriesSchema } from '@/schemas';
import { faker } from '@faker-js/faker';

export function createMockSeries(): CreateSeriesSchema {
  const hasSynopsis = faker.datatype.boolean();

  return {
    title: faker.lorem.sentence({ min: 1, max: 4 }),
    synopsis: hasSynopsis ? faker.lorem.paragraph({ min: 2, max: 5 }) : undefined,
  };
}

export function createMockSerieses(count: number): CreateSeriesSchema[] {
  return Array.from({ length: count }, createMockSeries);
}

export function createMockBook(): CreateBookSchema {
  const hasSynopsis = faker.datatype.boolean();

  return {
    title: faker.lorem.sentence({ min: 1, max: 4 }),
    visibility: faker.helpers.weightedArrayElement([
      {
        value: 'PRIVATE',
        weight: 1,
      },
      {
        value: 'PUBLIC',
        weight: 3,
      },
    ]),
    synopsis: hasSynopsis ? faker.lorem.paragraph({ min: 2, max: 5 }) : undefined,
  };
}

export function createMockBooks(count: number): CreateBookSchema[] {
  return Array.from({ length: count }, createMockBook);
}
