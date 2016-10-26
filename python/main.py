#!/usr/bin/python3
import sys
import numpy as np
import cv2

from search import (search_for_table_corners,
        search_plane_rectangle_on_image_and_draw_cube_on_it)
from show import *
from tracking import search_for_tracking_object


if __name__ == '__main__':
    if len(sys.argv) == 1:
        roi_hist, track_window = search_for_tracking_object()
        print('track_window', track_window, '\n', '-' * 70)
        cap = cv2.VideoCapture(0)
        # Setup the termination criteria, either 10 iteration or move by
        # atleast 1 pt
        term_crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT,
            1, 1)
        while True:
            frame = cap.read()[1]
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            dst = cv2.calcBackProject([hsv], [0], roi_hist, [0, 180], 1)
            # apply meanshift to get the new location
            # FIXME: track_window is static
            track_window = cv2.meanShift(dst, track_window,
                    term_crit)[1]
            print('track_window', track_window, '\n', '-' * 70)
            # Draw it on image
            x, y, w, h = track_window
            res = cv2.rectangle(frame, (x, y), (x + w, y + h), 255, 2)
            cv2.imshow('img2', res)
            k = cv2.waitKey(60) & 0xff
            if k == 27:
                cv2.destroyAllWindows()
                cap.release()
                break
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
