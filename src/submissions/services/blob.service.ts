import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';

import { logInfo, logError } from '../../common/logger/winston.logger';

@Injectable()
export class BlobService {
  private readonly container: string;
  private readonly account: string;
  private readonly key: string;
  private readonly service: BlobServiceClient;

  constructor(private readonly configService?: ConfigService) {
    this.container = this.configService?.get<string>('azure-blob.container');
    this.account = this.configService?.get<string>('azure-blob.accountName');
    this.key = this.configService?.get<string>('azure-blob.accountKey');

    const cred = new StorageSharedKeyCredential(this.account, this.key);
    this.service = new BlobServiceClient(`https://${this.account}.blob.core.windows.net`, cred);
  }

  async uploadFile(localPath: string, blobName: string) {
    try {
      try {
        readFileSync(localPath);
      } catch {
        throw new Error('File not found');
      }

      const container = this.service.getContainerClient(this.container);
      await container.createIfNotExists();

      const block = container.getBlockBlobClient(blobName);
      const buff = readFileSync(localPath);
      await block.uploadData(buff, { blobHTTPHeaders: { blobContentType: this.guessMime(blobName) } });

      const sas = generateBlobSASQueryParameters(
        {
          containerName: this.container,
          blobName,
          permissions: BlobSASPermissions.parse('r'),
          startsOn: new Date(Date.now() - 60_000),
          expiresOn: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
        },
        (this.service as any).credential,
      ).toString();

      const url = `${block.url}?${sas}`;
      logInfo('BLOB_UPLOAD completed', { blobName, container: this.container });

      return url;
    } catch (err) {
      logError('BLOB_UPLOAD failed', { account: this.account, container: this.container, blobName, error: String(err) });
      throw err;
    }
  }

  private guessMime(name: string) {
    if (name.endsWith('.mp4')) return 'video/mp4';
    if (name.endsWith('.avi')) return 'video/x-msvideo';
    if (name.endsWith('.mov')) return 'video/quicktime';
    if (name.endsWith('.mp3')) return 'audio/mpeg';
    if (name.endsWith('.wav')) return 'audio/wav';
    if (name.endsWith('.m4a')) return 'audio/mp4';
    return 'application/octet-stream';
  }
}
