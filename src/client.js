import md5 from 'md5';
import { generateChunks, addMetadata, createError } from './tools';

export default class Client {
    constructor({ send, file, reqId }) {
        this.send = send;
        this.file = file;
        this.reqId = reqId;

        const { buffer } = file;

        this.checksum = md5(Array.from(buffer));
        this.size = buffer.length;
    }
    requestUpload() {
        /* eslint-disable camelcase */
        const {
            documentType: document_type,
            documentFormat: document_format,
            documentId: document_id,
            expirationDate: expiration_date,
            pageType: page_type,
            buffer,
        } = this.file;
        const passthrough = Object.assign(this.file.passthrough || {}, {document_upload: true});
        const request = {
            req_id           : this.reqId,
            passthrough,
            document_upload  : 1,
            document_type,
            document_format  : document_format.toUpperCase(),
            expiration_date,
            document_id,
            file_size        : buffer.length,
            expected_checksum: this.checksum,
        };
        if (page_type) {
            request.page_type = page_type;
        }
        /* eslint-enable camelcase */
        this.send(
            JSON.stringify(request)
        );
    }
    handleMessage({ error, document_upload: uploadInfo, passthrough }) {
        // Duplicate upload error
        if (error && error.code === 'DuplicateUpload') {
            return { warning: 'DuplicateUpload', message: error.message, passthrough };
        }
        if (error) {
            throw createError('ApiError', error);
        }

        const { checksum, size, upload_id: uploadId, call_type: callType } = uploadInfo;

        if (!checksum) {
            this.startBinaryUpload(Object.assign({}, this.file, { uploadId, callType }));
            return undefined;
        }

        if (size !== this.size) {
            throw createError('SizeMismatch', 'File size does not match');
        }

        if (checksum !== this.checksum) {
            throw createError('ChecksumMismatch', 'Checksum does not match');
        }

        return {document_upload: uploadInfo, passthrough};
    }
    startBinaryUpload(file) {
        addMetadata(generateChunks(file.buffer, file), file).forEach(chunk => this.send(chunk));
    }
}
