export async function makePrediction(imageBase64) {
    const endpoint = `https://${process.env.NEXT_PUBLIC_GCP_LOCATION}-aiplatform.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_GCP_PROJECT_ID}/locations/${process.env.NEXT_PUBLIC_GCP_LOCATION}/endpoints/${process.env.NEXT_PUBLIC_ENDPOINT_ID}:predict`;
  
    // Logging for debugging purposes
    console.log('Prediction API endpoint:', endpoint);
  
    // Check if required environment variables are available
    if (!process.env.NEXT_PUBLIC_GCP_ACCESS_TOKEN) {
      throw new Error('GCP access token is not set in the environment variables');
    }
  
    if (!process.env.NEXT_PUBLIC_ENDPOINT_ID) {
      throw new Error('GCP endpoint ID is not set in the environment variables');
    }
  
    const requestBody = {
      instances: [{ content: imageBase64 }],
      parameters: {
        confidenceThreshold: 0.5,
        maxPredictions: 5
      }
    };
  
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GCP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error during prediction: ${response.statusText} - ${errorText}`);
      }
  
      const prediction = await response.json();
      console.log('Prediction result:', prediction);
  
      return prediction;
    } catch (error) {
      console.error('Prediction request failed:', error.message);
      throw error;
    }
  }
  