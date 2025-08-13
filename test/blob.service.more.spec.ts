import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

jest.mock('../src/common/logger/winston.logger', () => ({ logInfo: jest.fn(), logError: jest.fn() }));

const genParams = { lastArgs: null as any };
jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: jest.fn().mockImplementation(() => ({
    getContainerClient: jest.fn().mockReturnValue({
      createIfNotExists: jest.fn().mockResolvedValue({}),
      getBlockBlobClient: jest.fn().mockReturnValue({ uploadData: jest.fn().mockResolvedValue({}), url: 'https://xxx/container/blob' }),
    }),
  })),
  StorageSharedKeyCredential: jest.fn().mockImplementation(() => ({})),
  BlobSASPermissions: { parse: jest.fn().mockReturnValue({}) },
  generateBlobSASQueryParameters: jest.fn().mockImplementation((opts: any) => {
    genParams.lastArgs = opts;
    return { toString: () => 'sas=1' };
  }),
}));

jest.mock('fs', () => ({ readFileSync: jest.fn().mockReturnValue(Buffer.from('x')) }));

import { BlobService } from '../src/submissions/services/blob.service';

describe('BlobService more', () => {
  it('sets SAS validity and permissions', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [BlobService, { provide: ConfigService, useValue: { get: (k: string) => ({ 'azure-blob.container': 'task', 'azure-blob.accountName': 'acc', 'azure-blob.accountKey': 'key' })[k] } }],
    }).compile();
    const service = moduleRef.get(BlobService);
    const url = await service.uploadFile('/tmp/v.mp4', 'v.mp4');
    expect(url).toContain('sas=');
    expect(genParams.lastArgs.containerName).toBe('task');
    expect(genParams.lastArgs.blobName).toBe('v.mp4');
    expect(genParams.lastArgs.permissions).toBeDefined();
    expect(genParams.lastArgs.expiresOn instanceof Date).toBe(true);
  });
});
