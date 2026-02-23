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

    consulta: ({ isbn }) => {
        const libros = leerDB();

        // Todos los ejemplares con ese ISBN
        const ejemplares = libros.filter(l => l.isbn === isbn);

        if (ejemplares.length === 0) {
            return { ok: false, mensaje: 'No existe ningún libro con ese ISBN' };
        }

        const disponibles = ejemplares.filter(l => !l.prestado);

        if (disponibles.length === 0) {
            return {
                ok: false,
                mensaje: 'Todos los ejemplares están prestados',
                libro: {
                    nombre: ejemplares[0].nombre,
                    autor: ejemplares[0].autor,
                    isbn: ejemplares[0].isbn,
                },
            };
        }

        return {
            ok: true,
            mensaje: `Hay ${disponibles.length} ejemplar(es) disponible(s)`,
            libro: {
                nombre: ejemplares[0].nombre,
                autor: ejemplares[0].autor,
                isbn: ejemplares[0].isbn,
                disponibles: disponibles.length,
                total: ejemplares.length,
            },
        };
    },

};

//________ Creación del servidor 0MQ______________________
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