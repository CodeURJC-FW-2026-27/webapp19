import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';

const client = new MongoClient('mongodb://127.0.0.1:27017');
export let Property;

// Copy the images from data/ to uploads/ if they are not there yet
function copyImages() {
    fs.mkdirSync('uploads', { recursive: true });
    for (const file of fs.readdirSync('data')) {
        if (!fs.existsSync('uploads/' + file)) {
            fs.copyFileSync('data/' + file, 'uploads/' + file);
        }
    }
}

export async function connectDB() {
    try {
        await client.connect();
        Property = client.db('dreamhouse').collection('properties');
        console.log('Connected to local MongoDB');

        copyImages();

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
                    comments: [{ _id: new ObjectId(), name: 'John Smith', rating: 5, text: 'Great apartment, very well located and spacious rooms.', date: '2026-10-08' },
                    { _id: new ObjectId(), name: 'Antonio Jiménez', rating: 2, text: 'Its well connected but very old. The floor creeks, the walls show signs of water damage and the cabinet doors are broken', date: '2026-07-15' }]
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
                    comments: [{ _id: new ObjectId(), name: 'John Smith', rating: 5, text: 'Great apartment, very well located and spacious rooms.', date: '2026-10-08' },
                    { _id: new ObjectId(), name: 'Antonio Jiménez', rating: 2, text: 'Its well connected but very old. The floor creeks, the walls show signs of water damage and the cabinet doors are broken', date: '2026-07-15' }]
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
                    comments: [{ _id: new ObjectId(), name: 'John Smith', rating: 5, text: 'Great apartment, very well located and spacious rooms.', date: '2026-10-08' },
                    { _id: new ObjectId(), name: 'Antonio Jiménez', rating: 2, text: 'Its well connected but very old. The floor creeks, the walls show signs of water damage and the cabinet doors are broken', date: '2026-07-15' }]
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
                    comments: [{ _id: new ObjectId(), name: 'John Smith', rating: 5, text: 'Great apartment, very well located and spacious rooms.', date: '2026-10-08' },
                    { _id: new ObjectId(), name: 'Antonio Jiménez', rating: 2, text: 'Its well connected but very old. The floor creeks, the walls show signs of water damage and the cabinet doors are broken', date: '2026-07-15' }]
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
                    comments: [{ _id: new ObjectId(), name: 'John Smith', rating: 5, text: 'Great apartment, very well located and spacious rooms.', date: '2026-10-08' },
                    { _id: new ObjectId(), name: 'Antonio Jiménez', rating: 2, text: 'Its well connected but very old. The floor creeks, the walls show signs of water damage and the cabinet doors are broken', date: '2026-07-15' }]
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
                    comments: [{ _id: new ObjectId(), name: 'John Smith', rating: 5, text: 'Great apartment, very well located and spacious rooms.', date: '2026-10-08' },
                    { _id: new ObjectId(), name: 'Antonio Jiménez', rating: 2, text: 'Its well connected but very old. The floor creeks, the walls show signs of water damage and the cabinet doors are broken', date: '2026-07-15' }]
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
                    comments: [{ _id: new ObjectId(), name: 'John Smith', rating: 5, text: 'Great apartment, very well located and spacious rooms.', date: '2026-10-08' },
                    { _id: new ObjectId(), name: 'Antonio Jiménez', rating: 2, text: 'Its well connected but very old. The floor creeks, the walls show signs of water damage and the cabinet doors are broken', date: '2026-07-15' }]
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
                    comments: [{ _id: new ObjectId(), name: 'John Smith', rating: 5, text: 'Great apartment, very well located and spacious rooms.', date: '2026-10-08' },
                    { _id: new ObjectId(), name: 'Antonio Jiménez', rating: 2, text: 'Its well connected but very old. The floor creeks, the walls show signs of water damage and the cabinet doors are broken', date: '2026-07-15' }]
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
                    comments: [{ _id: new ObjectId(), name: 'John Smith', rating: 5, text: 'Great apartment, very well located and spacious rooms.', date: '2026-10-08' },
                    { _id: new ObjectId(), name: 'Antonio Jiménez', rating: 2, text: 'Its well connected but very old. The floor creeks, the walls show signs of water damage and the cabinet doors are broken', date: '2026-07-15' }]
                }
            ]);
            console.log('Initial properties and sample comments inserted into MongoDB');
        }
    } catch (err) {
        console.log('Error connecting to MongoDB:', err);
        throw err;
    }
}
