import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { sendSuccess, AppError } from "../utils/ApiResponse.js";

// ─── Helper: populate cart with product details ────────────────────────────
const populateCart = (cart) =>
  cart.populate({
    path: "items.product",
    select: "name slug price images stock isActive brand",
  });

// ─── Get Cart ──────────────────────────────────────────────────────────────
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    await populateCart(cart);
    sendSuccess(res, 200, "Cart fetched.", cart);
  } catch (error) {
    next(error);
  }
};

// ─── Add to Cart ───────────────────────────────────────────────────────────
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive)
      throw new AppError("Product not found.", 404);
    if (product.stock < quantity)
      throw new AppError(`Only ${product.stock} items in stock.`, 400);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (existingIndex > -1) {
      // Item already in cart — update quantity
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        throw new AppError(`Cannot add more than ${product.stock} items.`, 400);
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      // New item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price, // snapshot current price
        variant: variant || {},
      });
    }

    await cart.save();
    await populateCart(cart);
    sendSuccess(res, 200, "Item added to cart.", cart);
  } catch (error) {
    next(error);
  }
};

// ─── Update Item Quantity ──────────────────────────────────────────────────
export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) throw new AppError("Quantity must be at least 1.", 400);

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) throw new AppError("Cart not found.", 404);

    const item = cart.items.id(itemId);
    if (!item) throw new AppError("Item not found in cart.", 404);

    // Check stock
    const product = await Product.findById(item.product);
    if (quantity > product.stock) {
      throw new AppError(`Only ${product.stock} items available.`, 400);
    }

    item.quantity = quantity;
    await cart.save();
    await populateCart(cart);
    sendSuccess(res, 200, "Cart updated.", cart);
  } catch (error) {
    next(error);
  }
};

// ─── Remove Item from Cart ─────────────────────────────────────────────────
export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) throw new AppError("Cart not found.", 404);

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId,
    );
    await cart.save();
    await populateCart(cart);
    sendSuccess(res, 200, "Item removed from cart.", cart);
  } catch (error) {
    next(error);
  }
};

// ─── Clear Cart ────────────────────────────────────────────────────────────
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { new: true },
    );
    sendSuccess(res, 200, "Cart cleared.", cart);
  } catch (error) {
    next(error);
  }
};
