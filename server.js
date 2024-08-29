import OSC from "osc-js";

const HOST_ADDRESS = "0.0.0.0";
const UDP_SERVER_PORT = 9000;
const UDP_CLIENT_PORT = 41235;
const WS_SERVER_PORT = 8080;

const options = {
  receiver: "ws",
  udpServer: {
    host: HOST_ADDRESS,
    port: UDP_SERVER_PORT,
    exclusive: false,
  },
  udpClient: {
    host: HOST_ADDRESS,
    port: UDP_CLIENT_PORT,
  },
  wsServer: {
    host: HOST_ADDRESS,
    port: WS_SERVER_PORT,
  },
};

const osc = new OSC({ plugin: new OSC.BridgePlugin(options) });

osc.on("open", () => {
  console.log(`Listening on UDP port ${UDP_SERVER_PORT} and WebSocket port ${WS_SERVER_PORT}`);
});

osc.on("/players", (message) => {
  console.log(message.args);
  osc.send(new OSC.Message("/udp2ws", ...message.args), { receiver: "ws" });
});

osc.open();
