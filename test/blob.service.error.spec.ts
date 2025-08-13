import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

jest.mock('../src/common/logger/winston.logger', () => ({ logInfo: jest.fn(), logError: jest.fn() }));

jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: jest.fn().mockImplementation(() => ({
    getContainerClient: jest.fn().mockReturnValue({
      createIfNotExists: jest.fn().mockResolvedValue({}),
      getBlockBlobClient: jest.fn().mockReturnValue({ uploadData: jest.fn().mockResolvedValue({}), url: 'https://acc/container/blob' }),
    }),
  })),
  StorageSharedKeyCredential: jest.fn().mockImplementation(() => ({})),
  BlobSASPermissions: { parse: jest.fn().mockReturnValue({}) },
  generateBlobSASQueryParameters: jest.fn().mockReturnValue({ toString: () => 'sas=1' }),
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => {
    throw new Error('ENOENT');
  }),
}));

import { BlobService } from '../src/submissions/services/blob.service';

describe('BlobService errors', () => {
  it('throws File not found when local file missing', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [BlobService, { provide: ConfigService, useValue: { get: (k: string) => ({ 'azure-blob.container': 'task', 'azure-blob.accountName': 'acc', 'azure-blob.accountKey': 'key' })[k] } }],
    }).compile();
    const service = moduleRef.get(BlobService);
    await expect(service.uploadFile('/nope', 'a.mp4')).rejects.toThrow('File not found');
  });
});
