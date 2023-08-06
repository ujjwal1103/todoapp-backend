const mongoose = require('mongoose');

const sliderImagesSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Todo = mongoose.model('SliderImage', sliderImagesSchema);

module.exports = Todo;
