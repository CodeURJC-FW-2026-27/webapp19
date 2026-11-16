import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { Property } from './models/property.js';

const router = express.Router();
// Configure multer to store uploaded images in the uploads/ directory
const upload = multer({ dest: 'uploads/' });

// ============================================================================
// SHARED VALIDATION FUNCTIONS (avoid duplicating code between Create and Edit)
// ============================================================================

async function validatePropertyData(body, file, existingProperty = null) {
    const { title, location, bedrooms, bathrooms, area, price, status, type, description } = body;

    // 1. Check that no required field is missing
    if (!title || !location || !bedrooms || !bathrooms || !area || !price || !status || !type || !description) {
        return 'All property fields are required.';
    }

    // 2. Check that the title starts with an uppercase letter
    const trimmedTitle = title.trim();
    if (!/^[A-ZÁÉÍÓÚÑ]/.test(trimmedTitle)) {
        return 'The property title must start with an uppercase letter.';
    }

    // 3. Check that no other property has the same title
    // When editing (existingProperty != null), exclude the current property from the search
    const duplicateQuery = { title: trimmedTitle };
    if (existingProperty) {
        duplicateQuery._id = { $ne: existingProperty._id };
    }
    const existing = await Property.findOne(duplicateQuery);
    if (existing) {
        return 'A property with this title already exists.';
    }

    // 4. Check that numeric fields are within valid ranges
    const numBedrooms = Number(bedrooms);
    const numBathrooms = Number(bathrooms);
    const numArea = Number(area);
    const numPrice = Number(price);

    if (
        Number.isNaN(numBedrooms) || numBedrooms < 1 || numBedrooms > 20 ||
        Number.isNaN(numBathrooms) || numBathrooms < 1 || numBathrooms > 20 ||
        Number.isNaN(numArea) || numArea < 10 || numArea > 5000 ||
        Number.isNaN(numPrice) || numPrice < 50 || numPrice > 50000
    ) {
        return 'Numeric fields (bedrooms, bathrooms, area, price) must be within valid ranges.';
    }

    // 5. Check that status and category are allowed values
    if (!['Available', 'Rented'].includes(status)) {
        return 'Invalid property status.';
    }
    if (!['Shared Apartment', 'Full House', 'Room'].includes(type)) {
        return 'Invalid property category.';
    }

    // 6. Check minimum and maximum length for the description
    const trimmedDesc = description.trim();
    if (trimmedDesc.length < 10 || trimmedDesc.length > 1000) {
        return 'The description must be between 10 and 1000 characters.';
    }

    // 7. An image is required when creating (!existingProperty), but optional when editing
    if (!existingProperty && !file) {
        return 'A property image is required.';
    }

    return null; // null means all validations passed
}

function validateReviewData(body) {
    const { author, date, rating, comment } = body;

    if (!author || !date || !rating || !comment) {
        return 'All review fields (author, date, rating, and comment) are required.';
    }

    const numRating = Number(rating);
    if (Number.isNaN(numRating) || numRating < 1 || numRating > 5) {
        return 'Rating must be a number between 1 and 5.';
    }

    if (Number.isNaN(Date.parse(date))) {
        return 'Please provide a valid date.';
    }

    if (comment.trim().length < 5 || comment.trim().length > 500) {
        return 'The review text must be between 5 and 500 characters.';
    }

    return null;
}

// ============================================================================
// MAIN PAGE (Listing + Pagination + Search + Category Filter)
// ============================================================================

router.get('/', async (req, res) => {
    try {
        const perPage = 6; // Maximum 6 properties per page
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const search = req.query.search ? req.query.search.trim() : '';
        const type = req.query.type ? req.query.type.trim() : '';

        // Build the MongoDB filter if the user searched by text or selected a category
        const filter = {};
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }
        if (type) {
            filter.type = type;
        }

        const totalProperties = await Property.countDocuments(filter);
        const totalPages = Math.max(1, Math.ceil(totalProperties / perPage));

        const properties = await Property.find(filter)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .lean();

        // Keep search/category query parameters when navigating across pages
        const querySuffix = `${search ? `&search=${encodeURIComponent(search)}` : ''}${type ? `&type=${encodeURIComponent(type)}` : ''}`;

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push({
                number: i,
                isCurrent: i === page,
                url: `/?page=${i}${querySuffix}`
            });
        }

        res.render('index', {
            properties,
            pages,
            search,
            selectedType: type,
            hasNextPage: page < totalPages,
            nextPageUrl: `/?page=${page + 1}${querySuffix}`,
            hasPrevPage: page > 1,
            prevPage: page - 1,
            nextPage: page + 1,
            prevPageUrl: `/?page=${page - 1}${querySuffix}`
        });
    } catch (err) {
        console.error('Error retrieving properties:', err);
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
        const property = await Property.findById(req.params.id).lean();

        if (!property) {
            return res.status(404).render('error', {
                errorMessage: 'Property not found.',
                backUrl: '/',
                backText: 'Back to Home'
            });
        }

        // Convert numeric rating (1-5) into a 5-element array of stars for Mustache
        if (property.comments && property.comments.length > 0) {
            property.comments = property.comments.map(comment => {
                const stars = [];
                for (let i = 1; i <= 5; i++) {
                    stars.push({ filled: i <= comment.rating });
                }
                return { ...comment, stars };
            });
        }

        res.render('property_detail', { property });
    } catch (err) {
        console.error('Error retrieving property details:', err);
        res.status(500).render('error', {
            errorMessage: 'An error occurred while retrieving the property details.',
            backUrl: '/',
            backText: 'Back to Home'
        });
    }
});

// ============================================================================
// EDIT PROPERTY (GET loads form with current data, POST saves updates)
// ============================================================================

router.get('/property/:id/edit', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).lean();
        if (!property) {
            return res.status(404).render('error', {
                errorMessage: 'Property not found.',
                backUrl: '/',
                backText: 'Back to Home'
            });
        }

        // Reuse the SAME new_property.html template with isEdit: true and prefilled data
        res.render('new_property', {
            isEdit: true,
            formAction: `/property/${property._id}/edit`,
            pageTitle: 'Edit Property',
            submitText: 'Save Changes',
            cancelUrl: `/property/${property._id}`,
            property,
            // Helper booleans so Mustache marks the matching <option> as 'selected'
            isAvailable: property.status === 'Available',
            isRented: property.status === 'Rented',
            isSharedApartment: property.type === 'Shared Apartment',
            isFullHouse: property.type === 'Full House',
            isRoom: property.type === 'Room'
        });
    } catch (err) {
        console.error('Error loading edit property form:', err);
        res.status(500).render('error', {
            errorMessage: 'An error occurred while loading the edit form.',
            backUrl: '/',
            backText: 'Back to Home'
        });
    }
});

router.post('/property/:id/edit', upload.single('image'), async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            if (req.file) await fs.rm(req.file.path, { force: true });
            return res.status(404).render('error', {
                errorMessage: 'Property not found.',
                backUrl: '/',
                backText: 'Back to Home'
            });
        }

        // Validate using the shared function, passing 'property' to allow keeping its own title
        const errorMsg = await validatePropertyData(req.body, req.file, property);
        if (errorMsg) {
            if (req.file) await fs.rm(req.file.path, { force: true });
            return res.status(400).render('error', {
                errorMessage: errorMsg,
                backUrl: `/property/${property._id}/edit`,
                backText: 'Back to Edit Form'
            });
        }

        // If a new image was uploaded, delete the old one from uploads/ and store the new filename
        // If NO new image was uploaded, keep property.image unchanged
        if (req.file) {
            if (property.image) {
                await fs.rm(path.resolve('uploads', path.basename(property.image)), { force: true });
            }
            property.image = req.file.filename;
        }

        // Update the remaining property fields
        property.title = req.body.title.trim();
        property.location = req.body.location.trim();
        property.bedrooms = Number(req.body.bedrooms);
        property.bathrooms = Number(req.body.bathrooms);
        property.area = Number(req.body.area);
        property.price = Number(req.body.price);
        property.status = req.body.status;
        property.type = req.body.type;
        property.description = req.body.description.trim();

        await property.save();

        res.render('confirmation', {
            title: 'Property Updated',
            message: 'The property has been updated successfully.',
            backUrl: `/property/${property._id}`,
            backText: 'Back to Property Details'
        });
    } catch (err) {
        if (req.file) await fs.rm(req.file.path, { force: true });
        console.error('Error updating property:', err);
        res.status(500).render('error', {
            errorMessage: 'An error occurred while updating the property.',
            backUrl: `/property/${req.params.id}/edit`,
            backText: 'Try Again'
        });
    }
});

// ============================================================================
// DELETE PROPERTY (Removes from MongoDB and deletes its image from uploads/)
// ============================================================================

router.post('/property/:id/delete', async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id);
        if (!property) {
            return res.status(404).render('error', {
                errorMessage: 'Property not found.',
                backUrl: '/',
                backText: 'Back to Home'
            });
        }

        // Delete the physical image file from the uploads/ directory
        if (property.image) {
            await fs.rm(path.resolve('uploads', path.basename(property.image)), { force: true });
        }

        res.render('confirmation', {
            title: 'Property Deleted',
            message: 'The property has been deleted successfully.',
            backUrl: '/',
            backText: 'Back to Home'
        });
    } catch (err) {
        console.error('Error deleting property:', err);
        res.status(500).render('error', {
            errorMessage: 'An error occurred while deleting the property.',
            backUrl: `/property/${req.params.id}`,
            backText: 'Back to Property'
        });
    }
});

// ============================================================================
// DOWNLOAD IMAGE FROM uploads/
// ============================================================================

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

// ============================================================================
// REVIEWS / COMMENTS (Create, Edit, and Delete)
// ============================================================================

// Create a new review
router.post('/property/:id/comment', async (req, res) => {
    try {
        const errorMsg = validateReviewData(req.body);
        if (errorMsg) {
            return res.status(400).render('error', {
                errorMessage: errorMsg,
                backUrl: `/property/${req.params.id}`,
                backText: 'Back to Property'
            });
        }

        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).render('error', {
                errorMessage: 'Property not found.',
                backUrl: '/',
                backText: 'Back to Home'
            });
        }

        // Prevent duplicate reviews from the same author with the exact same text
        const trimmedAuthor = req.body.author.trim();
        const duplicateReview = property.comments.some(
            c => c.name.toLowerCase() === trimmedAuthor.toLowerCase() && c.text.trim() === req.body.comment.trim()
        );
        if (duplicateReview) {
            return res.status(400).render('error', {
                errorMessage: 'This review has already been submitted for this property.',
                backUrl: `/property/${req.params.id}`,
                backText: 'Back to Property'
            });
        }

        property.comments.push({
            name: trimmedAuthor,
            date: req.body.date,
            rating: Number(req.body.rating),
            text: req.body.comment.trim()
        });
        await property.save();

        res.render('confirmation', {
            title: 'Review Submitted',
            message: 'Your review has been added successfully.',
            backUrl: `/property/${req.params.id}`,
            backText: 'Back to Property Details'
        });
    } catch (err) {
        console.error('Error saving comment:', err);
        res.status(500).render('error', {
            errorMessage: 'An unexpected error occurred while saving your review.',
            backUrl: `/property/${req.params.id}`,
            backText: 'Back to Property'
        });
    }
});

// Show form to edit an existing review
router.get('/property/:id/comment/:commentId/edit', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).lean();
        if (!property) {
            return res.status(404).render('error', {
                errorMessage: 'Property not found.',
                backUrl: '/',
                backText: 'Back to Home'
            });
        }

        const comment = property.comments.find(c => c._id.toString() === req.params.commentId);
        if (!comment) {
            return res.status(404).render('error', {
                errorMessage: 'Review not found.',
                backUrl: `/property/${property._id}`,
                backText: 'Back to Property'
            });
        }

        res.render('edit_comment', {
            property,
            comment,
            isRating1: comment.rating === 1,
            isRating2: comment.rating === 2,
            isRating3: comment.rating === 3,
            isRating4: comment.rating === 4,
            isRating5: comment.rating === 5
        });
    } catch (err) {
        console.error('Error loading edit review form:', err);
        res.status(500).render('error', {
            errorMessage: 'An error occurred while loading the review edit form.',
            backUrl: `/property/${req.params.id}`,
            backText: 'Back to Property'
        });
    }
});

// Save updates to an edited review
router.post('/property/:id/comment/:commentId/edit', async (req, res) => {
    try {
        const errorMsg = validateReviewData(req.body);
        if (errorMsg) {
            return res.status(400).render('error', {
                errorMessage: errorMsg,
                backUrl: `/property/${req.params.id}/comment/${req.params.commentId}/edit`,
                backText: 'Back to Edit Review'
            });
        }

        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).render('error', {
                errorMessage: 'Property not found.',
                backUrl: '/',
                backText: 'Back to Home'
            });
        }

        const comment = property.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).render('error', {
                errorMessage: 'Review not found.',
                backUrl: `/property/${property._id}`,
                backText: 'Back to Property'
            });
        }

        comment.name = req.body.author.trim();
        comment.date = req.body.date;
        comment.rating = Number(req.body.rating);
        comment.text = req.body.comment.trim();

        await property.save();

        res.render('confirmation', {
            title: 'Review Updated',
            message: 'Your review has been updated successfully.',
            backUrl: `/property/${property._id}`,
            backText: 'Back to Property Details'
        });
    } catch (err) {
        console.error('Error updating review:', err);
        res.status(500).render('error', {
            errorMessage: 'An error occurred while updating the review.',
            backUrl: `/property/${req.params.id}`,
            backText: 'Back to Property'
        });
    }
});

// Delete a review
router.post('/property/:id/comment/:commentId/delete', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).render('error', {
                errorMessage: 'Property not found.',
                backUrl: '/',
                backText: 'Back to Home'
            });
        }

        const comment = property.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).render('error', {
                errorMessage: 'Review not found.',
                backUrl: `/property/${property._id}`,
                backText: 'Back to Property'
            });
        }

        comment.deleteOne(); // Remove the subdocument from the Mongoose comments array
        await property.save();

        res.render('confirmation', {
            title: 'Review Deleted',
            message: 'The review has been deleted successfully.',
            backUrl: `/property/${property._id}`,
            backText: 'Back to Property Details'
        });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).render('error', {
            errorMessage: 'An error occurred while deleting the review.',
            backUrl: `/property/${req.params.id}`,
            backText: 'Back to Property'
        });
    }
});

export default router;
