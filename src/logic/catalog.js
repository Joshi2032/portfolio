export const sectionIds = ["proyectos", "stack", "formacion", "cv", "contacto"];

export const projectOrder = [
  { id: "ensamble", tags: ["ia", "flutter"], plate: "plate-ia", index: "01", org: "PM" },
  { id: "restaurantes", tags: ["flutter"], plate: "plate-food", index: "02", org: "Flutter + Supabase" },
  { id: "maxifum", tags: ["flutter", "ia"], plate: "plate-ops", index: "03", org: "MAXIFUM" },
  { id: "kaizen", tags: ["csharp"], plate: "plate-plant", index: "04", org: "Mitsubishi Electric" },
  { id: "sap", tags: ["sap"], plate: "plate-cloud", index: "05", org: "Enjo-it" },
  { id: "aguacate", tags: ["ia", "flutter"], plate: "plate-avo", index: "06", org: "YOLO26n", note: "detector-aguacate" },
  { id: "tienda", tags: ["flutter"], plate: "plate-shop", index: "07", org: "Flutter + NestJS" },
];

export const filters = [
  { id: "all" },
  { id: "ia" },
  { id: "flutter" },
  { id: "enterprise" },
];

export const stackGroups = [
  { id: "core", items: ["Flutter", "Supabase", "C#", "MySQL", "SAP BTP / HANA", "Gemma 4 12B (QLoRA)", "Qwen"] },
  { id: "base", variant: "base", items: ["Angular", "TypeScript", "React", "Vue", "Java", "Spring Boot", "Node", "PHP"] },
  { id: "cloud", items: ["Firebase", "AWS", "Docker", "Git"] },
  { id: "tools", items: ["GitHub", "GPS", "n8n"] },
];

export const cvFiles = {
  es: "cv/Josue-Isai-Salazar-Castro-CV-ES.pdf",
  en: "cv/Josue-Isai-Salazar-Castro-CV-EN.pdf",
};

export function matchesFilter(tags, filter) {
  if (filter === "all") return true;
  if (filter === "enterprise") return tags.includes("csharp") || tags.includes("sap");
  return tags.includes(filter);
}

export function cvHref(file) {
  return `${import.meta.env.BASE_URL}${file}`;
}
