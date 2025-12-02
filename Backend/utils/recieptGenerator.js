
import PDFDocument from "pdfkit";
import uploadBufferToCloudinary from "./cloudinaryUpload.js";


const generatePDFBuffer = (payment, bill) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      
      doc
        .fontSize(20)
        .text("Society Maintenance Payment Receipt", { align: "center" })
        .moveDown();

      
      doc
        .fontSize(10)
        .text(`Receipt ID: ${payment._id}`)
        .text(`Payment Date: ${payment.paidAt?.toISOString().slice(0, 10)}`)
        .text(`Payment Method: ${payment.method || "online"}`)
        .moveDown();


      doc
        .fontSize(12)
        .text(`Month: ${bill.month}`)
        .text(`Bill Amount: ₹${bill.amount}`)
        .moveDown();

      
      if (bill.flatId && bill.flatId.flatNumber) {
        doc
          .text(`Flat: ${bill.flatId.block || ""} - ${bill.flatId.flatNumber}`)
          .moveDown();
      }

    
      doc
        .fontSize(12)
        .text("Payment Details", { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .text(`Provider: ${payment.provider}`)
        .text(`Payment ID: ${payment.providerPaymentId}`)
        .text(`Order ID: ${payment.providerOrderId}`)
        .moveDown();

      doc
        .fontSize(14)
        .text(`Amount Paid: ₹${payment.amount}`, { align: "right" })
        .moveDown(2);

      doc
        .fontSize(10)
        .text(
          "This is a system-generated receipt. No physical signature required.",
          { align: "center" }
        );

    
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// Main function – ye hi tum payment.controller me use karoge
export const createPDFReceipt = async (payment, bill) => {
  // Optional: flat populate so we can print flat details
  await bill.populate("flatId", "flatNumber block");

  const pdfBuffer = await generatePDFBuffer(payment, bill);

  const uploaded = await uploadBufferToCloudinary(pdfBuffer, "receipts");

  return uploaded.secure_url; // ye URL tum DB me store karoge
};
