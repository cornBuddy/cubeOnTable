import sys
import cv2

from search import filt


def show_frame(image):
    cv2.namedWindow('image', cv2.WINDOW_NORMAL)
    cv2.imshow('image', image)
    end = cv2.waitKey(1) == 27
    if end:
        cv2.destroyAllWindows()
    return end


def show_image(image):
    cv2.namedWindow('image', cv2.WINDOW_NORMAL)
    cv2.imshow('image', image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


def show_filtered():
    path = sys.argv[1]
    raw_image = cv2.imread(path)
    result = filt(raw_image)
    show_image(result)

