import express from 'express';
import Property from './models/property.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const perPage = 6; //number of items per page as required
        const page= parseInt(req.query.page) || 1; //current page, default to 1

        //Count total properties to calculate total pages
        const totalProperties = await Property.countDocuments ();
        const totalPages = Math.ceil(totalProperties / perPage);

        //Fetch only the properties for the current page
        const properties = await Property.find()
        .skip((page-1) * perPage)
        .limit(perPage)
        .lean();

        //Generate an array of pages for the view pagination links
        const pages = [];
        for(let i = 1; i<= totalPages; i++){
            pages.push({
                number: i,
                isCurrent: i ===page
            });
        }

        //Render the index view passing pagination parameters
        res.render('index', { 
            properties,
            pages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            prevPage: page - 1
         });
    } catch (err) {
        console.error("Error retrieving properties:", err);
        res.status(500).send('Error retrieving properties');
    }
});

export default router;
