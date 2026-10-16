// Technical note shown inside the avocado project dialog.
export const note = {
  es: {
    title: "Nota técnica",
    summary: "Datos, los cinco modelos entrenados, el despliegue en el teléfono y los resultados.",
    finalLabel: "va en el teléfono",
    sections: [
      {
        id: "problema",
        title: "El problema",
        body: [
          "Saber, con la cámara del teléfono, si hay un aguacate, si es Hass u otro, y si está inmaduro, maduro o podrido. La detección tenía que correr en el propio teléfono, sin depender de la red.",
        ],
      },
      {
        id: "datos",
        title: "Los datos",
        body: [
          "La base es el conjunto Hass de estudio de Xavier, Rodrigues y Silva (2024), “Hass” Avocado Ripening Photographic Dataset, en Mendeley Data (DOI 10.17632/3xd9n945v8). Se sumaron Mendeley Kamat, Agrocomputation 227 (Agro227), Fruits-360 y Fruits-30.",
          "Las clases con fotos son Hass y «otro», cada una por estado de madurez. El conjunto quedó en 11 130 imágenes de entrenamiento, 1 585 de validación y 1 486 de prueba.",
        ],
      },
      {
        id: "entrenamiento",
        title: "El entrenamiento",
        body: [
          "No fue un solo modelo. Se entrenaron cinco: dos detectores YOLO26n pensados para el teléfono, un localizador YOLO26x de una sola clase y dos clasificadores de madurez para un contenedor de inferencia. Todo corrió en una NVIDIA RTX PRO 4500 Blackwell con PyTorch, a 640 px en el caso de los YOLO.",
        ],
        models: {
          caption: "Modelos entrenados (métricas sobre validación)",
          head: ["Modelo", "Para qué", "Datos y corrida", "Métrica clave"],
          rows: [
            ["YOLO26n Hass", "Primer detector para el teléfono", "Solo Hass de estudio: 9 899 fotos, separadas por fruto en 7 749 / 1 127 / 1 023. 100 épocas, lote 64.", "mAP50 96.35% (época 60)"],
            ["YOLO26n mix", "Detector final del teléfono", "Ajuste fino del anterior con Hass + «otro»: 11 130 / 1 585 / 1 486. 100 épocas, lote 160.", "mAP50 97.65% · mAP50-95 96.88% (época 72)"],
            ["YOLO26x localizador", "Encontrar el fruto (1 clase) en el contenedor", "Detector grande de una clase, lote 12. Se pausó tras 47 de 100 épocas (unas 3.3 h).", "mAP50 99.50% · mAP50-95 99.39% · recall 100%"],
            ["ConvNeXt-Tiny", "Clasificar madurez en el recorte", "Recorte del fruto con CLAHE; dos cabezas (variedad y madurez).", "F1 de madurez 88.15% · acierto 88.96%"],
            ["EfficientNet-B3", "Clasificar madurez en el recorte", "Mismo recorte y mismas dos cabezas; mejor peso en la época 24.", "F1 de madurez 94.45% · acierto 94.64%"],
          ],
        },
        after: [
          "El camino al teléfono: la corrida solo con Hass sirvió de punto de partida, y el ajuste fino con la mezcla subió el mAP50 de 96.35% a 97.65%. Ese YOLO26n mix es el que se exporta a TFLite (float32, 9.7 MB) y va dentro de la app. Ultralytics guarda como mejor peso el que maximiza su métrica de ajuste (pesa sobre todo mAP50-95); fue la época 72. El pico de mAP50 fue 97.67% en la época 29.",
          "Para el contenedor ganó EfficientNet-B3 sobre ConvNeXt-Tiny (F1 de madurez 94.45% contra 88.15%). Ahí el detector es el mismo YOLO26n mix y no el YOLO26x, para que todo quepa en una GPU de 4 GB.",
        ],
      },
      {
        id: "telefono",
        title: "En el teléfono",
        body: [
          "El modelo se exporta a TFLite y va dentro de la app Flutter, así que la detección funciona sin red. La app tiene cuatro pantallas: foto de un frame, cámara en vivo, historial y ciencia. También se puede elegir una imagen de la galería.",
          "En la cámara en vivo, ByteTrack mantiene identificadores estables para cada fruto: una detección necesita confianza de 0.45 y un track se muestra tras al menos 3 apariciones. El historial se guarda en SQLite en el teléfono.",
          "La app puede nombrar Hass, Méndez, Fuerte, Criollo, Reed, Bacon y otro.",
        ],
      },
      {
        id: "resultados",
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
        id: "sigue",
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
    title: "Technical note",
    summary: "Data, the five models trained, on-device deployment, and results.",
    finalLabel: "ships on the phone",
    sections: [
      {
        id: "problem",
        title: "The problem",
        body: [
          "Use the phone camera to tell whether an avocado is present, whether it is Hass or other, and whether it is unripe, ripe, or rotten. Detection had to run on the phone itself, without depending on a network.",
        ],
      },
      {
        id: "data",
        title: "The data",
        body: [
          "The base is the Hass study dataset by Xavier, Rodrigues, and Silva (2024), “Hass” Avocado Ripening Photographic Dataset, on Mendeley Data (DOI 10.17632/3xd9n945v8). Mendeley Kamat, Agrocomputation 227 (Agro227), Fruits-360, and Fruits-30 were added.",
          "The classes with photos are Hass and “other”, each split by ripeness. The set ended up with 11,130 training images, 1,585 validation images, and 1,486 test images.",
        ],
      },
      {
        id: "training",
        title: "Training",
        body: [
          "It wasn't a single model. Five were trained: two YOLO26n detectors meant for the phone, a one-class YOLO26x locator, and two ripeness classifiers for an inference container. Everything ran on an NVIDIA RTX PRO 4500 Blackwell with PyTorch, at 640 px for the YOLO runs.",
        ],
        models: {
          caption: "Models trained (validation metrics)",
          head: ["Model", "Goal", "Data and run", "Key metric"],
          rows: [
            ["YOLO26n Hass", "First phone detector", "Hass study photos only: 9,899 images, split by fruit into 7,749 / 1,127 / 1,023. 100 epochs, batch 64.", "mAP50 96.35% (epoch 60)"],
            ["YOLO26n mix", "Final phone detector", "Fine-tune of the previous run on Hass + “other”: 11,130 / 1,585 / 1,486. 100 epochs, batch 160.", "mAP50 97.65% · mAP50-95 96.88% (epoch 72)"],
            ["YOLO26x locator", "Find the fruit (1 class) in the container", "Large one-class detector, batch 12. Paused after 47 of 100 epochs (about 3.3 h).", "mAP50 99.50% · mAP50-95 99.39% · 100% recall"],
            ["ConvNeXt-Tiny", "Classify ripeness on the crop", "Fruit crop with CLAHE; two heads (variety and ripeness).", "Ripeness F1 88.15% · accuracy 88.96%"],
            ["EfficientNet-B3", "Classify ripeness on the crop", "Same crop and same two heads; best weights at epoch 24.", "Ripeness F1 94.45% · accuracy 94.64%"],
          ],
        },
        after: [
          "The path to the phone: the Hass-only run was the starting point, and fine-tuning on the mix raised mAP50 from 96.35% to 97.65%. That YOLO26n mix is what gets exported to TFLite (float32, 9.7 MB) and ships inside the app. Ultralytics keeps as best weights the epoch that maximizes its fitness metric (weighted mostly toward mAP50-95); that was epoch 72. Peak mAP50 was 97.67% at epoch 29.",
          "For the container, EfficientNet-B3 beat ConvNeXt-Tiny (ripeness F1 94.45% vs 88.15%). There the detector is the same YOLO26n mix rather than YOLO26x, so everything fits on a 4 GB GPU.",
        ],
      },
      {
        id: "phone",
        title: "On the phone",
        body: [
          "The model is exported to TFLite and ships inside the Flutter app, so detection works without a network. The app has four screens: a one-frame photo, a live camera, history, and science. A picture can also be picked from the gallery.",
          "In the live camera, ByteTrack keeps stable IDs for each fruit: a detection needs 0.45 confidence and a track is shown after at least 3 hits. History is stored in SQLite on the phone.",
          "The app can name Hass, Méndez, Fuerte, Criollo, Reed, Bacon, and other.",
        ],
      },
      {
        id: "results",
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
        id: "next",
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
