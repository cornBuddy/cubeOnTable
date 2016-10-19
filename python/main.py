#!/usr/bin/python3
import sys
import numpy as np
import cv2


CANNY_LOW = 30
CANNY_HIGH = 200
GAUSIAN = (5, 5)

MIN_RECT_AREA = 100
IS_CLOSED = True
DELTA = 0.01


def filt(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edged = cv2.Canny(image, CANNY_LOW, CANNY_HIGH)
    blured = cv2.GaussianBlur(edged, GAUSIAN, 5)
    return blured


def show(image):
    cv2.namedWindow('image', cv2.WINDOW_NORMAL)
    cv2.imshow('image', image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


def search_for_table_corners(raw_image):
    filtered = filt(raw_image)
    show(filtered)
    _, cnts, _ = cv2.findContours(filtered,
            cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    cnts = sorted(cnts, key=cv2.contourArea, reverse=True)
    biggest = None
    for cnt in cnts:
        cnt_len = cv2.arcLength(cnt, IS_CLOSED)
        approx = cv2.approxPolyDP(cnt, DELTA * cnt_len, IS_CLOSED)
        if len(approx) == 4:
            biggest = cnt
            cv2.drawContours(raw_image, [biggest], -1, (0, 255, 0), 2)
            show(raw_image)
            break
    return biggest


def main():
    path = sys.argv[1]
    raw_image = cv2.imread(path)
    table = search_for_table_corners(raw_image)
    if table is None:
        raise Exception('there is no table!')
    print(table)


if __name__ == '__main__':
    main()
