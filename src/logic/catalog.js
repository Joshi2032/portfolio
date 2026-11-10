export const sectionIds = ["proyectos", "stack", "formacion", "cv", "contacto"];

export const projectOrder = [
  { id: "ensamble", size: "xl", tags: ["ia", "flutter"], plate: "plate-ia", index: "01" },
  { id: "lim", size: "l", tags: ["flutter"], plate: "plate-lim", index: "02" },
  { id: "restaurantes", tags: ["flutter"], plate: "plate-food", index: "03" },
  { id: "maxifum", tags: ["flutter", "ia"], plate: "plate-ops", index: "04" },
  { id: "kaizen", tags: ["csharp"], plate: "plate-plant", index: "05" },
  { id: "sap", tags: ["sap"], plate: "plate-cloud", index: "06" },
  { id: "aguacate", size: "xl", tags: ["ia", "flutter"], plate: "plate-avo", index: "07" },
  { id: "tienda", size: "l", tags: ["flutter"], plate: "plate-shop", index: "08" },
];

export const filters = [
  { id: "all" },
  { id: "ia" },
  { id: "flutter" },
  { id: "enterprise" },
];

export const stackGroups = [
  { id: "core", items: ["Flutter", "Supabase", "C#", "Angular", "MySQL", "SAP BTP / HANA"] },
  { id: "ai", items: ["Gemma 4 12B (QLoRA)", "Qwen", "YOLO11n", "TFLite", "ONNX"] },
  { id: "backend", items: ["NestJS", "Prisma", "PostgreSQL"] },
  { id: "base", variant: "base", items: ["TypeScript", "React", "Vue", "Java", "Spring Boot", "Node", "PHP"] },
  { id: "cloud", items: ["Firebase", "AWS", "Docker", "Git"] },
  { id: "tools", items: ["GitHub", "n8n"] },
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
