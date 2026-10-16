export const note = {
  slug: "detector-aguacate",
  image: "proyectos/aguacate/camara.png",
  es: {
    title: "Detector de aguacate con YOLO26n en el teléfono",
    description: "Nota técnica: datos, entrenamiento, despliegue en el teléfono con TFLite y resultados del detector de aguacate (mAP50 97.65%).",
    kicker: "Nota técnica",
    back: "Volver al portafolio",
    other: "Read in English",
    imageAlt: "Cámara en vivo del detector, con cajas de madurez",
    sections: [
      {
        title: "El problema",
        body: [
          "Saber, con la cámara del teléfono, si hay un aguacate, si es Hass u otro, y si está inmaduro, maduro o podrido. La detección tenía que correr en el propio teléfono, sin depender de la red.",
        ],
      },
      {
        title: "Los datos",
        body: [
          "La base es el conjunto Hass de estudio de Xavier, Rodrigues y Silva (2024), “Hass” Avocado Ripening Photographic Dataset, en Mendeley Data (DOI 10.17632/3xd9n945v8). Se sumaron Mendeley Kamat, Agrocomputation 227 (Agro227), Fruits-360 y Fruits-30.",
          "Las clases con fotos son Hass y «otro», cada una por estado de madurez. El conjunto quedó en 11 130 imágenes de entrenamiento, 1 585 de validación y 1 486 de prueba.",
        ],
      },
      {
        title: "El entrenamiento",
        body: [
          "Hubo dos corridas de YOLO26n. La primera, solo con Hass, llegó a un mAP50 de 96.35% en validación (mejor época: 60).",
          "El modelo del teléfono es un ajuste fino de esa corrida con la mezcla de Hass y «otro», a 100 épocas. Ultralytics guarda como mejor peso el que maximiza su métrica de ajuste (pesa sobre todo mAP50-95); fue la época 72.",
          "Se entrenó en una NVIDIA RTX PRO 4500 Blackwell con PyTorch.",
        ],
      },
      {
        title: "En el teléfono",
        body: [
          "El modelo se exporta a TFLite y va dentro de la app Flutter, así que la detección funciona sin red. La app tiene cuatro pantallas: foto de un frame, cámara en vivo, historial y ciencia. También se puede elegir una imagen de la galería.",
          "En la cámara en vivo, ByteTrack mantiene identificadores estables para cada fruto: una detección necesita confianza de 0.45 y un track se muestra tras al menos 3 apariciones. El historial se guarda en SQLite en el teléfono.",
          "La app puede nombrar Hass, Méndez, Fuerte, Criollo, Reed, Bacon y otro.",
        ],
      },
      {
        title: "Resultados",
        stats: [
          { value: "97.65%", label: "mAP50 en validación" },
          { value: "96.88%", label: "mAP50-95 en validación" },
          { value: "93.9%", label: "acierto del estado de madurez" },
        ],
        body: [
          "Sobre las 1 585 imágenes de validación, la precisión es 95.84% y el recall 93.93%. Si solo se pregunta si hay fruto, sin importar la clase, el mAP50 sube a 99.50% con recall de 100%.",
          "La confusión más común es entre Hass podrido y Hass maduro.",
        ],
      },
      {
        title: "Qué sigue",
        body: [
          "Mejorar la separación entre podrido y maduro.",
          "Poner en marcha el contenedor de inferencia para poscosecha que ya está documentado: el mismo detector, un recorte con CLAHE y un clasificador EfficientNet-B3 de variedad y madurez. Todavía no está levantado; en el teléfono sigue mandando el modelo TFLite.",
          "La pantalla de ciencia explora imagen hiperespectral; aún no tiene modelo.",
        ],
      },
    ],
  },
  en: {
    title: "An avocado detector with YOLO26n on the phone",
    description: "Technical note: data, training, on-device deployment with TFLite, and results of the avocado detector (mAP50 97.65%).",
    kicker: "Technical note",
    back: "Back to the portfolio",
    other: "Leer en español",
    imageAlt: "Live camera of the detector, with ripeness boxes",
    sections: [
      {
        title: "The problem",
        body: [
          "Use the phone camera to tell whether an avocado is present, whether it is Hass or other, and whether it is unripe, ripe, or rotten. Detection had to run on the phone itself, without depending on a network.",
        ],
      },
      {
        title: "The data",
        body: [
          "The base is the Hass study dataset by Xavier, Rodrigues, and Silva (2024), “Hass” Avocado Ripening Photographic Dataset, on Mendeley Data (DOI 10.17632/3xd9n945v8). Mendeley Kamat, Agrocomputation 227 (Agro227), Fruits-360, and Fruits-30 were added.",
          "The classes with photos are Hass and “other”, each split by ripeness. The set ended up with 11,130 training images, 1,585 validation images, and 1,486 test images.",
        ],
      },
      {
        title: "Training",
        body: [
          "There were two YOLO26n runs. The first, Hass only, reached 96.35% mAP50 on validation (best epoch: 60).",
          "The phone model is a fine-tune of that run on the Hass + “other” mix, for 100 epochs. Ultralytics keeps as best weights the epoch that maximizes its fitness metric (weighted mostly toward mAP50-95); that was epoch 72.",
          "Training ran on an NVIDIA RTX PRO 4500 Blackwell with PyTorch.",
        ],
      },
      {
        title: "On the phone",
        body: [
          "The model is exported to TFLite and ships inside the Flutter app, so detection works without a network. The app has four screens: a one-frame photo, a live camera, history, and science. A picture can also be picked from the gallery.",
          "In the live camera, ByteTrack keeps stable IDs for each fruit: a detection needs 0.45 confidence and a track is shown after at least 3 hits. History is stored in SQLite on the phone.",
          "The app can name Hass, Méndez, Fuerte, Criollo, Reed, Bacon, and other.",
        ],
      },
      {
        title: "Results",
        stats: [
          { value: "97.65%", label: "mAP50 on validation" },
          { value: "96.88%", label: "mAP50-95 on validation" },
          { value: "93.9%", label: "ripeness state accuracy" },
        ],
        body: [
          "On the 1,585 validation images, precision is 95.84% and recall 93.93%. Asking only whether a fruit is present, regardless of class, mAP50 rises to 99.50% with 100% recall.",
          "The most common mix-up is rotten Hass versus ripe Hass.",
        ],
      },
      {
        title: "What's next",
        body: [
          "Better separation between rotten and ripe.",
          "Bring up the post-harvest inference container that is already documented: the same detector, a CLAHE crop, and an EfficientNet-B3 classifier for variety and ripeness. It is not running yet; on the phone, the TFLite model is still what does the work.",
          "The science screen explores hyperspectral imaging; it has no model yet.",
        ],
      },
    ],
  },
};
