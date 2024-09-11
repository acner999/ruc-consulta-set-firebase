/* eslint-disable max-len */
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const cors = require("cors"); // Importar el paquete cors
const admin = require("firebase-admin"); // Importar el SDK de admin de Firebase


const config = require("./config"); // Importar archivo de configuración

admin.initializeApp(); // Inicializar la aplicación de Firebase Admin
const db = admin.firestore(); // Obtener la referencia a Firestore

// Claves y vector de inicialización (IV) para el cifrado
const key = CryptoJS.enc.Base64.parse(config.crypto.key);
const iv = CryptoJS.enc.Base64.parse(config.crypto.iv);

// Configurar CORS
const corsHandler = cors({
  origin: true, // Permitir todas las solicitudes
});

function encrypt(ruc, dv) {
  const data = JSON.stringify({ruc, dv});
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv: iv,
  });
  return encrypted.toString();
}

function decrypt(encryptedText) {
  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv: iv,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hola logs!", {structuredData: true});
  response.send("Hola from Firebase!");
});

exports.consultarRUC = onRequest(async (request, response) => {
  // Aplicar el middleware CORS
  corsHandler(request, response, async () => {
    const {ruc, dv} = request.query;

    if (!ruc || !dv) {
      response.status(400).send("Faltan parámetros: RUC o dígito verificador.");
      return;
    }

    try {
      const dato = encrypt(ruc, dv);
      logger.info("Datos cifrados para la consulta", {dato});

      const api = `${config.url}/validezDocumento/contribuyente?t3=${encodeURIComponent(dato)}`;

      const apiResponse = await axios.get(api);

      const razonSocial = apiResponse.data.trim();

      logger.info("Consulta de RUC exitosa", {ruc, razonSocial,
        encryptedData: encrypt, // Agregar la coma final aquí
        decrypt: decrypt(encrypt),
      });

      // Guardar los datos en Firestore
      await db.collection("ruc-consultas").add({
        ruc: ruc,
        dv: dv,
        razonSocial: razonSocial,
        timestamp: admin.firestore.FieldValue.serverTimestamp(), // Guardar la fecha/hora de la consulta
      });

      response.status(200).send({razonSocial});
    } catch (error) {
      logger.error("Error al consultar el RUC", {error: error.message});
      response.status(500).send(error);
    }
  });
});
