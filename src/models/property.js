import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    area: { type: Number, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['Available', 'Rented'], default: 'Available' },
    image: { type: String, required: true }
});

const Property = mongoose.model('Property', propertySchema);

export default Property;
