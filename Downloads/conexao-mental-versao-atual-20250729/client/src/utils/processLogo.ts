import { removeBackground, loadImageFromUrl } from './backgroundRemoval';
import logoUrl from '@/assets/logo-transparent.png';

export const processLogoBackground = async (): Promise<string> => {
  try {
    // Load the current logo
    const img = await loadImageFromUrl(logoUrl);
    
    // Remove background
    const processedBlob = await removeBackground(img);
    
    // Create a new URL for the processed image
    return URL.createObjectURL(processedBlob);
  } catch (error) {
    console.error('Error processing logo:', error);
    // Return original logo if processing fails
    return logoUrl;
  }
};

export const processCurrentLogoAndDownload = async (): Promise<void> => {
  try {
    console.log('Loading current logo...');
    const img = await loadImageFromUrl(logoUrl);
    
    console.log('Removing background from logo...');
    const processedBlob = await removeBackground(img);
    
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