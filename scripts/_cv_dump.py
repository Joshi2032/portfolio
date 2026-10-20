import fitz, json
from pathlib import Path
out={}
for lang in ["ES","EN"]:
    p=Path(f"public/cv/Josue-Isai-Salazar-Castro-CV-{lang}.pdf")
    doc=fitz.open(p); page=doc[0]
    pix=page.get_pixmap(dpi=170); pix.save(f"scripts/_cv_{lang}_orig.png")
    spans=[]
    d=page.get_text("dict")
    for b in d["blocks"]:
        if b["type"]!=0:
            spans.append({"image_bbox":[round(v,1) for v in b["bbox"]]})
            continue
        for l in b["lines"]:
            for s in l["spans"]:
                if not s["text"].strip(): continue
                spans.append({"x":round(s["bbox"][0],1),"y":round(s["bbox"][1],1),"x2":round(s["bbox"][2],1),"y2":round(s["bbox"][3],1),"oy":round(s["origin"][1],1),"size":round(s["size"],1),"font":s["font"],"color":f"#{s['color']:06x}","text":s["text"]})
    drawings=[]
    for dr in page.get_drawings():
        r=dr["rect"]
        # only meaningful shapes: lines/rects with fill or long
        drawings.append({"rect":[round(v,1) for v in r],"fill":dr.get("fill"),"color":dr.get("color"),"width":dr.get("width"),"type":dr["type"],"n":len(dr["items"])})
    out[lang]={"rect":list(page.rect),"spans":spans,"drawings":drawings,"images":[list(map(str,i)) for i in page.get_images(full=True)],"links":[{k:str(v) for k,v in l.items()} for l in page.get_links()],"fonts":[list(map(str,f)) for f in page.get_fonts()]}
Path("scripts/_cv_dump.json").write_text(json.dumps(out,ensure_ascii=False,indent=1),encoding="utf-8")
print("ok", {k: len(v["spans"]) for k,v in out.items()})
