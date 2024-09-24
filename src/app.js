const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const YAML = require('yamljs');

const app = express();
const port = 3006;

// Cargar el archivo de definición de API (api-definition.yaml)
const swaggerDocument = YAML.load('./api-definition.yaml');

// Configurar la ruta para la documentación de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Implementar las rutas según la definición del API
app.get('/usuarios', (req, res) => {
    const usuarios = ['Juan', 'Maria', 'Pedro'];
    res.json(usuarios);
});

app.get('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const usuarios = ['Juan', 'Maria', 'Pedro'];
    if (id >= 0 && id < usuarios.length) {
        res.json(usuarios[id]);
    } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log(`Documentación disponible en http://localhost:${port}/api-docs`);
});