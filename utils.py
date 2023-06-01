import cv2
import numpy as np
from PIL import Image
from typing import Any, Dict, List, Tuple
from io import BytesIO

# utils from Inpaint Anything repo (https://github.com/geekyutao/Inpaint-Anything/blob/main/utils/utils.py)

def dilate_mask(mask, dilate_factor=20):
    mask = mask.astype(np.uint8)
    mask = cv2.dilate(
        mask,
        np.ones((dilate_factor, dilate_factor), np.uint8),
        iterations=1
    )
    return mask

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

def recover_size(image_padded: np.ndarray, mask_padded: np.ndarray, orig_size: Tuple[int, int], 
                 padding_factors: Tuple[int, int, int, int]) -> Tuple[np.ndarray, np.ndarray]:
    """
    Resizes a padded and resized image and mask to the original size.

    Args:
        image_padded: A numpy array representing the padded and resized image.
        mask_padded: A numpy array representing the padded and resized mask.
        orig_size: A tuple containing two integers - the original height and width of the image before resizing and padding.

    Returns:
        A tuple containing two numpy arrays - the recovered image and the recovered mask with dimensions `orig_size`.
    """
    h,w,_ = image_padded.shape
    top_pad, bottom_pad, left_pad, right_pad = padding_factors
    image = image_padded[top_pad:h-bottom_pad, left_pad:w-right_pad, :]
    mask = mask_padded[top_pad:h-bottom_pad, left_pad:w-right_pad]
    image_resized = cv2.resize(image, orig_size[::-1], interpolation=cv2.INTER_LINEAR)
    mask_resized = cv2.resize(mask, orig_size[::-1], interpolation=cv2.INTER_LINEAR)
    return image_resized, mask_resized