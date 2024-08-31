const tf = require('@tensorflow/tfjs-node');
const handpose = require('@tensorflow-models/handpose');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

// Configurar el backend de TensorFlow.js (adapta según tu hardware)
tf.setBackend('cpu'); // Opciones: 'cpu', 'webgl'

// Ruta de la imagen (cambia por la tuya)
const imagePath = 'saludo.jpg';

async function detectarManos() {
  try {
    // Cargar el modelo de detección de manos
    const model = await handpose.load();

    // Cargar la imagen
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image,   
 0, 0);

    // Convertir la imagen a un tensor y realizar la predicción
    const input = tf.browser.fromPixels(canvas);
    const predictions = await model.estimateHands(input);

    // Verificar si se detectaron manos
    if (predictions.length > 0) {
      console.log('¡Se han detectado manos!');

      // Dibujar los resultados (puedes personalizar esto)
      predictions.forEach(prediction => {
        // Obtener las coordenadas de los puntos clave (landmarks)
        const landmarks = prediction.landmarks;

        // Calcular el rectángulo envolvente (bounding box)
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        landmarks.forEach(([x, y]) => {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        });

        // Dibujar el rectángulo envolvente
        const width = maxX - minX;
        const height = maxY - minY;
        ctx.strokeStyle = 'green';
        ctx.strokeRect(minX, minY, width, height);

        // Dibujar los puntos clave (opcional)
        landmarks.forEach(([x, y]) => {
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fill();
        });
      });

      // Guardar la imagen resultante
      const out = fs.createWriteStream('output.png');
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      console.log('Imagen guardada con éxito: output.png');
    } else {
      console.log('No se han detectado manos en la imagen.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

detectarManos();