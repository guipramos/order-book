import { useEffect, useRef, useState } from "react";
import { TableVirtuoso } from "react-virtuoso";

type Order = {
  id: string;
  type: "BID" | "ASK";
  price: string;
  amount: number;
  timestamp: number;
};

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const orderBuffers = useRef<Order[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8086");

    ws.onopen = () => console.log("Conectado à Bolsa A5X");

    ws.onmessage = (event) => {
      const newOrder: Order = JSON.parse(event.data);

      /* Abaixo o modo onde travava o navegador fazendo varias requisições */

      // Atualiza o estado instantaneamente a cada evento
      // setOrders((prevOrders) => {
      // Mantém apenas as últimas 50 ordens na tela para o DOM não estourar de tamanho,
      // mas o React ainda vai re-renderizar a lista inteira 100x por segundo.
      //const updated = [newOrder, ...prevOrders];
      //return updated.slice(0, 50);
      //});

      /* Agora eu implemento a solução correta */

      // Porque eu usei o useRef? Usando esse hook eu evito de ficar fazendo muitas requisições, fazendo com que o navegador trave.
      // O useRef guarda o valor real dentro do .current e usamos o unshift para reatribuir o array pro inicio
      orderBuffers.current.unshift(newOrder);
    };

    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h2>A5X - Livro de Ofertas (Order Book)</h2>
      <p>Total de ordens em tela: {orders.length}</p>

      <TableVirtuoso
        style={{ height: "600px" }}
        data={orders}
        components={{
          TableRow: (props) => {
            const order = props.item;

            return (
              <tr
                {...props}
                style={{ color: order.type === "BID" ? "green" : "red" }}
              />
            );
          },
        }}
        fixedHeaderContent={() => (
          <tr style={{ background: "white", borderBottom: "1px solid #ccc" }}>
            <th>Tipo</th>
            <th>Preço (R$)</th>
            <th>Qtd</th>
            <th>Horário</th>
          </tr>
        )}
        itemContent={(index, order) => (
          <>
            <td>{order.type}</td>
            <td>{order.price}</td>
            <td>{order.amount}</td>
            <td>{new Date(order.timestamp).toLocaleTimeString()}</td>
          </>
        )}
      />

      {/* <table
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
      </table> */}
    </div>
  );
}

export default App;
