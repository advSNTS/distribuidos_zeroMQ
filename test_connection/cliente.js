import zmq from "zeromq";

const sock = new zmq.Request();

const SERVER_IP = "192.168.0.3";

async function run() {
  sock.connect(`tcp://${SERVER_IP}:5555`);
  console.log("Conectado al servidor...");

  const mensaje = "Hola desde el cliente";
  await sock.send(mensaje);

  const [respuesta] = await sock.receive();
  console.log("Respuesta del servidor:", respuesta.toString());
}

run();