import mongoose from 'mongoose';
const commentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    text: { type: String, required: false },
    date: { type: String, required: true },
});
const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    area: { type: Number, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['Available', 'Rented'], default: 'Available' },
    image: { type: String, required: true },
    comments: [commentSchema]
});
const Comment = mongoose.model('Comment', commentSchema);
const Property = mongoose.model('Property', propertySchema);

//Exporting models so they can be imported and used in the router
export {Property, Comment};
