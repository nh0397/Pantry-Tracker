// src/app/api/vertexPrediction/route.js
import { NextResponse } from 'next/server';
import { PredictionServiceClient } from '@google-cloud/automl';

const client = new PredictionServiceClient({
  keyFilename: 'src/credentials/serviceAccountKey.json',
});

export async function POST(request) {
  const { image } = await request.json();

  const projectId = process.env.NEXT_PUBLIC_GCP_PROJECT_ID;
  const location = process.env.NEXT_PUBLIC_GCP_LOCATION;
  const modelId = process.env.NEXT_PUBLIC_VERTEX_AI_MODEL_ID;

  const name = client.modelPath(projectId, location, modelId);
  const params = {};
  const payload = {
    image: { imageBytes: image },
  };

  try {
    const [response] = await client.predict({ name, payload, params });
    return NextResponse.json({ predictions: response.payload });
  } catch (error) {
    console.error('Error during prediction:', error);
    return NextResponse.json({ error: 'Prediction failed' }, { status: 500 });
  }
}
