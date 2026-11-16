import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { Property } from './models/property.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

//Main page route with pagination
router.get('/', async (req, res) => {
    try {
        const perPage = 6; //number of items per page as required
        const page = parseInt(req.query.page) || 1; //current page, default to 1

        //Count total properties to calculate total pages
        const totalProperties = await Property.countDocuments();
        const totalPages = Math.ceil(totalProperties / perPage);

        //Fetch only the properties for the current page
        const properties = await Property.find()
            .skip((page - 1) * perPage)
            .limit(perPage)
            .lean();

        //Generate an array of pages for the view pagination links
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push({
                number: i,
                isCurrent: i === page
            });
        }

        //Render the index view passing pagination parameters
        res.render('index', {
            properties,
            pages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            prevPage: page - 1,
            nextPage: page + 1
        });
    } catch (err) {
        console.error("Error retrieving properties:", err);
        res.status(500).render('error', {
            errorMessage: 'An error occurred while loading the properties.',
            backUrl: '/',
            backText: 'Try Again'
        });
    }
});

router.get('/new_property', (req, res) => {
    res.render('new_property');
});

router.post('/new_property', upload.single('image'), async (req, res) => {
    const formError = (errorMessage, status = 400) => res.status(status).render('error', {
        errorMessage,
        backUrl: '/new_property',
        backText: 'Back to the creation form'
    });
    try {
        const { title, category, status, price, location, description, bedrooms, area } = req.body;

        //Validation from the backend
        if (!title || !category || !price || !location || !description || !bedrooms || !area) {
            if (req.file) fs.unlink(req.file.path, () => { });
            return formError('All property fields are required.');
        }
        if (!req.file) {
            return formError('A valid image file is required.');
        }

        const property = await Property.create({ title, category, status, price: Number(price), location, description, bedrooms: Number(bedrooms), area: Number(area), image: req.file.filename });

        res.render('confirmation', {
            title: 'Property Created',
            message: 'The property has been added successfully.',
            backUrl: `/property/${property._id}`,
            backText: 'View Property'
        });
    } catch (err) {
        console.error('Error creating property: ', err);
        //The property was not saved, so delete its uploaded image
        if (req.file) fs.unlink(req.file.path, () => { });
        if (err.name === 'ValidationError') {
            return formError('Some property fields are not valid. Please review the form.');
        }
        formError('An unexpected error occurred while saving the property.', 500);
    }
});

//Property detail page route
router.get('/property/:id', async (req, res) => {
    try {
        //find the property by its unique ID
        const property = await Property.findById(req.params.id).lean();

        if (!property) {
            return res.status(404).render('error', {
                errorMessage: 'Property not found.',
                backUrl: '/',
                backText: 'Back to Home'
            })
        }

        // Map comments to generate a dynamic array of stars for Mustache rendering
        if (property.comments && property.comments.length > 0) {
            property.comments = property.comments.map(comment => {
                const stars = [];
                for (let i = 1; i <= 5; i++) {
                    stars.push({
                        filled: i <= comment.rating
                    });
                }
                return {
                    ...comment,
                    stars
                };
            });
        }

        //Render the detail view passing the property data 
        res.render('property_detail', { property });
    } catch (err) {
        console.error("Error retrieving property details: ", err);
        res.status(500).render('error', {
            errorMessage: 'An error occurred while retrieving the property details.',
            backUrl: '/',
            backText: 'Back to Home'
        });
    }
});

//Route to download the property image stored in the uploads folder
router.get('/property/:id/image', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property || !property.image) {
            return res.status(404).send('Image not found');
        }

        const filename = path.basename(property.image);
        const imagePath = path.resolve('uploads', filename);
        res.download(imagePath);
    } catch (err) {
        console.error('Error downloading property image:', err);
        res.status(500).send('Error retrieving image');
    }
});

//Route to receive and save a new review/comment for the form
router.post('/property/:id/comment', async (req, res) => {
    try {
        //Extract the exact name attributes defined in the HTML form
        const { author, date, rating, comment } = req.body;

        //Basic server-side validation for required fields
        if (!author || !date || !rating || !comment) {
            return res.status(400).render('error', {
                errorMessage: 'All review fields(author, date, rating, and comment) are required.',
                backUrl: `/property/${req.params.id}`,
                backText: 'Back to Property'
            });
        }

        //Map the form data to the keys expected by the Mongoose model
        const newComment = {
            name: author, //'author' in HTML maps to 'name' in the model
            date: date,
            rating: Number(rating),
            text: comment //'comment' in HTML maps to 'text' in the model
        };

        //Find the property, push the new comment into its comments array, and save
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).render('error', {
                errorMessage: 'Property not found.',
                backUrl: '/',
                backText: 'Back to Home'
            });
        }

        property.comments.push(newComment);
        await property.save();

        //Redirect back to the property detail page to see the new review
        res.render('confirmation', {
            title: 'Review Submitted',
            message: 'Your review has been added successfully.',
            backUrl: `/property/${req.params.id}`,
            backText: 'Back to Property Details'
        });
    } catch (err) {
        console.error("Error saving comment: ", err);
        res.status(500).render('error', {
            errorMessage: 'An unexpected error occurred while saving your review.',
            backUrl: `/property/${req.params.id}`,
            backText: 'Back to Property'
        });
    }
});

export default router;
