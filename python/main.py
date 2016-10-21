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
            cv2.drawContours(raw_image, [approx], -1, (0, 0, 0), 1)
            return np.float32(approx)
    return None


def draw(img, corners, imgpts):
    corner = tuple(corners[0].ravel())
    img = cv2.line(img, corner, tuple(imgpts[0].ravel()), (255,0,0), 5)
    img = cv2.line(img, corner, tuple(imgpts[1].ravel()), (0,255,0), 5)
    img = cv2.line(img, corner, tuple(imgpts[2].ravel()), (0,0,255), 5)
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
        [x4, y4, 0],
    ])


def generate_axis(a):
    axis = np.float32([[a,0,0], [0,a,0], [0,0,-a]]).reshape(-1,3)
    return axis


def get_corners_subpixels(raw_image, corners):
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER,
            30, 0.001)
    gray = cv2.cvtColor(raw_image, cv2.COLOR_BGR2GRAY)
    corners_subpxs = cv2.cornerSubPix(gray, corners,
            (11, 11), (-1, -1), criteria)
    return corners_subpxs


def create_canvas(image):
    return image.copy()


def get_projection_points(raw_image, table_corners):
    object_points = get_object_points(table_corners)
    corners_subpxs = get_corners_subpixels(raw_image, table_corners)
    camera_matrix = generate_camera_matrix(raw_image)
    distorsions = generate_distorsions()
    _, rvecs, tvecs, _ = cv2.solvePnPRansac(object_points, corners_subpxs,
            camera_matrix, distorsions)
    size = round(raw_image.shape[0] / 10)
    axis = generate_axis(size)
    projection_points, _ = cv2.projectPoints(axis, rvecs, tvecs,
            camera_matrix, distorsions)
    for p in projection_points:
        raw_image = cv2.circle(raw_image, tuple(p.ravel()[0:2]), 5, (0,0,0), -1)
    print('projection points: ', projection_points)
    return projection_points, corners_subpxs


def draw_cube(raw_image, table_corners):
    projection_points, corners_subpxs = get_projection_points(raw_image,
            table_corners)
    canvas = create_canvas(raw_image)
    canvas = draw(raw_image, corners_subpxs, projection_points)
    return canvas


def main():
    path = sys.argv[1]
    raw_image = cv2.imread(path)
    table_corners = search_for_table_corners(raw_image)
    if table_corners is None:
        raise Exception('there is no table!')
    result = draw_cube(raw_image, table_corners)
    show(result)


if __name__ == '__main__':
    main()
