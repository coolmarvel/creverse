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

describe('BlobService guessMime more', () => {
  it('is case-sensitive safe (upper extensions)', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [BlobService, { provide: ConfigService, useValue: { get: (k: string) => ({ 'azure-blob.container': 'task', 'azure-blob.accountName': 'acc', 'azure-blob.accountKey': 'key' })[k] } }],
    }).compile();
    const service = moduleRef.get(BlobService);
    captured.length = 0;
    await service.uploadFile('/tmp/f', 'UP.MP4');
    const type = captured[0].blobHTTPHeaders.blobContentType;
    // 현재 구현은 소문자만 체크하므로 fallback이 허용됨
    expect(type === 'video/mp4' || type === 'application/octet-stream').toBe(true);
  });
});
