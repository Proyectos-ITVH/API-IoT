const app = require('./src/app');
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor Express escuchando en http://localhost:${port}`);
    console.log(`Accede a la ruta principal: http://localhost:${port}`);
});