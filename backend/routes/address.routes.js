import { Router } from "express";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/address.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", getAddresses);
router.post("/", createAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;
