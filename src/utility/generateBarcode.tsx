import BwipJs from "bwip-js";
import { useEffect, useRef, useState } from "react";

// This function generates a barcode image URL using the bwip-js library
export const generateBarcodeImageUrl = async (value: string, options?: Partial<BwipJs.RenderOptions>) => {
	const defaultOptions: BwipJs.RenderOptions = {
        
		bcid: 'code39', // Use the Code 39 barcode standard
		text: value.toUpperCase(), // Text to encode
		scale: 3, // 3x scaling factor
		height: 8, // Bar height, in millimeters
		includetext: false, // Include human-readable text
		textxalign: 'center', // Center-align the text
	};
	try {
		// Create a temporary canvas element to draw the barcode
		const canvas = document.createElement('canvas');
		canvas.style.display = 'none'; // Hide the canvas element
		document.body.appendChild(canvas); // Append it to the body to ensure it's part of the document

		// Use bwip-js to draw the barcode on the canvas
		BwipJs.toCanvas(canvas, { ...defaultOptions, ...options });

		// Convert the canvas to a data URL
		const imageUrl = canvas.toDataURL('image/png');

		// Clean up by removing the temporary canvas from the document
		document.body.removeChild(canvas);

		return imageUrl;
	} catch (error) {
		console.error('Error generating barcode image:', error);
		return ''; // Return an empty string or handle the error as needed
	}
};

export const useBarcode = (value: string, options?:Partial<BwipJs.RenderOptions>) => {
    const [barcodeUrl, setBarcodeUrl] = useState<string | undefined>();
    useEffect(() => {
        const generateBarcode = async () => {
            const url = await generateBarcodeImageUrl(value, options);
            setBarcodeUrl(url);
        };

        generateBarcode();
    }, [value]);

    return barcodeUrl;
}