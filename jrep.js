const symApplyOptions = Symbol('ApplyOptions')
const symTopAsString = Symbol('TopAsString')
const symWrite = Symbol('Write')
const symHeaders = Symbol('Headers')
const symLogAssignment = Symbol('LogAssignment')

const defaultOptions = {
  ver: 1,
  levels: {
    fatal: 60,
    error: 50,
    warn: 40,
    info: 30,
    debug: 20,
    trace: 10
  },
  level: 'info',
  write: process.stdout.write.bind(process.stdout)
}

module.exports = Object.freeze({
  create (obj) {
    return new Jrep(obj)
  }
})

class Jrep {
  constructor (options) {
    this[symApplyOptions](options)
  }

  [symApplyOptions] (options) {
    const split = splitOptions(options)
    this.options = Object.freeze(split.options)
    this.top = Object.freeze(split.top)
    this[symTopAsString] = split.topAsString
    this[symWrite] = this.options.write
    this[symHeaders] = {}
    this[symLogAssignment]()
  }

  [symLogAssignment] () {
    Object.keys(this.options.levels).forEach((level) => {
      this[symHeaders][level] = `{"ver":${this.options.ver},"level":"${level}","lvl":${this.options.levels[level]}${this[symTopAsString]},"time":`
      this[level] = function (...items) {
        if (this.options.levels[this.options.level] > this.options.levels[level]) { return }
        let text = this[symHeaders][level] + (new Date()).getTime()
        const splitItems = stringifyLogItems(items)
        text += ',"msg":' + splitItems.msg
        text += ',"data":' + splitItems.data + '}\n'

        this[symWrite](text)
      }
    })
  }

  child (options) {
    const newOpts = Object.assign({}, this.options, this.top, options)
    const newChild = Object.create(this)
    newChild[symApplyOptions](newOpts)
    newChild.parent = this
    return newChild
  }

  stringify (obj, replacer, spacer) {
    this[symWrite](stringify(obj, replacer, spacer))
  }

  json (data) {
    this[symWrite](stringify(data, null, 2))
  }
}

function splitOptions (options) {
  let result = {
    options: defaultOptions,
    top: {},
    topAsString: ''
  }
  if (!options) { return result }
  result.options = Object.assign({}, defaultOptions, options)
  let topKeys = []
  for (const key in result.options) {
    if (!Object.keys(defaultOptions).includes(key)) {
      topKeys.push(key)
    }
  }
  if (topKeys.length < 1) { return result }
  for (const topKey of topKeys) {
    result.top[topKey] = result.options[topKey]
    result.topAsString += ',"' + topKey + '":' + stringify(result.options[topKey])
    delete result.options[topKey]
  }
  return result
}

function stringifyLogItems (items) {
  let result = {msg: [], data: []}

  for (const item of items) {
    if (Object.prototype.toString.call(item) === '[object String]') {
      result.msg.push(item)
      continue
    }
    if (item instanceof Error) {
      result.data.push(serializerr(item))
      result.msg.push(item.message)
      continue
    }
    result.data.push(item)
  }

  if (result.msg.length < 1) {
    result.msg = ''
  } else if (result.msg.length === 1) {
    result.msg = result.msg[0]
  }

  if (result.data.length < 1) {
    result.data = ''
  } else if (result.data.length === 1) {
    result.data = result.data[0]
  }

  result.msg = stringify(result.msg)
  result.data = stringify(result.data)
  return result
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