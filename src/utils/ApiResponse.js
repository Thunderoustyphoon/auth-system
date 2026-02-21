// standardize the response in the system

class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400; // true for 2xx , false otherwise
  }
}

export { ApiResponse };