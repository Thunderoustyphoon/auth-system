
// asynchandler - its basically like a net catches your errors 

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error); // sends to global error.middleware.js
  }
};
export { asyncHandler };