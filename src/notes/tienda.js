// Technical note inside the store dialog. Architecture and decisions only: no secrets or business data.
export const note = {
  es: {
    title: "Nota técnica",
    summary: "Arquitectura, módulos, cómo trabaja sin red, los datos y las decisiones técnicas.",
    sections: [
      {
        id: "arquitectura",
        title: "Arquitectura",
        list: [
          "Monorepo con dos apps Flutter (celular Android para vender y escritorio Windows para administrar), dos paquetes compartidos (core: modelos, cliente del API y motor de sincronización; ui: tema y componentes) y el servidor.",
          "API en NestJS 11 con Prisma 6, sobre PostgreSQL alojado en Supabase. La API corre en la computadora de la tienda, arranca sola con Windows y atiende en la red local; un túnel permite vender fuera de la tienda.",
          "Cada app prueba la red local unos 3 segundos; si no responde, prueba la nube; si ninguna responde, sigue con su copia local.",
        ],
      },
      {
        id: "modulos",
        title: "Módulos",
        stats: [
          { value: "19", label: "módulos con permiso propio" },
          { value: "24", label: "módulos de Nest en el API" },
          { value: "130+", label: "rutas del API" },
        ],
        list: [
          "Escritorio (17): productos, categorías, entradas de mercancía, proveedores, avisos de stock, ventas, ticket, mayoreo, reportes, historial, clientes, rutas, ruta del día, empleados, roles, permisos y ajustes.",
          "Celular (4 pestañas): stock, cobrar, ventas y ajustes.",
          "Reportes por producto, cliente, vendedor, categoría, ticket, forma de pago y mes, con costo, utilidad y margen; valor de inventario y crédito de clientes.",
        ],
      },
      {
        id: "sin-red",
        title: "Sin red",
        list: [
          "Cada venta se guarda primero en SQLite en el teléfono, en una cola de cambios pendientes.",
          "Al sincronizar, el teléfono manda lotes de 100 cambios (el servidor acepta hasta 200 por petición) y recibe solo lo que cambió desde su última sincronización: productos, clientes, ventas, abonos y rutas del día.",
          "Cada cambio se aplica en su propia transacción, así uno con error no frena a los demás. Los errores permanentes (datos inválidos o sin permiso) se apartan con su motivo; los temporales se reintentan.",
          "Sincroniza al abrir, después de cada acción, cada 45 segundos y en cuanto Supabase Realtime avisa de un cambio: la API retiene la petición y responde al llegar el aviso, lo que también funciona en Flutter web.",
          "Un vendedor solo puede enviar ventas, devoluciones y abonos; catálogo, clientes y entradas piden los módulos de escritorio.",
          "Si dos ventas del mismo producto se confirman sin verse, se conservan las dos y el producto se marca como vendido de más.",
        ],
      },
      {
        id: "datos",
        title: "Datos",
        list: [
          "26 modelos y 4 enumeraciones en Prisma.",
          "Dinero con 2 decimales y cantidades con 3, para vender por pieza, kilo, gramo, litro o mililitro.",
          "Cada partida guarda el costo unitario del momento, así la utilidad y el margen no cambian si después cambia el costo.",
          "Borrado lógico en productos, clientes y proveedores, y una bitácora de precios, costos, mayoreo, stock, devoluciones, cancelaciones, entradas y ventas.",
          "Cuatro formas de pago: efectivo, tarjeta, transferencia y fiado. El saldo de fiado es lo vendido a crédito menos los abonos.",
          "Lotes con caducidad: lo que queda de cada lote se estima suponiendo que se vende primero lo más antiguo.",
        ],
      },
      {
        id: "decisiones",
        title: "Decisiones técnicas",
        list: [
          "El servidor valida el precio de cada partida contra las tarifas del producto; el mayoreo solo vale al llegar a la cantidad mínima. Esas reglas son funciones puras con pruebas.",
          "Con saldo de fiado pendiente no hay venta nueva, en ninguna forma de pago, hasta que el saldo es cero.",
          "JWT con contraseñas en bcrypt; permisos por rol y por módulo, con excepciones por empleado; límite de intentos de inicio de sesión por IP, también detrás del túnel.",
          "Avisos de poco stock: notificación push en Android y aviso en la barra de Windows aunque la ventana esté cerrada.",
          "Impresión directa de tickets, listados, catálogo, reportes, estados de cuenta y hojas de ruta.",
          "Exportación DBF incremental, sin contraseñas ni bitácora.",
          "Pruebas de precios, permisos de sincronización, fallos por movimiento, valor de inventario y lectura de reportes.",
        ],
      },
    ],
  },
  en: {
    title: "Technical note",
    summary: "Architecture, modules, how it works offline, the data, and the technical decisions.",
    sections: [
      {
        id: "architecture",
        title: "Architecture",
        list: [
          "A monorepo with two Flutter apps (an Android phone app for selling and a Windows desktop app for administration), two shared packages (core: models, API client, and sync engine; ui: theme and components), and the server.",
          "NestJS 11 API with Prisma 6, on PostgreSQL hosted on Supabase. The API runs on the store's computer, starts with Windows, and serves the local network; a tunnel allows selling outside the store.",
          "Each app tries the local network for about 3 seconds, then the cloud; if neither answers, it keeps working from its local copy.",
        ],
      },
      {
        id: "modules",
        title: "Modules",
        stats: [
          { value: "19", label: "modules with their own permission" },
          { value: "24", label: "Nest modules in the API" },
          { value: "130+", label: "API routes" },
        ],
        list: [
          "Desktop (17): products, categories, stock receipts, suppliers, stock alerts, sales, receipt header, wholesale, reports, history, customers, routes, day route, employees, roles, permissions, and settings.",
          "Phone (4 tabs): stock, checkout, sales, and settings.",
          "Reports by product, customer, seller, category, ticket, payment method, and month, with cost, profit, and margin; inventory value and customer credit.",
        ],
      },
      {
        id: "offline",
        title: "Offline",
        list: [
          "Each sale is saved first in SQLite on the phone, in a queue of pending changes.",
          "On sync, the phone sends batches of 100 changes (the server accepts up to 200 per request) and receives only what changed since its last sync: products, customers, sales, payments, and day routes.",
          "Each change runs in its own transaction, so one bad change doesn't block the rest. Permanent errors (invalid data or no permission) are set aside with their reason; temporary ones are retried.",
          "It syncs on launch, after each action, every 45 seconds, and as soon as Supabase Realtime reports a change: the API holds the request and answers when the event arrives, which also works on Flutter web.",
          "A seller can only send sales, returns, and credit payments; catalog, customers, and receipts need the desktop modules.",
          "If two sales of the same product are confirmed without seeing each other, both are kept and the product is flagged as oversold.",
        ],
      },
      {
        id: "data",
        title: "Data",
        list: [
          "26 models and 4 enums in Prisma.",
          "Money with 2 decimals and quantities with 3, to sell by piece, kilogram, gram, liter, or milliliter.",
          "Each sale line stores the unit cost at that moment, so profit and margin don't change if the cost changes later.",
          "Soft delete for products, customers, and suppliers, and an activity log of prices, costs, wholesale, stock, returns, cancellations, receipts, and sales.",
          "Four payment methods: cash, card, transfer, and store credit. A credit balance is what was sold on credit minus payments.",
          "Lots with expiry dates: what's left of each lot is estimated assuming the oldest stock sells first.",
        ],
      },
      {
        id: "decisions",
        title: "Technical decisions",
        list: [
          "The server checks each line's price against the product's tariffs; wholesale only applies at the minimum quantity. Those rules are pure functions with tests.",
          "With an unpaid credit balance there's no new sale, in any payment method, until the balance is zero.",
          "JWT with bcrypt-hashed passwords; permissions by role and module, with per-employee overrides; login attempts limited per IP, also behind the tunnel.",
          "Low-stock alerts: push notifications on Android and a Windows taskbar alert even with the window closed.",
          "Direct printing of tickets, sales lists, catalog, reports, account statements, and route sheets.",
          "Incremental DBF export, without passwords or the activity log.",
          "Tests for pricing, sync permissions, per-change failures, inventory value, and report parsing.",
        ],
      },
    ],
  },
};
