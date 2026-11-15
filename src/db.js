import mongoose from 'mongoose';
import { Property } from './models/property.js';

export async function connectDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/dreamhouse');
        console.log('Conectado a MongoDB local');

        const count = await Property.countDocuments();
        if (count === 0) {
            await Property.insertMany([
                { title: 'C. Río Duero 13, 6ºB', location: 'Móstoles Sur, Madrid', bedrooms: 3, bathrooms: 2, area: 100, price: 500, status: 'Available', type: 'Full House', image: 'property1.jpg', description: 'TODO' },
                { title: 'Av. de la Constitución, 45', location: 'Centro, Madrid', bedrooms: 2, bathrooms: 1, area: 75, price: 850, status: 'Available', type: 'Shared Apartment', image: 'property2.jpg', description: 'TODO' },
                { title: 'C. Alcalá 120, 2ºC', location: 'Salamanca, Madrid', bedrooms: 4, bathrooms: 2, area: 130, price: 1450, status: 'Rented', type: 'Full House', image: 'property3.jpg', description: 'TODO' },
                { title: 'Paseo de la Castellana 85', location: 'Chamberí, Madrid', bedrooms: 1, bathrooms: 1, area: 50, price: 760, status: 'Available', type: 'Room', image: 'property4.jpg', description: 'TODO' },
                { title: 'C. Pintor Velázquez 12', location: 'Móstoles, Madrid', bedrooms: 3, bathrooms: 2, area: 90, price: 600, status: 'Available', type: 'Full House', image: 'property5.jpg', description: 'TODO' },
                { title: 'Av. de España 5', location: 'Fuenlabrada, Madrid', bedrooms: 2, bathrooms: 1, area: 80, price: 575, status: 'Available', type: 'Shared Apartment', image: 'property6.jpg', description: 'TODO' },
                { title: 'C. Mayor 10, 3ºA', location: 'Alcorcón, Madrid', bedrooms: 3, bathrooms: 2, area: 95, price: 650, status: 'Rented', type: 'Full House', image: 'property7.jpg', description: 'TODO' },
                { title: 'C. Princesa 31', location: 'Moncloa, Madrid', bedrooms: 2, bathrooms: 1, area: 65, price: 900, status: 'Available', type: 'Shared Apartment', image: 'property8.jpg', description: 'TODO' },
                { title: 'C. Gran Vía 12', location: 'Centro, Madrid', bedrooms: 1, bathrooms: 1, area: 40, price: 810, status: 'Available', type: 'Room', image: 'property9.jpg', description: 'TODO' }
            ]);
            console.log('Datos iniciales insertados en MongoDB');
        }
    } catch (err) {
        console.log('Error al conectar a MongoDB:', err);
    }

}
