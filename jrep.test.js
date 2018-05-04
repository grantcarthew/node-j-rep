require('console-probe').apply()

let output = {}
const write = function (text) {
  output = JSON.parse(text)
}

function getType (value) {
  return Object.prototype.toString.call(value).slice(8).slice(0, -1)
}

// const jrep = require('./index')
const jrep = require('./jrep')
const msg1 = 'the quick brown fox'
const msg2 = 'jumped over the lazy dog'
const msg3 = 'and back again.'
const msg4 = 'that crazy dog!'
const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace']
const data1 = {foo: 'bar', levels}
const data2 = {bar: 'foo', answer: 42, levels}

beforeEach(() => {
  output = {}
})

describe('logger object tests', () => {
  test('member tests', () => {
    expect(getType(jrep.create)).toBe('Function')
    const log = jrep.create()
    expect(getType(log.options)).toBe('Object')
    expect(Object.keys(log.options).length).toBe(4)
    expect(getType(log.options.levels)).toBe('Object')
    expect(getType(log.child)).toBe('Function')
    expect(getType(log.fatal)).toBe('Function')
    expect(getType(log.error)).toBe('Function')
    expect(getType(log.warn)).toBe('Function')
    expect(getType(log.info)).toBe('Function')
    expect(getType(log.debug)).toBe('Function')
    expect(getType(log.trace)).toBe('Function')
  })
  test('options tests', () => {
    let log = jrep.create({ foo: 'bar' })
    expect(log.options.ver).toBe(1)
    expect(log.options.level).toBe('info')
    expect(log.options.write).toBeDefined()
    expect(log.top.foo).toBe('bar')
    let custLevels = Object.assign({}, log.options.levels)
    custLevels.silly = 42
    log = log.child({ ver: 2, levels: custLevels, level: 'trace', baz: true })
    expect(log.options.ver).toBe(2)
    expect(log.options.levels.silly).toBe(42)
    expect(getType(log.silly)).toBe('Function')
    expect(log.options.level).toBe('trace')
    expect(log.options.write).toBeDefined()
    expect(log.top.foo).toBe('bar')
    expect(log.top.baz).toBe(true)
    // console.json(log)
  })
  test('convenience methods', () => {
    const log = jrep.create({ level: 'debug', write })
    const foo = { one: [1, 2, 3], two: { inner: true }, three: 3.14 }
    log.stringify(foo)
    expect(output.one[2]).toBe(3)
    expect(output.two.inner).toBeTruthy()
    expect(output.three).toBe(3.14)
    output = {}
    log.json(foo)
    expect(output.one[2]).toBe(3)
    expect(output.two.inner).toBeTruthy()
    expect(output.three).toBe(3.14)
  })
})

describe('logger option tests', () => {
  let log = jrep.create({ level: 'warn', write, project: 'xyz', session: 12345 })
  test('top level properties', () => {
    log.warn(msg1, data1)
    expect(Object.keys(output).length).toBe(8)

    expect(output.ver).toBe(1)
    expect(getType(output.time)).toBe('Number')
    expect(output.level).toBe('warn')
    expect(output.msg).toBe(msg1)
    expect(output.data).toMatchObject(data1)
    expect(data1).toMatchObject(output.data)
    expect(output.project).toBe('xyz')
  })
  test('child logger properties', () => {
    log = log.child({ env: 'dev' })
    output = {}
    log.warn(msg2, data2)
    expect(Object.keys(output).length).toBe(9)
    expect(output.ver).toBe(1)
    expect(getType(output.time)).toBe('Number')
    expect(output.level).toBe('warn')
    expect(output.msg).toBe(msg2)
    expect(output.data).toMatchObject(data2)
    expect(data2).toMatchObject(output.data)
    expect(output.project).toBe('xyz')
    expect(output.env).toBe('dev')
  })
})

describe('logging tests', () => {
  for (const level of levels) {
    const log = jrep.create({write, level: level})

    test(level + ': one message', () => {
      log[level](msg1)
      expect(Object.keys(output).length).toBe(6)
      expect(output.ver).toBe(1)
      expect(getType(output.time)).toBe('Number')
      expect(output.level).toBe(level)
      expect(output.msg).toBe(msg1)
      expect(output.data).toBe('')
    })
    test(level + ': two messages', () => {
      log[level](msg1, msg2)
      expect(Object.keys(output).length).toBe(6)
      expect(output.ver).toBe(1)
      expect(getType(output.time)).toBe('Number')
      expect(output.level).toBe(level)
      expect(getType(output.msg)).toBe('Array')
      expect(output.msg[0]).toBe(msg1)
      expect(output.msg[1]).toBe(msg2)
      expect(output.data).toBe('')
    })
    test(level + ': two messages one data', () => {
      log[level](msg1, msg2, data1)
      expect(Object.keys(output).length).toBe(6)
      expect(output.ver).toBe(1)
      expect(getType(output.time)).toBe('Number')
      expect(output.level).toBe(level)
      expect(getType(output.msg)).toBe('Array')
      expect(output.msg[0]).toBe(msg1)
      expect(output.msg[1]).toBe(msg2)
      expect(output.data).toMatchObject(data1)
      expect(data1).toMatchObject(output.data)
    })
    test(level + ': two messages two data', () => {
      log[level](msg1, msg2, data1, data2)
      expect(Object.keys(output).length).toBe(6)
      expect(output.ver).toBe(1)
      expect(getType(output.time)).toBe('Number')
      expect(output.level).toBe(level)
      expect(getType(output.msg)).toBe('Array')
      expect(output.msg[0]).toBe(msg1)
      expect(output.msg[1]).toBe(msg2)
      expect(getType(output.data)).toBe('Array')
      expect(output.data.length).toBe(2)
      expect(output.data[0]).toMatchObject(data1)
      expect(data1).toMatchObject(output.data[0])
      expect(output.data[1]).toMatchObject(data2)
      expect(data2).toMatchObject(output.data[1])
    })
    test(level + ': two messages two data mixed order', () => {
      log[level](data1, msg2, data2, msg1)
      expect(Object.keys(output).length).toBe(6)
      expect(output.ver).toBe(1)
      expect(getType(output.time)).toBe('Number')
      expect(output.level).toBe(level)
      expect(getType(output.msg)).toBe('Array')
      expect(output.msg[0]).toBe(msg2)
      expect(output.msg[1]).toBe(msg1)
      expect(getType(output.data)).toBe('Array')
      expect(output.data.length).toBe(2)
      expect(output.data[0]).toMatchObject(data1)
      expect(data1).toMatchObject(output.data[0])
      expect(output.data[1]).toMatchObject(data2)
      expect(data2).toMatchObject(output.data[1])
    })
  }
})

describe('logging level tests', () => {
  test('level: fatal', () => {
    const log = jrep.create({level: 'fatal', write})
    log.fatal('fatal')
    expect(output.msg).toBe('fatal')
    output = {}
    log.error('error')
    expect(output.msg).toBeUndefined()
    log.warn('warn')
    expect(output.msg).toBeUndefined()
    log.info('info')
    expect(output.msg).toBeUndefined()
    log.debug('debug')
    expect(output.msg).toBeUndefined()
    log.trace('trace')
    expect(output.msg).toBeUndefined()
  })
  test('level: error', () => {
    const log = jrep.create({level: 'error', write})
    log.fatal('fatal')
    expect(output.msg).toBe('fatal')
    log.error('error')
    expect(output.msg).toBe('error')
    output = {}
    log.warn('warn')
    expect(output.msg).toBeUndefined()
    log.info('info')
    expect(output.msg).toBeUndefined()
    log.debug('debug')
    expect(output.msg).toBeUndefined()
    log.trace('trace')
    expect(output.msg).toBeUndefined()
  })
  test('level: warn', () => {
    const log = jrep.create({level: 'warn', write})
    log.fatal('fatal')
    expect(output.msg).toBe('fatal')
    log.error('error')
    expect(output.msg).toBe('error')
    log.warn('warn')
    expect(output.msg).toBe('warn')
    output = {}
    log.info('info')
    expect(output.msg).toBeUndefined()
    log.debug('debug')
    expect(output.msg).toBeUndefined()
    log.trace('trace')
    expect(output.msg).toBeUndefined()
  })
  test('level: info', () => {
    const log = jrep.create({level: 'info', write})
    log.fatal('fatal')
    expect(output.msg).toBe('fatal')
    log.error('error')
    expect(output.msg).toBe('error')
    log.warn('warn')
    expect(output.msg).toBe('warn')
    log.info('info')
    expect(output.msg).toBe('info')
    output = {}
    log.debug('debug')
    expect(output.msg).toBeUndefined()
    log.trace('trace')
    expect(output.msg).toBeUndefined()
  })
  test('level: debug', () => {
    const log = jrep.create({level: 'debug', write})
    log.fatal('fatal')
    expect(output.msg).toBe('fatal')
    log.error('error')
    expect(output.msg).toBe('error')
    log.warn('warn')
    expect(output.msg).toBe('warn')
    log.info('info')
    expect(output.msg).toBe('info')
    log.debug('debug')
    expect(output.msg).toBe('debug')
    output = {}
    log.trace('trace')
    expect(output.msg).toBeUndefined()
  })
  test('level: trace', () => {
    const log = jrep.create({level: 'trace', write})
    log.fatal('fatal')
    expect(output.msg).toBe('fatal')
    log.error('error')
    expect(output.msg).toBe('error')
    log.warn('warn')
    expect(output.msg).toBe('warn')
    log.info('info')
    expect(output.msg).toBe('info')
    log.debug('debug')
    expect(output.msg).toBe('debug')
    log.trace('trace')
    expect(output.msg).toBe('trace')
  })
})

describe('logging error tests', () => {
  const log = jrep.create({level: 'trace', write, name: 'error tests'})
  let err1 = new Error(msg1)
  let err2 = new Error(msg2)

  test('error level test', () => {
    log.error(err1)
    expect(output.msg).toBe(msg1)
    expect(output.data.message).toBe(msg1)
    expect(output.data.name).toBe('Error')
    expect(output.data.stack).toBeDefined()
    log.error(err1, err2)
    expect(output.msg.length).toBe(2)
    expect(output.msg[0]).toBe(msg1)
    expect(output.msg[1]).toBe(msg2)
    expect(output.data.length).toBe(2)
    expect(output.data[0].message).toBe(msg1)
    expect(output.data[1].message).toBe(msg2)
    expect(output.data[0].name).toBe('Error')
    expect(output.data[1].name).toBe('Error')
    expect(output.data[0].stack).toBeDefined()
    expect(output.data[1].stack).toBeDefined()
  })
  test('info level test', () => {
    log.info(err1)
    expect(output.msg).toBe(msg1)
    expect(output.data.message).toBe(msg1)
    expect(output.data.name).toBe('Error')
    expect(output.data.stack).toBeDefined()
    log.info(err1, err2)
    expect(output.msg.length).toBe(2)
    expect(output.msg[0]).toBe(msg1)
    expect(output.msg[1]).toBe(msg2)
    expect(output.data.length).toBe(2)
    expect(output.data[0].message).toBe(msg1)
    expect(output.data[1].message).toBe(msg2)
    expect(output.data[0].name).toBe('Error')
    expect(output.data[1].name).toBe('Error')
    expect(output.data[0].stack).toBeDefined()
    expect(output.data[1].stack).toBeDefined()
    log.info(msg3, err1, msg4, err2)
    expect(output.msg.length).toBe(4)
    expect(output.msg[0]).toBe(msg3)
    expect(output.msg[1]).toBe(msg1)
    expect(output.msg[2]).toBe(msg4)
    expect(output.msg[3]).toBe(msg2)
    expect(output.data.length).toBe(2)
    expect(output.data[0].message).toBe(msg1)
    expect(output.data[1].message).toBe(msg2)
    expect(output.data[0].name).toBe('Error')
    expect(output.data[1].name).toBe('Error')
    expect(output.data[0].stack).toBeDefined()
    expect(output.data[1].stack).toBeDefined()
    // console.json(output)
  })
})