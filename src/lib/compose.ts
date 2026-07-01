import type { Frame } from "./frames";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Draw a source image into a slot using cover-fit
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const iw = (img as HTMLImageElement).naturalWidth || (img as HTMLCanvasElement).width;
  const ih = (img as HTMLImageElement).naturalHeight || (img as HTMLCanvasElement).height;
  const sRatio = iw / ih;
  const dRatio = dw / dh;
  let sx = 0,
    sy = 0,
    sw = iw,
    sh = ih;
  if (sRatio > dRatio) {
    sw = ih * dRatio;
    sx = (iw - sw) / 2;
  } else {
    sh = iw / dRatio;
    sy = (ih - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

export async function composeFrame(
  frame: Frame,
  photoDataUrls: string[],
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext("2d")!;

  // 1) Draw frame background first (JPG opaque, contains decorations + placeholder photos)
  const overlay = await loadImage(frame.overlay);
  ctx.drawImage(overlay, 0, 0, frame.width, frame.height);

  // 2) Draw user photos ON TOP of each slot (covering the placeholder photos in the frame)
  const photos = await Promise.all(photoDataUrls.map((p) => loadImage(p)));
  for (let i = 0; i < frame.slots.length; i++) {
    const slot = frame.slots[i];
    const img = photos[i % photos.length];
    drawCover(ctx, img, slot.x, slot.y, slot.w, slot.h);
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}

export function captureFromVideo(video: HTMLVideoElement, mirror = true): string {
  const w = video.videoWidth;
  const h = video.videoHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  if (mirror) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.92);
}
