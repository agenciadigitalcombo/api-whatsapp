import axios from "axios";
import sharp from "sharp";

async function getThumbnailBuffer(url: string, size: number = 300): Promise<Buffer | null> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    const buffer = await sharp(response.data)
      .resize(size, size, {
        fit: 'cover',
        background: "#ffffff"  
      })
      .flatten({ background: "#ffffff" }) 
      .jpeg({ quality: 100 })
      .toBuffer();
    return buffer;

  } catch (error) {
    console.error("Erro ao obter ou redimensionar imagem:", error);
    return null;
  }
}

export default getThumbnailBuffer;
