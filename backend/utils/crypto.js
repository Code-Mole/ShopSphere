import crypto from "crypto";

/**
 * Verify that an incoming webhook actually came from Paystack.
 * Paystack signs the raw body with our secret key — we recompute and compare.
 */
export const verifyPaystackSignature = (rawBody, signatureHeader) => {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  return hash === signatureHeader;
};

/**
 * Generate a unique, collision-resistant payment reference.
 */
export const generateReference = () => {
  return `SS_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
};
