const perj = require('../src/perj')
const Tool = require('./tool')
const tool = new Tool()
const data = require('../data')
const write = tool.write.bind(tool)
const passThrough = true

beforeEach(() => {
  tool.reset()
})

describe('logger option tests', () => {
  let log = perj.create({
    levels: { foo: 100, bar: 200 },
    level: 'foo',
    write,
    messageKey: 'newMessageKey',
    dataKey: 'newDataKey',
    project: 'elephant',
    session: 12345,
    platform: {
      name: 'node',
      pid: 1234
    },
    undef: undefined,
    nul: null,
    empty: ''
  })
  test('options tests', () => {
    let log = perj.create()
    let custLevels = Object.assign({}, log.levels)
    custLevels.silly = 42
    log = perj.create({
      levels: custLevels,
      level: 'trace',
      levelKey: 'logLevel',
      levelNumberKey: 'levelNo',
      dateTimeKey: 'datetime',
      messageKey: 'message',
      dataKey: 'objectData',
      write,
      foo: 'bar' })
    expect(log.levels.silly).toBe(42)
    expect(tool.getType(log.silly)).toBe('Function')
    expect(log.level).toBe('trace')
    expect(log.write).toBeDefined()
    log.silly(data.msg[0], data.tardis)
    expect(tool.jsonOut.logLevel).toBe('silly')
    expect(tool.jsonOut.levelNo).toBe(42)
    expect(tool.getType(tool.jsonOut.datetime)).toBe('Number')
    expect(tool.jsonOut.message).toBe(data.msg[0])
    expect(tool.jsonOut.objectData).toMatchObject(data.tardis)
    expect(data.tardis).toMatchObject(tool.jsonOut.objectData)
    custLevels.crazy = 43
    // Only baz: true should be added to child.
    log = log.child({
      levels: custLevels,
      level: 'debug',
      levelKey: 'childLogLevel',
      levelNumberKey: 'childLevelNo',
      dateTimeKey: 'childDatetime',
      messageKey: 'childMessage',
      dataKey: 'childObjectData',
      write,
      baz: true })
    expect(log.levels.silly).toBe(42)
    expect(tool.getType(log.silly)).toBe('Function')
    expect(log.crazy).toBeUndefined()
    expect(log.level).toBe('trace')
    expect(log.write).toBeDefined()
    tool.reset()
    log.silly(data.msg[0], data.tardis)
    expect(tool.jsonOut.logLevel).toBe('silly')
    expect(tool.jsonOut.levelNo).toBe(42)
    expect(tool.getType(tool.jsonOut.datetime)).toBe('Number')
    expect(tool.jsonOut.message).toBe(data.msg[0])
    expect(tool.jsonOut.objectData).toMatchObject(data.tardis)
    expect(data.tardis).toMatchObject(tool.jsonOut.objectData)
    expect(() => { perj.create({level: 'abc'}) }).toThrow('The level option must be a valid key in the levels object.')
  })
  test('options passThrough', () => {
    let log = perj.create({ write, passThrough, foo: 'bar' })
    log.info(data.msg[0], data.tardis)
    expect(tool.objOut.level).toBe('info')
    expect(tool.objOut.lvl).toBe(30)
    expect(tool.getType(tool.objOut.time)).toBe('Number')
    expect(tool.objOut.msg).toBe(data.msg[0])
    expect(tool.objOut.foo).toBe('bar')
    expect(tool.objOut.data).toMatchObject(data.tardis)
    expect(data.tardis).toMatchObject(tool.objOut.data)
    log = log.child({ foobar: 'baz' })
    tool.reset()
    log.info(data.msg[0], data.tardis)
    expect(tool.objOut.level).toBe('info')
    expect(tool.objOut.lvl).toBe(30)
    expect(tool.getType(tool.objOut.time)).toBe('Number')
    expect(tool.objOut.msg).toBe(data.msg[0])
    expect(tool.objOut.foo).toBe('bar')
    expect(tool.objOut.foobar).toBe('baz')
    expect(tool.objOut.data).toMatchObject(data.tardis)
    expect(data.tardis).toMatchObject(tool.objOut.data)
  })
  test('top level properties', () => {
    let log = perj.create({ write, passThrough, foo: 'bar' })
    log.info(data.msg[0], data.tardis)
    expect(Object.keys(tool.jsonOut).length).toBe(6)
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe(data.msg[0])
    expect(tool.jsonOut.data).toMatchObject(data.tardis)
    expect(data.tardis).toMatchObject(tool.jsonOut.data)
    expect(tool.jsonOut.data).toMatchObject(data.tardis)
  })
  test('top level object', () => {
    let log = perj.create({ write, passThrough, foo: 'bar', platform: { name: 'node', pid: 1234 } })
    log.info(data.msg[0], data.tardis)
    expect(Object.keys(tool.jsonOut).length).toBe(7)
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe(data.msg[0])
    expect(tool.jsonOut.data).toMatchObject(data.tardis)
    expect(data.tardis).toMatchObject(tool.jsonOut.data)
    expect(tool.getType(tool.jsonOut.platform)).toBe('Object')
    expect(tool.jsonOut.platform.name).toBe('node')
    expect(tool.jsonOut.platform.pid).toBe(1234)
    let child = log.child({ platform: { page: 1, exit: false } })
    tool.reset()
    child.info(data.msg[0], data.tardis)
    expect(Object.keys(tool.jsonOut).length).toBe(7)
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.msg).toBe(data.msg[0])
    expect(tool.jsonOut.data).toMatchObject(data.tardis)
    expect(data.tardis).toMatchObject(tool.jsonOut.data)
    expect(tool.getType(tool.jsonOut.platform)).toBe('Object')
    expect(tool.jsonOut.platform.name).toBeUndefined()
    expect(tool.jsonOut.platform.pid).toBeUndefined()
    expect(tool.jsonOut.platform.page).toBe(1)
    expect(tool.jsonOut.platform.exit).toBe(false)
  })
  test('child logger properties', () => {
    let log = perj.create({ write, passThrough, foo: 'bar' })
    const child = log.child({ env: 'dev' })
    tool.reset()
    log.info(data.msg[0])
    expect(tool.jsonOut.env).toBeUndefined()
    tool.reset()
    child.info(data.msg[1], data.serenity)
    expect(Object.keys(tool.jsonOut).length).toBe(7)
    expect(tool.getType(tool.jsonOut.time)).toBe('Number')
    expect(tool.jsonOut.level).toBe('info')
    expect(tool.jsonOut.msg).toBe(data.msg[1])
    expect(tool.jsonOut.data).toMatchObject(data.serenity)
    expect(data.serenity).toMatchObject(tool.jsonOut.data)
    expect(tool.jsonOut.env).toBe('dev')
    expect(() => { log.child() }).toThrow('Provide top level arguments to create a child logger.')
  })
  test('undefined and null values', () => {
    const log = perj.create({ undef: undefined, nul: null, write })
    log.info(data.msg[0])
    expect(tool.jsonOut.undef).toBe('')
    expect(tool.jsonOut.nul).toBe(null)
    tool.reset()
    const child = log.child({ undef2: undefined, nul2: null })
    child.info(data.msg[0])
    expect(tool.jsonOut.undef2).toBe('')
    expect(tool.jsonOut.nul2).toBe(null)
  })
  test('child logger level', () => {
    log = perj.create({ level: 'fatal', write })
    let child = log.child({ child: true })
    child.level = 'trace'
    tool.reset()
    log.info(data.msg[0])
    expect(tool.jsonOut.msg).toBeUndefined()
    tool.reset()
    child.info(data.msg[0])
    expect(tool.jsonOut.msg).toBe(data.msg[0])
  })
})
