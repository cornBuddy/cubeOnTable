#!/usr/bin/python3
import sys
import numpy as np
import cv2


CANNY_LOW = 300
CANNY_HIGH = 400

MIN_RECT_AREA = 100
IS_CLOSED = True
DELTA = 0.1


def filt(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edged = cv2.Canny(gray, CANNY_LOW, CANNY_HIGH)
    blured = cv2.GaussianBlur(edged, (5,5),0)
    return blured


def find_biggest_rect_contour(cnts):
    biggest = sorted(cnts, key=cv2.contourArea, reverse=True)[0]
    p1 = sorted(biggest, key=itemgetter(0), reverse=False)[0]
    p2 = sorted(biggest, key=itemgetter(1), reverse=False)[0]
    p3 = sorted(biggest, key=itemgetter(0), reverse=True)[0]
    p4 = sorted(biggest, key=itemgetter(1), reverse=True)[0]
    return p1, p2, p3, p4


def show(image):
    cv2.imshow('image', image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()



def search_for_table_corners(raw_image):
    filtered = filt(raw_image)
    show(filtered)
    _, cnts, _ = cv2.findContours(filtered, cv2.RETR_TREE,
            cv2.CHAIN_APPROX_SIMPLE)
    biggest = sorted(cnts, key=cv2.contourArea, reverse=True)[0]
    p1 = sorted(biggest, key=lambda x: x[0][0], reverse=False)[0]
    p2 = sorted(biggest, key=lambda x: x[0][1], reverse=False)[0]
    p3 = sorted(biggest, key=lambda x: x[0][0], reverse=True)[0]
    p4 = sorted(biggest, key=lambda x: x[0][1], reverse=True)[0]
    return p1, p2, p3, p4


def main():
    path = sys.argv[1]
    raw_image = cv2.imread(path)
    corners = search_for_table_corners(raw_image)
    print(corners)


if __name__ == '__main__':
    main()
