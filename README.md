# Pantry Tracker

A Next.js application that allows users to manage pantry inventory by either adding items manually or capturing a photo to auto-populate the item details using Google Cloud AI Platform's image recognition.

## Features

- **Inventory Dashboard**: View and manage your pantry items.
- **Add Items Manually**: Add items to your inventory by manually entering the details.
- **Auto-Populate Items**: Capture a photo of your pantry items and let AI auto-populate the details.
- **Edit and Delete Items**: Easily edit or delete items from your inventory.
- **Responsive Design**: Optimized for various screen sizes and devices.

## Tech Stack

- **Next.js**: React framework for building server-rendered React applications.
- **Google Cloud AI Platform**: Used for image recognition to auto-populate pantry items.
- **Firebase Firestore**: Database for storing inventory items.
- **Material UI**: Component library for building responsive and customizable user interfaces.

## Setup and Installation

### Prerequisites

- Node.js (>= 12.x)
- Google Cloud account
- Firebase project

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/yourusername/pantry-tracker.git
   cd pantry-tracker
   ```
## Install Dependencies
```bash
   npm install
   ```

## Set Up Environment Variables:

Create a .env.local file in the root of your project and add the following environment variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Google Cloud AI Platform
NEXT_PUBLIC_GCP_PROJECT_ID=your_gcp_project_id
NEXT_PUBLIC_GCP_LOCATION=us-central1  # or your specific location
NEXT_PUBLIC_VERTEX_AI_ENDPOINT_ID=your_vertex_ai_endpoint_id
NEXT_PUBLIC_GCP_ACCESS_TOKEN=your_gcp_access_token

# Service Account Credentials
GOOGLE_CLOUD_PROJECT=your_gcp_project_id
GOOGLE_APPLICATION_CREDENTIALS=./credentials/serviceAccountKey.json

   ```

Replace the placeholder values with your actual Firebase and Google Cloud credentials.


## Run the Development Server:

```
npm run dev
```

Open http://localhost:3000 with your browser to see the app.


## Deployment
To deploy the application, follow these steps:

Build the application:
```
npm run build
```

Start the production server:

```
npm start
```

You can deploy your application to any hosting provider that supports Node.js applications, such as Vercel, Heroku, or Firebase Hosting.

I have deployed it on vercel. 


## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.