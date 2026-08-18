import assert from 'node:assert/strict';
import test from 'node:test';
import { cleanColors } from '../src/utils/catalog';

test('cleanColors preserves the admin color payload stored in Supabase', () => {
  const image = 'https://example.supabase.co/storage/v1/object/public/product-images/iphone-14-blue.jpg';
  const colors = cleanColors([{
    name: 'Bleu',
    hex: '#0066cc',
    image,
    stock: 7,
    available: true,
    sort_order: 0,
  }], 20);

  assert.deepEqual(colors, [{
    name: 'Bleu',
    hex: '#0066cc',
    image,
    stock: 7,
    available: true,
    sort_order: 0,
  }]);
});

test('cleanColors rejects malformed colors instead of storing invalid JSON', () => {
  assert.deepEqual(cleanColors([{ name: 'Bleu', hex: 'blue' }], 20), []);
});
