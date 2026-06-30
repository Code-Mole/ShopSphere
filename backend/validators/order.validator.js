import { body } from "express-validator";

export const checkoutValidator = [
  body("shippingAddress.fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
  body("shippingAddress.phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),
  body("shippingAddress.addressLine1")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),
  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),
  body("shippingAddress.region")
    .trim()
    .notEmpty()
    .withMessage("Region is required"),
  body("deliveryOption")
    .optional()
    .isIn(["standard", "express"])
    .withMessage("Invalid delivery option"),
  body("couponCode").optional().trim(),
];
