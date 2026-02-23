// cliente.js
import { Request } from 'zeromq';

const sock = new Request();
sock.connect('tcp://localhost:5555');

// Probar por título
await sock.send(JSON.stringify({ titulo: 'El Quijote' }));
const [respTitulo] = await sock.receive();
console.log('Por título:', JSON.parse(respTitulo.toString()));

// Probar por ISBN
await sock.send(JSON.stringify({ isbn: '978-3-16-148410-0' }));
const [respIsbn] = await sock.receive();
console.log('Por ISBN:', JSON.parse(respIsbn.toString()));

sock.close();