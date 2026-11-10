// Technical note shown inside the LIM project dialog.
// Sources: the LIM user manual and the repo's ARCHITECTURE, PRINTING and DEPLOY_K8S docs.
export const note = {
  es: {
    title: "Nota técnica",
    summary: "Cómo vende, cobra, descuenta inventario y sigue funcionando sin internet, y dónde corre.",
    sections: [
      {
        id: "problema",
        title: "El problema",
        body: [
          "Un restaurante con combos de «elige tu base y tus guisos» necesitaba vender rápido, cuadrar la caja al final del turno y saber cuánto le deja cada platillo, sin depender de que el internet funcione.",
        ],
      },
      {
        id: "plataformas",
        title: "Un código, tres plataformas",
        body: [
          "La app es Flutter con Riverpod y go_router, organizada en un monorepo: la app, un paquete de núcleo (modelos, repositorios, impresión, modo sin conexión, permisos) y un paquete de interfaz (tema y componentes).",
        ],
        list: [
          "En el navegador, para cualquier equipo.",
          "Como app de Windows, que es la que imprime el ticket en la impresora térmica y se actualiza sola.",
          "En el celular, con el menú lateral escondido y el carrito como hoja desde abajo.",
        ],
      },
      {
        id: "venta",
        title: "Vender y cobrar",
        list: [
          "Los combos tienen grupos con reglas (elige una, elige N, opcional hasta N, de N a M) y costo extra por opción. El botón para agregar se activa solo cuando todos los grupos están completos.",
          "Los platillos pueden tener formas de preparación obligatorias y extras opcionales que suman o restan al precio.",
          "El total final lo calcula el servidor con los precios reales del menú, aunque alguien modifique el precio en el equipo.",
          "Cada venta lleva un folio consecutivo que comparten todas las cajas, así que nunca se repite.",
          "Búsqueda global con Ctrl K para ir a una sección o agregar un platillo al carrito.",
        ],
      },
      {
        id: "inventario",
        title: "Inventario y utilidad",
        body: [
          "Cada platillo tiene receta. Al cobrar se descuentan los insumos de cada platillo, forma, extra y guiso elegido en los combos. Si un insumo no alcanza, la venta no se cobra y LIM dice qué falta; al cancelar un pedido, los insumos regresan.",
          "Las entradas de mercancía actualizan el costo promedio de cada insumo, y cada venta guarda cuánto costó en ese momento. Así la utilidad de ventas pasadas no cambia si después sube un insumo.",
          "El Resumen muestra ventas, utilidad y margen del día, comparación con ayer a la misma hora, margen por platillo en 30 días y pistas: insumos en bajo stock, platillos sin receta o sin costo y la mejor hora del día.",
        ],
      },
      {
        id: "caja",
        title: "Caja y corte",
        body: [
          "Solo puede haber una caja abierta por restaurante. Al cerrar se captura lo contado en efectivo, vouchers de tarjeta y transferencias, y el corte marca para cada uno si cuadra, falta o sobra, con texto e ícono además del color. Los pedidos cancelados no cuentan en ningún importe.",
        ],
      },
      {
        id: "sin-red",
        title: "Sin internet",
        body: [
          "Si no hay conexión al cobrar, la venta se guarda en una cola local (SQLite en Windows y móvil) y se envía sola al volver la red. La barra superior muestra cuántas ventas faltan por enviar, y LIM evita que una venta se registre dos veces.",
          "El menú, los pedidos y los usuarios se actualizan solos con los cambios de otras cajas (realtime de Postgres).",
        ],
      },
      {
        id: "permisos",
        title: "Permisos",
        body: [
          "Cada puesto (Dueño, Gerente, Cajero, Repartidor) tiene permisos de inicio, y el dueño puede cambiarlos por puesto o por persona. El menú lateral solo muestra las secciones permitidas, y una sección sin permiso no se abre aunque se escriba su dirección.",
        ],
      },
      {
        id: "ticket",
        title: "Ticket térmico",
        body: [
          "La app de Windows manda el ticket directo a la impresora térmica en ESC/POS (Win32, sin servicios intermedios): primero el ORIGINAL y, si salió bien, una COPIA. Desde la app se configuran el ancho del papel (58 u 80 mm), el folio, los datos del negocio, el pie y si se desglosa el IVA. Cualquier ticket se puede reimprimir desde Ingresos.",
        ],
      },
      {
        id: "servidor",
        title: "El servidor del restaurante",
        body: [
          "El backend puede correr en la nube o en una PC del propio restaurante. Para la versión local hay un chart de Helm sobre k3s con Postgres, Kong, Redis (cola de impresión), MinIO (fotos de platillos) y un túnel opcional de Cloudflare.",
          "Un script instala lo que falte, despliega todo y registra un servicio que lo recupera solo después de un apagón.",
        ],
      },
    ],
  },
  en: {
    title: "Technical note",
    summary: "How it sells, charges, deducts inventory, and keeps working offline, and where it runs.",
    sections: [
      {
        id: "problem",
        title: "The problem",
        body: [
          "A restaurant with “pick your base and your sides” combos needed to sell fast, balance the till at the end of each shift, and know how much each dish earns, without depending on the internet.",
        ],
      },
      {
        id: "platforms",
        title: "One codebase, three platforms",
        body: [
          "The app is Flutter with Riverpod and go_router, organized as a monorepo: the app, a core package (models, repositories, printing, offline mode, permissions), and a UI package (theme and components).",
        ],
        list: [
          "In the browser, on any computer.",
          "As a Windows app, which prints the ticket on the thermal printer and updates itself.",
          "On the phone, with the sidebar hidden and the cart as a bottom sheet.",
        ],
      },
      {
        id: "selling",
        title: "Selling and checkout",
        list: [
          "Combos have groups with rules (pick one, pick N, optional up to N, from N to M) and extra cost per option. The add button only turns on when every group is complete.",
          "Dishes can have required preparation styles and optional add-ons that add to or subtract from the price.",
          "The server computes the final total from the real menu prices, even if someone tampers with the price on the device.",
          "Every sale gets a sequential order number shared by all registers, so it never repeats.",
          "Global search with Ctrl K to jump to a section or add a dish to the cart.",
        ],
      },
      {
        id: "inventory",
        title: "Inventory and profit",
        body: [
          "Each dish has a recipe. Charging deducts the ingredients of every dish, style, add-on, and side chosen in combos. If an ingredient runs short, the sale is not charged and LIM says what is missing; cancelling an order puts the ingredients back.",
          "Stock receipts update each ingredient's average cost, and each sale stores what it cost at that moment. That way, profit on past sales does not change if an ingredient gets more expensive later.",
          "The Summary shows the day's sales, profit, and margin, a comparison with yesterday at the same time, margin per dish over 30 days, and hints: low-stock ingredients, dishes without a recipe or cost, and the best hour of the day.",
        ],
      },
      {
        id: "till",
        title: "Till and close-out",
        body: [
          "Only one till can be open per restaurant. At closing, the counted cash, card vouchers, and transfers are entered, and the close-out marks each one as balanced, short, or over, with text and an icon as well as colour. Cancelled orders count toward no amount.",
        ],
      },
      {
        id: "offline",
        title: "Offline",
        body: [
          "If there is no connection at checkout, the sale goes into a local queue (SQLite on Windows and mobile) and is sent automatically when the network returns. The top bar shows how many sales are waiting, and LIM keeps a sale from being recorded twice.",
          "The menu, orders, and users update themselves with changes from other registers (Postgres realtime).",
        ],
      },
      {
        id: "permissions",
        title: "Permissions",
        body: [
          "Each role (Owner, Manager, Cashier, Delivery) has default permissions, and the owner can change them per role or per person. The sidebar only shows allowed sections, and a section without permission will not open even if its address is typed in.",
        ],
      },
      {
        id: "ticket",
        title: "Thermal ticket",
        body: [
          "The Windows app sends the ticket straight to the thermal printer in ESC/POS (Win32, no middle services): first the ORIGINAL and, if that printed, a COPY. Paper width (58 or 80 mm), order number, business details, footer, and whether VAT is broken out are set from the app. Any ticket can be reprinted from Income.",
        ],
      },
      {
        id: "server",
        title: "The restaurant's server",
        body: [
          "The backend can run in the cloud or on a PC in the restaurant itself. For the local version there is a Helm chart on k3s with Postgres, Kong, Redis (print queue), MinIO (dish photos), and an optional Cloudflare tunnel.",
          "A script installs whatever is missing, deploys everything, and registers a service that brings it back on its own after a power cut.",
        ],
      },
    ],
  },
};
