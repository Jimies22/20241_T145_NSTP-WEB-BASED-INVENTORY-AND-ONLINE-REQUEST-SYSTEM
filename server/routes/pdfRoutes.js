const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Request = require("../models/borrow");
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Define the middleware locally
const jwtVerifyMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

const generatePdfHandler = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const request = await Request.findById(requestId).populate('item');

    // Color scheme
    const colors = {
      midnightBlue: '#191970',    // Primary color
      lightBlue: '#E6E8FA',       // Light background
      darkText: '#1A1A1A',        // Dark text
      greyText: '#666666'         // Secondary text
    };

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=borrowed-item-${requestId}.pdf`
    );

    doc.pipe(res);

    // Header with Midnight Blue
    doc
      .rect(0, 0, doc.page.width, 100)
      .fill(colors.midnightBlue);

    // White text for header
    doc
      .fontSize(28)
      .fillColor('#FFFFFF')
      .text('NSTP Equipment Borrowing', { align: 'center', top: 40 });

    // Date on top right
    doc
      .fontSize(10)
      .fillColor(colors.whiteText)
      .text(new Date().toLocaleDateString(), { align: 'right', top: 110 });

    // Add item image if exists
    if (request.item?.image) {
      try {
        const imagePath = path.join(__dirname, '..', 'uploads', request.item.image);
        if (fs.existsSync(imagePath)) {
          doc
            .moveDown(2)
            .image(imagePath, {
              fit: [200, 200],
              align: 'center'
            })
            .moveDown();
        }
      } catch (error) {
        console.error("Error adding image to PDF:", error);
      }
    }

    // Item Details Section
    doc
      .moveDown(2)
      .fontSize(20)
      .fillColor(colors.midnightBlue)
      .text('Item Details', { align: 'left' })
      .moveDown();

    // Function for detail lines with modern styling
    const addDetailLine = (label, value) => {
      doc
        .fontSize(12)
        .fillColor(colors.greyText)
        .text(label, { continued: true })
        .fillColor(colors.darkText)
        .text(`: ${value || 'N/A'}`)
        .moveDown(0.5);
    };

    addDetailLine('Item Name', request.item?.name);
    addDetailLine('Description', request.item?.description);
    addDetailLine('Category', request.item?.category);
    addDetailLine('Status', request.status);

    // Dates Section with modern styling
    doc
      .moveDown(2)
      .fontSize(20)
      .fillColor(colors.midnightBlue)
      .text('Important Dates')
      .moveDown();

    // Modern date formatting
    const formatDate = (date) => {
      return date ? new Date(date).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A';
    };

    const addDateLine = (label, date) => {
      doc
        .fontSize(12)
        .fillColor(colors.greyText)
        .text(label, { continued: true })
        .fillColor(colors.darkText)
        .text(`: ${formatDate(date)}`)
        .moveDown(0.5);
    };

    addDateLine('Request Date', request.requestDate);
    addDateLine('Borrow Date', request.borrowDate);
    addDateLine('Return Date', request.returnDate);

    // Add a subtle line before footer
    doc
      .moveDown(2)
      .strokeColor(colors.lightBlue)
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();

    // Modern footer
    doc
      .moveDown(2)
      .fontSize(10)
      .fillColor(colors.greyText)
      .text('This document is automatically generated and serves as a record of equipment borrowing.', {
        align: 'center',
        width: 400
      });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Error generating PDF", error: error.message });
  }
};

router.get("/generate-pdf/:requestId", jwtVerifyMiddleware, generatePdfHandler);

module.exports = router;
