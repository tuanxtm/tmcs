import { test, type Page } from '@playwright/test'

export type FireFrame = {
  hash: number
  transparent: number
  opaque: number
  bottom: number[]
  image: string
}

// Read the actual swapchain before presentation; headless Vulkan screenshots can be blank.
test.beforeEach(async ({ page }) => {
  await page.addInitScript({
    content: `
    let config, texture, busy = false, last = 0;
    const configure = GPUCanvasContext.prototype.configure;
    GPUCanvasContext.prototype.configure = function (value) {
      config = { ...value, usage: (value.usage || GPUTextureUsage.RENDER_ATTACHMENT) | GPUTextureUsage.COPY_SRC };
      return configure.call(this, config);
    };
    const getTexture = GPUCanvasContext.prototype.getCurrentTexture;
    GPUCanvasContext.prototype.getCurrentTexture = function () {
      texture = getTexture.call(this);
      return texture;
    };
    const submit = GPUQueue.prototype.submit;
    GPUQueue.prototype.submit = function (commands) {
      window.fireSubmissions = (window.fireSubmissions || 0) + 1;
      if (!texture || busy || performance.now() - last < 100) return submit.call(this, commands);
      busy = true;
      last = performance.now();
      const width = texture.width, height = texture.height;
      const bytesPerRow = Math.ceil(width * 4 / 256) * 256;
      const buffer = config.device.createBuffer({ size: bytesPerRow * height, usage: 9 });
      const encoder = config.device.createCommandEncoder();
      encoder.copyTextureToBuffer({ texture }, { buffer, bytesPerRow }, [width, height]);
      submit.call(this, [...commands, encoder.finish()]);
      buffer.mapAsync(1).then(() => {
        const bytes = new Uint8Array(buffer.getMappedRange());
        const pixels = new Uint8ClampedArray(width * height * 4);
        let hash = 2166136261, transparent = 0, opaque = 0;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const source = y * bytesPerRow + x * 4, target = (y * width + x) * 4;
            for (let c = 0; c < 4; c++) {
              const channel = config.format.startsWith('bgra') && c < 3 ? 2 - c : c;
              pixels[target + c] = bytes[source + channel];
              hash = Math.imul(hash ^ bytes[source + c], 16777619) >>> 0;
            }
            if (!pixels[target + 3]) transparent++;
            if (pixels[target + 3] === 255) opaque++;
          }
        }
        const image = document.createElement('canvas');
        image.width = width; image.height = height;
        image.getContext('2d').putImageData(new ImageData(pixels, width, height), 0, 0);
        window.fireFrame = { hash, transparent, opaque, bottom: Array.from(pixels.slice(-4)), image: image.toDataURL() };
        buffer.unmap(); buffer.destroy(); busy = false;
      }).catch(() => { buffer.destroy(); busy = false; });
    };
  `,
  })
})

export function readFireFrame(page: Page) {
  return page.evaluate(() => (window as unknown as { fireFrame?: FireFrame }).fireFrame)
}
