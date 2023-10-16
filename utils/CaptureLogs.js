const util = require("util")

const methodNames = ['log', 'warn', 'error']
const messages = []
global.cnsl = {}


methodNames.forEach(methodName => {
  const originalMethod = (global.cnsl[methodName] = console[methodName])

  console[methodName] = function () {
    const params = Array.prototype.slice.call(arguments, 1)
    const message = params.length ? util.format(arguments[0], ...params) : arguments[0]

    messages.push({
      type: methodName, // "log", "warn", "error"
      message
    })

    originalMethod.apply(console, arguments)
  }
})


const restore = () => {
    Object.keys(global.cnsl).forEach(methodName => {
      console[methodName] = global.cnsl[methodName]
    })
}

module.exports = {
    "messages": messages,
    "restore": restore
}