class EmailValidator {
  isValid (email) {
    return true
  }
}

describe('Email Validator', () => {
  test('should return true if validator returns true', () => {
    const emailValidator = new EmailValidator()

    const isEmailValid = emailValidator.isValid('valid_email@mail.com')

    expect(isEmailValid).toBe(true)
  })
})
