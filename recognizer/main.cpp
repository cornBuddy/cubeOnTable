#include "opencv2/highgui/highgui.hpp"
#include "opencv2/imgproc/imgproc.hpp"

#include <iostream>

int main() {
    cv::namedWindow("camera", cv::WINDOW_AUTOSIZE);
    cv::VideoCapture cap;
    cap.open(0);
    cv::Mat frame;
    while (true) {
        cap >> frame;
        if (!frame.data)
            break;
        cv::imshow("camera", frame);
        if (cv::waitKey(33) >= 0)
            break;
    }
    return 0;
}
