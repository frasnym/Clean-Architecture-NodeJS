const validator = require('validator')

class EmailValidator {
  isValid (email) {
    return validator.isEmail(email)
  }
}

const makeEmailValidator = () => {
  return new EmailValidator()
}

describe('Email Validator', () => {
  test('should return true if validator returns true', () => {
    const emailValidator = makeEmailValidator()

    const isEmailValid = emailValidator.isValid('valid_email@mail.com')

    expect(isEmailValid).toBe(true)
  })

  test('should return false if validator returns false', () => {
    validator.isEmailValid = false
    const emailValidator = makeEmailValidator()

    const isEmailValid = emailValidator.isValid('invalid_email@mail.com')

    expect(isEmailValid).toBe(false)
  })
})
