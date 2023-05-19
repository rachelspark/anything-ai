# import cv2
# import numpy as np
# from PIL import Image
# from typing import Any, Dict, List, Tuple
# from io import BytesIO

# def load_img_to_array(img_p):
#     img = Image.open(BytesIO(img_p))
#     # if img.mode == "RGBA":
#     #     img = img.convert("RGB")
#     return np.array(img)

# def save_array_to_img(img_arr, img_p):
#     Image.fromarray(img_arr.astype(np.uint8)).save(img_p)

# def create_mask(img):
#     alpha = img[:, :, 3]
#     # binary_mask = np.where(alpha_channel == 255, 1, 0)
#     # binary_mask = binary_mask.astype('uint8')
#     # return binary_mask
#     # Threshold the alpha channel to create a binary image
#     threshold_value = 0 # adjust threshold value as needed
#     _, binary_alpha = cv2.threshold(alpha, threshold_value, 255, cv2.THRESH_BINARY)

#     # Invert the binary image
#     inverted_binary_alpha = cv2.bitwise_not(binary_alpha)

#     # Apply a morphological operation to remove small holes or noise in the binary image
#     kernel = np.ones((3, 3), np.uint8)
#     morphed_binary_alpha = cv2.erode(inverted_binary_alpha, kernel, iterations=1)
#     # Convert the binary image to a NumPy array
#     binary_mask = morphed_binary_alpha.astype(np.uint8)
#     return binary_mask

# def dilate_mask(mask, dilate_factor=15):
#     mask = mask.astype(np.uint8)
#     mask = cv2.dilate(
#         mask,
#         np.ones((dilate_factor, dilate_factor), np.uint8),
#         iterations=1
#     )
#     return mask

# def erode_mask(mask, dilate_factor=15):
#     mask = mask.astype(np.uint8)
#     mask = cv2.erode(
#         mask,
#         np.ones((dilate_factor, dilate_factor), np.uint8),
#         iterations=1
#     )
#     return mask

# def show_mask(ax, mask: np.ndarray, random_color=False):
#     mask = mask.astype(np.uint8)
#     if np.max(mask) == 255:
#         mask = mask / 255
#     if random_color:
#         color = np.concatenate([np.random.random(3), np.array([0.6])], axis=0)
#     else:
#         color = np.array([30 / 255, 144 / 255, 255 / 255, 0.6])
#     h, w = mask.shape[-2:]
#     mask_img = mask.reshape(h, w, 1) * color.reshape(1, 1, -1)
#     ax.imshow(mask_img)


# def show_points(ax, coords: List[List[float]], labels: List[int], size=375):
#     coords = np.array(coords)
#     labels = np.array(labels)
#     color_table = {0: 'red', 1: 'green'}
#     for label_value, color in color_table.items():
#         points = coords[labels == label_value]
#         ax.scatter(points[:, 0], points[:, 1], color=color, marker='*',
#                    s=size, edgecolor='white', linewidth=1.25)

# def get_clicked_point(img_path):
#     img = cv2.imread(img_path)
#     cv2.namedWindow("image")
#     cv2.imshow("image", img)

#     last_point = []
#     keep_looping = True

#     def mouse_callback(event, x, y, flags, param):
#         nonlocal last_point, keep_looping, img

#         if event == cv2.EVENT_LBUTTONDOWN:
#             if last_point:
#                 cv2.circle(img, tuple(last_point), 5, (0, 0, 0), -1)
#             last_point = [x, y]
#             cv2.circle(img, tuple(last_point), 5, (0, 0, 255), -1)
#             cv2.imshow("image", img)
#         elif event == cv2.EVENT_RBUTTONDOWN:
#             keep_looping = False

#     cv2.setMouseCallback("image", mouse_callback)

#     while keep_looping:
#         cv2.waitKey(1)

#     cv2.destroyAllWindows()

#     return last_point


# def resize_and_pad(image: np.ndarray, mask: np.ndarray, target_size: int = 512) -> Tuple[np.ndarray, np.ndarray]:
#     """
#     Resizes an image and its corresponding mask to have the longer side equal to `target_size` and pads them to make them
#     both have the same size. The resulting image and mask have dimensions (target_size, target_size).

#     Args:
#         image: A numpy array representing the image to resize and pad.
#         mask: A numpy array representing the mask to resize and pad.
#         target_size: An integer specifying the desired size of the longer side after resizing.

#     Returns:
#         A tuple containing two numpy arrays - the resized and padded image and the resized and padded mask.
#     """
#     height, width, _ = image.shape
#     max_dim = max(height, width)
#     scale = target_size / max_dim
#     new_height = int(height * scale)
#     new_width = int(width * scale)
#     image_resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_LINEAR)
#     mask_resized = cv2.resize(mask, (new_width, new_height), interpolation=cv2.INTER_LINEAR)
#     pad_height = target_size - new_height
#     pad_width = target_size - new_width
#     top_pad = pad_height // 2
#     bottom_pad = pad_height - top_pad
#     left_pad = pad_width // 2
#     right_pad = pad_width - left_pad
#     image_padded = np.pad(image_resized, ((top_pad, bottom_pad), (left_pad, right_pad), (0, 0)), mode='constant')
#     mask_padded = np.pad(mask_resized, ((top_pad, bottom_pad), (left_pad, right_pad)), mode='constant')
#     return image_padded, mask_padded, (top_pad, bottom_pad, left_pad, right_pad)

# def recover_size(image_padded: np.ndarray, mask_padded: np.ndarray, orig_size: Tuple[int, int], 
#                  padding_factors: Tuple[int, int, int, int]) -> Tuple[np.ndarray, np.ndarray]:
#     """
#     Resizes a padded and resized image and mask to the original size.

#     Args:
#         image_padded: A numpy array representing the padded and resized image.
#         mask_padded: A numpy array representing the padded and resized mask.
#         orig_size: A tuple containing two integers - the original height and width of the image before resizing and padding.

#     Returns:
#         A tuple containing two numpy arrays - the recovered image and the recovered mask with dimensions `orig_size`.
#     """
#     h,w,c = image_padded.shape
#     top_pad, bottom_pad, left_pad, right_pad = padding_factors
#     image = image_padded[top_pad:h-bottom_pad, left_pad:w-right_pad, :]
#     mask = mask_padded[top_pad:h-bottom_pad, left_pad:w-right_pad]
#     image_resized = cv2.resize(image, orig_size[::-1], interpolation=cv2.INTER_LINEAR)
#     mask_resized = cv2.resize(mask, orig_size[::-1], interpolation=cv2.INTER_LINEAR)
#     return image_resized, mask_resized
