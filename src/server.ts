import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

import routes from './routes';
import './database';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(routes);

const path = 'src/.env';
dotenv.config({ path });

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}!`);
});
