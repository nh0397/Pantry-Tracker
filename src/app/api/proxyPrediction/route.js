import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(req) {
  try {
    const body = await req.json();
    const endpoint = `https://us-central1-prediction-aiplatform.clients6.google.com/ui/projects/${process.env.NEXT_PUBLIC_GCP_PROJECT_ID}/locations/${process.env.NEXT_PUBLIC_GCP_LOCATION}/endpoints/${process.env.NEXT_PUBLIC_VERTEX_AI_ENDPOINT_ID}:predict?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GCP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body), // Forward the JSON payload as is
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error during proxy request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
