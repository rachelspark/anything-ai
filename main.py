from __future__ import annotations

import io
import os
import time
from pathlib import Path
from typing import List, Tuple

from common import stub
from sam import SegmentAnything
from sd import StableDiffusion

from fastapi import File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import modal
import numpy as np

@stub.function(image=stub.sd_image)
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI, Response, Form
    from PIL import Image, ImageDraw
    import base64
    from io import BytesIO
    import torch
    import cv2
    import requests


    app = FastAPI()
    sd = StableDiffusion()
    sam = SegmentAnything()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    def process_coords(point_coords: str):
        is_point = False
        point_coords = [float(coord) for coord in point_coords.split(',')]
        point_coords = np.asarray(point_coords)
        print(point_coords)

        if (point_coords[0] == point_coords[2]) and (point_coords[1] == point_coords[3]): # just an input point, not an input box
            is_point = True
            point_coords = point_coords[0:2]

        # Convert points to a PyTorch tensor
        points_tensor = torch.tensor([point_coords])
        # Reshape the tensor to have 4 dimensions
        points_tensor_4d = points_tensor.unsqueeze(0).unsqueeze(0)
        print(points_tensor_4d)
        
        return is_point, points_tensor_4d


    def resize_and_pad(image: np.ndarray, mask: np.ndarray, target_size: int = 512) -> Tuple[np.ndarray, np.ndarray]:
        """
        Resizes an image and its corresponding mask to have the longer side equal to `target_size` and pads them to make them
        both have the same size. The resulting image and mask have dimensions (target_size, target_size).

        Args:
            image: A numpy array representing the image to resize and pad.
            mask: A numpy array representing the mask to resize and pad.
            target_size: An integer specifying the desired size of the longer side after resizing.

        Returns:
            A tuple containing two numpy arrays - the resized and padded image and the resized and padded mask.
        """
        height, width, _ = image.shape
        max_dim = max(height, width)
        scale = target_size / max_dim
        new_height = int(height * scale)
        new_width = int(width * scale)
        image_resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_LINEAR)
        mask_resized = cv2.resize(mask, (new_width, new_height), interpolation=cv2.INTER_LINEAR)
        pad_height = target_size - new_height
        pad_width = target_size - new_width
        top_pad = pad_height // 2
        bottom_pad = pad_height - top_pad
        left_pad = pad_width // 2
        right_pad = pad_width - left_pad
        image_padded = np.pad(image_resized, ((top_pad, bottom_pad), (left_pad, right_pad), (0, 0)), mode='constant')
        mask_padded = np.pad(mask_resized, ((top_pad, bottom_pad), (left_pad, right_pad)), mode='constant')
        return image_padded, mask_padded, (top_pad, bottom_pad, left_pad, right_pad)

    @app.post("/generate-mask")
    def generate_mask(point_coords: str = Form(...), file: UploadFile = File(...), mask_state: str = Form(...)):
        img_content = file.file.read()
        raw_image = Image.open(BytesIO(img_content)).convert("RGBA")
        is_point, points_tensor = process_coords(point_coords)

        if is_point:
            masks, scores = sam.predict_masks.call(img=raw_image.convert('RGB'), input_points=points_tensor)
        else:
            masks, scores = sam.predict_masks.call(img=raw_image.convert('RGB'), input_box=points_tensor)

        def apply_mask_to_image(mask, image, random_color=False):
            if random_color:
                color = np.concatenate([np.random.random(3), np.array([0.6])], axis=0)
            else:
                color = np.array([30/255, 144/255, 255/255, 0.8])
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
            binary_masks = []

            for i, (mask, _) in enumerate(zip(masks, scores)):
                mask = mask.cpu().detach()
                masked_image = apply_mask_to_image(mask, raw_image)
                masked_images.append(masked_image)

                if mask_state == "replace": # replace background
                    binary_mask = np.where(mask > 0.5, 0, 1)
                else: # fill in object
                    binary_mask = np.where(mask > 0.5, 1, 0)
                binary_masks.append(binary_mask)
            
            return masked_images, binary_masks

        masked_images, binary_masks = apply_masks_to_image(raw_image, masks[0], scores)
        binary_buf = BytesIO()
        colored_buf = BytesIO()
        binary_pil = Image.fromarray((binary_masks[0] * 255).astype(np.uint8))
        mask_pil = Image.fromarray((masked_images[0] * 255).astype(np.uint8))

        raw_image.paste(mask_pil, (0,0), mask=mask_pil)

        binary_pil.save(binary_buf, format="PNG")
        raw_image.save(colored_buf, format="PNG")

        binary_mask_str = base64.b64encode(binary_buf.getvalue()).decode("utf-8")
        colored_mask_str = base64.b64encode(colored_buf.getvalue()).decode("utf-8")

        return {"binary_mask": binary_mask_str, "colored_mask": colored_mask_str}

    @app.post("/generate-image")
    def generate_image(prompt: str = Form(...), mask_img: UploadFile = File(...), img: UploadFile = File(...)):
        images = []
        try:
            img_content = img.file.read()
            img_pil = Image.open(BytesIO(img_content))
            img_arr = np.array(img_pil)

            mask_img_content = mask_img.file.read()
            mask_image = Image.open(BytesIO(mask_img_content))
            mask_arr = np.array(mask_image)

            img_padded, mask_padded, padding_factors = resize_and_pad(img_arr, mask_arr)
            img_padded = img_padded[:, :, :3]

            for i in range(4):
                background_image = sd.run_inference.call(prompt, img_padded, mask_padded)
        
                for j, image_bytes in enumerate(background_image):
                    encoded = base64.b64encode(image_bytes)
                    images.append(encoded)
            return {"images": images}
        except Exception as e:
            print(e)
            raise e
        finally:
            img.file.close()
            mask_img.file.close()

    return app