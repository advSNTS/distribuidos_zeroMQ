import { readFileSync, writeFileSync } from 'fs';
import { Reply } from 'zeromq';

const PATH = './libros.json';

const leerDB = () => {
    try {
        return JSON.parse(readFileSync(PATH, 'utf8'));
    } catch {
        return [];
    }
};

const guardarDB = (data) => {
    writeFileSync(PATH, JSON.stringify(data, null, 2));
};

// Calcula fecha de devolución: hoy + 7 días
const calcularFechaDevolucion = () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 7);
    return fecha.toISOString().split('T')[0];
};

const prestarLibro = ({ isbn, titulo }) => {
    const libros = leerDB();
    // Buscar un ejemplar disponible por ISBN o título (case-insensitive)
    const libro = libros.find(l =>
        !l.prestado && (
            (isbn && l.isbn === isbn) ||
            (titulo && l.nombre.toLowerCase() === titulo.toLowerCase())
        )
    );

    if (!libro) {
        return { ok: false, mensaje: 'No disponible' };
    }

    // Marcar como prestado
    libro.prestado = true;
    libro.fecha_devolucion = calcularFechaDevolucion();
    guardarDB(libros);

    return {
        ok: true,
        mensaje: 'Préstamo exitoso',
        libro: {
            id: libro.id,
            nombre: libro.nombre,
            autor: libro.autor,
            isbn: libro.isbn,
            fecha_devolucion: libro.fecha_devolucion,
        },
    };
};

// ── Servidor ZeroMQ ──────────────────────────────────────────
const sock = new Reply();

await sock.bind('tcp://*:5555');
console.log('📚 Servidor de biblioteca escuchando en tcp://*:5555');

for await (const [msg] of sock) {
    let respuesta;

    try {
        const peticion = JSON.parse(msg.toString());
        // Petición esperada: { isbn: "..." } o { titulo: "..." }
        console.log("Peticion recibida: ", peticion);
        respuesta = prestarLibro(peticion);
    } catch (err) {
        respuesta = { ok: false, mensaje: 'Petición inválida', error: err.message };
    }

    await sock.send(JSON.stringify(respuesta));
}