import express from 'express';
import mustacheExpress from 'mustache-express';
import router from './router.js';
import { connectDB } from './db.js';

const app = express();

// Conectar a la base de datos MongoDB
connectDB();

app.use(express.static('./public'));
app.use('/uploads', express.static('./uploads'));

app.set('view engine', 'html');
app.engine('html', mustacheExpress(), '.html');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use('/', router);

app.listen(3000, () => console.log('Web ready in http://localhost:3000/'));
