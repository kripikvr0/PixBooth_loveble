import f0 from "@/assets/frames/378d5ec7e39c13e0be44eef6779f7f6c.jpg.asset.json";
import f1 from "@/assets/frames/6cd597913c335ecf8d4210fafb09349a.jpg.asset.json";
import f2 from "@/assets/frames/7fdda8718a2f9d1e2a5e1717faf30f72.jpg.asset.json";
import f3 from "@/assets/frames/9744b29aef12322ba22c5eb0b3d8a4bd.jpg.asset.json";
import f4 from "@/assets/frames/9bd8e869d88077414b2f96e0c51f950f.jpg.asset.json";
import f5 from "@/assets/frames/a7be8317fc4d51194618eeeabc25da28.jpg.asset.json";
import f6 from "@/assets/frames/bded4891ad37970d24a9e1987c30a926.jpg.asset.json";
import f7 from "@/assets/frames/e7b412034af301edd6e7b133e60dcd44.jpg.asset.json";
import f8 from "@/assets/frames/e8b57a3e3075f7758fceb993d3f9363a.jpg.asset.json";
import f9 from "@/assets/frames/fcd1cc2f26507b3424d50fdb2a7498fc.jpg.asset.json";

export type Slot = { x: number; y: number; w: number; h: number };
export type Frame = {
  id: string;
  name: string;
  overlay: string;
  width: number;
  height: number;
  slots: Slot[];
};

export const FRAMES: Frame[] = [
  {
    id: "the-1975",
    name: "The 1975",
    overlay: f0.url,
    width: 736,
    height: 1308,
    slots: [
      { x: 60, y: 200, w: 290, h: 230 },
      { x: 60, y: 440, w: 290, h: 230 },
      { x: 60, y: 680, w: 290, h: 230 },
    ],
  },
  {
    id: "polaroid-strip",
    name: "Polaroid Strip",
    overlay: f1.url,
    width: 736,
    height: 1308,
    slots: [
      { x: 277, y: 466, w: 189, h: 140 },
      { x: 277, y: 630, w: 189, h: 140 },
      { x: 277, y: 795, w: 189, h: 140 },
      { x: 277, y: 960, w: 189, h: 140 },
    ],
  },
  {
    id: "sasana-inbox",
    name: "Sasana Inbox",
    overlay: f2.url,
    width: 736,
    height: 1104,
    slots: [
      { x: 60, y: 90, w: 280, h: 200 },
      { x: 60, y: 295, w: 280, h: 200 },
      { x: 60, y: 500, w: 280, h: 200 },
      { x: 60, y: 705, w: 280, h: 200 },
      { x: 395, y: 90, w: 280, h: 200 },
      { x: 395, y: 295, w: 280, h: 200 },
      { x: 395, y: 500, w: 280, h: 200 },
      { x: 395, y: 705, w: 280, h: 200 },
    ],
  },
  {
    id: "allday-receipt",
    name: "Allday Receipt",
    overlay: f3.url,
    width: 736,
    height: 1308,
    slots: [
      { x: 60, y: 165, w: 200, h: 280 },
      { x: 270, y: 240, w: 200, h: 280 },
      { x: 480, y: 165, w: 200, h: 280 },
    ],
  },
  {
    id: "airmail-cute",
    name: "Cute Silly Object",
    overlay: f4.url,
    width: 675,
    height: 1200,
    slots: [{ x: 200, y: 380, w: 360, h: 480 }],
  },
  {
    id: "leopard-sepia",
    name: "Leopard Sepia",
    overlay: f5.url,
    width: 736,
    height: 1308,
    slots: [
      { x: 200, y: 280, w: 340, h: 240 },
      { x: 200, y: 545, w: 340, h: 240 },
      { x: 200, y: 810, w: 340, h: 240 },
    ],
  },
  {
    id: "leopard-brown",
    name: "Leopard Brown",
    overlay: f6.url,
    width: 736,
    height: 1308,
    slots: [
      { x: 260, y: 200, w: 320, h: 260 },
      { x: 260, y: 470, w: 320, h: 260 },
      { x: 260, y: 740, w: 320, h: 260 },
    ],
  },
  {
    id: "baby-girl",
    name: "Baby Girl",
    overlay: f7.url,
    width: 736,
    height: 1308,
    slots: [
      { x: 380, y: 410, w: 230, h: 250 },
      { x: 380, y: 680, w: 230, h: 250 },
      { x: 380, y: 950, w: 230, h: 250 },
    ],
  },
  {
    id: "kate-jackson",
    name: "Kate & Jackson",
    overlay: f8.url,
    width: 675,
    height: 1200,
    slots: [
      { x: 180, y: 105, w: 325, h: 250 },
      { x: 180, y: 365, w: 325, h: 250 },
      { x: 180, y: 625, w: 325, h: 250 },
    ],
  },
  {
    id: "breaking-news",
    name: "Breaking News",
    overlay: f9.url,
    width: 736,
    height: 1308,
    slots: [
      { x: 90, y: 360, w: 250, h: 220 },
      { x: 370, y: 360, w: 250, h: 220 },
      { x: 90, y: 600, w: 250, h: 220 },
      { x: 370, y: 600, w: 250, h: 220 },
    ],
  },
];

export function getFrame(id: string): Frame | undefined {
  return FRAMES.find((f) => f.id === id);
}
