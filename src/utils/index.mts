export class DevelopmentError extends Error {
  constructor (message?: string) {
    super(
      message
        ? `${message}\n`
        : '' +
        'The behavior is not expected and not allowed.\n' +
        'If you see this in development, please fix the error ASAP.\n' +
        'If you see this in production, please contract our customer service.\n'
    )
  }
}

export class NotImplementedError extends Error {
  constructor (message?: string) {
    super(
      message
        ? `${message}\n`
        : '' +
        'A requested method or operation is not implemented.'
    )
  }
}
