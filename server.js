import express from 'express';
import urlRoutes from './src/routes/apiRoutes.js';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(express.json());


app.use(cors({ origin: '*' }));

app.use("/api", urlRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});