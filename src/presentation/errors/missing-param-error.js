module.exports = class MissingParamError extends Error {
  constructor (params) {
    super(`Missing param: ${params}`)
    this.name = 'MissingParamError'
  }
}
