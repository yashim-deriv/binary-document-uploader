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
        const {
            documentType: document_type, // eslint-disable-line camelcase
            documentFormat: document_format, // eslint-disable-line camelcase
            documentId: document_id, // eslint-disable-line camelcase
            expirationDate: expiration_date, // eslint-disable-line camelcase
            buffer,
        } = this.file;
        const passthrough = Object.assign(this.file.passthrough || {}, {document_upload: true});
        this.send(
            JSON.stringify({
                req_id           : this.reqId,
                passthrough,
                document_upload  : 1,
                document_type,
                document_format  : document_format.toUpperCase(),
                expiration_date,
                document_id,
                file_size        : buffer.length,
                expected_checksum: this.checksum,
            })
        );
    }
    handleMessage({ error, document_upload: uploadInfo, echoReq, passthrough }) {
        // Duplicate upload error
        if (error && error.code === 'DuplicateUpload') {
            return { warning: 'DuplicateUpload' };
        }
        if (error) {
            throw createError('ApiError', error, echoReq);
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
