import { describe, expect, it } from 'vitest';
import { InscChunKs, largeTextToChunks } from './chunkString';

// 定义一个小图像的 base64 字符串
const smallImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAHAwGNRRkVAAAAABJRU5Erw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAHAwGNRRkVAAAAABJRU5Erw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAHAwGNRRkVAAAAABJRU5Erw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAHAwGNRRkVAAAAABJRU5Erw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAHAwGNRRkVAAAAABJRU5ErAAADUlEQVR42mNkYPhfDwAHAwGNRRkVAAAAABJRU5ErkJggg==";

describe('testChunkSize', () => {
  it('should split a small image into chunks', () => {
    // 模拟小图像的 base64 字符串
    const imgIndex = "A0";
    const awardRatio = 10;

    const result: InscChunKs | undefined = largeTextToChunks(imgIndex, smallImageBase64, awardRatio);

    result?.chunks.forEach((chunk, index) => {
      console.log(index, "-->:", chunk);
    })

    // 验证返回结果
    expect(result).toBeDefined();
    if (result) {
      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.estimateGas).toBe(result.chunks.length * 0.1);
      expect(result.award).toBe(result.estimateGas * awardRatio);
      expect(result.singleTxCost).toBe(Math.ceil(((result.award + result.estimateGas) / result.chunks.length) / 0.1) * 0.1);
      expect(result.totalCost).toBe(result.singleTxCost * result.chunks.length);
    }
  });
});
