import api from "@/lib/api";
import { PDFDocument } from "pdf-lib";

class docService {
    static async *yieldPDFPages(file: File): AsyncGenerator<Blob> {
        const fileArrayBuffer = await file.arrayBuffer();
        const originalPdfDoc = await PDFDocument.load(fileArrayBuffer);

        for (let i = 0; i < originalPdfDoc.getPageCount(); i++) {
            const newPdfDoc = await PDFDocument.create();
            const [copiedPage] = await newPdfDoc.copyPages(originalPdfDoc, [i]);
            newPdfDoc.addPage(copiedPage);

            const pdfBytes = await newPdfDoc.save();

            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            yield blob;
        }
    }

    static async completeUpload({
        nodeID,
        flowID,
        fileName
    }: {
        nodeID: string,
        flowID: string,
        fileName: string
    }) {
        try {
            const { data } = await api.post(
                `<docProcessor>/api/v1/doc-processor/storage/flows/${flowID}/nodes/${nodeID}/complete-upload`,
                {
                    fileName
                }
            );
            return data;
        }
        catch (err) {
            console.debug("[completeUpload] Could not complete upload", err);
            return null;
        }
    }

    static async getFiles({
        nodeID,
        flowID
    }: {
        nodeID: string,
        flowID: string
    }) {
        try {
            const { data } = await api.get(
                `<docProcessor>/api/v1/doc-processor/storage/flows/${flowID}/nodes/${nodeID}/files`
            );
            return data;
        }
        catch (err) {
            console.debug("[getFiles] Could not get files", err);
            return [];
        }
    }

    static async getFileRefID({
        nodeID,
        flowID,
        fileName
    }: {
        nodeID: string,
        flowID: string,
        fileName: string
    }) {
        try {
            const { data } = await api.post(
                `<docProcessor>/api/v1/doc-processor/storage/flows/${flowID}/nodes/${nodeID}/files/ref-id`,
                {
                    fileName
                }
            );
            return data;
        }
        catch (err) {
            console.debug("[getFileRefID] Could not generate file ref ID", err);
            return null;
        }
    }
}

export default docService;