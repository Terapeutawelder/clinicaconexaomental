import { loadImageFromUrl, removeBackground } from './backgroundRemoval';

export const processCurrentLogoAndSave = async (): Promise<void> => {
  try {
    console.log('Loading current logo...');
    const logoPath = '/src/assets/logo-transparent.png';
    const imageElement = await loadImageFromUrl(logoPath);
    
    console.log('Removing background from logo...');
    const processedBlob = await removeBackground(imageElement);
    
    // Convert blob to base64 for downloading
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      
      // Create download link
      const link = document.createElement('a');
      link.href = base64;
      link.download = 'logo-transparent-processed.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Processed logo downloaded successfully');
    };
    reader.readAsDataURL(processedBlob);
    
  } catch (error) {
    console.error('Error processing logo:', error);
  }
};