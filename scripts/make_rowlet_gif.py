"""Cute Rowlet fan-art GIF: gentle bounce, blink and bowtie-leaf wiggle.

Drawn programmatically with PIL (supersampled) on a transparent background so
it can be dropped onto any page section. Faithful traits: round brown body,
white face mask with a top notch and pointed chin, orange beak and toes,
feathered side wings, cream belly and the green leaf bowtie.
Output: public/rowlet.gif
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw

SS = 3                      # supersample factor for smooth edges
S = 560
W = S * SS
BROWN = (146, 102, 62, 255)
BROWN_DARK = (96, 63, 33, 255)
BROWN_MID = (122, 82, 45, 255)
CREAM = (255, 246, 222, 255)
BELLY = (250, 236, 203, 255)
ORANGE = (243, 146, 44, 255)
ORANGE_DARK = (203, 106, 22, 255)
GREEN = (74, 166, 84, 255)
GREEN_DARK = (45, 120, 58, 255)
BLACK = (34, 26, 20, 255)
WHITE = (255, 255, 255, 255)

OUT = Path("public/rowlet.gif")
OUT.parent.mkdir(parents=True, exist_ok=True)

def sc(v):
    return v * SS

def leaf_layer(angle, flip=False):
    layer = Image.new("RGBA", (sc(190), sc(120)), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    pts = [(15, 60), (58, 22), (108, 8), (158, 22), (182, 52),
           (152, 88), (96, 106), (42, 92)]
    d.polygon([(sc(x), sc(y)) for x, y in pts], fill=GREEN, outline=GREEN_DARK, width=sc(5))
    d.line([(sc(26), sc(60)), (sc(162), sc(50))], fill=GREEN_DARK, width=sc(4))
    d.line([(sc(70), sc(52)), (sc(96), sc(30))], fill=GREEN_DARK, width=sc(3))
    d.line([(sc(100), sc(56)), (sc(124), sc(78))], fill=GREEN_DARK, width=sc(3))
    if flip:
        layer = layer.transpose(Image.FLIP_LEFT_RIGHT)
    return layer.rotate(angle, resample=Image.BICUBIC,
                        center=(sc(15) if not flip else sc(174), sc(60)))

def frame(i, n=16):
    t = i / n
    bounce = round(math.sin(t * math.tau) * 10 * SS)
    squash = 1 + 0.025 * math.sin(t * math.tau + math.pi / 2)
    blink = i in (7, 8)
    wiggle = math.sin(t * math.tau * 2) * 7

    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = W // 2
    base = sc(112) + bounce

    bw, bh = sc(332) * squash, sc(352) / squash
    x0, y0, x1, y1 = cx - bw / 2, base, cx + bw / 2, base + bh

    # --- feet: three orange toes per foot, tucked under the body ---
    for dx in (sc(-62), sc(62)):
        for toe in (-1, 0, 1):
            tx = cx + dx + toe * sc(24)
            d.rounded_rectangle([tx - sc(15), y1 - sc(18), tx + sc(15), y1 + sc(12)],
                                radius=sc(12), fill=ORANGE, outline=ORANGE_DARK, width=sc(3))

    # --- back wings (behind body) ---
    lift = abs(math.sin(t * math.tau)) * sc(10)
    for side in (-1, 1):
        wx = cx + side * (bw / 2 - sc(2))
        wy = base + sc(196) - lift
        d.ellipse([wx - sc(40), wy - sc(102), wx + sc(40), wy + sc(102)], fill=BROWN_DARK)
        d.ellipse([wx - sc(24), wy - sc(78), wx + sc(24), wy + sc(78)], fill=BROWN_MID)

    # --- round body ---
    d.ellipse([x0, y0, x1, y1], fill=BROWN, outline=BROWN_DARK, width=sc(6))

    # subtle darker shading arc at the very top of the head
    d.arc([x0 + sc(28), y0 + sc(6), x1 - sc(28), y0 + sc(120)], start=180, end=360,
          fill=BROWN_MID, width=sc(10))
    d.ellipse([x0, y0, x1, y1], outline=BROWN_DARK, width=sc(6))

    # --- cream belly ---
    d.ellipse([cx - sc(100), base + sc(196), cx + sc(100), base + bh - sc(24)],
              fill=BELLY)
    # two little chest feather arcs on the belly
    for dy in (sc(238), sc(268)):
        d.arc([cx - sc(52), dy, cx + sc(52), dy + sc(38)], start=20, end=160,
              fill=(226, 205, 164, 255), width=sc(4))

    # --- white face mask: two lobes, top notch, pointed chin ---
    fy = base + sc(18)
    d.ellipse([cx - sc(130), fy, cx + sc(8), fy + sc(158)], fill=CREAM)
    d.ellipse([cx - sc(8), fy, cx + sc(130), fy + sc(158)], fill=CREAM)
    d.polygon([(cx - sc(88), fy + sc(112)), (cx + sc(88), fy + sc(112)),
               (cx, fy + sc(188))], fill=CREAM)
    # top notch carved in brown
    d.polygon([(cx - sc(26), fy - sc(2)), (cx + sc(26), fy - sc(2)),
               (cx, fy + sc(34))], fill=BROWN_MID)
    # faint face edge
    d.arc([cx - sc(130), fy, cx + sc(8), fy + sc(158)], start=90, end=300,
          fill=(226, 205, 164, 255), width=sc(3))
    d.arc([cx - sc(8), fy, cx + sc(130), fy + sc(158)], start=240, end=90,
          fill=(226, 205, 164, 255), width=sc(3))

    # --- eyes ---
    for dx in (sc(-57), sc(57)):
        ex, ey = cx + dx, fy + sc(82)
        if blink:
            d.arc([ex - sc(27), ey - sc(12), ex + sc(27), ey + sc(18)],
                  start=0, end=180, fill=BLACK, width=sc(6))
        else:
            d.ellipse([ex - sc(25), ey - sc(33), ex + sc(25), ey + sc(33)], fill=BLACK)
            d.ellipse([ex - sc(9), ey - sc(23), ex + sc(9), ey - sc(5)], fill=WHITE)
            d.ellipse([ex + sc(3), ey + sc(6), ex + sc(13), ey + sc(16)], fill=WHITE)

    # --- orange beak: wide upper diamond + small lower tip ---
    by = fy + sc(116)
    d.polygon([(cx - sc(21), by), (cx + sc(21), by), (cx, by + sc(19))],
              fill=ORANGE, outline=ORANGE_DARK, width=sc(2))
    d.polygon([(cx - sc(13), by + sc(15)), (cx + sc(13), by + sc(15)),
               (cx, by + sc(29))], fill=ORANGE_DARK)

    # --- side feather scallops over the body edge ---
    for side in (-1, 1):
        for k in range(3):
            fx = cx + side * (bw / 2 - sc(16))
            fy2 = base + sc(196) + k * sc(38)
            d.ellipse([fx - sc(20), fy2 - sc(26), fx + sc(20), fy2 + sc(26)],
                      fill=BROWN_DARK)
            d.ellipse([fx - sc(11), fy2 - sc(17), fx + sc(11), fy2 + sc(17)],
                      fill=BROWN_MID)

    # --- green leaf bowtie under the chin ---
    neck_y = base + sc(198)
    left = leaf_layer(wiggle, flip=True)
    right = leaf_layer(-wiggle, flip=False)
    img.alpha_composite(left, (int(cx - sc(178)), int(neck_y - sc(58))))
    img.alpha_composite(right, (int(cx - sc(12)), int(neck_y - sc(58))))
    d = ImageDraw.Draw(img)
    d.ellipse([cx - sc(16), neck_y - sc(16), cx + sc(16), neck_y + sc(16)], fill=GREEN_DARK)
    d.ellipse([cx - sc(9), neck_y - sc(9), cx + sc(9), neck_y + sc(9)], fill=GREEN)

    return img.resize((S, S), Image.LANCZOS)

frames = [frame(i) for i in range(16)]
sheet = Image.new("RGBA", (S * 4, S), (255, 255, 255, 255))
for j, idx in enumerate((0, 4, 7, 11)):
    sheet.alpha_composite(frames[idx], (j * S, 0))
sheet.convert("RGB").save("scripts/_rowlet_sheet.png")
frames[0].save(OUT, save_all=True, append_images=frames[1:],
               duration=90, loop=0, disposal=2, optimize=True)
print(f"saved {OUT} ({OUT.stat().st_size/1024:.0f} KB, {len(frames)} frames)")
print("sheet saved")
