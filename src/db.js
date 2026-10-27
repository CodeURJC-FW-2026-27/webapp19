import mongoose from 'mongoose';
import Property from './models/property.js';

export async function connectDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/dreamhouse');
        console.log('Conectado a MongoDB local');

        const count = await Property.countDocuments();
        if (count === 0) {
            await Property.insertMany([
                { title: 'C. Río Duero 13, 6ºB', location: 'Móstoles Sur, Madrid', bedrooms: 3, area: 100, price: 500, status: 'Available', image: '/images/property1.jpg' },
                { title: 'Av. de la Constitución, 45', location: 'Centro, Madrid', bedrooms: 2, area: 75, price: 850, status: 'Available', image: '/images/property2.jpg' },
                { title: 'C. Alcalá 120, 2ºC', location: 'Salamanca, Madrid', bedrooms: 4, area: 130, price: 1450, status: 'Rented', image: '/images/property3.jpg' }
            ]);
            console.log('Datos iniciales insertados en MongoDB');
        }
    } catch (err)     } catch (err)     }('Error al conectar a MongoDB:', err);
    }
}
