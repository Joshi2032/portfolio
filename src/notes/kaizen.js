// Expandable project detail inside the Kaizen dialog. Generic, non-confidential facts only.
export const note = {
  es: {
    title: "Detalle del proyecto",
    summary: "El problema, cómo lo construí, el modelo de datos y los resultados medidos.",
    sections: [
      {
        id: "problema",
        title: "El problema",
        body: [
          "Las propuestas de mejora se llenaban en un formato de Excel largo y repetitivo y se entregaban en mano al encargado del área, que las pasaba a los revisores; la respuesta volvía por el mismo camino.",
          "Eso causaba demoras, propuestas perdidas, poco seguimiento, acceso difícil y gasto de papel y tinta. En las entrevistas, varios empleados dijeron que no proponían mejoras porque llenar la hoja era lento y la respuesta tardaba.",
          "El turno nocturno era el caso más grave: quien recibía las hojas solo estaba de día, así que la propuesta esperaba al siguiente turno y la respuesta podía tardar dos semanas.",
        ],
      },
      {
        id: "objetivo",
        title: "El objetivo",
        body: [
          "Reducir 60% los tiempos del proceso, con seguimiento en tiempo real y un proceso totalmente digital, de agosto a diciembre de 2025.",
        ],
        list: [
          "Digitalizar el formato completo.",
          "Un módulo para que los revisores aprueben o rechacen.",
          "Acceso desde toda la planta.",
          "Inicio de sesión por rol: colaborador, revisor y administrador.",
          "Diseño modular, para sumar funciones sin romper lo existente.",
          "Interfaz responsiva para computadora, tableta y móvil.",
        ],
      },
      {
        id: "proceso",
        title: "Cómo lo hice",
        ordered: [
          "Acta del proyecto: objetivos, alcance y responsabilidades.",
          "Requerimientos de la aplicación.",
          "Entrevistas y observación en planta, incluido el turno nocturno.",
          "Análisis y clasificación del proceso manual.",
          "Diagrama entidad-relación y esquema en MySQL, primero en local.",
          "Prototipos de pantallas, revisión con el equipo y ajustes.",
          "Desarrollo en C#: pantallas, lógica y consultas; después, migración de módulos a Angular.",
          "Pruebas y correcciones; migración de la base local al servidor.",
          "Seguimiento del plan contra lo real en un Gantt.",
        ],
      },
      {
        id: "datos",
        title: "Modelo de datos",
        body: ["Relacional, normalizado hasta tercera forma normal, con relaciones uno a muchos."],
        list: [
          "Propuesta, el núcleo: descripción, fechas de inicio y cierre, foto de antes y de después, y las 5S que aplica (seleccionar, ordenar, limpiar, estandarizar, sostener).",
          "Categoría (por ejemplo, ergonomía o proceso) y área de mejora.",
          "Revisión: estado y comentarios del revisor. Estados: pendiente, en proceso, aceptada, rechazada y requiere cambios.",
        ],
      },
      {
        id: "funciones",
        title: "Funciones",
        list: [
          "Acceso por rol: colaborador, revisor y administrador.",
          "Historial de cada revisión.",
          "Multidispositivo y disponible en toda la planta.",
          "Protección de ideas: la propuesta queda registrada en el sistema y no se pierde en papel.",
        ],
      },
      {
        id: "resultados",
        title: "Resultados",
        stats: [
          { value: "20 → 5 min", label: "llenado de la propuesta" },
          { value: "50%", label: "menos tiempo de aprobación" },
          { value: "2 sem → 8 h", label: "respuesta en el turno nocturno" },
        ],
        table: {
          caption: "Antes → después",
          head: ["Paso", "Turno matutino", "Turno nocturno"],
          rows: [
            ["Llenado", "20 → 5 min", "20 → 5 min"],
            ["Flujo de aprobación", "20 → 10 min", "30 → 15 min"],
            ["Respuesta", "10 → 5 min", "2 semanas → 8 h"],
          ],
        },
        after: ["Además, menos papel y tinta."],
      },
    ],
  },
  en: {
    title: "Project detail",
    summary: "The problem, how I built it, the data model, and the measured results.",
    sections: [
      {
        id: "problem",
        title: "The problem",
        body: [
          "Improvement proposals were filled in on a long, repetitive Excel form and handed in person to the area lead, who passed them on to the reviewers; the answer came back the same way.",
          "That meant delays, lost proposals, little tracking, hard access, and paper and ink. In interviews, several employees said they didn't propose improvements because the form was slow and the answer took too long.",
          "The night shift had it worst: the people who collected the forms only worked days, so a proposal waited for the next shift and the answer could take two weeks.",
        ],
      },
      {
        id: "goal",
        title: "The goal",
        body: [
          "Cut process times by 60%, with real-time tracking and a fully digital process, from August to December 2025.",
        ],
        list: [
          "Digitize the full form.",
          "A module for reviewers to approve or reject.",
          "Access from anywhere in the plant.",
          "Role-based sign-in: employee, reviewer, and admin.",
          "A modular design, so features can be added without breaking what exists.",
          "A responsive interface for desktop, tablet, and mobile.",
        ],
      },
      {
        id: "process",
        title: "How I built it",
        ordered: [
          "Project charter: goals, scope, and responsibilities.",
          "Application requirements.",
          "Interviews and on-floor observation, including the night shift.",
          "Analysis and classification of the manual process.",
          "Entity-relationship diagram and MySQL schema, local first.",
          "Screen prototypes, team review, and changes.",
          "Development in C#: screens, logic, and queries; then migration of modules to Angular.",
          "Testing and fixes; migration of the local database to the server.",
          "Planned vs. actual tracked in a Gantt chart.",
        ],
      },
      {
        id: "data",
        title: "Data model",
        body: ["Relational, normalized to third normal form, with one-to-many relationships."],
        list: [
          "Proposal, the core: description, start and close dates, before and after photos, and the 5S it applies (sort, set in order, shine, standardize, sustain).",
          "Category (for example, ergonomics or process) and improvement area.",
          "Review: status and reviewer comments. Statuses: pending, in progress, accepted, rejected, and changes requested.",
        ],
      },
      {
        id: "features",
        title: "Features",
        list: [
          "Role-based access: employee, reviewer, and admin.",
          "History of every review.",
          "Multi-device and available across the plant.",
          "Idea protection: the proposal is recorded in the system and isn't lost on paper.",
        ],
      },
      {
        id: "results",
        title: "Results",
        stats: [
          { value: "20 → 5 min", label: "to fill in a proposal" },
          { value: "50%", label: "less approval time" },
          { value: "2 wk → 8 h", label: "night-shift response" },
        ],
        table: {
          caption: "Before → after",
          head: ["Step", "Day shift", "Night shift"],
          rows: [
            ["Form filling", "20 → 5 min", "20 → 5 min"],
            ["Approval flow", "20 → 10 min", "30 → 15 min"],
            ["Response", "10 → 5 min", "2 weeks → 8 h"],
          ],
        },
        after: ["Plus less paper and ink."],
      },
    ],
  },
};
