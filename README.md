# distribuidos_zeroMQ

Proyecto de comunicación entre dispositivos utilizando Node.js y ZeroMQ. Permite establecer un canal de comunicación entre un servidor (bibliotecario) y uno o más clientes (lectores) a través de sockets TCP.

---

## Requisitos previos

- **Node.js** instalado en todos los dispositivos que participen en la comunicación.
 Se sugiere que utilice una versión precompilada en dispositivos windows. La versión recomendada es la **24.14.0 LTS**.
  Puedes encontrar las instrucciones de instalación oficiales según su sistema operativo en: https://nodejs.org
 

---

## Instalación

**1. Clonar el repositorio**

```bash
git clone https://github.com/advSNTS/distribuidos_zeroMQ
```

**2. Moverse al directorio del proyecto**

```bash
cd distribuidos_zeroMQ
```

**3. Instalar las dependencias**

Las dependencias ya están definidas en el `package.json`, por lo que solo hace falta ejecutar:

```bash
npm install
```

---

## Configuración

### Puerto de comunicación

El puerto predeterminado es el **5555**. Si deseas cambiarlo, puedes modificarlo en el archivo `bibliotecario.json`.

### Firewall (dispositivo servidor)

El dispositivo que actúa como servidor debe tener abierto el puerto de comunicación. A continuación se muestran los comandos según el sistema operativo:

**Windows (PowerShell como administrador)**
```powershell
netsh advfirewall firewall add rule name="ZeroMQ" dir=in action=allow protocol=TCP localport=5555
```

**Linux**
```bash
sudo ufw allow 5555/tcp
```

**macOS**

En macOS el firewall generalmente no bloquea puertos de aplicaciones de usuario. Si tienes problemas, revisa las preferencias de seguridad en *Configuración del Sistema → Red → Firewall*.

> Si cambiaste el puerto en `bibliotecario.json`, reemplaza `5555` por el puerto que configuraste.

---

## Uso

### Dispositivo servidor

Ejecuta el archivo `bibliotecario.js` con Node:

```bash
node bibliotecario.js
```

### Dispositivo cliente

Ejecuta el archivo `lector.js` con Node:

```bash
node lector.js
```

Al iniciar, el cliente solicitará el **socket** del servidor, es decir, la dirección IP y el puerto en el siguiente formato:

```
ip:puerto
```

Por ejemplo:
```
192.168.1.100:5555
```

---

## Navegación

Una vez conectado, sigue las instrucciones que aparecen en la terminal. Puedes moverte entre las opciones usando las **teclas de flecha** y confirmar con **Enter**.
