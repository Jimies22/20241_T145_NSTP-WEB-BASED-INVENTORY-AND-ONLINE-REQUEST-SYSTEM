const PDFDocument = require('pdfkit');

const generatePDF = async (request, res) => {
  // Create a document
  const doc = new PDFDocument();
  
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=borrowed-item-${request._id}.pdf`);

  // Pipe the PDF directly to the response
  doc.pipe(res);

  // Add the header with styling
  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .text('Borrowed Item Details', { align: 'center' })
    .moveDown();

  // Add item details
  doc
    .font('Helvetica')
    .fontSize(12)
    .text(`Item Name: ${request.item?.name || 'N/A'}`)
    .text(`Description: ${request.item?.description || 'N/A'}`)
    .text(`Category: ${request.item?.category || 'N/A'}`)
    .moveDown()
    .text(`Status: ${request.status}`)
    .moveDown()
    .text(`Request Date: ${new Date(request.requestDate).toLocaleString()}`)
    .text(`Borrow Date: ${new Date(request.borrowDate).toLocaleString()}`)
    .text(`Return Date: ${new Date(request.returnDate).toLocaleString()}`);

  // If there's an item image, add it to the PDF
  if (request.item?.image) {
    try {
      // Assuming the image path is relative to your server
      const imagePath = `./uploads/${request.item.image}`;
      doc.moveDown()
         .image(imagePath, {
           fit: [250, 250],
           align: 'center'
         });
    } catch (error) {
      console.error('Error loading image:', error);
    }
  }

  // Finalize PDF file
  doc.end();
};

module.exports = { generatePDF };
