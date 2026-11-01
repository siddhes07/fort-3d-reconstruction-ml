import gradio as gr
from PIL import ImageOps
from ultralytics import YOLO

model = YOLO("gateway_best.pt")

def detect(img):
    if img is None:
        return None, "Please upload a photo."
    img = ImageOps.exif_transpose(img).convert("RGB")
    r = model.predict(img, conf=0.25, verbose=False)[0]
    text = "Sorry...!No gateway detected. Please Upload another Photo" if len(r.boxes) == 0 else "\n".join(
        f"gateway: confidence {float(b.conf):.2f}" for b in r.boxes)
    return r.plot()[:, :, ::-1], text

gr.Interface(detect, gr.Image(type="pil"), [gr.Image(), gr.Textbox()],
             title="Savrdhan").launch()