const AuthRouter = require('./auth-router')
const MissingParamError = require('../helpers/missing-param-error')
const UnauthorizedError = require('../helpers/unauthorized-error')
const ServerError = require('../helpers/server-error')

const makeAuthRouter = () => {
  const authUseCase = makeAuthUseCase()
  authUseCase.accessToken = 'valid_token'
  const authRouter = new AuthRouter(authUseCase)
  return {
    authUseCase,
    authRouter
  }
}

const makeAuthUseCase = () => {
  class AuthUseCase {
    auth (email, password) {
      this.email = email
      this.password = password

      return this.accessToken
    }
  }

  return new AuthUseCase()
}

const makeAuthUseCaseWithError = () => {
  class AuthUseCase {
    auth () {
      throw new Error()
    }
  }

  return new AuthUseCase()
}

describe('Auth Router', () => {
  test('should return 400 if no email is provided', () => {
    const { authRouter } = makeAuthRouter()

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
    const { authRouter } = makeAuthRouter()

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
    const { authRouter } = makeAuthRouter()

    const httpResponse = authRouter.route()
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if httpRequest has no body', () => {
    const { authRouter } = makeAuthRouter()

    const httpRequest = {}

    const httpResponse = authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should call AuthUseCase with correct params', () => {
    const { authRouter, authUseCase } = makeAuthRouter()

    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'any_password'
      }
    }

    authRouter.route(httpRequest)
    expect(authUseCase.email).toBe(httpRequest.body.email)
    expect(authUseCase.password).toBe(httpRequest.body.password)
  })

  test('should return 401 when invalid credentials are provided', () => {
    const { authRouter, authUseCase } = makeAuthRouter()
    authUseCase.accessToken = null

    const httpRequest = {
      body: {
        email: 'invalid_email@mail.com',
        password: 'invalid_password'
      }
    }

    const httpResponse = authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  test('should return 200 when valid credentials are provided', () => {
    const { authRouter, authUseCase } = makeAuthRouter()

    const httpRequest = {
      body: {
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }
    }

    const httpResponse = authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authUseCase.accessToken)
  })

  test('should return 500 if no AuthUseCase is provided', () => {
    const authRouter = new AuthRouter()

    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if AuthUseCase has no auth() method', () => {
    // class AuthUseCase {}
    // const authUseCase = new AuthUseCase()
    // const authRouter = new AuthRouter(authUseCase)
    const authRouter = new AuthRouter({})

    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if AuthUseCase throws', () => {
    const authUseCase = makeAuthUseCaseWithError()
    const authRouter = new AuthRouter(authUseCase)
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
})
