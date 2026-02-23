const express = require('express')
const path = require('path')
const app = express()
const PORT = 3000;

app.use(express.json())
app.use(express.static('public'))

//BASE DE DATOS (en memoria)
let libros = [
    { id: 1, titulo: "The Great Gatsby", autor: "F. Scott Fitzgerald" },
    { id: 2, titulo: "Cien años de soledad", autor: "Gabriel García Márquez" },
    { id: 3, titulo: "Don Quijote de la Mancha", autor: "Miguel de Cervantes" }
];

// Operacion GET
app.get('/api/libros',(req,res) => {
    res.json(libros);
});

// Operacion POST
app.post('/api/libros', (req, res) => {
    const nuevoLibro = {
        id: libros.length + 1,
        titulo: req.body.titulo,
        autor: req.body.autor
    };

    libros.push(nuevoLibro);

    res.status(201).json({ mensaje: "Libro agregado", libro: nuevoLibro });
});


// Operacion PUT
app.put('/api/libros/:id', (req, res) => {
    const libroId = parseInt(req.params.id); 
    const libro = libros.find(l => l.id === libroId);

    if (libro) {
        if (req.body.titulo) libro.titulo = req.body.titulo;
        if (req.body.autor) libro.autor = req.body.autor;

        res.json({ mensaje: "Libro actualizado", libro });
    } else {
        res.status(404).json({ mensaje: "Libro no encontrado" });
    }
});

// Operacion DELETE: eliminar un libro
app.delete('/api/libros/:id', (req, res) => {
    const libroId = parseInt(req.params.id);
    const index = libros.findIndex(l => l.id === libroId);

    if (index !== -1) {
        libros.splice(index, 1);
        res.json({ mensaje: "Libro eliminado" });
    } else {
        res.status(404).json({ mensaje: "Libro no encontrado" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor encendido en: http://localhost:${PORT}`);
});