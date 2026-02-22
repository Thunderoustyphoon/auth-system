// tadaaaaaaaaaaaa... all magic words are here 

import { object } from "webidl-conversions"

// for DB_Name
export const DB_NAME = "Auth SYS"

//lets make user roles for future puposes
export const UserRoles = Object.freeze({
    USER: "user",
    ADMIN: "admin"
})

// for Oauth providers for now google only
export const oAuthProviders = Object.freeze({
    GOOGLE: "google"
})

// for expiring tokens
export const TokenExpiry = Object.freeze({
    ACCESS: 15 * 60 * 1000, // 15 minutes
    REFRESH: 7 * 24 * 60 * 1000 // 7 day for now 
})

// http codes gives professional approach 
export const HttpStatus = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL: 500,
});