class AuthRouter {
  route (httpRequest) {
    if (!httpRequest || !httpRequest.body) {
      return {
        statusCode: 500
      }
    }
    const { email, password } = httpRequest.body
    if (!email || !password) {
      return {
        statusCode: 400
      }
    }
  }
}

describe('Auth Router', () => {
  test('should return 400 if no email is provided', () => {
    const authRouter = new AuthRouter()

    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }

    const httpResponse = authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })

  test('should return 400 if no password is provided', () => {
    const authRouter = new AuthRouter()

    const httpRequest = {
      body: {
        email: 'any@email.com'
      }
    }

    const httpResponse = authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })

  test('should return 500 if no httpRequest is provided', () => {
    const authRouter = new AuthRouter()

    const httpResponse = authRouter.route()
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should return 500 if httpRequest has no body', () => {
    const authRouter = new AuthRouter()

    const httpRequest = {}

    const httpResponse = authRouter.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })
})
