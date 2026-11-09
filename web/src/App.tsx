import { useEffect, useState } from "react";

type Order = {
  id: string;
  type: "BID" | "ASK";
  price: string;
  amount: number;
  timestamp: number;
};

function App() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8086");

    ws.onopen = () => console.log("Conectado à Bolsa A5X");

    ws.onmessage = (event) => {
      const newOrder: Order = JSON.parse(event.data);

      // A armadilha do Júnior: Atualizar o estado instantaneamente a cada evento
      setOrders((prevOrders) => {
        // Mantém apenas as últimas 50 ordens na tela para o DOM não estourar de tamanho,
        // mas o React ainda vai re-renderizar a lista inteira 100x por segundo.
        const updated = [newOrder, ...prevOrders];
        return updated.slice(0, 50);
      });
    };

    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h2>A5X - Livro de Ofertas (Order Book)</h2>
      <p>Total de ordens em tela: {orders.length}</p>

      <table
        style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <th>Tipo</th>
            <th>Preço (R$)</th>
            <th>Qtd</th>
            <th>Horário</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              style={{ color: order.type === "BID" ? "green" : "red" }}
            >
              <td>{order.type}</td>
              <td>{order.price}</td>
              <td>{order.amount}</td>
              <td>{new Date(order.timestamp).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
