import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

jest.mock('../src/common/logger/winston.logger', () => ({ logInfo: jest.fn(), logError: jest.fn() }));

const captured: any[] = [];
jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: jest.fn().mockImplementation(() => ({
    getContainerClient: jest.fn().mockReturnValue({
      createIfNotExists: jest.fn().mockResolvedValue({}),
      getBlockBlobClient: jest.fn().mockReturnValue({
        uploadData: jest.fn().mockImplementation((_buf: any, opts: any) => {
          captured.push(opts);
          return Promise.resolve({});
        }),
        url: 'https://acc/container/blob',
      }),
    }),
  })),
  StorageSharedKeyCredential: jest.fn().mockImplementation(() => ({})),
  BlobSASPermissions: { parse: jest.fn().mockReturnValue({}) },
  generateBlobSASQueryParameters: jest.fn().mockReturnValue({ toString: () => 'sas=1' }),
}));

jest.mock('fs', () => ({ readFileSync: jest.fn().mockReturnValue(Buffer.from('x')) }));

import { BlobService } from '../src/submissions/services/blob.service';

describe('BlobService guessMime', () => {
  it('sets correct content types for common extensions', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [BlobService, { provide: ConfigService, useValue: { get: (k: string) => ({ 'azure-blob.container': 'task', 'azure-blob.accountName': 'acc', 'azure-blob.accountKey': 'key' })[k] } }],
    }).compile();
    const service = moduleRef.get(BlobService);
    captured.length = 0;
    await service.uploadFile('/tmp/f', 'a.mp4');
    await service.uploadFile('/tmp/f', 'b.avi');
    await service.uploadFile('/tmp/f', 'c.mov');
    await service.uploadFile('/tmp/f', 'd.mp3');
    await service.uploadFile('/tmp/f', 'e.wav');
    await service.uploadFile('/tmp/f', 'f.m4a');
    await service.uploadFile('/tmp/f', 'g.bin');
    const types = captured.map((o) => o.blobHTTPHeaders.blobContentType);
    expect(types).toEqual(['video/mp4', 'video/x-msvideo', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/mp4', 'application/octet-stream']);
  });
});
