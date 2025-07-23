const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
require('dotenv').config(); // Carga las variables de .env

const client = new SecretManagerServiceClient();
const projectId = process.env.GCP_PROJECT_ID;

// Un caché simple en memoria para no pedir el mismo secreto una y otra vez.
const secretCache = new Map();

/**
 * Accede a un secreto de Google Secret Manager y lo guarda en caché.
 * @param {string} secretName - El nombre del secreto (ej. 'db_password').
 * @returns {Promise<string>} El valor del secreto.
 */
async function getSecret(secretName) {
  if (secretCache.has(secretName)) {
    return secretCache.get(secretName);
  }

  try {
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name });

    const payload = version.payload.data.toString('utf8');
    secretCache.set(secretName, payload);
    
    console.log(`Successfully fetched and cached secret: ${secretName}`);
    return payload;
  } catch (error) {
    console.error(`Error accessing secret ${secretName}:`, error);
    // En un entorno real, podrías querer que la aplicación falle si no puede obtener un secreto crítico.
    process.exit(1); 
  }
}

module.exports = { getSecret };