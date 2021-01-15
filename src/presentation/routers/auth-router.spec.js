const AuthRouter = require('./auth-router')
const MissingParamError = require('../helpers/missing-param-error')
const UnauthorizedError = require('../helpers/unauthorized-error')
const ServerError = require('../helpers/server-error')
const InvalidParamError = require('../helpers/invalid-param-error')

const makeAuthRouter = () => {
  const authUseCase = makeAuthUseCase()
  const emailValidatorSpy = makeEmailValidator()
  const authRouter = new AuthRouter(authUseCase, emailValidatorSpy)
  return {
    authUseCase,
    authRouter,
    emailValidatorSpy
  }
}

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    isValid (email) {
      return this.isEmailValid
    }
  }

  const emailValidatorSpy = new EmailValidatorSpy()
  emailValidatorSpy.isEmailValid = true
  return emailValidatorSpy
}

const makeEmailValidatorWithError = () => {
  class EmailValidatorSpy {
    isValid () {
      throw new Error()
    }
  }
  return new EmailValidatorSpy()
}

const makeAuthUseCase = () => {
  class AuthUseCase {
    async auth (email, password) {
      this.email = email
      this.password = password

      return this.accessToken
    }
  }
  const authUseCase = new AuthUseCase()
  authUseCase.accessToken = 'valid_token'

  return authUseCase
}

const makeAuthUseCaseWithError = () => {
  class AuthUseCase {
    async auth () {
      throw new Error()
    }
  }

  return new AuthUseCase()
}

describe('Auth Router', () => {
  test('should return 400 if no email is provided', async () => {
    const { authRouter } = makeAuthRouter()

    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }

    const httpResponse = await authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('should return 400 if no password is provided', async () => {
    const { authRouter } = makeAuthRouter()

    const httpRequest = {
      body: {
        email: 'any@email.com'
      }
    }

    const httpResponse = await authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('should return 500 if no httpRequest is provided', async () => {
    const { authRouter } = makeAuthRouter()

    const httpResponse = await authRouter.route()
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if httpRequest has no body', async () => {
    const { authRouter } = makeAuthRouter()

    const httpRequest = {}

    const httpResponse = await authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should call AuthUseCase with correct params', async () => {
    const { authRouter, authUseCase } = makeAuthRouter()

    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'any_password'
      }
    }

    await authRouter.route(httpRequest)
    expect(authUseCase.email).toBe(httpRequest.body.email)
    expect(authUseCase.password).toBe(httpRequest.body.password)
  })

  test('should return 401 when invalid credentials are provided', async () => {
    const { authRouter, authUseCase } = makeAuthRouter()
    authUseCase.accessToken = null

    const httpRequest = {
      body: {
        email: 'invalid_email@mail.com',
        password: 'invalid_password'
      }
    }

    const httpResponse = await authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  test('should return 200 when valid credentials are provided', async () => {
    const { authRouter, authUseCase } = makeAuthRouter()

    const httpRequest = {
      body: {
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }
    }

    const httpResponse = await authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authUseCase.accessToken)
  })

  test('should return 500 if no AuthUseCase is provided', async () => {
    const authRouter = new AuthRouter()

    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if AuthUseCase has no auth() method', async () => {
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

    const httpResponse = await authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if AuthUseCase throws', async () => {
    const authUseCase = makeAuthUseCaseWithError()
    const authRouter = new AuthRouter(authUseCase)
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 400 if invalid email is provided', async () => {
    const { authRouter, emailValidatorSpy } = makeAuthRouter()
    emailValidatorSpy.isEmailValid = false
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('should return 500 if no EmailValidator is provided', async () => {
    const authUseCase = makeAuthUseCase()
    const authRouter = new AuthRouter(authUseCase)
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should return 500 if EmailValidator has no isValid method', async () => {
    const authUseCase = makeAuthUseCase()
    const authRouter = new AuthRouter(authUseCase, {})
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should return 500 if EmailValidator throws', async () => {
    const authUseCase = makeAuthUseCase()
    const emailValidator = makeEmailValidatorWithError()
    const authRouter = new AuthRouter(authUseCase, emailValidator)
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    const httpResponse = await authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
})
