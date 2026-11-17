import express from 'express';
import mustacheExpress from 'mustache-express';
import router from './router.js';
import { connectDB } from './db.js';

const app = express();

app.use(express.static('./public'));
app.use('/uploads', express.static('./uploads'));

app.locals.isAllTypes = true;

app.set('view engine', 'html');
app.engine('html', mustacheExpress(), '.html');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use('/', router);

await connectDB();

app.listen(3000, () => console.log('Web ready in http://localhost:3000/'));
