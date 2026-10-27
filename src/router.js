import express from 'express';
import Property from './models/property.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const properties = await Property.find().lean();
        res.render('index', { properties });
    } catch (err) {
        res.status(500).send('Error al obtener las propiedades');
    }
});

export default router;
