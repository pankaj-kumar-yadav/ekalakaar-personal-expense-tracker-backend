export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL = 500,
}

export enum ApiMount {
  HEALTH = "/health",
  USERS = "/users",
  EXPENSES = "/expenses",
  DASHBOARD = "/dashboard",
}
