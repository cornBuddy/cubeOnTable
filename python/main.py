#!/usr/bin/python3
import sys
import numpy as np
import cv2

from drawing import draw_cube
from search import search_for_table_corners, filt


def show(image):
    cv2.namedWindow('image', cv2.WINDOW_NORMAL)
    cv2.imshow('image', image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

def search_plane_rectangle_on_image_and_draw_cube_on_it():
    path = sys.argv[1]
    raw_image = cv2.imread(path)
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
    if len(sys.argv) == 3:
        result = search_plane_rectangle_on_image_and_draw_cube_on_it()
        show(result)
        output_path = sys.argv[2]
        cv2.imwrite(output_path, result)
    else:
        show_filtered()

