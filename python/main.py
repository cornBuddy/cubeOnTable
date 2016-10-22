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
            cv2.drawContours(raw_image, [approx], -1, (0, 0, 0), 4)
            return np.float32(approx)
    return None


def draw(img, corners, imgpts):
    corner = tuple(corners[0].ravel())
    img = cv2.line(img, corner, tuple(imgpts[0].ravel()), BLUE, 5)
    img = cv2.line(img, corner, tuple(imgpts[1].ravel()), GREEN, 5)
    img = cv2.line(img, corner, tuple(imgpts[2].ravel()), RED, 5)
    return img


def generate_camera_matrix(image):
    h, w = image.shape[:2]
    # let it be full frame matrix
    sx, sy = (36, 24)
    # focus length
    f = 50
    fx = w * f / sx
    fy = h * f / sy
    cx = w / 2
    cy = h / 2
    mtx = np.zeros((3, 3), np.float32)
    mtx[0, 0] = fx # [ fx  0  cx ]
    mtx[0, 2] = cx # [  0 fy  cy ]
    mtx[1, 1] = fy # [  0  0   1 ]
    mtx[1, 2] = cy
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


def get_rt_matrix(rmat, tvec):
    rtmat = np.zeros((3, 4), np.float32)


def estimate_pose(raw_image, table_corners):
    object_points = get_object_points(table_corners)
    corners_subpxs = get_corners_subpixels(raw_image, table_corners)
    camera_matrix = generate_camera_matrix(raw_image)
    distorsions = generate_distorsions()
    rvec = np.zeros((3, 1), np.float32)
    tvec = np.zeros((3, 1), np.float32)
    rotation_vec, translation_vec = cv2.solvePnPRansac(object_points,
            corners_subpxs, camera_matrix, distorsions, iterationsCount=500,
            reprojectionError=50)[1:3]
    print('rotation vector: \n', rotation_vec, '\n', '-' * 70)
    print('translation vector: \n', translation_vec, '\n', '-' * 70)
    return rotation_vec, translation_vec, camera_matrix, distorsions, \
        corners_subpxs


def create_canvas(image):
    return image.copy()


def get_projection_points(raw_image, table_corners):
    rvecs, tvecs, mcam, dist, corn2 = estimate_pose(raw_image, table_corners)
    size = round(raw_image.shape[0] / 10)
    axis = generate_axis(size)
    projection_points = cv2.projectPoints(axis, rvecs, tvecs, mcam, dist)[0]
    return projection_points, corn2


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


def show_filtered():
    path = sys.argv[1]
    raw_image = cv2.imread(path)
    result = filt(raw_image)
    show(result)


if __name__ == '__main__':
    test = len(sys.argv) == 3
    if test:
        show_filtered()
    else:
        main()

