#!/usr/bin/python3
import sys
import numpy as np
import cv2

from search import (search_for_table_corners,
        search_plane_rectangle_on_image_and_draw_cube_on_it)
from show import *
from tracking import search_for_tracking_object, update_track_window


if __name__ == '__main__':
    if len(sys.argv) == 1:
        roi_hist, track_window = search_for_tracking_object()
        print('track_window', track_window, '\n', '-' * 70)
        cap = cv2.VideoCapture(0)
        # Setup the termination criteria, either 10 iteration or move by
        # atleast 1 pt
        while True:
            frame = cap.read()[1]
            track_window = update_track_window(frame, track_window,
                    roi_hist)
            print('track_window', track_window, '\n', '-' * 70)
            # Draw it on image
            x, y, w, h = track_window
            roi = frame[x:x + w, y:y + h]
            # relative to roi
            corners = search_for_table_corners(roi)
            if corners is None:
                print('table gone')
                break
            else:
                # TODO: make corners absolete
#               # TODO: draw cube and show result
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
