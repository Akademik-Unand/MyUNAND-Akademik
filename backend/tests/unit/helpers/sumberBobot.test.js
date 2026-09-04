'use strict';

const { leafIds } = require('../../../src/helpers/sumberBobot');

describe('sumberBobot leafIds', () => {
  it('drops parents that have children', () => {
    const rows = [
      { id: 'p', parent_cpmk_id: null },
      { id: 's1', parent_cpmk_id: 'p' },
      { id: 's2', parent_cpmk_id: 'p' },
      { id: 'q', parent_cpmk_id: null },
    ];
    expect(leafIds(rows).sort()).toEqual(['q', 's1', 's2']);
  });
});
