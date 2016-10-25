#!/usr/bin/python3
import sys
import numpy as np
import cv2

from drawing import draw_cube
from search import search_for_table_corners, filt


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


def search_plane_rectangle_on_image_and_draw_cube_on_it(raw_image):
    table_corners = search_for_table_corners(raw_image)[0]
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
        corners = None
        while True:
            frame = capture.read()[1]
            while corners is None:
                print('searching...')
                corners = search_for_table_corners(frame)
            print('found!', corners)
        rect = corners[1]
        x, y = rect[0]
        w, h = rect[1]
        roi = frame[x:w, y:h]
        hsv_roi =  cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hsv_roi, np.array((0., 60.,32.)),
                np.array((180., 255., 255.)))
        roi_hist = cv2.calcHist([hsv_roi], [0], mask, [180], [0, 180])
        cv2.normalize(roi_hist, roi_hist, 0, 255, cv2.NORM_MINMAX)
        while True:
            frame = capture.read()[1]
            # TODO: write some code
        capture.release()
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
