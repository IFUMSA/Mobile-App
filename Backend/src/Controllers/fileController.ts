import { Request, Response } from "express";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

// Parse uploaded file and extract text
export const parseFile = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    let extractedText = "";

    // Handle different file types
    if (file.mimetype === "application/pdf") {
      try {
        const pdfData = await pdfParse(file.buffer);
        extractedText = pdfData.text;
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        res.status(400).json({ message: "Failed to parse PDF file" });
        return;
      }
    } else if (file.mimetype === "text/plain") {
      extractedText = file.buffer.toString("utf-8");
    } else if (
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // For Word docs, we'd need a library like mammoth
      // For now, return a message
      extractedText = `[Word Document: ${file.originalname}] - Word document parsing requires additional setup. Please copy-paste the text content or use PDF.`;
    } else {
      extractedText = `[File: ${file.originalname}] - Unsupported file type for text extraction.`;
    }

    // Truncate if too long (AI models have token limits)
    const maxLength = 10000;
    if (extractedText.length > maxLength) {
      extractedText = extractedText.substring(0, maxLength) + "... [truncated]";
    }

    res.status(200).json({
      message: "File parsed successfully",
      fileName: file.originalname,
      mimeType: file.mimetype,
      textContent: extractedText,
      charCount: extractedText.length,
    });
    return;
  } catch (error) {
    console.error("File parsing error:", error);
    res.status(500).json({ message: "Server error while parsing file" });
    return;
  }
};
