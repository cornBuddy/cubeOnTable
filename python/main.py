#!/usr/bin/python3
import sys
import numpy as np
import cv2


CANNY_LOW = 200
CANNY_HIGH = 200
GAUSSIAN_BLUR_SIZE = (7, 7)


def filt(image):
    copy = image.copy()
    edges = cv2.Canny(copy, CANNY_LOW, CANNY_HIGH)
    blured = cv2.GaussianBlur(edges, GAUSSIAN_BLUR_SIZE, 0)
    return blured


def main():
    path = sys.argv[1]
    raw_image = cv2.imread(path)
    filtered = filt(raw_image)
    cv2.imshow('filtered', filtered)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


if __name__ == '__main__':
    main()
