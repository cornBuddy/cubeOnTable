import numpy as np
import cv2

import search as s


BLUE = (255, 0, 0)
GREEN = (0, 255, 0)
RED = (0, 0, 255)


def draw_cube(raw_image, table_corners):
    projection_points, corners_subpxs = s.get_projection_points(raw_image,
            table_corners)
    canvas = _create_canvas(raw_image)
    canvas = _draw(raw_image, corners_subpxs, projection_points)
    return canvas


def _draw(img, corners, imgpts):
    imgpts = np.int32(imgpts).reshape(-1, 2)
    # draw ground floor in green
    img = cv2.drawContours(img, [imgpts[:4]], -1, GREEN, -3)
    # draw pillars in blue color
    for i, j in zip(range(4), range(4, 8)):
        img = cv2.line(img, tuple(imgpts[i]), tuple(imgpts[j]), BLUE, 3)
    # draw top layer in red color
    img = cv2.drawContours(img, [imgpts[4:]], -1, RED, 3)
    return img


def _create_canvas(image):
    return image.copy()


