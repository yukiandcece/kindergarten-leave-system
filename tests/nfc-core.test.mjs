import assert from 'node:assert/strict';
import { parseNdefRecord } from '../nfcDemo/nfc-core.js';

const expectedNfcId = '41025_18181459960';

const displayedRecord = {
  recordType: 'text',
  mediaType: '',
  id: '',
  byteLength: 17,
  rawHex: '34 31 30 32 35 5f 31 38 31 38 31 34 35 39 39 36 30',
  nfc_id: expectedNfcId,
  encoding: 'utf-8',
  lang: 'zh-CN'
};

assert.equal(displayedRecord.nfc_id, expectedNfcId);

const encoded = new TextEncoder().encode(expectedNfcId);
const parsedRecord = parseNdefRecord({
  recordType: 'text',
  mediaType: '',
  id: '',
  data: new DataView(encoded.buffer),
  encoding: 'utf-8',
  lang: 'zh-CN'
});

assert.equal(parsedRecord.recordType, 'text');
assert.equal(parsedRecord.text, expectedNfcId);
assert.equal(parsedRecord.nfc_id, expectedNfcId);
assert.equal(
  parsedRecord.rawHex,
  '34 31 30 32 35 5f 31 38 31 38 31 34 35 39 39 36 30'
);

console.log('NFC core tests passed');
