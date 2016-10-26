import cv2
import numpy as np

from search import search_for_table_corners


RANGE_LOW = np.array((0., 60.,32.))
RANGE_HIGH = np.array((180., 255., 255.))

# b = none
# while b is none
#   frame <- capture from video camera
#   b <- bounding rectangle for table
# roi <- frame[b]
# tracking roi
# while true:
#   frame <- capture from video camera
#   update roi using tracking
#   find table corners inside roi
#   draw cube on updated table coordinates


def get_tracking_roi(raw_image):
    cap = cv2.VideoCapture(0)
    bounding_rect = None
    while bounding_rect is None:
        frame = cap.read()[1]
        bounding_rect = search_for_table_corners(frame)[1]
    (x, y), (w, h) = bounding_rect
    roi = frame[x:x + w, y:y + h]
    return roi, bounding_rect


def normalize_roi(roi):
    hsv_roi =  cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv_roi, RANGE_LOW, RANGE_HIGH)
    roi_hist = cv2.calcHist([hsv_roi], [0], mask, [180], [0, 180])
    cv2.normalize(roi_hist, roi_hist, 0, 255, cv2.NORM_MINMAX)
    return roi_hist
