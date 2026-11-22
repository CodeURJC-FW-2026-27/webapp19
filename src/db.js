import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';

const client = new MongoClient('mongodb://127.0.0.1:27017');
export let Property;

// Copy the images from data/ to uploads/ if they are not there yet
function copyImages() {
    fs.mkdirSync('uploads', { recursive: true });
    for (const file of fs.readdirSync('data')) {
        if (!file.endsWith('.json') && !fs.existsSync('uploads/' + file)) {
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
            const rawData = fs.readFileSync('data/properties.json', 'utf8');
            const properties = JSON.parse(rawData);

            for (const prop of properties) {
                for (const review of prop.reviews) {
                    review._id = new ObjectId();
                }
            }

            await Property.insertMany(properties);
            console.log('Initial properties and sample reviews inserted into MongoDB');
        }
    } catch (err) {
        console.log('Error connecting to MongoDB:', err);
        throw err;
    }
}
