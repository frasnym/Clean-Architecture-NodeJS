module.exports = class InvalidParamError extends Error {
  constructor (params) {
    super(`Invalid param: ${params}`)
    this.name = 'InvalidParamError'
  }
}
