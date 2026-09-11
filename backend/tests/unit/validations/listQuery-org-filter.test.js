'use strict';

const dosenValidation = require('../../../src/validations/institusi/dosen.validation');
const programStudiValidation = require('../../../src/validations/institusi/program-studi.validation');

const id = '123e4567-e89b-12d3-a456-426614174000';
const id2 = '223e4567-e89b-12d3-a456-426614174000';

describe('listQuery accepts org-scope filters injected by attachAbility', () => {
  const cases = [
    ['dosen program_studi_id array', dosenValidation, { program_studi_id: [id, id2] }],
    ['dosen program_studi_id scalar', dosenValidation, { program_studi_id: id }],
    ['dosen fakultas_id array', dosenValidation, { fakultas_id: [id] }],
    ['dosen departemen_id array', dosenValidation, { departemen_id: [id2] }],
    ['program-studi id array (narrow scope)', programStudiValidation, { id: [id, id2] }],
    ['program-studi fakultas_id array', programStudiValidation, { fakultas_id: [id] }],
  ];

  for (const [name, validation, filter] of cases) {
    test(`accepts ${name}`, () => {
      const result = validation.list.validate({ filter });
      expect(result.error).toBeFalsy();
    });
  }

  test('rejects filter keys outside the declared + org filter set', () => {
    const result = dosenValidation.list.validate({ filter: { foo: 'bar' } });
    expect(result.error).toBeTruthy();
  });

  test('rejects filter values outside string/number/boolean/array', () => {
    const result = dosenValidation.list.validate({ filter: { program_studi_id: { id } } });
    expect(result.error).toBeTruthy();
  });
});