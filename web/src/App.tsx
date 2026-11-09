import { useEffect, useRef, useState } from "react";
import { TableVirtuoso, type TableComponents } from "react-virtuoso";

type Order = {
  id: string;
  type: "BID" | "ASK";
  price: string;
  amount: number;
  timestamp: number;
};

// Definido fora do App para o React não recriar os componentes a cada render
// (o que remontaria todas as linhas da tabela a cada atualização).
const tableComponents: TableComponents<Order> = {
  Table: (props) => (
    <table {...props} className="w-full border-collapse text-sm" />
  ),
  TableHead: (props) => <thead {...props} className="z-10" />,
  TableRow: ({ item: order, ...props }) => (
    <tr
      {...props}
      className={`border-b border-slate-800/70 transition-colors hover:bg-slate-800/60 ${
        order.type === "BID" ? "bg-emerald-500/[0.03]" : "bg-rose-500/[0.03]"
      }`}
    />
  ),
};

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const orderBuffers = useRef<Order[]>([]);

  useEffect(() => {
    let ws: WebSocket;
    let timeoutId: number;

    function conectar() {
      ws = new WebSocket("ws://localhost:8086");

      ws.onopen = () => console.log("Conectado à Bolsa");

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

      ws.onclose = () => {
        timeoutId = setTimeout(() => {
          conectar();
        }, 3000);
      };
    }
    conectar();

    const intervalId = setInterval(() => {
      if (orderBuffers.current.length === 0) return;
      console.log("1. Buffer antes: ", orderBuffers.current.length);

      const newOrder = orderBuffers.current;
      orderBuffers.current = [];

      console.log("2. Novas ordens: ", newOrder.length);
      console.log("3. Buffer depois de zerar: ", orderBuffers.current.length);

      setOrders((prevOrders) => {
        console.log("4. Ordens antigas: ", prevOrders.length);
        const combined = [...newOrder, ...prevOrders];

        console.log("5. Combinado: ", combined.length);

        const result = combined.slice(0, 50);
        console.log("6. depois do slice: ", result.length);

        return result;
      });
    }, 200);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-200 antialiased">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Livro de Ofertas{" "}
              <span className="font-normal text-slate-400">(Order Book)</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-1.5 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-slate-400">Ordens em tela:</span>
            <span className="font-mono font-semibold tabular-nums text-white">
              {orders.length}
            </span>
          </div>
        </header>

        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/40">
          <TableVirtuoso
            style={{ height: "600px" }}
            data={orders}
            components={tableComponents}
            fixedHeaderContent={() => (
              <tr className="border-b border-slate-700 bg-slate-900 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3 text-left font-semibold">Tipo</th>
                <th className="px-5 py-3 text-right font-semibold">
                  Preço (R$)
                </th>
                <th className="px-5 py-3 text-right font-semibold">Qtd</th>
                <th className="px-5 py-3 text-right font-semibold">Horário</th>
              </tr>
            )}
            itemContent={(_index, order) => {
              const isBid = order.type === "BID";

              return (
                <>
                  <td className="px-5 py-2.5">
                    <span
                      className={`inline-block min-w-14 rounded-md px-2 py-0.5 text-center text-xs font-bold ${
                        isBid
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      {order.type}
                    </span>
                  </td>
                  <td
                    className={`px-5 py-2.5 text-right font-mono tabular-nums ${
                      isBid ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {order.price}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono tabular-nums text-slate-200">
                    {order.amount}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono tabular-nums text-slate-400">
                    {new Date(order.timestamp).toLocaleTimeString()}
                  </td>
                </>
              );
            }}
          />
        </div>
      </div>

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
