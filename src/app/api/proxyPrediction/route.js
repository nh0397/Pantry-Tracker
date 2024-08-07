import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const endpoint = `https://${process.env.NEXT_PUBLIC_GCP_LOCATION}-aiplatform.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_GCP_PROJECT_ID}/locations/${process.env.NEXT_PUBLIC_GCP_LOCATION}/endpoints/${process.env.NEXT_PUBLIC_VERTEX_AI_ENDPOINT_ID}:predict`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GCP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body), // Forward the JSON payload as is
    });

    if (!response.ok) {
      throw new Error(`Error during proxy request: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error during proxy request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
