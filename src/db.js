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

function newReview(author, date, rating, comment) {
    return { _id: new ObjectId(), author, date, rating, comment };
}

export async function connectDB() {
    try {
        await client.connect();
        Property = client.db('dreamhouse').collection('properties');
        console.log('Connected to local MongoDB');

        copyImages();

        // Sample data, only inserted when the database is empty
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
                    reviews: [
                        newReview('John Smith', '2026-10-08', 5, 'Great apartment, very well located and spacious rooms.'),
                        newReview('Antonio Jiménez', '2026-07-15', 2, 'It is well connected but very old. The floor creaks and the walls show signs of water damage.')
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
                    reviews: [
                        newReview('Laura Martín', '2026-09-21', 4, 'Very good location and nice flatmates. The kitchen is a bit small.')
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
                    reviews: [
                        newReview('Carlos Ruiz', '2026-06-30', 5, 'Beautiful house, the bathrooms are brand new and the neighbourhood is very quiet.'),
                        newReview('Marta Gil', '2026-08-12', 3, 'Nice flat but too expensive for what it offers.'),
                        newReview('Pablo Herrera', '2026-09-03', 4, 'High ceilings and lots of light. Heating could be better.')
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
                    reviews: [
                        newReview('Sofía Navarro', '2026-10-02', 5, 'Perfect room for studying, very clean and quiet.')
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
                    reviews: [
                        newReview('David López', '2026-05-18', 4, 'Close to the university and the metro. Great for a family.'),
                        newReview('Elena Castro', '2026-07-27', 1, 'The landlord never answered when the heating broke.')
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
                    reviews: [
                        newReview('Javier Moreno', '2026-09-14', 3, 'Good price, but the building is a bit noisy at night.'),
                        newReview('Lucía Ortega', '2026-10-20', 5, 'The air conditioning is great in summer and the balcony is lovely.')
                    ]
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
                    reviews: [
                        newReview('Raúl Santos', '2026-04-09', 4, 'Very spacious and the storage room is really useful.')
                    ]
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
                    reviews: [
                        newReview('Irene Vega', '2026-10-11', 5, 'I could walk to the faculty every day. Very sunny and bright.'),
                        newReview('Sergio Prieto', '2026-08-25', 2, 'Nice area but the rooms are tiny.')
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
                    reviews: []
                }
            ]);
            console.log('Initial properties and sample reviews inserted into MongoDB');
        }
    } catch (err) {
        console.log('Error connecting to MongoDB:', err);
        throw err;
    }
}
