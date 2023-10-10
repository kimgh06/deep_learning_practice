import { useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { DrawingUtils } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils"
import { Camera } from '@mediapipe/camera_utils';

export default function UsingMediaPipe() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const resultsRef = useRef(null);

  const onResults = useCallback((results) => {
    resultsRef.current = results;
    const canvasCtx = canvasRef.current?.getContext("2d");
    drawCanvas(canvasCtx, results);
  }, []);

  // 초기 설정
  useEffect(() => {
    const video = document.getElementsByTagName('video');
    console.log(video)
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 5,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null) {
      const camera = new Camera(webcamRef.current?.video, {
        onFrame: async () => {
          await hands.send({ image: webcamRef.current?.video });
          OutputData();
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, [onResults]);

  /*  랜드마크들의 좌표를 콘솔에 출력 */
  const OutputData = () => {
    const results = resultsRef?.current;
    console.log(results.multiHandLandmarks);
  };

  return (
    <div>
      <Webcam className="input_video" ref={webcamRef} mirrored style={{ display: 'none' }} />
      <canvas className="output_canvas" width={640} height={480} ref={canvasRef}></canvas>
    </div>
  );
}

const drawCanvas = (ctx, results) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  // canvas의 좌우 반전
  ctx.scale(-1, 1);
  ctx.translate(-width, 0);
  // capture image 그리기
  ctx.drawImage(results.image, 0, 0, width, height);
  // 손의 묘사
  if (results.multiHandLandmarks) {
    // 골격 묘사
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });
      drawLandmarks(ctx, landmarks, {
        color: "#FF0000",
        lineWidth: 1,
        radius: 5,
      });
    }
  }
  ctx.restore();
};