const { WebSocketServer } = require("ws");

const wss = new WebSocketServer({ port: 8086 });

console.log("Servidor WebSocket rodando na porta 8086...");

wss.on("connection", function connection(ws) {
  console.log("Novo cliente (trader) conectado.");

  // Envia uma nova ordem a cada 10ms (100 atualizaçoes por segundo)

  const interval = setInterval(() => {
    const order = {
      id: Math.random().toString(36).slice(2, 9),

      // O BID é compra e o ASK é venda
      type: Math.random() > 0.5 ? "BID" : "ASK",

      // Aqui aparece o preço entre 50 e 150
      price: (Math.random() * 100 + 50).toFixed(2),

      // Aqui aparece o quantidade de ações
      amount: Math.floor(Math.random() * 1000) + 1,
      timestamp: Date.now(),
    };

    ws.send(JSON.stringify(order));
  }, 10);

  ws.on("close", () => {
    clearInterval(interval);
    console.log("Cliente desconectado.");
  });
});
