import assert from 'node:assert/strict';
import { backOfficeCode, frontOfficeCode, loadOfficeCounts } from '../src/lib/front-office.ts';

const ranges = [];
function database(rows, responseError = null) {
  return {
    from(table) {
      assert.equal(table, 'registrations');
      return {
        select(columns) { assert.equal(columns, 'programme,function'); return this; },
        order(column) { assert.equal(column, 'id'); return this; },
        range(start, end) {
          ranges.push([start, end]);
          // Simulate a database response cap smaller than the requested page.
          return Promise.resolve({ data: rows.slice(start, Math.min(end + 1, start + 137)), count: rows.length, error: responseError });
        },
      };
    },
  };
}

assert.equal(frontOfficeCode(' OGV '), 'oGV');
assert.equal(frontOfficeCode('igt'), 'iGT');
assert.equal(frontOfficeCode(null), 'other');
assert.equal(frontOfficeCode('Unknown'), 'other');
assert.equal(backOfficeCode(' tm '), 'TM');
assert.equal(backOfficeCode('mkt'), 'MKT');
assert.equal(backOfficeCode('Other relevant function*'), 'other');
assert.equal(backOfficeCode(null), 'other');
const rows = Array.from({ length: 1207 }, (_, index) => ({
  programme: ['oGV', 'oGT', 'iGV', 'iGT', null][index % 5],
  function: ['TM', 'EM', 'BD', 'PR', 'MKT', 'Other relevant function*'][index % 6],
}));
const result = await loadOfficeCounts(database(rows));
assert.equal(result.total, 1207);
assert.deepEqual(result.front, { oGV: 242, oGT: 242, iGV: 241, iGT: 241, other: 241 });
assert.deepEqual(result.back, { TM: 202, EM: 201, BD: 201, PR: 201, MKT: 201, other: 201 });
assert.equal(ranges.length, 9);
assert.equal(ranges[1][0], 137);
assert.deepEqual(await loadOfficeCounts(database([])), { total: 0, front: { oGV: 0, oGT: 0, iGV: 0, iGT: 0, other: 0 }, back: { TM: 0, EM: 0, BD: 0, PR: 0, MKT: 0, other: 0 } });
await assert.rejects(() => loadOfficeCounts(database(rows, { message: 'Read denied' })), error => error.message === 'Read denied');
console.log('PASS: front/back office normalization, all-page counts, server page limits, empty data and read errors.');
