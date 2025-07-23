-- =================================================================
-- Script para la creación de tablas de una PANADERÍA en PostgreSQL
-- (Versión simplificada con los campos solicitados)
-- =================================================================

-- Eliminamos las tablas en orden inverso a su creación para evitar errores de dependencias.
DROP TABLE IF EXISTS pedido_productos;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS productos;


-- =================================================================
-- 1. Creación de la tabla de PRODUCTOS
-- Almacena el nombre, precio y descripción de cada producto.
-- =================================================================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    descripcion TEXT
);

-- Comentarios sobre la tabla `productos` (PostgreSQL):
-- id SERIAL PRIMARY KEY: Clave primaria autoincremental, estándar en PostgreSQL.
-- nombre VARCHAR(255) NOT NULL: Nombre del producto, es un campo obligatorio.
-- precio NUMERIC(10, 2) NOT NULL: Tipo de dato ideal para dinero por su precisión. Obligatorio.
-- descripcion TEXT: Campo de texto opcional para más detalles.


-- =================================================================
-- 2. Creación de la tabla de PEDIDOS
-- Almacena la información general de cada pedido.
-- =================================================================
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente VARCHAR(255) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- Comentarios sobre la tabla `pedidos` (PostgreSQL):
-- id SERIAL PRIMARY KEY: Clave primaria autoincremental.
-- cliente VARCHAR(255) NOT NULL: Nombre del cliente.
-- total NUMERIC(10, 2) NOT NULL: Costo total del pedido.
-- fecha TIMESTAMPTZ DEFAULT NOW(): Fecha y hora del pedido. `TIMESTAMPTZ` incluye la
--                                   zona horaria, y `NOW()` establece la fecha actual por defecto.


-- =================================================================
-- 3. Creación de la tabla PEDIDO_PRODUCTOS (Tabla Intermedia)
-- Conecta los pedidos con los productos.
-- =================================================================
CREATE TABLE pedido_productos (
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,

    -- Clave primaria compuesta para que un producto no se repita en un mismo pedido.
    PRIMARY KEY (pedido_id, producto_id),

    -- Claves foráneas para mantener la integridad de los datos.
    CONSTRAINT fk_pedido
      FOREIGN KEY (pedido_id) 
      REFERENCES pedidos(id)
      ON DELETE CASCADE, -- Si se borra un pedido, se borran sus detalles.

    CONSTRAINT fk_producto
      FOREIGN KEY (producto_id) 
      REFERENCES productos(id)
      ON DELETE RESTRICT -- Impide borrar un producto si está en un pedido.
);

-- Comentarios sobre la tabla `pedido_productos`:
-- Esta tabla no tiene un 'id' propio, ya que la combinación de `pedido_id` y
-- `producto_id` es única y sirve como su identificador (clave primaria compuesta).
-- Se establecen las relaciones para garantizar que los IDs existan en sus tablas maestras.


-- =================================================================
-- INSERCIÓN DE DATOS DE EJEMPLO (OPCIONAL)
-- =================================================================

-- Insertar productos
INSERT INTO productos (nombre, precio, descripcion) VALUES
('Barra de Pan', 1.10, 'Pan de trigo tradicional de fermentación lenta.'),
('Croissant', 1.50, 'Clásico croissant de mantequilla.'),
('Café Solo', 1.20, 'Café espresso intenso.');
