import { Test } from '@nestjs/testing';
import { FFmpegService } from '../src/submissions/services/ffmpeg.service';

jest.mock('fluent-ffmpeg', () => {
  const chain = {
    videoFilters: jest.fn().mockReturnThis(),
    noAudio: jest.fn().mockReturnThis(),
    noVideo: jest.fn().mockReturnThis(),
    audioCodec: jest.fn().mockReturnThis(),
    outputOptions: jest.fn().mockReturnThis(),
    output: jest.fn().mockReturnThis(),
    on: jest.fn().mockImplementation(function (event: string, cb: Function) {
      if (event === 'end') setTimeout(() => cb(), 1);
      return this;
    }),
    run: jest.fn().mockReturnThis(),
  };
  const ctor = jest.fn().mockReturnValue(chain);
  (ctor as any).setFfmpegPath = jest.fn();
  return ctor;
});

jest.mock('tmp', () => ({ dirSync: jest.fn().mockReturnValue({ name: '/tmp' }) }));

describe('FFmpegService', () => {
  it('preprocess returns paths', async () => {
    const moduleRef = await Test.createTestingModule({ providers: [FFmpegService] }).compile();
    const service = moduleRef.get(FFmpegService);
    const res = await service.preprocess('/tmp/in.mp4', 100);
    expect(res.videoPath).toContain('/tmp/');
    expect(res.audioPath).toContain('/tmp/');
  });
});
