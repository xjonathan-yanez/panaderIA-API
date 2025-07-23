// 1. Importar Express
const express = require('express');
const { getSecret } = require('./config/secrets');

const cors = require('cors');
// 2. Inicializar la aplicación Express
const app = express();

app.use(cors());
// 3. Definir el puerto
// Usamos el puerto 3000 por defecto, pero puede ser configurado por una variable de entorno.
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON (aunque no es necesario para estos GET, es buena práctica tenerlo)
app.use(express.json());

async function startServer() {
  try {
    console.log('Loading secrets...');
    
    // Carga todos los secretos necesarios al inicio y guárdalos en app.locals
    // app.locals es un buen lugar para datos a nivel de aplicación.
    app.locals.secrets = {
      dbPassword: await getSecret('db_password')
    };

    console.log('Secrets loaded successfully. Starting server...');

    // Configura tus rutas aquí, después de cargar los secretos
    app.get('/', (req, res) => {
      // Ejemplo de cómo usar un secreto en una ruta
      const { apiKey } = req.app.locals.secrets;
      res.send(`App is running! The API Key starts with: ${apiKey.substring(0, 5)}...`);
    });

    // Inicia el servidor solo si los secretos se cargaron correctamente
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}



// --- Base de Datos Mockup (en memoria) ---
// En una aplicación real, esto vendría de una base de datos (PostgreSQL, MongoDB, etc.).
const productosMock = [
    { id: 1, nombre: "Croissant de Mantequilla", precio: 1.50, descripcion: "Clásico croissant francés, hojaldrado y tierno. Perfecto para el desayuno." },
    { id: 2, nombre: "Baguette Rústica", precio: 2.20, descripcion: "Pan de corteza crujiente y miga suave, elaborado con masa madre." },
    { id: 3, nombre: "Tarta de Fresa y Nata", precio: 25.00, descripcion: "Deliciosa tarta con una base de masa quebrada, nata montada y fresas frescas." },
    { id: 4, nombre: "Napolitana de Chocolate", precio: 1.80, descripcion: "Dulce hojaldre relleno de dos barras de chocolate intenso." },
    { id: 5, nombre: "Empanada de Carne", precio: 2.50, descripcion: "Empanada casera horneada con un sabroso relleno de carne de ternera, cebolla y especias." },
    { id: 6, nombre: "Muffin de Arándanos", precio: 2.00, descripcion: null }
];

let pedidosMock = [];
let pedidoProductosMock = [];

// --- Endpoints (Rutas) de la API ---

// Endpoint raíz que da la bienvenida a la API.
app.get('/', (req, res) => {
    res.send('Bienvenido a la API de Productos con Express.js');
});

// Endpoint para obtener la lista completa de productos.
app.get('/productos', (req, res) => {
    // Simplemente devolvemos el array completo en formato JSON.
    res.json(productosMock);
});

// Endpoint para obtener un único producto por su ID.
app.get('/productos/:id', (req, res) => {
    // Obtenemos el ID de los parámetros de la ruta (req.params).
    // Los parámetros de la URL vienen como strings, así que lo convertimos a número.
    const productoId = parseInt(req.params.id, 10);

    // Buscamos el producto en nuestro array de mockup.
    const producto = productosMock.find(p => p.id === productoId);

    if (producto) {
        // Si el producto se encuentra, lo devolvemos como JSON.
        res.json(producto);
    } else {
        // Si no se encuentra, devolvemos un estado 404 (Not Found) y un mensaje de error.
        res.status(404).json({ error: `Producto con id ${productoId} no encontrado` });
    }
});

app.post('/pedidos', (req, res) => {
    // 1. Extraer los datos del cuerpo de la petición
    // Esperamos un body con este formato:
    // {
    //   "cliente": "Nombre del Cliente",
    //   "productos": [
    //     { "producto_id": 1, "cantidad": 2 },
    //     { "producto_id": 4, "cantidad": 1 }
    //   ]
    // }
    const { cliente, productos } = req.body;

    // 2. Validación básica de la entrada
    if (!cliente || !productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ error: "Datos de pedido inválidos. Se requiere 'cliente' y un array de 'productos'." });
    }

    let totalCalculado = 0;
    const productosDelPedido = [];

    // 3. Validar productos y calcular el total
    for (const item of productos) {
        const productoEncontrado = productosMock.find(p => p.id === item.producto_id);

        if (!productoEncontrado) {
            // Si un producto no existe, detenemos todo y devolvemos un error.
            return res.status(404).json({ error: `El producto con id ${item.producto_id} no fue encontrado.` });
        }

        // Acumulamos el total
        totalCalculado += productoEncontrado.precio * item.cantidad;
        productosDelPedido.push({ ...item, nombre: productoEncontrado.nombre, precio_unitario: productoEncontrado.precio });
    }

    // 4. Generar el nuevo pedido
    const nuevoPedidoId = pedidosMock.length > 0 ? Math.max(...pedidosMock.map(p => p.id)) + 1 : 1;
    
    const nuevoPedido = {
        id: nuevoPedidoId,
        cliente: cliente,
        total: parseFloat(totalCalculado.toFixed(2)), // Redondeamos a 2 decimales
        fecha: new Date().toISOString() // Fecha en formato estándar ISO 8601
    };

    // 5. Guardar el pedido y los productos asociados en nuestras "tablas" mockup
    pedidosMock.push(nuevoPedido);

    productos.forEach(item => {
        pedidoProductosMock.push({
            pedido_id: nuevoPedidoId,
            producto_id: item.producto_id,
            cantidad: item.cantidad
        });
    });

    // 6. Devolver una respuesta exitosa
    // El status 201 (Created) es el estándar para respuestas de POST exitosos.
    res.status(201).json({
        mensaje: "Pedido creado exitosamente.",
        pedido: nuevoPedido,
        // Opcional: devolver los detalles de los productos en el pedido
        // detalle_productos: productosDelPedido 
    });
});


// 4. Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
    startServer();
});