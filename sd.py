from __future__ import annotations

import io
import os
import time
from pathlib import Path

from common import stub

import modal
import numpy as np

model_id = "stabilityai/stable-diffusion-2-inpainting"
cache_path = "/vol/cache"

def download_models():
    import diffusers
    import torch

    hugging_face_token = os.environ["HUGGINGFACE_TOKEN"]

    # Downloads all other models.
    pipe = diffusers.StableDiffusionInpaintPipeline.from_pretrained(
        model_id,
        use_auth_token=hugging_face_token,
        revision="fp16",
        torch_dtype=torch.float16,
        cache_dir=cache_path,
    )
    pipe.save_pretrained(cache_path, safe_serialization=True)


image = (
    modal.Image.debian_slim(python_version="3.10")
    .pip_install(
        "accelerate",
        "diffusers[torch]>=0.15.1",
        "ftfy",
        "torch",
        "torchvision",
        "transformers~=4.25.1",
        "triton",
        "safetensors",
        "torch>=2.0",
        "opencv-python-headless",
        "pillow",
        "matplotlib",
    )
    .pip_install("xformers", pre=True)
    .run_function(
        download_models,
        secrets=[modal.Secret.from_name("huggingface")],
    )
)
stub.sd_image = image

@stub.cls(image=stub.sd_image, gpu="A10G")
class StableDiffusion:
    def __enter__(self):
        import diffusers
        import torch

        torch.backends.cuda.matmul.allow_tf32 = True
        
        self.pipe = diffusers.StableDiffusionInpaintPipeline.from_pretrained(
            cache_path,
            low_cpu_mem_usage=True,
            device_map="auto",
        )
        self.pipe.enable_xformers_memory_efficient_attention()

    @modal.method()
    def run_inference(
        self, prompt: str, front_img: np.ndarray, mask_img: np.ndarray, guidance_scale: float = 7.5, steps: int = 50
    ) -> list[bytes]:
        import torch
        
        with torch.inference_mode():
            with torch.autocast("cuda"):
                image = self.pipe(
                    prompt=prompt,
                    image=front_img,
                    mask_image=mask_img,
                    guidance_scale=guidance_scale,
                    num_inference_steps=steps,
                ).images[0]

        # Convert to PNG bytes
        image_output = []
        with io.BytesIO() as buf:
            image.save(buf, format="PNG")
            image_output.append(buf.getvalue())
        return image_output

@stub.local_entrypoint()
def entrypoint(
    prompt: str, samples: int = 5, steps: int = 10, batch_size: int = 1
):
    dir = Path("/tmp/stable-diffusion")
    if not dir.exists():
        dir.mkdir(exist_ok=True, parents=True)

    sd = StableDiffusion()
    for i in range(samples):
        t0 = time.time()
        images = sd.run_inference.call(prompt, steps, batch_size)
        total_time = time.time() - t0
        print(
            f"Sample {i} took {total_time:.3f}s ({(total_time)/len(images):.3f}s / image)."
        )
        for j, image_bytes in enumerate(images):
            output_path = dir / f"output_{j}_{i}.png"
            print(f"Saving it to {output_path}")
            with open(output_path, "wb") as f:
                f.write(image_bytes)