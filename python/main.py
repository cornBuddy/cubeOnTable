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
BLACK = (0, 0, 0)

TABLE_WIDTH = 1
TABLE_HEIGHT = 2


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
            cv2.drawContours(raw_image, [approx], -1, BLACK, 4)
            return np.float32(approx)
    return None


def draw(img, corners, imgpts):
    #corner = tuple(corners[0].ravel())
    #img = cv2.line(img, corner, tuple(imgpts[0].ravel()), BLUE, 5)
    #img = cv2.line(img, corner, tuple(imgpts[1].ravel()), GREEN, 5)
    #img = cv2.line(img, corner, tuple(imgpts[2].ravel()), RED, 5)
    #return img
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
    return np.float32([
        [0, 0, 0],
        [TABLE_WIDTH, 0, 0],
        [0, TABLE_HEIGHT, 0],
        [TABLE_WIDTH, TABLE_HEIGHT, 0],
    ])


def generate_axis():
    #axis = np.float32([[1,0,0], [0,1,0], [0,0,-1]]).reshape(-1,3)
    axis = np.float32([[0,0,0], [0,1,0], [1,1,0], [1,0,0],
                   [0,0,-1],[0,1,-1],[1,1,-1],[1,0,-1] ])
    return axis


def get_corners_subpixels(raw_image, corners):
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER,
            30, 0.001)
    gray = cv2.cvtColor(raw_image, cv2.COLOR_BGR2GRAY)
    corners_subpxs = cv2.cornerSubPix(gray, corners,
            (11, 11), (-1, -1), criteria)
    return corners_subpxs


def estimate_pose(raw_image, table_corners):
    print('table_corners:\n', table_corners, '\n', '-' * 70)
    object_points = get_object_points(table_corners)
    print('object_points:\n', object_points, '\n', '-' * 70)
    corners_subpxs = get_corners_subpixels(raw_image, table_corners)
    print('corners_subpxs:\n', corners_subpxs, '\n', '-' * 70)
    camera_matrix = generate_camera_matrix(raw_image)
    print('camera_matrix:\n', camera_matrix, '\n', '-' * 70)
    distorsions = generate_distorsions()
    rotation_vec, translation_vec = cv2.solvePnP(object_points,
            corners_subpxs, camera_matrix, distorsions,
            flags=cv2.SOLVEPNP_P3P)[1:3]
    print('rotation_vec:\n', rotation_vec, '\n', '-' * 70)
    print('translation_vec:\n', translation_vec, '\n', '-' * 70)
    return rotation_vec, translation_vec, camera_matrix, distorsions, \
        corners_subpxs


def create_canvas(image):
    return image.copy()


def get_projection_points(raw_image, table_corners):
    rvecs, tvecs, mcam, dist, corn2 = estimate_pose(raw_image, table_corners)
    axis = generate_axis()
    projection_points = cv2.projectPoints(axis, rvecs, tvecs, mcam, dist)[0]
    print('projection_points:\n', projection_points, '\n', '-' * 70)
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
    return result


def show_filtered():
    path = sys.argv[1]
    raw_image = cv2.imread(path)
    result = filt(raw_image)
    show(result)


if __name__ == '__main__':
    if len(sys.argv) == 3:
        result = main()
        output_path = sys.argv[2]
        cv2.imwrite(output_path, result)
    else:
        show_filtered()

