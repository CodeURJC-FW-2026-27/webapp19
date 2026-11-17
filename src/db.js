import mongoose from 'mongoose';
import { Property } from './models/property.js';

export async function connectDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/dreamhouse');
        console.log('Connected to local MongoDB');

        const count = await Property.countDocuments();
        if (count === 0) {
            await Property.insertMany([
                { 
                    title: 'C. Río Duero 13, 6ºB', 
                    location: 'Móstoles Sur, Madrid', 
                    bedrooms: 3, 
                    area: 100, 
                    price: 500, 
                    status: 'Available', 
                    category: 'Full House', 
                    image: 'property1.jpg', 
                    description: 'Bright three-bedroom apartment in Móstoles Sur with terrace, elevator, and easy access to public transport.',
                    comments:[
                        {name: 'Laura Gomenz', rating: 5, text: 'Very bright apartment and quiet neighborhood, close to the metro station.', date: '2026-10-12'},
                        {name: 'Carlos Ruiz', rating: 4, text: 'Spacious living room and well-equipped kitchen.', date: '2026-10-20' }
                    ]
                },
                { 
                    title: 'Av. de la Constitución, 45', 
                    location: 'Centro, Madrid', 
                    bedrooms: 2, 
                    area: 75, 
                    price: 850, 
                    status: 'Available', 
                    category: 'Shared Apartment', 
                    image: 'property2.jpg', 
                    description: 'Modern two-bedroom shared apartment in central Madrid, ideal for students or young professionals.',
                    comments: [
                        {name:'Elena Martin', rating: 5, text: 'Unbeatable location right in the center, everything is within walking distance.', date: '2026-10-15'}
                    ]
                },
                { 
                    title: 'C. Alcalá 120, 2ºC', 
                    location: 'Salamanca, Madrid', 
                    bedrooms: 4, 
                    area: 130, 
                    price: 1450, 
                    status: 'Rented', 
                    category: 'Full House', 
                    image: 'property3.jpg', 
                    description: 'Elegant four-bedroom residence in the Salamanca district with high ceilings and renovated bathrooms.',
                    comments: [
                        { name: 'David Torres', rating: 5, text: 'Premium quality finishes and a very attentive landlord.', date: '2026-09-28' }
                    ] 
                },
                { 
                    title: 'Paseo de la Castellana 85', 
                    location: 'Chamberí, Madrid', 
                    bedrooms: 1, 
                    area: 50, 
                    price: 760, 
                    status: 'Available', 
                    category: 'Room', 
                    image: 'property4.jpg', 
                    description: 'Cozy private room in Chamberí with study desk, built-in wardrobe, and shared modern kitchen.',
                    comments: [
                        { name: 'Sofia Navarro', rating: 4, text: 'Clean, comfortable room with great metro connections.', date: '2026-11-01' }
                    ]
                },
                { 
                    title: 'C. Pintor Velázquez 12', 
                    location: 'Móstoles, Madrid', 
                    bedrooms: 3, 
                    area: 90, 
                    price: 600, 
                    status: 'Available', 
                    category: 'Full House', 
                    image: 'property5.jpg', 
                    description: 'Family-friendly three-bedroom flat near parks, supermarkets, and Rey Juan Carlos University.',
                    comments: [
                        { name: 'Javier Morales', rating: 5, text: 'Great value for money and very close to the university campus.', date: '2026-11-03' }
                    ]
                },
                { 
                    title: 'Av. de España 5', 
                    location: 'Fuenlabrada, Madrid', 
                    bedrooms: 2, 
                    area: 80, 
                    price: 575, 
                    status: 'Available', 
                    category: 'Shared Apartment', 
                    image: 'property6.jpg', 
                    description: 'Renovated two-bedroom shared flat in Fuenlabrada with air conditioning and balcony.',
                    comments: []
                },
                { 
                    title: 'C. Mayor 10, 3ºA', 
                    location: 'Alcorcón, Madrid', 
                    bedrooms: 3, 
                    area: 95, 
                    price: 650, 
                    status: 'Rented', 
                    category: 'Full House', 
                    image: 'property7.jpg', 
                    description: 'Spacious third-floor apartment in Alcorcón town center with natural gas heating and storage room.',
                    comments: []
                },
                { 
                    title: 'C. Princesa 31', 
                    location: 'Moncloa, Madrid', 
                    bedrooms: 2, 
                    area: 65, 
                    price: 900, 
                    status: 'Available', 
                    category: 'Shared Apartment', 
                    image: 'property8.jpg', 
                    description: 'Sunny shared apartment in Moncloa just minutes away from Ciudad Universitaria and Parque del Oeste.',
                    comments: [
                        { name: 'Ana Beltran', rating: 5, text: 'Perfect location for university students and great flatmates.', date: '2026-11-05' }
                    ]
                },
                { 
                    title: 'C. Gran Vía 12', 
                    location: 'Centro, Madrid', 
                    bedrooms: 1, 
                    area: 40, 
                    price: 810, 
                    status: 'Available', 
                    category: 'Room', 
                    image: 'property9.jpg', 
                    description: 'Exterior private room on Gran Vía with soundproof windows, Wi-Fi, and weekly cleaning included.',
                    comments: []
                }
            ]);
            console.log('Initial properties and sample comments inserted into MongoDB');
        }
    } catch (err) {
        console.log('Error connecting to MongoDB:', err);
    }

}
