from typing import List
import modal
from PIL import Image

from common import stub

cache_path = "/vol/sam-cache"
sam_checkpoint = "sam_vit_h_4b8939.pth"
model_type = "vit_h"

image = (
    modal.Image.debian_slim()
    .apt_install("git", "wget")
    .pip_install(
        "opencv-python-headless",
        "torch",
        "torchvision",
        "pycocotools",
        "matplotlib",
        "onnxruntime",
        "onnx",
        "pillow",
        "git+https://github.com/facebookresearch/segment-anything.git",
    )
    .run_commands(f'wget https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth -P {cache_path}')
)
stub.sam_image = image

if stub.is_inside(stub.sam_image):
    import torch
    from PIL import Image

@stub.cls(image=stub.sam_image, gpu="A10G")
class SegmentAnything:
    def __enter__(self):
        from segment_anything import sam_model_registry, SamPredictor

        self.model = sam_model_registry[model_type](checkpoint=f'{cache_path}/{sam_checkpoint}').to("cuda")
        self.predictor = SamPredictor(self.model)

    @modal.method()
    def predict_masks(self, img: Image, input_points: List[List[float]] = None, input_labels: List[int] = None, input_box: List[List[float]] = None
    ) -> list[bytes]:
        import numpy as np

        if input_points is not None: 
            input_points = np.array(input_points)
            input_labels = np.array(input_labels)
        if input_box is not None: input_box = np.array(input_box)

        self.predictor.set_image(np.asarray(img))
        masks, scores, _ = self.predictor.predict(
            point_coords=input_points, 
            point_labels=input_labels,
            box=input_box, 
            multimask_output=True,
        )

        return masks, scores

@stub.local_entrypoint()
def entrypoint():
    import requests
    import numpy as np
    from pathlib import Path
    from matplotlib import pyplot as plt
    from io import BytesIO

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