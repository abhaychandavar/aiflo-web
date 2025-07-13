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
        spaceID,
        fileName,
        mode
    }: {
        spaceID: string,
        fileName: string,
        mode: string
    }) {
        try {
            const { data } = await api.post(
                `<docProcessor>/api/v1/doc-processor/storage/spaces/${spaceID}/complete-upload`,
                {
                    fileName,
                    mode
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
        spaceID
    }: {
        spaceID: string
    }) {
        try {
            const { data } = await api.get(
                `<docProcessor>/api/v1/doc-processor/storage/spaces/${spaceID}/files`
            );
            return data;
        }
        catch (err) {
            console.debug("[getFiles] Could not get files", err);
            return [];
        }
    }

    static async getFileRefID({
        spaceID,
        fileName
    }: {
        spaceID: string,
        fileName: string
    }) {
        try {
            const { data } = await api.post(
                `<docProcessor>/api/v1/doc-processor/storage/spaces/${spaceID}/files/ref-id`,
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

    static async deleteDocument({
        spaceID,
        id
    }: {
        spaceID: string,
        id: string
    }) {
        try {
            const { data } = await api.delete(
                `<docProcessor>/api/v1/doc-processor/storage/spaces/${spaceID}/documents/${id}`
            );
            return data;
        }
        catch (err) {
            console.debug("[deleteDocument] Could not complete upload", err);
            return null;
        }
    }
}

export default docService;