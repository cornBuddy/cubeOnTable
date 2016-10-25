#!/usr/bin/python3
import sys
import numpy as np
import cv2

from drawing import draw_cube
from search import search_for_table_corners, filt


def show(image):
    cv2.namedWindow('image', cv2.WINDOW_NORMAL)
    cv2.imshow('image', image)
    end = cv2.waitKey(1) == 27
    if end:
        cv2.destroyAllWindows()
    return end

def search_plane_rectangle_on_image_and_draw_cube_on_it(raw_image):
    table_corners = search_for_table_corners(raw_image)
    if table_corners is None:
        raise Exception('there is no table!')
    result = draw_cube(raw_image, table_corners)
    return result


def show_filtered():
    path = sys.argv[1]
    raw_image = cv2.imread(path)
    result = filt(raw_image)
    show(result)


if __name__ == '__main__':
    if len(sys.argv) == 1:
        capture = cv2.VideoCapture(0)
        while True:
            frame = capture.read()[1]
            if show(frame):
                break
        capture.release()
    elif len(sys.argv) == 3:
        path = sys.argv[1]
        img = cv2.imread(path)
        result = search_plane_rectangle_on_image_and_draw_cube_on_it(img)
        show(result)
        output_path = sys.argv[2]
        cv2.imwrite(output_path, result)
    else:
        show_filtered()

