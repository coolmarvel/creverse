import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

jest.mock('../src/common/logger/winston.logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

import { BlobService } from '../src/submissions/services/blob.service';

jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: jest.fn().mockImplementation(() => ({
    getContainerClient: jest.fn().mockReturnValue({
      createIfNotExists: jest.fn().mockResolvedValue({}),
      getBlockBlobClient: jest.fn().mockReturnValue({
        uploadData: jest.fn().mockResolvedValue({}),
        url: 'https://account.blob.core.windows.net/container/blob.mp4',
      }),
    }),
  })),
  StorageSharedKeyCredential: jest.fn().mockImplementation(() => ({})),
  BlobSASPermissions: { parse: jest.fn().mockReturnValue({}) },
  generateBlobSASQueryParameters: jest.fn().mockReturnValue({ toString: () => 'sas=1' }),
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(Buffer.from('file')),
}));

describe('BlobService', () => {
  it('uploads and returns SAS URL', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        BlobService,
        { provide: ConfigService, useValue: { get: (k: string) => ({ 'azure-blob.containerName': 'task', 'azure-blob.accountName': 'acc', 'azure-blob.accountKey': 'key' })[k] } },
      ],
    }).compile();

    const service = moduleRef.get(BlobService);
    const url = await service.uploadFile('/tmp/f.mp4', 'blob.mp4');
    expect(url).toContain('https://');
    expect(url).toContain('sas=');
  });
});
