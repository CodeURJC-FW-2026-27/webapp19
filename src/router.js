import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { ObjectId } from 'mongodb';
import { Property } from './db.js';

const router = express.Router();

// Uploaded images are saved in uploads/ keeping their extension
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

function renderError(res, status, message, backUrl, backText) {
    res.status(status).render('error', { errorMessage: message, backUrl, backText });
}

function renderConfirmation(res, title, message, backUrl, backText) {
    res.render('confirmation', { title, message, backUrl, backText });
}

function findPropertyById(id) {
    return Property.findOne({ _id: new ObjectId(id) });
}

function findReview(property, reviewId) {
    return property.reviews.find(review => review._id.toString() === reviewId);
}

function deleteImage(filename) {
    return fs.rm(path.join('uploads', path.basename(filename)), { force: true });
}

// Returns the property fields from the form, ready to be saved
function getPropertyData(body) {
    return {
        title: body.title.trim(),
        location: body.location.trim(),
        bedrooms: Number(body.bedrooms),
        area: Number(body.area),
        price: Number(body.price),
        status: body.status,
        category: body.category,
        description: body.description.trim()
    };
}

// Validation functions: they return an error message or null if everything is correct

async function validateProperty(body, file, property) {
    const { title, location, bedrooms, area, price, status, category, description } = body;

    if (!title || !location || !bedrooms || !area || !price || !status || !category || !description) {
        return 'All property fields are required.';
    }
    if (!title.trim() || !location.trim() || !description.trim()) {
        return 'All property fields are required.';
    }
    if (!/^[A-ZÁÉÍÓÚÜÑ]/.test(title.trim())) {
        return 'The property title must start with an uppercase letter.';
    }

    // When editing, the property can keep its own title
    const sameTitle = await Property.findOne({
        title: title.trim(),
        _id: { $ne: property ? property._id : null }
    });
    if (sameTitle) {
        return 'A property with this title already exists.';
    }

    if (!Number.isInteger(Number(bedrooms)) || !(bedrooms >= 0 && bedrooms <= 20)) {
        return 'Bedrooms must be a whole number between 0 and 20.';
    }
    if (!(area >= 1 && area <= 5000)) {
        return 'Area must be between 1 and 5000 m2.';
    }
    if (!(price >= 1 && price <= 50000)) {
        return 'Price must be between 1 and 50000 euros.';
    }
    if (!['Available', 'Rented'].includes(status)) {
        return 'Invalid property status.';
    }
    if (!['Shared Apartment', 'Full House', 'Room'].includes(category)) {
        return 'Invalid property category.';
    }
    if (description.trim().length < 20 || description.trim().length > 1000) {
        return 'The description must be between 20 and 1000 characters.';
    }

    if (file && !file.mimetype.startsWith('image/')) {
        return 'The uploaded file must be an image.';
    }
    // The image is required when creating, but optional when editing
    if (!property && !file) {
        return 'A property image is required.';
    }
    return null;
}

function validateReview(body, property, reviewId) {
    const { author, date, rating, comment } = body;

    if (!author || !date || !rating || !comment || !author.trim() || !comment.trim()) {
        return 'All review fields (author, date, rating, and comment) are required.';
    }
    if (author.trim().length < 2 || author.trim().length > 50) {
        return 'The author name must be between 2 and 50 characters.';
    }
    if (Number.isNaN(Date.parse(date))) {
        return 'Please provide a valid date.';
    }
    if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {
        return 'Rating must be a number between 1 and 5.';
    }
    if (comment.trim().length < 5 || comment.trim().length > 500) {
        return 'The review text must be between 5 and 500 characters.';
    }

    // An author can only review a property once (the review being edited does not count)
    const repeated = property.reviews.some(review =>
        review._id.toString() !== reviewId &&
        review.author.toLowerCase() === author.trim().toLowerCase()
    );
    if (repeated) {
        return 'This author has already submitted a review for this property.';
    }
    return null;
}

// ============================================================================
// MAIN PAGE (listing, pagination, search and category filter)
// ============================================================================

router.get('/', async (req, res) => {
    try {
        const perPage = 6;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const search = req.query.search ? req.query.search.trim() : '';
        const category = req.query.type ? req.query.type.trim() : '';

        const filter = {};
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) {
            filter.category = category;
        }

        const totalProperties = await Property.countDocuments(filter);
        const totalPages = Math.max(1, Math.ceil(totalProperties / perPage));
        const properties = await Property.find(filter)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .toArray();
        properties.forEach(p => p.isRented = p.status === 'Rented');

        // Page links keep the search and the category
        let query = '';
        if (search) query += `&search=${encodeURIComponent(search)}`;
        if (category) query += `&type=${encodeURIComponent(category)}`;

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push({ number: i, isCurrent: i === page, url: `/?page=${i}${query}` });
        }

        res.render('index', {
            properties,
            pages,
            search,
            selectedType: category,
            isAllTypes: !category,
            isSharedApartment: category === 'Shared Apartment',
            isFullHouse: category === 'Full House',
            isRoom: category === 'Room',
            hasPrevPage: page > 1,
            prevPageUrl: `/?page=${page - 1}${query}`,
            hasNextPage: page < totalPages,
            nextPageUrl: `/?page=${page + 1}${query}`
        });
    } catch (err) {
        console.error('Error retrieving properties:', err);
        renderError(res, 500, 'An error occurred while loading the properties.', '/', 'Try Again');
    }
});

// ============================================================================
// PROPERTIES (create, detail, edit and delete)
// ============================================================================

router.get('/new_property', (req, res) => {
    res.render('new_property', {
        isEdit: false,
        formAction: '/new_property',
        pageTitle: 'Add Property',
        submitText: 'Save',
        cancelUrl: '/',
        isAvailable: true
    });
});

router.post('/new_property', upload.single('image'), async (req, res) => {
    try {
        const errorMsg = await validateProperty(req.body, req.file, null);
        if (errorMsg) {
            if (req.file) await deleteImage(req.file.filename);
            return renderError(res, 400, errorMsg, '/new_property', 'Back to the creation form');
        }

        const property = getPropertyData(req.body);
        property.image = req.file.filename;
        property.reviews = [];
        const result = await Property.insertOne(property);

        renderConfirmation(res, 'Property Created', 'The property has been added successfully.',
            `/property/${result.insertedId}`, 'View Property');
    } catch (err) {
        console.error('Error creating property:', err);
        if (req.file) await deleteImage(req.file.filename);
        renderError(res, 500, 'An unexpected error occurred while saving the property.', '/new_property', 'Try Again');
    }
});

router.get('/property/:id', async (req, res) => {
    try {
        const property = await findPropertyById(req.params.id);
        if (!property) {
            return renderError(res, 404, 'Property not found.', '/', 'Back to Home');
        }

        // Each review gets a list of 5 stars (filled or empty) for Mustache
        for (const review of property.reviews) {
            review.stars = [];
            for (let i = 1; i <= 5; i++) {
                review.stars.push({ filled: i <= review.rating });
            }
        }

        property.isRented = property.status === 'Rented';

        res.render('property_detail', { property });
    } catch (err) {
        console.error('Error retrieving property details:', err);
        renderError(res, 500, 'An error occurred while retrieving the property details.', '/', 'Back to Home');
    }
});

router.get('/property/:id/edit', async (req, res) => {
    try {
        const property = await findPropertyById(req.params.id);
        if (!property) {
            return renderError(res, 404, 'Property not found.', '/', 'Back to Home');
        }

        // The same form as new_property is used, with the current data
        res.render('new_property', {
            isEdit: true,
            formAction: `/property/${property._id}/edit`,
            pageTitle: 'Edit Property',
            submitText: 'Save Changes',
            cancelUrl: `/property/${property._id}`,
            property,
            isAvailable: property.status === 'Available',
            isRented: property.status === 'Rented',
            isSelShared: property.category === 'Shared Apartment',
            isSelHouse: property.category === 'Full House',
            isSelRoom: property.category === 'Room'
        });
    } catch (err) {
        console.error('Error loading edit property form:', err);
        renderError(res, 500, 'An error occurred while loading the edit form.', '/', 'Back to Home');
    }
});

router.post('/property/:id/edit', upload.single('image'), async (req, res) => {
    try {
        const property = await findPropertyById(req.params.id);
        if (!property) {
            if (req.file) await deleteImage(req.file.filename);
            return renderError(res, 404, 'Property not found.', '/', 'Back to Home');
        }

        const errorMsg = await validateProperty(req.body, req.file, property);
        if (errorMsg) {
            if (req.file) await deleteImage(req.file.filename);
            return renderError(res, 400, errorMsg, `/property/${property._id}/edit`, 'Back to Edit Form');
        }

        const newData = getPropertyData(req.body);
        if (req.file) {
            newData.image = req.file.filename;
        }
        await Property.updateOne({ _id: property._id }, { $set: newData });

        // The old image is not needed anymore
        if (req.file) {
            await deleteImage(property.image);
        }

        renderConfirmation(res, 'Property Updated', 'The property has been updated successfully.',
            `/property/${property._id}`, 'Back to Property Details');
    } catch (err) {
        console.error('Error updating property:', err);
        if (req.file) await deleteImage(req.file.filename);
        renderError(res, 500, 'An error occurred while updating the property.',
            `/property/${req.params.id}/edit`, 'Try Again');
    }
});

router.post('/property/:id/delete', async (req, res) => {
    try {
        const property = await findPropertyById(req.params.id);
        if (!property) {
            return renderError(res, 404, 'Property not found.', '/', 'Back to Home');
        }

        await Property.deleteOne({ _id: property._id });
        await deleteImage(property.image);

        renderConfirmation(res, 'Property Deleted', 'The property has been deleted successfully.',
            '/', 'Back to Home');
    } catch (err) {
        console.error('Error deleting property:', err);
        renderError(res, 500, 'An error occurred while deleting the property.',
            `/property/${req.params.id}`, 'Back to Property');
    }
});

// ============================================================================
// REVIEWS (create, edit and delete)
// ============================================================================

router.post('/property/:id/review', async (req, res) => {
    try {
        const property = await findPropertyById(req.params.id);
        if (!property) {
            return renderError(res, 404, 'Property not found.', '/', 'Back to Home');
        }

        const errorMsg = validateReview(req.body, property, null);
        if (errorMsg) {
            return renderError(res, 400, errorMsg, `/property/${property._id}`, 'Back to Property');
        }

        await Property.updateOne({ _id: property._id }, {
            $push: {
                reviews: {
                    _id: new ObjectId(),
                    author: req.body.author.trim(),
                    date: req.body.date,
                    rating: Number(req.body.rating),
                    comment: req.body.comment.trim()
                }
            }
        });

        renderConfirmation(res, 'Review Submitted', 'Your review has been added successfully.',
            `/property/${property._id}`, 'Back to Property Details');
    } catch (err) {
        console.error('Error saving review:', err);
        renderError(res, 500, 'An unexpected error occurred while saving your review.',
            `/property/${req.params.id}`, 'Back to Property');
    }
});

router.get('/property/:id/review/:reviewId/edit', async (req, res) => {
    try {
        const property = await findPropertyById(req.params.id);
        if (!property) {
            return renderError(res, 404, 'Property not found.', '/', 'Back to Home');
        }

        const review = findReview(property, req.params.reviewId);
        if (!review) {
            return renderError(res, 404, 'Review not found.', `/property/${property._id}`, 'Back to Property');
        }

        // Options of the rating select, the current rating is marked as selected
        const ratings = [];
        for (let i = 5; i >= 1; i--) {
            ratings.push({ value: i, label: i === 1 ? '1 Star' : `${i} Stars`, selected: i === review.rating });
        }

        res.render('edit_review', { property, review, ratings });
    } catch (err) {
        console.error('Error loading edit review form:', err);
        renderError(res, 500, 'An error occurred while loading the review edit form.',
            `/property/${req.params.id}`, 'Back to Property');
    }
});

router.post('/property/:id/review/:reviewId/edit', async (req, res) => {
    try {
        const property = await findPropertyById(req.params.id);
        if (!property) {
            return renderError(res, 404, 'Property not found.', '/', 'Back to Home');
        }

        const review = findReview(property, req.params.reviewId);
        if (!review) {
            return renderError(res, 404, 'Review not found.', `/property/${property._id}`, 'Back to Property');
        }

        const errorMsg = validateReview(req.body, property, req.params.reviewId);
        if (errorMsg) {
            return renderError(res, 400, errorMsg,
                `/property/${property._id}/review/${review._id}/edit`, 'Back to Edit Review');
        }

        await Property.updateOne(
            { _id: property._id, 'reviews._id': review._id },
            {
                $set: {
                    'reviews.$.author': req.body.author.trim(),
                    'reviews.$.date': req.body.date,
                    'reviews.$.rating': Number(req.body.rating),
                    'reviews.$.comment': req.body.comment.trim()
                }
            }
        );

        renderConfirmation(res, 'Review Updated', 'Your review has been updated successfully.',
            `/property/${property._id}`, 'Back to Property Details');
    } catch (err) {
        console.error('Error updating review:', err);
        renderError(res, 500, 'An error occurred while updating the review.',
            `/property/${req.params.id}`, 'Back to Property');
    }
});

router.post('/property/:id/review/:reviewId/delete', async (req, res) => {
    try {
        const property = await findPropertyById(req.params.id);
        if (!property) {
            return renderError(res, 404, 'Property not found.', '/', 'Back to Home');
        }

        const review = findReview(property, req.params.reviewId);
        if (!review) {
            return renderError(res, 404, 'Review not found.', `/property/${property._id}`, 'Back to Property');
        }

        await Property.updateOne({ _id: property._id }, { $pull: { reviews: { _id: review._id } } });

        renderConfirmation(res, 'Review Deleted', 'The review has been deleted successfully.',
            `/property/${property._id}`, 'Back to Property Details');
    } catch (err) {
        console.error('Error deleting review:', err);
        renderError(res, 500, 'An error occurred while deleting the review.',
            `/property/${req.params.id}`, 'Back to Property');
    }
});

export default router;
