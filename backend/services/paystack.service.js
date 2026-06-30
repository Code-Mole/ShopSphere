const PAYSTACK_BASE_URL = "https://api.paystack.co";

const headers = () => ({
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
});

/**
 * Initialize a Paystack transaction.
 * Amount must be converted to the smallest currency unit (pesewas for GHS).
 */
export const initializeTransaction = async ({
  email,
  amount,
  reference,
  metadata,
}) => {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100), // GHS → pesewas
      reference,
      currency: "GHS",
      callback_url: `${process.env.CLIENT_URL}/order/confirmation`,
      metadata,
    }),
  });

  const data = await response.json();
  if (!data.status)
    throw new Error(data.message || "Failed to initialize payment.");
  return data.data; // { authorization_url, access_code, reference }
};

/**
 * Verify a Paystack transaction by reference.
 * This is the source of truth — never trust the frontend redirect alone.
 */
export const verifyTransaction = async (reference) => {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      method: "GET",
      headers: headers(),
    },
  );

  const data = await response.json();
  if (!data.status)
    throw new Error(data.message || "Failed to verify payment.");
  return data.data; // { status, amount, currency, channel, customer, ... }
};

/**
 * Map Paystack's payment channel to our internal enum.
 */
export const mapPaymentMethod = (channel) => {
  const map = {
    card: "card",
    mobile_money: "mobile_money",
    bank_transfer: "bank_transfer",
    bank: "bank_transfer",
  };
  return map[channel] || "unknown";
};
