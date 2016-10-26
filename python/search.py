import numpy as np
import cv2

from drawing import draw_cube


CANNY_LOW = 30
CANNY_HIGH = 200
GAUSIAN = (5, 5)

IS_CLOSED = True
DELTA = 0.01

BLACK = (0, 0, 0)
YELLOW = (0, 255, 255)

TABLE_WIDTH = 1
TABLE_HEIGHT = 2


def search_plane_rectangle_on_image_and_draw_cube_on_it(raw_image):
    table_corners = search_for_table_corners(raw_image)[0]
    if table_corners is None:
        raise Exception('there is no table!')
    result = draw_cube(raw_image, table_corners)
    return result


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
        if len(approx) == 4 and cv2.contourArea(approx) > 100:
            cv2.drawContours(raw_image, [approx], -1, BLACK, 4)
            x, y, w, h = cv2.boundingRect(approx)
            rect = ((x, y), (w, h))
            cv2.rectangle(raw_image, rect[0], (x + w, y + h), YELLOW, 2)
            return np.float32(approx), rect
    return None


def get_projection_points(raw_image, table_corners):
    rvecs, tvecs, mcam, corn2 = _estimate_pose(raw_image,
            table_corners)
    axis = _generate_axis()
    dist= _generate_distorsions()
    projection_points = cv2.projectPoints(axis, rvecs, tvecs, mcam, dist)[0]
    print('projection_points:\n', projection_points, '\n', '-' * 70)
    return projection_points, corn2


def search_for_tracked_object(image):
    raise NotImplementedError()


def _generate_camera_matrix(image):
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


def _generate_distorsions():
    return np.zeros((1, 4), np.float32)


def _get_object_points(corners):
    return np.float32([
        [0, 0, 0],
        [TABLE_WIDTH, 0, 0],
        [0, TABLE_HEIGHT, 0],
        [TABLE_WIDTH, TABLE_HEIGHT, 0],
    ])


def _generate_axis():
    a = 0.1
    axis = np.float32([[0,0,0], [0,a,0], [a,a,0], [a,0,0],
                   [0,0,-a],[0,a,-a],[a,a,-a],[a,0,-a] ])
    return axis


def _get_corners_subpixels(raw_image, corners):
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER,
            30, 0.001)
    gray = cv2.cvtColor(raw_image, cv2.COLOR_BGR2GRAY)
    corners_subpxs = cv2.cornerSubPix(gray, corners,
            (11, 11), (-1, -1), criteria)
    return corners_subpxs


def _estimate_pose(raw_image, table_corners):
    print('table_corners:\n', table_corners, '\n', '-' * 70)
    object_points = _get_object_points(table_corners)
    print('object_points:\n', object_points, '\n', '-' * 70)
    corners_subpxs = _get_corners_subpixels(raw_image, table_corners)
    print('corners_subpxs:\n', corners_subpxs, '\n', '-' * 70)
    camera_matrix = _generate_camera_matrix(raw_image)
    print('camera_matrix:\n', camera_matrix, '\n', '-' * 70)
    distorsions = _generate_distorsions()
    rotation_vec, translation_vec = cv2.solvePnP(object_points,
            corners_subpxs, camera_matrix, distorsions,
            flags=cv2.SOLVEPNP_P3P)[1:3]
    print('rotation_vec:\n', rotation_vec, '\n', '-' * 70)
    print('translation_vec:\n', translation_vec, '\n', '-' * 70)
    return rotation_vec, translation_vec, camera_matrix, corners_subpxs

