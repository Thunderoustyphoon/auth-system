// A utility file because we will be using it a lot . 
// It helps you to throw errors rather than using other boring stuffs

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],        
    stack = ""
  ) {
    super(message);

    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    // Preserve original stack trace if provided, otherwise capture a new one.
    // This is useful when re-throwing caught errors so you don't lose context.
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
