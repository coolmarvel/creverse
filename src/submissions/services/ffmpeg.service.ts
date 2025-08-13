import { Injectable, Logger } from '@nestjs/common';
import ffmpegStatic from 'ffmpeg-static';
import * as ffmpeg from 'fluent-ffmpeg';
import { randomUUID } from 'crypto';
import { join } from 'path';
import * as tmp from 'tmp';

function resolveFfmpegPath(): string {
  const envPath = process.env.FFMPEG_PATH;
  if (typeof envPath === 'string' && envPath.length > 0) return envPath;

  const candidate: unknown = ffmpegStatic as unknown;
  if (typeof candidate === 'string' && candidate.length > 0) return candidate;
  if (candidate && typeof (candidate as { path?: unknown }).path === 'string') return String((candidate as { path: string }).path);
  if (candidate && typeof (candidate as { default?: unknown }).default === 'string') return String((candidate as { default: string }).default);

  const reqVal = require('ffmpeg-static');
  if (typeof reqVal === 'string' && reqVal.length > 0) return reqVal;

  return 'ffmpeg';
}
const resolvedFfmpegPath = resolveFfmpegPath();
ffmpeg.setFfmpegPath(resolvedFfmpegPath);

@Injectable()
export class FFmpegService {
  private readonly logger = new Logger(FFmpegService.name);
  async preprocess(inputPath: string, cropRightPx = 300): Promise<{ videoPath: string; audioPath: string }> {
    const dir = tmp.dirSync().name;
    const base = randomUUID();
    const videoPath = join(dir, `${base}-video.mp4`);
    const audioPath = join(dir, `${base}-audio.mp3`);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .videoFilters(`crop=iw-${cropRightPx}:ih:0:0`)
        .noAudio()
        .outputOptions(['-movflags +faststart'])
        .output(videoPath)
        .on('end', () => resolve())
        .on('error', (err: any) => {
          this.logger.error(`ffmpeg video process failed: ${String(err)}`);
          reject(new Error(String(err)));
        })
        .run();
    });

    await new Promise<void>((resolve, reject) => {
      const cmd: any = ffmpeg(inputPath);
      if (typeof cmd.noVideo === 'function') cmd.noVideo();

      cmd
        .audioCodec('libmp3lame')
        .outputOptions(['-q:a', '2'])
        .output(audioPath)
        .on('end', () => resolve())
        .on('error', (err: any) => {
          this.logger.error(`ffmpeg audio process failed: ${String(err)}`);
          reject(new Error(String(err)));
        })
        .run();
    });

    return { videoPath, audioPath };
  }
}
