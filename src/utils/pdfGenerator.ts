import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generate and download a PDF from a DOM element
 */
export async function exportElementToPDF(
  elementId: string,
  filename: string,
  options: { title?: string; onProgress?: (msg: string) => void } = {}
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    options.onProgress?.('Đang chuẩn bị trang văn bản...');

    // Make sure all images in element are loaded
    const images = element.getElementsByTagName('img');
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    options.onProgress?.('Đang render độ phân giải cao...');

    const canvas = await html2canvas(element, {
      scale: 2, // High resolution for crisp printing
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200, // Fixed desktop preview width to avoid mobile reflow
    });

    options.onProgress?.('Đang tạo tệp PDF A4...');

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Create A4 PDF (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const calculatedHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = calculatedHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, calculatedHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Add additional pages if content spans more than one A4 page
    while (heightLeft > 0) {
      position = heightLeft - calculatedHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, calculatedHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}
