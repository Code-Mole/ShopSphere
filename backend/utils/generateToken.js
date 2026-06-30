import jwt from "jsonwebtoken";

/**
 * Sign and return a JWT for a given user id.
 * The token is stateless — no DB lookup needed on each request.
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};
