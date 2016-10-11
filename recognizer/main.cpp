#include "opencv2/objdetect/objdetect.hpp"
#include "opencv2/highgui/highgui.hpp"
#include "opencv2/imgproc/imgproc.hpp"

#include <iostream>

int main() {
    cv::namedWindow("camera", cv::WINDOW_AUTOSIZE);
    cv::VideoCapture cap;
    cap.open(0);
    cv::Mat frame;
    cv::CascadeClassifier faceClassifier;
    faceClassifier.load("/usr/local/share/OpenCV/haarcascades/haarcascade_frontalface_alt.xml");
    std::vector<cv::Rect> faces;
    while (true) {
        cap >> frame;
        if (!frame.data)
            break;
        cv::Mat frame_gray;
        cv::cvtColor(frame, frame_gray, CV_BGR2GRAY);
        cv::equalizeHist(frame_gray, frame_gray );
        faceClassifier.detectMultiScale(frame_gray, faces, 1.1, 2, 0|CV_HAAR_SCALE_IMAGE, cv::Size(30, 30));
        for( size_t i = 0; i < faces.size(); i++ ) {
            cv::Point center( faces[i].x + faces[i].width*0.5, faces[i].y + faces[i].height*0.5 );
            cv::ellipse( frame, center, cv::Size( faces[i].width*0.5, faces[i].height*0.5), 0, 0, 360, cv::Scalar( 255, 0, 255 ), 4, 8, 0 );
        }
        cv::imshow("camera", frame);
        if (cv::waitKey(33) >= 0)
            break;
    }
    return 0;
}
