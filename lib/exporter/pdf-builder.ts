import PDFDocument from "pdfkit/js/pdfkit.standalone";

export async function buildPdf(
  headers: string[],
  rows: any[][],
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
      });

      const buffers: Buffer[] = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const margins = doc.page.margins;
      const pageWidth = doc.page.width - margins.left - margins.right;

      const columnWidth = pageWidth / headers.length;

      // Title
      doc.fontSize(16).text("Report", { align: "left" });
      doc.moveDown();
      let y = doc.y;

      // Header Row
      doc.fontSize(10).font("Helvetica-Bold");

      let maxHeaderHeight = 0;
      headers.forEach((header) => {
        const height = doc.heightOfString(header, {
          width: columnWidth,
          align: "left",
        });
        maxHeaderHeight = Math.max(maxHeaderHeight, height);
      });

      headers.forEach((header, i) => {
        doc.text(header, margins.left + i * columnWidth, y, {
          width: columnWidth,
          align: "left",
        });
      });

      y += maxHeaderHeight + 10;

      doc.font("Helvetica");

      // Rows
      for (const row of rows) {
        let maxRowHeight = 0;
        row.forEach((cell) => {
          const cellText =
            cell !== null && cell !== undefined ? String(cell) : "";
          const height = doc.heightOfString(cellText, {
            width: columnWidth,
            align: "left",
          });
          maxRowHeight = Math.max(maxRowHeight, height);
        });

        if (y + maxRowHeight > doc.page.height - margins.bottom) {
          doc.addPage();
          y = margins.top;
        }

        row.forEach((cell, i) => {
          doc.text(
            cell !== null && cell !== undefined ? String(cell) : "",
            margins.left + i * columnWidth,
            y,
            {
              width: columnWidth,
              align: "left",
            },
          );
        });

        y += maxRowHeight + 10;
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
