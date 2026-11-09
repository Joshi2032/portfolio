// Technical note shown inside the avocado project dialog.
// Source: the project's technical manual (v3.1, November 2026).
export const note = {
  es: {
    title: "Nota técnica",
    summary: "Los datos, los modelos, cómo se midió de forma honesta y cómo corre en el teléfono y en cámaras.",
    finalLabel: "detector actual de la app",
    sections: [
      {
        id: "problema",
        title: "El problema",
        body: [
          "Encontrar cada aguacate en una imagen y decir, para cada uno, su variedad (Hass o Fuerte) y su madurez (verde, maduro o pasado). Tenía que funcionar en un celular Android y también en cámaras fijas de bodega o empaque.",
          "Cuando la confianza no alcanza el umbral (0.75 en variedad y 0.50 en madurez), la app no adivina: muestra solo «Aguacate».",
        ],
      },
      {
        id: "arquitectura",
        title: "Por qué en cascada",
        body: [
          "Primero un detector YOLO11n (640 px) encuentra los aguacates. Después, dos clasificadores YOLO11n-cls (224 px, unos 1.5 M de parámetros) ven el recorte de cada uno: uno decide la variedad y otro la madurez.",
        ],
        list: [
          "Datos: las fotos de variedad y las de madurez vienen de datasets distintos, y muchas no traen cajas. Un detector multiclase necesitaría las dos etiquetas en cada caja, y esos datos no existen.",
          "Mantenimiento: cada modelo se reentrena por separado. Para agregar una variedad solo se reentrena su clasificador.",
          "Costo: los clasificadores corren solo sobre los aguacates que lo necesitan, no en cada frame.",
        ],
      },
      {
        id: "datos",
        title: "Los datos",
        body: [
          "Antes de entrenar revisé cada fuente a ojo, con hojas de muestra que dibujan las cajas. Varios datasets de «variedades» eran fotos de hojas de árbol, y otros tenían las cajas corridas o una sola caja para una caja llena de frutos. Esos se excluyeron o pasaron a negativos.",
          "Conclusión: de las variedades buscadas, solo Hass y Fuerte tienen fotos públicas de fruto. Las demás hay que fotografiarlas.",
          "La separación entre entrenamiento y validación se hizo por fruto, no por foto, para que el mismo aguacate nunca quede de los dos lados. Las etiquetas de madurez de 7 fuentes se unificaron en verde, maduro y pasado, con un tope por clase para que ninguna fuente defina una clase sola.",
        ],
        list: [
          "Detector v3: 9,692 imágenes con aguacate de 10 fuentes y 3,230 negativas (hojas, plátanos y fotos de COCO).",
          "Detector v3.1: 17,084 de entrenamiento y 2,984 de validación, con 3,200 primeros planos sintéticos, 134 aguacates partidos y frutas parecidas como negativos (peras, limas, kiwis, mangos y más).",
        ],
      },
      {
        id: "atajo",
        title: "El atajo del fondo",
        body: [
          "El primer clasificador de variedad llegó a 100% en la época 1. No había aprendido la fruta: Hass venía sobre fondo gris de estudio y Fuerte sobre blanco puro, así que aprendía el fondo.",
          "Lo corregí segmentando cada fruto, quitando el halo del borde y pegándolo sobre fondos aleatorios iguales para las dos clases (fotos, hojas, colores lisos), con escala, posición y sombra variables.",
          "Como el 100% de validación no bastaba, lo medí con 1,577 recortes de Hass de fuentes que nunca entraron al entrenamiento de variedad. Con los pesos de la época 3 acertaba en unos 83%; al seguir entrenando con los fondos aleatorios llegó a 93.7%.",
        ],
      },
      {
        id: "entrenamiento",
        title: "El entrenamiento",
        body: [
          "Todo se entrenó en una AMD Radeon RX 9060 XT (16 GB) con ROCm dentro de WSL2, PyTorch y Ultralytics. El script se niega a entrenar en CPU: valida la GPU antes de cada corrida, revisa el log y registra el uso cada 20 s (92% de mediana).",
        ],
        models: {
          caption: "Modelos",
          head: ["Modelo", "Para qué", "Datos y corrida", "Métrica clave"],
          rows: [
            ["Detector v3", "Encontrar aguacates", "Ajuste fino desde v2 en dos etapas; la segunda, 30 épocas sin early stopping.", "mAP50 0.980 en fuentes que v2 nunca vio · 0% de hojas marcadas"],
            ["Detector v3.1", "Encontrar aguacates en fotos de celular", "Ajuste fino de v3 con primeros planos, frutos partidos y frutas parecidas. 25 épocas.", "77.3% de aguacates encontrados en fotos reales (v3: 54.5%)"],
            ["Variedad", "Hass o Fuerte", "YOLO11n-cls, 224 px, fondos aleatorios y aumentos de brillo, desenfoque y JPEG.", "93.7% en Hass de fuentes externas (umbral 0.75)"],
            ["Madurez", "Verde, maduro o pasado", "YOLO11n-cls, 224 px, 7 fuentes; casi sin aumento de tono, porque el color es la señal.", "86.3% en 1,709 recortes de validación"],
          ],
        },
        after: [
          "Los modelos se exportan a ONNX y a TFLite float32. Una validación compara el TFLite contra el original: la presencia de aguacate coincide en 40 de 40 imágenes y la variedad en 60 de 60 recortes.",
        ],
      },
      {
        id: "medir",
        title: "Medir con fotos reales",
        body: [
          "La validación interna resultó engañosa: la v3 sacaba mAP50 de 0.986 en validación, pero en fotos de celular dejaba cajas a medias, no veía aguacates partidos y marcaba limas.",
          "Por eso armé un set de prueba que nunca entra al entrenamiento: fotos propias, fotos de Wikimedia Commons con licencia libre (árbol, mano, canasta, partidos) y 13 fotos negativas de hojas, limones, limas, peras y mangos, con 44 aguacates etiquetados a mano. Un filtro por hash perceptual impide que fotos parecidas se cuelen al entrenamiento.",
        ],
        table: {
          caption: "Test con fotos reales (44 aguacates, 13 fotos negativas)",
          head: ["Métrica", "v3", "v3.1"],
          rows: [
            ["Aguacates encontrados", "54.5%", "77.3%"],
            ["Cuánto del fruto cubre la caja", "55.5%", "86.9%"],
            ["Fotos negativas con alguna caja falsa", "5 de 13", "3 de 13"],
            ["Variedad correcta, donde se conoce", "3 de 17", "11 de 19"],
          ],
        },
      },
      {
        id: "telefono",
        title: "En el teléfono",
        body: [
          "La app Flutter corre los tres modelos TFLite en un isolate, para no trabar la interfaz.",
        ],
        list: [
          "El preprocesado va directo del frame YUV de la cámara al tensor de 640×640, ya rotado y con letterbox, en una sola pasada: de 28.6 a 7.4 ms por frame.",
          "Solo se clasifican los aguacates nuevos, los inestables o los que llevan 15 frames sin revisarse. El límite de recortes por frame se ajusta solo entre 3 y 6 según lo que tarda cada celular.",
          "Un tracker suaviza las cajas y las probabilidades entre frames, así la etiqueta no parpadea.",
          "En el escaneo 360°, una firma visual detecta cuándo el aguacate dio la vuelta completa y la cierra sola. La variedad y la madurez salen del voto de todas las capturas.",
          "Si no hay red, las fotos y los escaneos se guardan en el celular y se suben después.",
        ],
      },
      {
        id: "camaras",
        title: "En cámaras",
        body: [
          "Un script en Python aplica la misma cascada a webcams, cámaras IP por RTSP (con reconexión automática), Raspberry Pi y Jetson, con el mismo preprocesado que la app. Cada cierto tiempo guarda un evento en Supabase, que aparece en el historial de la app con el filtro Cámara.",
          "En una PC de escritorio, solo con CPU, procesa una imagen en 85 ms con TFLite (unas 10 por segundo). Para inspección en bodega bastan de 2 a 5.",
        ],
      },
      {
        id: "resultados",
        title: "Resultados",
        stats: [
          { value: "77.3%", label: "aguacates encontrados en fotos reales" },
          { value: "86.9%", label: "del fruto cubierto por la caja" },
          { value: "0%", label: "fotos de hojas marcadas como aguacate" },
        ],
        body: [
          "En madurez, la confusión principal es entre maduro y pasado: las fuentes no coinciden del todo en dónde termina «maduro». Casi nunca confunde verde con pasado (9 de 857).",
          "Limitación conocida: la madurez se aprendió sobre todo de Hass, que cambia de verde a morado. Fuerte se queda verde al madurar, así que en Fuerte la madurez por color no es confiable.",
        ],
      },
      {
        id: "sigue",
        title: "Qué sigue",
        list: [
          "Más fotos reales del entorno de uso: es lo que más mejora el detector.",
          "Un ciclo semanal de casos difíciles: desde el historial se reporta un error, se revisa en una página y entra al siguiente entrenamiento.",
          "Un detector más grande para el modo Foto y más variedades, como Criollo, fotografiadas con el propio escaneo 360°.",
        ],
      },
    ],
  },
  en: {
    title: "Technical note",
    summary: "The data, the models, how it was measured honestly, and how it runs on the phone and on cameras.",
    finalLabel: "the app's current detector",
    sections: [
      {
        id: "problem",
        title: "The problem",
        body: [
          "Find every avocado in an image and give each one its variety (Hass or Fuerte) and ripeness (unripe, ripe, or overripe). It had to work on an Android phone and on fixed cameras in a warehouse or packing line.",
          "When confidence is below the threshold (0.75 for variety, 0.50 for ripeness), the app does not guess: it only shows “Avocado”.",
        ],
      },
      {
        id: "architecture",
        title: "Why a cascade",
        body: [
          "First a YOLO11n detector (640 px) finds the avocados. Then two YOLO11n-cls classifiers (224 px, about 1.5 M parameters) look at each crop: one decides variety and the other ripeness.",
        ],
        list: [
          "Data: the variety photos and the ripeness photos come from different datasets, and many have no boxes. A multiclass detector would need both labels on every box, and that data does not exist.",
          "Maintenance: each model is retrained on its own. Adding a variety only means retraining its classifier.",
          "Cost: the classifiers only run on the avocados that need it, not on every frame.",
        ],
      },
      {
        id: "data",
        title: "The data",
        body: [
          "Before training I reviewed every source by eye, with sample sheets that draw the boxes. Several “variety” datasets were photos of tree leaves, and others had shifted boxes or a single box for a crate full of fruit. Those were excluded or turned into negatives.",
          "Conclusion: of the varieties I looked for, only Hass and Fuerte have public photos of the fruit. The rest have to be photographed.",
          "Training and validation were split by fruit, not by photo, so the same avocado never lands on both sides. Ripeness labels from 7 sources were unified into unripe, ripe, and overripe, with a cap per class so no single source defines a class.",
        ],
        list: [
          "Detector v3: 9,692 images with avocados from 10 sources and 3,230 negatives (leaves, bananas, and COCO photos).",
          "Detector v3.1: 17,084 training and 2,984 validation images, with 3,200 synthetic close-ups, 134 cut avocados, and look-alike fruit as negatives (pears, limes, kiwis, mangoes, and more).",
        ],
      },
      {
        id: "shortcut",
        title: "The background shortcut",
        body: [
          "The first variety classifier hit 100% in epoch 1. It had not learned the fruit: Hass came on a grey studio background and Fuerte on pure white, so it was learning the background.",
          "I fixed it by segmenting each fruit, removing the edge halo, and pasting it onto random backgrounds that are the same for both classes (photos, leaves, flat colours), with varied scale, position, and shadow.",
          "Since 100% on validation was not enough, I measured it on 1,577 Hass crops from sources that never entered variety training. The epoch-3 weights got about 83% right; training on with the random backgrounds brought it to 93.7%.",
        ],
      },
      {
        id: "training",
        title: "Training",
        body: [
          "Everything was trained on an AMD Radeon RX 9060 XT (16 GB) with ROCm inside WSL2, PyTorch, and Ultralytics. The script refuses to train on CPU: it checks the GPU before each run, reads the log, and records usage every 20 s (92% median).",
        ],
        models: {
          caption: "Models",
          head: ["Model", "Goal", "Data and run", "Key metric"],
          rows: [
            ["Detector v3", "Find avocados", "Fine-tune from v2 in two stages; the second ran 30 epochs without early stopping.", "mAP50 0.980 on sources v2 never saw · 0% of leaves marked"],
            ["Detector v3.1", "Find avocados in phone photos", "Fine-tune of v3 with close-ups, cut fruit, and look-alike fruit. 25 epochs.", "77.3% of avocados found in real photos (v3: 54.5%)"],
            ["Variety", "Hass or Fuerte", "YOLO11n-cls, 224 px, random backgrounds and brightness, blur, and JPEG augmentation.", "93.7% on Hass from external sources (0.75 threshold)"],
            ["Ripeness", "Unripe, ripe, or overripe", "YOLO11n-cls, 224 px, 7 sources; almost no hue augmentation, since colour is the signal.", "86.3% on 1,709 validation crops"],
          ],
        },
        after: [
          "The models are exported to ONNX and to float32 TFLite. A validation step compares the TFLite model against the original: avocado presence matches on 40 of 40 images and variety on 60 of 60 crops.",
        ],
      },
      {
        id: "measure",
        title: "Measuring with real photos",
        body: [
          "Internal validation turned out to be misleading: v3 scored mAP50 0.986 on validation, but on phone photos it left half-boxes, missed cut avocados, and marked limes.",
          "So I built a test set that never enters training: my own photos, freely licensed Wikimedia Commons photos (tree, hand, basket, cut fruit), and 13 negative photos of leaves, lemons, limes, pears, and mangoes, with 44 avocados labelled by hand. A perceptual-hash filter keeps similar photos out of training.",
        ],
        table: {
          caption: "Real-photo test (44 avocados, 13 negative photos)",
          head: ["Metric", "v3", "v3.1"],
          rows: [
            ["Avocados found", "54.5%", "77.3%"],
            ["How much of the fruit the box covers", "55.5%", "86.9%"],
            ["Negative photos with a false box", "5 of 13", "3 of 13"],
            ["Correct variety, where known", "3 of 17", "11 of 19"],
          ],
        },
      },
      {
        id: "phone",
        title: "On the phone",
        body: [
          "The Flutter app runs the three TFLite models in an isolate so the interface never stalls.",
        ],
        list: [
          "Preprocessing goes straight from the camera's YUV frame to the 640×640 tensor, already rotated and letterboxed, in a single pass: from 28.6 to 7.4 ms per frame.",
          "Only new, unstable, or stale avocados (15 frames without a check) get classified. The crops-per-frame limit adjusts itself between 3 and 6 based on how long each phone takes.",
          "A tracker smooths boxes and probabilities across frames, so the label does not flicker.",
          "In the 360° scan, a visual signature detects when the avocado has turned all the way around and closes the scan. Variety and ripeness come from a vote across every capture.",
          "Without a network, photos and scans are kept on the phone and uploaded later.",
        ],
      },
      {
        id: "cameras",
        title: "On cameras",
        body: [
          "A Python script applies the same cascade to webcams, IP cameras over RTSP (with automatic reconnect), Raspberry Pi, and Jetson, with the same preprocessing as the app. Every so often it saves an event to Supabase, which shows up in the app's history under the Camera filter.",
          "On a desktop PC, CPU only, it processes an image in 85 ms with TFLite (about 10 per second). Warehouse inspection needs 2 to 5.",
        ],
      },
      {
        id: "results",
        title: "Results",
        stats: [
          { value: "77.3%", label: "avocados found in real photos" },
          { value: "86.9%", label: "of the fruit covered by the box" },
          { value: "0%", label: "leaf photos marked as avocado" },
        ],
        body: [
          "For ripeness, the main mix-up is ripe versus overripe: the sources do not fully agree on where “ripe” ends. It almost never confuses unripe with overripe (9 of 857).",
          "Known limitation: ripeness was learned mostly from Hass, which turns from green to purple. Fuerte stays green as it ripens, so colour-based ripeness is not reliable for Fuerte.",
        ],
      },
      {
        id: "next",
        title: "What's next",
        list: [
          "More real photos from where it is used: that is what improves the detector most.",
          "A weekly hard-case loop: an error is reported from the history, reviewed on a page, and goes into the next training run.",
          "A larger detector for Photo mode and more varieties, such as Criollo, photographed with the 360° scan itself.",
        ],
      },
    ],
  },
};
