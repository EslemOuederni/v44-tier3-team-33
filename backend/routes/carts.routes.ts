import express from "express";

const cartRouter = express.Router();

import {
  getCart,
  addPostToCart,
  removePostFromCart,
  clearCart,
  getCartTotalPrice,
} from "../controllers/Cart.controller";

cartRouter.get("/", getCart);
cartRouter.post("/:id", addPostToCart);
cartRouter.delete("/:id", removePostFromCart);
cartRouter.delete("/", clearCart);
cartRouter.get("/total-price", getCartTotalPrice);

export { cartRouter };
