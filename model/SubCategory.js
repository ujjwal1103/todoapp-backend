const mongoose = require('mongoose');
const Category = require('./Category');

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
subcategorySchema.pre('remove', async function (next) {
    const categoryId = this.category; // Assuming you have a reference to the parent category in the subcategory schema
    await Category.findByIdAndUpdate(categoryId, { $pull: { subcategories: this._id } });
    next();
  });
module.exports = Subcategory;