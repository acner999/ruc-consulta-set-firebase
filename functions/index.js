/* eslint-disable max-len */
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const cors = require("cors");
const admin = require("firebase-admin"); // Importar el SDK de admin de Firebase
const config = require("./config");
const serviceAccount = require("./configadmin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rucconsulta-4d509-default-rtdb.firebaseio.com",
});
const db = admin.database();

const key = CryptoJS.enc.Base64.parse(config.crypto.key);
const iv = CryptoJS.enc.Base64.parse(config.crypto.iv);

const corsHandler = cors({
  origin: true,
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
        encryptedData: encrypt,
        decrypt: decrypt(encrypt)});
      try {
        // Guardar los datos en Firestore
        await agregarRucConSufijo(ruc+"-"+dv, {
          ruc: ruc,
          dv: dv,
          razonSocial: razonSocial,
          timestamp: Date.now(), // Guardar la fecha/hora de la consulta
        });
      } catch (e) {
        logger.info("error al insertar", e);
      }


      response.status(200).send({razonSocial});
    } catch (error) {
      logger.error("Error al consultar el RUC", {error: error.message});
      response.status(500).send(error);
    }
  });


  // Función para agregar datos de un RUC
  // Función para agregar datos de un RUC con sufijo incremental si ya existe
  async function agregarRucConSufijo(ruc, data) {
    let rucFinal = ruc;
    let suffix = 1; // Comenzar con sufijo 1

    // Verificar si el RUC ya existe
    while (await db.ref("rucs/" + rucFinal).once("value").then((snapshot) => snapshot.exists())) {
      rucFinal = `${ruc}_${suffix}`; // Agregar sufijo al RUC
      suffix++;
    }

    // Agregar un timestamp con la fecha actual
    const dataConFecha = {
      ...data,
      fecha_creacion: new Date().toISOString(), // Formato de fecha ISO 8601
    };

    // Agregar los datos a la base de datos
    await db.ref("rucs/" + rucFinal).set(dataConFecha);
    console.log(`Datos agregados correctamente bajo el RUC ${rucFinal}.`);
  }
});
