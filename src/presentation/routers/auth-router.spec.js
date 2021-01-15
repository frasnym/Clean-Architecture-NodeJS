const AuthRouter = require('./auth-router')
const MissingParamError = require('../helpers/missing-param-error')

const makeAuthRouter = () => {
  return new AuthRouter()
}

describe('Auth Router', () => {
  test('should return 400 if no email is provided', () => {
    const authRouter = makeAuthRouter()

    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }

    const httpResponse = authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('should return 400 if no password is provided', () => {
    const authRouter = makeAuthRouter()

    const httpRequest = {
      body: {
        email: 'any@email.com'
      }
    }

    const httpResponse = authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('should return 500 if no httpRequest is provided', () => {
    const authRouter = makeAuthRouter()

    const httpResponse = authRouter.route()
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should return 500 if httpRequest has no body', () => {
    const authRouter = makeAuthRouter()

    const httpRequest = {}

    const httpResponse = authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should call AuthUseCase with correct params', () => {
    const authRouter = makeAuthRouter()

    const httpResponse = authRouter.route({})
    expect(httpResponse.statusCode).toBe(500)
  })
})
