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

const calcularFechaDevolucion = () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 14);
    return fecha.toISOString().split('T')[0];
};

// ── Handlers por tipo de petición ────────────────────────────
const handlers = {

    prestamo: ({ isbn, titulo }) => {
        const libros = leerDB();

        const libro = libros.find(l =>
            !l.prestado && (
                (isbn  && l.isbn === isbn) ||
                (titulo && l.nombre.toLowerCase() === titulo.toLowerCase())
            )
        );

        if (!libro) return { ok: false, mensaje: 'No disponible' };

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
    },

    // próximos handlers irán aquí...
    // devolucion: ({ id }) => { ... },
    // buscar:    ({ titulo, autor }) => { ... },

};

// ── Servidor ZeroMQ ──────────────────────────────────────────
const sock = new Reply();
await sock.bind('tcp://*:5555');
console.log('📚 Servidor de biblioteca escuchando en tcp://*:5555');

for await (const [msg] of sock) {
    let respuesta;

    try {
        const { tipo, ...params } = JSON.parse(msg.toString());

        const handler = handlers[tipo];

        if (!handler) {
            respuesta = { ok: false, mensaje: `Tipo de petición desconocido: "${tipo}"` };
        } else {
            respuesta = handler(params);
            console.log("Petición recibida. Tipo:", tipo, "Parámetro:", params);
        }

    } catch (err) {
        respuesta = { ok: false, mensaje: 'Petición inválida', error: err.message };
    }

    await sock.send(JSON.stringify(respuesta));
}