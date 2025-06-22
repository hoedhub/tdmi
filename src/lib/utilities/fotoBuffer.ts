import sharp from 'sharp';
const fotoBuffer = async (file: File | Blob | null, maxSizeKB = 200): Promise<Buffer | null> => {
    // Jika file null, undefined, atau bukan instance dari Blob, langsung kembalikan null
    if (!(file instanceof Blob)) {
        return null;
    }

    if (file.size === 0) {
        console.log('File is empty, skipping processing.');
        return null;
    }

    try {
        const buffer = await file.arrayBuffer();
        const foto = Buffer.from(buffer);

        const optimizedBuffer = await sharp(foto)
            .resize({
                width: 1600,
                height: 1600,
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: 70,
                progressive: true,
                mozjpeg: true
            })
            .toBuffer();

        // Check final size
        if (optimizedBuffer.byteLength > maxSizeKB * 1024) {
            console.error(`File size still exceeds ${maxSizeKB}KB after optimization. Size: ${Math.round(optimizedBuffer.byteLength / 1024)}KB`);
            // throw new Error(`File terlalu besar setelah optimasi.`);
            return null;
        }

        return optimizedBuffer;

    } catch (error) {
        console.error('Error processing image with sharp:', error);
        // Jika sharp gagal (misalnya format tidak didukung), kembalikan null
        return null;
    }
}

export default fotoBuffer;