// Lightweight assertion harness. Run with: node scripts/verify-pmview.mjs

// Mock window.localStorage
const store = new Map()
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
}

const { readBool, writeBool, readJSON, writeJSON, KEYS } = await import('../src/lib/storage.js')

let pass = 0, fail = 0
function check(label, cond) {
  if (cond) { pass++; console.log('  ok  ' + label) }
  else      { fail++; console.log('  FAIL ' + label) }
}

check('readBool default', readBool('missing', false) === false)
writeBool('a', true)
check('readBool roundtrip', readBool('a', false) === true)
writeJSON('b', { x: 1 })
check('readJSON roundtrip', readJSON('b', null).x === 1)
check('KEYS exposed', typeof KEYS.pmView === 'string')

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
