const symLogAssignment = Symbol('Log Levels Function Assignment')
const symStream = Symbol('Log Stream Output Function')
const symHeaders = Symbol('Log Headers')

const levels = { fatal: 60, error: 50, warn: 40, info: 30, debug: 20, trace: 10 }
const optionKeys = ['level', 'stream']
const defaultOptions = { level: 'info', stream: process.stdout }
// TODO: Remove the following line:
require('console-probe').apply()

module.exports = Object.freeze({
  create (obj) {
    return new Jrep(obj)
  }
})

class Jrep {
  constructor (obj) {
    const split = splitOptions(obj)
    this.options = split.options
    this.top = split.top
    this.levels = levels
    this[symStream] = this.options.stream
    this[symHeaders] = {}
    this[symLogAssignment]()
  }

  [symLogAssignment] () {
    Object.keys(this.levels).forEach((level) => {
      const top = stringifyTopProperties(this.top)
      this[symHeaders][level] = `{"ver":"1","level":"${level}","lvl":${this.levels[level]}${top},"time":`
      this[level] = function (...items) {
        if (this.levels[this.options.level] > this.levels[level]) { return }
        let text = this[symHeaders][level] + (new Date()).getTime()
        const objects = []
        const messages = []
        for (const item of items) {
          if (isString(item)) {
            messages.push(item)
            continue
          } else if (isError(item)) {
            objects.push(serializerr(item))
            item.message && messages.push(item.message)
            continue
          }
          objects.push(item)
        }
        // if (this.top) { text += stringifyTopProperties(this.top) }
        text += ',"msg":' + stringifyLogMessages(messages)
        text += ',"data":' + stringifyLogObjects(objects) + '}'

        // const buf = Buffer.from(text + '\n', 'utf8') <= not sure if needed
        this[symStream].write(text + '\n')
      }
    })
  }

  child (options) {
    return new Jrep(Object.assign({}, this.options, this.top, options))
  }

  stringify (obj, replacer, spacer) {
    this[symStream].write(stringify(obj, replacer, spacer))
  }

  json (data) {
    this[symStream].write(stringify(data, null, 2))
  }
}

function splitOptions (options) {
  let result = { options: defaultOptions, top: {} }
  if (!options) { return result }
  result.options = Object.assign({}, defaultOptions, options)
  let topKeys = []
  for (const key in result.options) {
    if (!optionKeys.includes(key)) {
      topKeys.push(key)
    }
  }
  if (topKeys.length < 1) { return result }
  for (const topKey of topKeys) {
    result.top[topKey] = result.options[topKey]
    delete result.options[topKey]
  }
  return result
}

function stringifyTopProperties (top) {
  let tops = ''
  for (const key in top) {
    tops += ',"' + key + '":"' + top[key] + '"'
  }
  return tops
}

function stringifyLogMessages (messages) {
  if (messages.length < 1) {
    return '""'
  } else if (messages.length === 1) {
    return '"' + messages[0] + '"'
  } else {
    let result = '['
    for (const message of messages) { result += '"' + message + '",' }
    return result.slice(0, -1) + ']'
  }
}

function stringifyLogObjects (objects) {
  if (objects.length < 1) {
    return '""'
  } else if (objects.length === 1) {
    let sObj = stringify(objects[0])
    return sObj || '""'
  } else {
    let result = '['
    for (const obj of objects) {
      let sObj = stringify(obj) || '""'
      result += sObj + ','
    }
    return result.slice(0, -1) + ']'
  }
}

function isString (value) {
  return Object.prototype.toString.call(value) === '[object String]'
}

function isError (value) {
  return value instanceof Error
}

// =================================================================
// Following code is from the fast-safe-stringify package.
// =================================================================

const arr = []

// Regular stringify
function stringify (obj, replacer, spacer) {
  decirc(obj, '', [], undefined)
  const res = JSON.stringify(obj, replacer, spacer)
  while (arr.length !== 0) {
    const part = arr.pop()
    part[0][part[1]] = part[2]
  }
  return res
}
function decirc (val, k, stack, parent) {
  let i
  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        parent[k] = '[Circular]'
        arr.push([parent, k, val])
        return
      }
    }
    stack.push(val)
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        decirc(val[i], i, stack, val)
      }
    } else {
      const keys = Object.keys(val)
      for (i = 0; i < keys.length; i++) {
        const key = keys[i]
        decirc(val[key], key, stack, val)
      }
    }
    stack.pop()
  }
}

// =================================================================
// Following code is from the serializerr package.
// =================================================================

function serializerr (obj = {}) {
  const chain = protochain(obj)
    .filter(obj => obj !== Object.prototype)
  return [obj]
    .concat(chain)
    .map(item => Object.getOwnPropertyNames(item))
    .reduce((result, names) => {
      names.forEach(name => {
        result[name] = obj[name]
      })
      return result
    }, {})
}

// =================================================================
// Following code is from the protochain package.
// =================================================================

function protochain (obj) {
  const chain = []
  let target = getPrototypeOf(obj)
  while (target) {
    chain.push(target)
    target = getPrototypeOf(target)
  }

  return chain
}

function getPrototypeOf (obj) {
  if (obj == null) return null
  return Object.getPrototypeOf(Object(obj))
}
