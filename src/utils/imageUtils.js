export async function getImageBase64(imageFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]; // Remove metadata
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  }
  