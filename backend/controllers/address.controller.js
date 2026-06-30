import Address from "../models/Address.js";
import { sendSuccess, AppError } from "../utils/ApiResponse.js";

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    sendSuccess(res, 200, "Addresses fetched.", addresses);
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const address = await Address.create({ ...req.body, user: req.user._id });
    sendSuccess(res, 201, "Address added.", address);
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!address) throw new AppError("Address not found.", 404);
    sendSuccess(res, 200, "Address updated.", address);
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!address) throw new AppError("Address not found.", 404);
    sendSuccess(res, 200, "Address deleted.");
  } catch (error) {
    next(error);
  }
};
