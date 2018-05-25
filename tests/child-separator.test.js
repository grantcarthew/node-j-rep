const perj = require('../src/perj')
const Tool = require('./tool')
const tool = new Tool()
const write = tool.write.bind(tool)
const passThrough = true

let log = perj.create({ test: 'parent', write, passThrough })
let child = []

beforeEach(() => {
  tool.reset()
})

describe('child separator tests', () => {
  test('parent', () => {
    log.info('parent', { parent: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('parent')
    expect(tool.jsonOut.data.parent).toBe(true)
    expect(tool.jsonOut.test).toBe('parent')
  })
  test('first child', () => {
    child.push(log.child({ test: 'first child', test2: 'first child2' }))
    child[0].info('first child', { c1: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('first child')
    expect(tool.jsonOut.data.c1).toBe(true)
    expect(tool.jsonOut.test).toBe('parent:first child')
    expect(tool.jsonOut.test2).toBe('first child2')
  })
  test('second child', () => {
    child.push(child[0].child({ test: 'second child', test2: 'second child2' }))
    child[1].info('second child', { c2: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('second child')
    expect(tool.jsonOut.data.c2).toBe(true)
    expect(tool.jsonOut.test).toBe('parent:first child:second child')
    expect(tool.jsonOut.test2).toBe('first child2:second child2')
  })
  test('third child', () => {
    child.push(child[1].child({ test: 'third child', test2: 'third child2' }))
    child[2].info('third child', { c3: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('third child')
    expect(tool.jsonOut.data.c3).toBe(true)
    expect(tool.jsonOut.test).toBe('parent:first child:second child:third child')
    expect(tool.jsonOut.test2).toBe('first child2:second child2:third child2')
  })
  test('parent unchanged', () => {
    log.info('parent', { parent: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('parent')
    expect(tool.jsonOut.data.parent).toBe(true)
    expect(tool.jsonOut.test).toBe('parent')
    expect(tool.jsonOut.test2).toBeUndefined()
  })
})

describe('child custom separator tests', () => {
  test('custom parent', () => {
    log = perj.create({ test: 'parent', write, passThrough, separatorString: ' > ' })
    child = []
    log.info('parent', { parent: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('parent')
    expect(tool.jsonOut.data.parent).toBe(true)
    expect(tool.jsonOut.test).toBe('parent')
  })
  test('custom first child', () => {
    child.push(log.child({ test: 'first child' }))
    child[0].info('first child', { c1: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('first child')
    expect(tool.jsonOut.data.c1).toBe(true)
    expect(tool.jsonOut.test).toBe('parent > first child')
  })
  test('custom second child', () => {
    child.push(child[0].child({ test: 'second child' }))
    child[1].info('second child', { c2: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('second child')
    expect(tool.jsonOut.data.c2).toBe(true)
    expect(tool.jsonOut.test).toBe('parent > first child > second child')
  })
  test('custom third child', () => {
    child.push(child[1].child({ test: 'third child' }))
    child[2].info('third child', { c3: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('third child')
    expect(tool.jsonOut.data.c3).toBe(true)
    expect(tool.jsonOut.test).toBe('parent > first child > second child > third child')
  })
  test('custom parent unchanged', () => {
    log.info('parent', { parent: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('parent')
    expect(tool.jsonOut.data.parent).toBe(true)
    expect(tool.jsonOut.test).toBe('parent')
  })
})

describe('object no child separator', () => {
  test('parent no child separator', () => {
    log = perj.create({ test: { p: 1 }, write, passThrough, separatorString: '@' })
    child = []
    log.info('parent', { parent: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('parent')
    expect(tool.jsonOut.data.parent).toBe(true)
    expect(tool.jsonOut.test.p).toBe(1)
  })
  test('first child no child separator', () => {
    child.push(log.child({ test: { c: 1 } }))
    child[0].info('first child', { c1: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('first child')
    expect(tool.jsonOut.data.c1).toBe(true)
    expect(tool.jsonOut.test.c).toBe(1)
  })
  test('second child no child separator', () => {
    child.push(child[0].child({ test: { c: 2 } }))
    child[1].info('second child', { c2: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('second child')
    expect(tool.jsonOut.data.c2).toBe(true)
    expect(tool.jsonOut.test.c).toBe(2)
  })
  test('parent unchanged no child separator', () => {
    log.info('parent', { parent: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('parent')
    expect(tool.jsonOut.data.parent).toBe(true)
    expect(tool.jsonOut.test.p).toBe(1)
  })
})

describe('deep child separator', () => {
  let deepLog = perj.create({ test: 'p', write, passThrough, separatorString: '#' })
  let value = 'p'
  test('parent deep', () => {
    deepLog.info(value, { parent: true })
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.lvl).toBe(30)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe('p')
    expect(tool.jsonOut.data.parent).toBe(true)
    expect(tool.jsonOut.test).toBe(value)
  })
  test('child deep separator', () => {
    for (let i = 0; i < 100; i++) {
      value += '#c' + i
      deepLog = deepLog.child({ test: 'c' + i })
      deepLog.info('c' + i, { c: i })
      expect(tool.jsonOut.level).toBe('info')
      expect(tool.jsonOut.lvl).toBe(30)
      expect(tool.getType(tool.jsonOut.time)).toBe('Number')
      expect(tool.jsonOut.msg).toBe('c' + i)
      expect(tool.jsonOut.data.c).toBe(i)
      expect(tool.jsonOut.test).toBe(value)
    }
  })
})
