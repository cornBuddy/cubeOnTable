#!/usr/bin/python3
import sys
import numpy as np
import cv2

from drawing import draw_cube
from search import search_for_table_corners
from show import *


def search_plane_rectangle_on_image_and_draw_cube_on_it(raw_image):
    table_corners = search_for_table_corners(raw_image)[0]
    if table_corners is None:
        raise Exception('there is no table!')
    result = draw_cube(raw_image, table_corners)
    return result


if __name__ == '__main__':
    if len(sys.argv) == 1:
        # TODO: write some code
        pass
    elif len(sys.argv) == 2:
        show_filtered()
    elif len(sys.argv) == 3:
        path = sys.argv[1]
        img = cv2.imread(path)
        result = search_plane_rectangle_on_image_and_draw_cube_on_it(img)
        show_image(result)
        output_path = sys.argv[2]
        cv2.imwrite(output_path, result)
    else:
        raise Exception('wrong arguments')
