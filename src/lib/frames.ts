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
      { x: 170, y: 469, w: 292, h: 286 },
      { x: 145, y: 742, w: 291, h: 286 },
      { x: 118, y: 1017, w: 290, h: 287 },
    ],
  },
  {
    id: "polaroid-strip",
    name: "Polaroid Strip",
    overlay: f1.url,
    width: 736,
    height: 1308,
    slots: [
      { x: 278, y: 468, w: 190, h: 139 },
      { x: 278, y: 633, w: 190, h: 138 },
      { x: 278, y: 798, w: 190, h: 138 },
      { x: 278, y: 961, w: 190, h: 138 },
    ],
  },
  {
    id: "sasana-inbox",
    name: "Sasana Inbox",
    overlay: f2.url,
    width: 736,
    height: 1104,
    slots: [
      { x: 55, y: 110, w: 215, h: 180 },
      { x: 55, y: 325, w: 215, h: 175 },
      { x: 55, y: 540, w: 215, h: 175 },
      { x: 55, y: 755, w: 215, h: 175 },
      { x: 415, y: 230, w: 220, h: 180 },
      { x: 415, y: 450, w: 220, h: 175 },
      { x: 415, y: 665, w: 220, h: 175 },
      { x: 415, y: 880, w: 220, h: 175 },
    ],
  },
  {
    id: "allday-receipt",
    name: "Allday Receipt",
    overlay: f3.url,
    width: 736,
    height: 1308,
    slots: [
      { x: 30, y: 490, w: 155, h: 200 },
      { x: 195, y: 555, w: 155, h: 195 },
      { x: 340, y: 470, w: 155, h: 195 },
      { x: 475, y: 550, w: 155, h: 195 },
      { x: 605, y: 500, w: 140, h: 195 },
    ],
  },
  {
    id: "airmail-cute",
    name: "Cute Silly Object",
    overlay: f4.url,
    width: 675,
    height: 1200,
    slots: [
      { x: 215, y: 340, w: 280, h: 160 },
      { x: 215, y: 520, w: 280, h: 160 },
      { x: 215, y: 700, w: 280, h: 160 },
    ],
  },
  {
    id: "leopard-sepia",
    name: "Leopard Sepia",
    overlay: f5.url,
    width: 736,
    height: 1308,
    slots: [
      { x: 190, y: 300, w: 345, h: 230 },
      { x: 190, y: 545, w: 345, h: 230 },
      { x: 190, y: 790, w: 345, h: 230 },
    ],
  },
  {
    id: "leopard-brown",
    name: "Leopard Brown",
    overlay: f6.url,
    width: 736,
    height: 1308,
    slots: [
      { x: 285, y: 220, w: 335, h: 255 },
      { x: 285, y: 490, w: 335, h: 250 },
      { x: 285, y: 755, w: 335, h: 250 },
    ],
  },
  {
    id: "baby-girl",
    name: "Baby Girl",
    overlay: f7.url,
    width: 736,
    height: 1308,
    slots: [
      { x: 303, y: 408, w: 260, h: 262 },
      { x: 345, y: 646, w: 263, h: 262 },
      { x: 389, y: 883, w: 264, h: 263 },
    ],
  },
  {
    id: "kate-jackson",
    name: "Kate & Jackson",
    overlay: f8.url,
    width: 675,
    height: 1200,
    slots: [
      { x: 188, y: 119, w: 317, h: 232 },
      { x: 189, y: 371, w: 304, h: 231 },
      { x: 191, y: 624, w: 303, h: 231 },
    ],
  },
  {
    id: "breaking-news",
    name: "Breaking News",
    overlay: f9.url,
    width: 736,
    height: 1308,
    slots: [
      { x: 160, y: 528, w: 251, h: 222 },
      { x: 421, y: 518, w: 251, h: 222 },
      { x: 169, y: 762, w: 251, h: 222 },
      { x: 430, y: 752, w: 252, h: 221 },
    ],
  },
];

export function getFrame(id: string): Frame | undefined {
  return FRAMES.find((f) => f.id === id);
}
