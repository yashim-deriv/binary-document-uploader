# binary-document-uploader
Uploading files through websocket to binary.com platform

# Installation

```
npm install @binary-com/binary-document-uploader
```

# Publishing a new version

### With npm

First increase the version in `package.json` according to major/minor/patch. Ideally this will be done in the same PR as your changes. After that, you can run:
```
npm run build
npm publish
```

### With yarn

Yarn automatically increases the version for you, so you only need to run:
```
yarn publish
```

The resulting `DocumentUploader.js` should be committed and uploaded to this repository.

# Usage

### ES6

```
import DocumentUploader from 'binary-document-uploader';

const uploader = new DocumentUploader(config);
```

### RequireJS

```
const DocumentUploader = require('binary-document-uploader');

const uploader = new DocumentUploader(config);
```

### Browser

```
<script src="./documentUploader.js"></script>
<script>
    const uploader = new DocumentUploader(config);
    uploader(file);
</script>
```

# Example

```
import DocumentUploader from 'binary-document-uploader';

const uploader = new DocumentUploader(config);

uploader.upload(file)
    .then(result => console.log(`Status: ${result.status}`))
    .catch(error => console.log(error));
```

# file (object)

File information and payload to send

## `file.filename`

Filename

## `file.buffer`

Array buffer containing the file to upload

## `file.documentType`

Document type

## `file.documentId` (optional)

Document id

## `file.documentFormat`

Document format

## `file.expirationDate` (optional)

Expiration date
## `file.lifetimeValid` (optional)

Boolean value that indicates whether this document is lifetime valid (only applies to POI document types, cancels out the expiration_date given if any)

## `file.chunkSize`

Default: `16384` (16 KB)

# config (object)

## `config.connection`

A **ready** websocket connection

## `config.debug`

Default: `false`
