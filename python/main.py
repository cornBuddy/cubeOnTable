#!/usr/bin/python3
import sys
import numpy as np
import cv2


def main():
    path = sys.argv[1]
    raw_image = cv2.imread(path)
    cv2.namedWindow('image', cv2.WINDOW_NORMAL)
    cv2.imshow('image', raw_image)
    cv2.waitKey(0)
    cv2.destroyAllWidnows()


if __name__ == '__main__':
    main()
