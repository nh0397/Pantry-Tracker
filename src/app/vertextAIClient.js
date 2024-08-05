// src/vertexAIClient.js
const { PredictionServiceClient } = require('@google-cloud/automl').v1;
const fs = require('fs');
const path = require('path');

// Set up the client using the service account key
const client = new PredictionServiceClient({
  keyFilename: path.resolve(__dirname, './credentials/serviceAccountKey.json'),
});

const projectId = process.env.NEXT_PUBLIC_GCP_PROJECT_ID;
const location = process.env.NEXT_PUBLIC_GCP_LOCATION;
const modelId = process.env.NEXT_PUBLIC_VERTEX_AI_MODEL_ID;

const getPrediction = async (image) => {
  const name = client.modelPath(projectId, location, modelId);
  const params = {};
  
  const payload = {
    image: { imageBytes: image },
  };

  const [response] = await client.predict({ name, payload, params });
  return response.payload;
};

module.exports = getPrediction;
