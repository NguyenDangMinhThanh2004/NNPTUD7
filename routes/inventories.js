var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventories');

// get all
router.get('/', async function (req, res, next) {
  try {
    let result = await inventoryModel.find().populate('product');
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// get inventory by ID ( có join với product)
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await inventoryModel.findById(id).populate('product');
    if (!result) {
      return res.status(404).send({ message: "Inventory not found" });
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Add_stock ( {product, quantity} - POST tăng stock tương ứng với quantity
router.post('/add-stock', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    let inv = await inventoryModel.findOneAndUpdate(
      { product: product },
      { $inc: { stock: quantity } },
      { new: true }
    );
    if (!inv) {
      return res.status(404).send({ message: "Inventory not found for this product" });
    }
    res.send(inv);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Remove_stock ( {product, quantity} - POST giảm stock tương ứng với quantity
router.post('/remove-stock', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    let inv = await inventoryModel.findOne({ product: product });
    if (!inv) {
      return res.status(404).send({ message: "Inventory not found for this product" });
    }
    if (inv.stock < quantity) {
      return res.status(400).send({ message: "Not enough stock to remove" });
    }
    inv.stock -= quantity;
    await inv.save();
    res.send(inv);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// reservation : post ( {product, quantity} - POST giảm stock và tăng reserved tương ứng với quantity
router.post('/reservation', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    let inv = await inventoryModel.findOne({ product: product });
    if (!inv) {
      return res.status(404).send({ message: "Inventory not found for this product" });
    }
    if (inv.stock < quantity) {
      return res.status(400).send({ message: "Not enough stock to reserve" });
    }
    inv.stock -= quantity;
    inv.reserved += quantity;
    await inv.save();
    res.send(inv);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// sold : post ( {product, quantity} - POST giảm reservation và tăng soldCount tương ứng với quantity
router.post('/sold', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    let inv = await inventoryModel.findOne({ product: product });
    if (!inv) {
      return res.status(404).send({ message: "Inventory not found for this product" });
    }
    if (inv.reserved < quantity) {
      return res.status(400).send({ message: "Not enough reserved stock to sell" });
    }
    inv.reserved -= quantity;
    inv.soldCount += quantity;
    await inv.save();
    res.send(inv);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
