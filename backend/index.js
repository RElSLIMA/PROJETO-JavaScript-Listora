require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./src/routes/userRoutes');
const itemRoutes = require('./src/routes/itemRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// rotas
app.use('/users', userRoutes);
app.use('/items', itemRoutes);

app.get('/', (req, res) => res.json({ status: 'API Listora funcionando 🚀' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));