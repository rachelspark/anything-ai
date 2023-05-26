from typing import List
import modal
import os
from PIL import Image

from common import stub

cache_path = "/vol/sam-cache"

def download_model():
    from transformers import SamModel, SamProcessor
    import torch

    model = SamModel.from_pretrained("facebook/sam-vit-huge")
    processor = SamProcessor.from_pretrained("facebook/sam-vit-huge")
    model.save_pretrained(cache_path)
    processor.save_pretrained(cache_path)

image = (
    modal.Image.debian_slim()
    .apt_install("git")
    .pip_install(
        "opencv-python-headless",
        "torch",
        "pycocotools",
        "matplotlib",
        "onnxruntime",
        "onnx",
        "transformers",
        "pillow",
    )
    .run_function(download_model, gpu="any")
)
stub.sam_image = image

if stub.is_inside(stub.sam_image):
    import torch
    from PIL import Image

@stub.cls(image=stub.sam_image, gpu="A10G")
class SegmentAnything:
    def __enter__(self):
        from transformers import SamModel, SamProcessor

        self.model = SamModel.from_pretrained("facebook/sam-vit-huge")
        self.processor = SamProcessor.from_pretrained("facebook/sam-vit-huge")

    @modal.method()
    def get_image_embeddings():
        pass

    @modal.method()
    def predict_masks(
        self, img: Image, input_points: List[List[float]] = None, input_box: List[List[float]] = None
    ) -> list[bytes]:
        # calculate image embeddings
        inputs = self.processor(img, return_tensors="pt")
        image_embeddings = self.model.get_image_embeddings(inputs["pixel_values"])
        inputs = self.processor(img, input_points=input_points, input_boxes=input_box, return_tensors="pt")
        inputs.pop("pixel_values", None)
        inputs.update({"image_embeddings": image_embeddings})
        
        with torch.no_grad():
            outputs = self.model(**inputs)

        masks = self.processor.image_processor.post_process_masks(outputs.pred_masks.cpu(), inputs["original_sizes"].cpu(), inputs["reshaped_input_sizes"].cpu())
        scores = outputs.iou_scores

        return masks, scores


@stub.local_entrypoint()
def entrypoint():
    import torch
    import requests
    import numpy as np
    from pathlib import Path
    import cv2
    from matplotlib import pyplot as plt
    from io import BytesIO
    import base64

    img_url = "https://huggingface.co/ybelkada/segment-anything/resolve/main/assets/car.png"
    raw_image = Image.open(requests.get(img_url, stream=True).raw).convert("RGBA")
    input_points = [[[2100, 1000]]]

    sam = SegmentAnything()

    masks, scores = sam.predict_masks.call(raw_image.convert('RGB'), input_points)

    dir = Path("/tmp/stable-diffusion")
    if not dir.exists():
        dir.mkdir(exist_ok=True, parents=True)

    def apply_mask_to_image(mask, image, random_color=False):
        if random_color:
            color = np.concatenate([np.random.random(3), np.array([0.6])], axis=0)
        else:
            color = np.array([30/255, 144/255, 255/255, 0.6])
        h, w = mask.shape[-2:]
        mask_image = (mask.reshape(h, w, 1) * color.reshape(1, 1, -1)).numpy()
        masked_image = np.array(image) * (1 - mask_image) + mask_image
        return masked_image

    def apply_masks_to_image(raw_image, masks, scores):
        if len(masks.shape) == 4:
            masks = masks.squeeze()
        if scores.shape[0] == 1:
            scores = scores.squeeze()

        masked_images = []

        for i, (mask, _) in enumerate(zip(masks, scores)):
            mask = mask.cpu().detach()
            masked_image = apply_mask_to_image(mask, raw_image)
            masked_images.append(masked_image)
        
        return masked_images

    masked_images = apply_masks_to_image(raw_image, masks[0], scores)
    buf = BytesIO()
    for i, img in enumerate(masked_images):
        img_pil = Image.fromarray((img * 255).astype(np.uint8))
        img_pil.save(buf, format="PNG")
        output_path = dir / f"output_{i}.png"
        print(f"Saving it to {output_path}")
        with open(output_path, "wb") as f:
            f.write(buf.getvalue())

    output_path = dir / f"output_mask.png"
    print(f"Saving it to {output_path}")
    with open(output_path, "wb") as f:
        f.write(buf.getvalue())