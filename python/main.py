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

BLUE = (255, 0, 0)
GREEN = (0, 255, 0)
RED = (0, 0, 255)

FOCAL = 50 # [25; 50] -> [focal; plane]


def show(image):
    cv2.namedWindow('image', cv2.WINDOW_NORMAL)
    cv2.imshow('image', image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


def filt(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edged = cv2.Canny(image, CANNY_LOW, CANNY_HIGH)
    blured = cv2.GaussianBlur(edged, GAUSIAN, 5)
    return blured


def search_for_table_corners(raw_image):
    filtered = filt(raw_image)
    _, cnts, _ = cv2.findContours(filtered,
            cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    cnts = sorted(cnts, key=cv2.contourArea, reverse=True)
    for cnt in cnts:
        cnt_len = cv2.arcLength(cnt, IS_CLOSED)
        approx = cv2.approxPolyDP(cnt, DELTA * cnt_len, IS_CLOSED)
        if len(approx) == 4:
            # return sorted(approx, key=lambda x: x[0][0], reverse=False)
            return approx
    return None


def draw(img, corners, imgpts):
    imgpts = np.int32(imgpts).reshape(-1,2)
    # draw ground floor in green
    img = cv2.drawContours(img, [imgpts[:4]],-1,(0,255,0),-3)
    # draw pillars in blue color
    for i,j in zip(range(4),range(4,8)):
        img = cv2.line(img, tuple(imgpts[i]), tuple(imgpts[j]),(255),3)
    # draw top layer in red color
    img = cv2.drawContours(img, [imgpts[4:]],-1,(0,0,255),3)
    return img


def generate_camera_matrix(image):
    fx = 0.5 + FOCAL / 50
    h, w, _ = image.shape
    mtx = np.zeros((3, 3), np.float32)
    mtx[0, 0] = mtx[1, 1] = fx * w
    mtx[0, 2] = 0.5 * (w - 1)
    mtx[1, 2] = 0.5 * (h - 1)
    mtx[2, 2] = 1
    return mtx


def generate_distorsions():
    return np.zeros((1, 4), np.float32)


def get_object_points(corners):
    x1, y1 = corners[0][0]
    x2, y2 = corners[1][0]
    x3, y3 = corners[2][0]
    x4, y4 = corners[3][0]
    return np.float32([
        [x1, y1, 0],
        [x2, y2, 0],
        [x3, y3, 0],
        [x4, y4, 0]
    ])


def draw_cube(raw_image, table_corners):
    object_points = get_object_points(table_corners)
    axis = np.float32([[0, 0, 0], [0, 3, 0], [3, 3, 0], [3, 0, 0],
            [0, 0, -3], [0, 3, -3], [3, 3, -3], [3, 0, -3]])
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER,
            30, 0.001)
    gray = cv2.cvtColor(raw_image, cv2.COLOR_BGR2GRAY)
    corners_subpxs = cv2.cornerSubPix(gray, table_corners,
            (11, 11), (-1, -1), criteria)
    canvas = raw_image.copy()
    camera_matrix = generate_camera_matrix(canvas)
    distorsions = generate_distorsions()
    _, rvecs, tvecs = cv2.solvePnP(object_points, corners_subpxs,
            camera_matrix, distorsions)
    projection_points, _ = cv2.projectPoints(axis, rvecs, tvecs,
            camera_matrix, distorsions)
    canvas = draw(raw_image, corners_subpxs, projection_points)
    return canvas


def main():
    path = sys.argv[1]
    raw_image = cv2.imread(path)
    table_corners = search_for_table_corners(raw_image)
    if table_corners is None:
        raise Exception('there is no table!')
    result = draw_cube(raw_image, np.float32(table_corners))
    show(result)


if __name__ == '__main__':
    main()
