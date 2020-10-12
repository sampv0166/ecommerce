import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// @ desc Fetch all products
// @route GET /api/products
// @access Public Route

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });

  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @ desc Fetch single products
// @route GET /api/products/:id
// @access Public Route

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not Found');
  }
});

// @ desc delete a product
// @route DELETE /api/products/:id
// @access PRIVATE/ADMIN

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.remove();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not Found');
  }
});

// @ desc create a product
// @route DELETE /api/products
// @access PRIVATE/ADMIN

const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user.id,
    image: '/images/sample.jpg',
    brand: 'Sample Brand',
    category: 'Sample Category',
    countInStock: 0,
    numReviews: 0,
    description: 'Samplw Description',
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @ desc updatre a product
// @route PUT /api/products/:id
// @access PRIVATE/ADMIN

const updateProduct = asyncHandler(async (req, res) => {
  const {
    name = req.params.name,
    price,
    description,
    image,
    brand,
    category,
    countInStock,
  } = req.body;

  console.log(name);

  const product = await Product.findById(req.params.id);

  // console.log(product);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('product not found');
  }
});

// @ desc create new review
// @route POST /api/products/:id/reviews
// @access PRIVATE/ADMIN

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  // console.log(product);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(404);
      throw new Error('product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('product not found');
  }
});

// @ desc Get top rated products
// @route GET /api/products/top
// @access public

const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);

  res.json(products);
});

export {
  getTopProducts,
  deleteProduct,
  getProducts,
  getProductById,
  updateProduct,
  createProduct,
  createProductReview,
};
