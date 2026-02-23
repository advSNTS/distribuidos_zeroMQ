// cliente.js
import { Request } from 'zeromq';
import { input, select } from '@inquirer/prompts';

// ── Conexión ─────────────────────────────────────────────────
const socket = await input({
    message: '📡 Ingresa la dirección del servidor (ej: 10.0.0.1:5555):',
    validate: (v) => /^.+:\d+$/.test(v) || 'Formato inválido, usa host:puerto',
});

const sock = new Request();
sock.connect(`tcp://${socket}`);

// ── Loop principal ───────────────────────────────────────────
while (true) {

    const accion = await select({
        message: '¿Qué deseas hacer?',
        choices: [
            { name: '📖  Pedir prestado', value: 'prestamo'   },
            { name: '↩️  Devolver',       value: 'devolucion' },
            { name: '🔍  Consultar',       value: 'consulta'   },
            { name: '🚪  Salir',           value: 'salir'      },
        ],
    });

    if (accion === 'salir') {
        console.log('\n¡👋 Hasta luego!\n');
        sock.close();
        process.exit(0);
    }

    // ── Parámetros por acción ────────────────────────────────
    let peticion;

    if (accion === 'prestamo') {
        const metodo = await select({
            message: '¿Buscar por?',
            choices: [
                { name: 'Título', value: 'titulo' },
                { name: 'ISBN',   value: 'isbn'   },
            ],
        });

        const valor = await input({
            message: metodo === 'titulo' ? 'Título del libro:' : 'ISBN del libro:',
        });

        peticion = { tipo: 'prestamo', [metodo]: valor };

    } else if (accion === 'devolucion') {
        const isbn = await input({ message: 'ISBN del libro:' });
        const id   = await input({ message: 'ID del ejemplar:' });

        peticion = { tipo: 'devolucion', isbn, id: Number(id) };

    } else if (accion === 'consulta') {
        const isbn = await input({ message: 'ISBN del libro:' });

        peticion = { tipo: 'consulta', isbn };
    }

    // ── Envío y respuesta ────────────────────────────────────
    await sock.send(JSON.stringify(peticion));
    const [res] = await sock.receive();
    const respuesta = JSON.parse(res.toString());

    console.log('\n', respuesta.ok ? '✅' : '❌', respuesta.mensaje);
    if (respuesta.libro) console.log(respuesta.libro);
    console.log('─'.repeat(45) + '\n');
}