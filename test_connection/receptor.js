import zmq from "zeromq";

const sock = new zmq.Reply();

async function run() {
  await sock.bind("tcp://0.0.0.0:5555");
  console.log("Servidor escuchando en puerto 5555...");

  for await (const [msg] of sock) {
    console.log("Mensaje recibido:", msg.toString());

    const respuesta = "Mensaje recibido correctamente";
    await sock.send(respuesta);
  }
}

run();