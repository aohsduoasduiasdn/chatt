const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3001;

let clients = [];

wss.on("connection", (ws) => {
  const clientInfo = { ws, username: "Anonymous" };
  clients.push(clientInfo);

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "setName") {
      clientInfo.username = data.name;
      broadcast({ system: true, message: `${data.name} has joined the chat.` });
    }

    if (data.type === "chatMessage") {
      const timestamp = new Date().toLocaleTimeString();
      broadcast({
        username: clientInfo.username,
        message: data.message,
        timestamp,
      });
    }
  });

  ws.on("close", () => {
    clients = clients.filter((client) => client.ws !== ws);
    broadcast({ system: true, message: `${clientInfo.username} has left the chat.` });
  });
});

function broadcast(data) {
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  });
}

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
