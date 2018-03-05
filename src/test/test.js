import WebSocket from 'ws';
import startServer from './server';
import DocumentUploader from '../';

describe('DocumentUploader', () => {
    let uploader;
    const onMessage = jest.fn();
    beforeAll(async () => {
        startServer();
        const connection = new WebSocket('ws://localhost:8080/');
        connection.onmessage = onMessage;
        await new Promise(r => connection.on('open', r));

        uploader = new DocumentUploader({
            connection,
            debug: true,
        });
    });

    describe('Upload a file', () => {
        it('Files should be uploaded succcessfully', async () => {
            const { document_upload: {status} } = await uploader.upload({
                filename      : 'test-file.jpg',
                buffer        : new Uint8Array([1, 2, 3, 4]),
                documentType  : 'passport',
                expirationDate: '2020-01-01',
                documentId    : '1234567',
                documentFormat: 'JPEG',
                passthrough   : {a: 1},
                chunkSize     : 2,
            });

            expect(status).toEqual('success');
            expect(onMessage.mock.calls.length).toBe(0);
        });
    });

    describe('Upload two files', () => {
        it('Files should be uploaded succcessfully', async () => {
            const upload1 = uploader.upload({
                filename      : 'test-file.jpg',
                buffer        : new Uint8Array([1, 2, 3, 4]),
                documentType  : 'passport',
                expirationDate: '2020-01-01',
                documentId    : '1234567',
                documentFormat: 'JPEG',
                passthrough   : {a: 1},
            });

            const upload2 = uploader.upload({
                filename      : 'test-file.jpg',
                buffer        : new Uint8Array([1, 2, 3, 4]),
                documentType  : 'passport',
                expirationDate: '2022-01-01',
                documentId    : '1234567',
                documentFormat: 'JPEG',
                passthrough   : {a: 1},
            });
            const res1 = await upload1;
            expect(res1.document_upload.status).toEqual('success');
            expect(res1.passthrough).toMatchObject({a: 1, document_upload: true});
            expect((await upload2).document_upload.status).toEqual('success');
            expect(onMessage.mock.calls.length).toBe(0);
        });
    });
});
