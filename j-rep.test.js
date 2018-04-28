require('console-probe').apply()

let output = ''
const stream = {
  write: function (text) {
    output = JSON.parse(text)
    // console.log(text)
  }
}

function getType (value) {
  return Object.prototype.toString.call(value).slice(8).slice(0, -1)
}

const Jrep = require('./j-rep')
const msg1 = 'the quick brown fox'
const msg2 = 'jumped over the lazy dog'
const msg3 = 'and back again.'
const msg4 = 'that crazy dog!'
const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace']
const data1 = {foo: 'bar', levels}
const data2 = {bar: 'foo', answer: 42, levels}

describe('logger object tests', () => {
  test('member tests', () => {
    expect(getType(Jrep.create)).toBe('Function')
    const log = Jrep.create()
    expect(getType(log.options)).toBe('Object')
    expect(getType(log.child)).toBe('Function')
    expect(getType(log.fatal)).toBe('Function')
    expect(getType(log.error)).toBe('Function')
    expect(getType(log.warn)).toBe('Function')
    expect(getType(log.info)).toBe('Function')
    expect(getType(log.debug)).toBe('Function')
    expect(getType(log.trace)).toBe('Function')
    expect(getType(log.levels)).toBe('Object')
  })
  test('options tests', () => {
    expect(getType(Jrep.create)).toBe('Function')
    const olog = Jrep.create({ this: 'one' })
    // console.json(olog)
  })
  // test('convenience methods', () => {
  // const log = Jrep.create({ level: 'debug', stream })
  // log.stringify(log)
  // console.json(output)
  // console.probe(Jrep)
  // expect(output.options).toBeDefined()
  // expect(output.options.level).toBe('debug')
  // expect(output.options.stream).toBeDefined()
  // })
})

describe('logger option tests', () => {
  let log = Jrep.create({ level: 'warn', stream, project: 'xyz', session: 12345 })
  test('top level properties', () => {
    log.warn(msg1, data1)
    console.json(output)
    expect(Object.keys(output).length).toBe(8)
    expect(output.ver).toBe('1')
    expect(getType(output.time)).toBe('Number')
    expect(output.level).toBe('warn')
    expect(output.msg).toBe(msg1)
    expect(output.data).toMatchObject(data1)
    expect(data1).toMatchObject(output.data)
    expect(output.project).toBe('xyz')
  })
  test('child logger properties', () => {
    log = log.child({ env: 'dev' })
    log.debug(msg2, data2)
    console.json(output)
    expect(Object.keys(output).length).toBe(9)
    expect(output.ver).toBe('1')
    expect(getType(output.time)).toBe('Number')
    expect(output.level).toBe('debug')
    expect(output.msg).toBe(msg2)
    expect(output.data).toMatchObject(data2)
    expect(data2).toMatchObject(output.data)
    expect(output.project).toBe('xyz')
    expect(output.env).toBe('dev')
  })
})

describe('logging tests', () => {
  for (const level of levels) {
    const log = Jrep.create({stream, level: level})

    test(level + ': one message', () => {
      log[level](msg1)
      expect(Object.keys(output).length).toBe(6)
      expect(output.ver).toBe('1')
      expect(getType(output.time)).toBe('Number')
      expect(output.level).toBe(level)
      expect(output.msg).toBe(msg1)
      expect(output.data).toBe('')
    })
    test(level + ': two messages', () => {
      log[level](msg1, msg2)
      expect(Object.keys(output).length).toBe(6)
      expect(output.ver).toBe('1')
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
      expect(output.ver).toBe('1')
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
      expect(output.ver).toBe('1')
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
      expect(output.ver).toBe('1')
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
    const log = Jrep.create({level: 'fatal', stream})
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
    const log = Jrep.create({level: 'error', stream})
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
    const log = Jrep.create({level: 'warn', stream})
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
    const log = Jrep.create({level: 'info', stream})
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
    const log = Jrep.create({level: 'debug', stream})
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
    const log = Jrep.create({level: 'trace', stream})
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
  const log = Jrep.create({level: 'trace', stream})
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
    console.json(output)
  })
})
