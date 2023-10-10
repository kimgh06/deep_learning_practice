import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
// import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from 'three';

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Camera } from '@mediapipe/camera_utils';

export default function UsingMediaPipe() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const resultsRef = useRef(null);
  const [result, setResult] = useState([]);

  const onResults = useCallback((results) => {
    resultsRef.current = results;
    const canvasCtx = canvasRef.current?.getContext("2d");
    drawCanvas(canvasCtx, results);
  }, []);
  // 초기 설정
  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 2,
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
    // if (results.multiHandLandmarks.length !== 0) {
    setResult(results.multiHandLandmarks);
    // }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <Webcam className="input_video" ref={webcamRef} mirrored style={{ display: 'none' }} />
      <canvas className="output_canvas" width={640} height={480} ref={canvasRef}></canvas>
      <Canvas camera={{ position: [5, 5, 15] }} style={{ width: '500px', height: '500px' }}>
        {/* <OrbitControls /> */}
        <ambientLight />
        <LookatComponent />
        <pointLight position={[10, 10, 10]} />
        <gridHelper args={[20, 20]} />
        <axesHelper args={[15]} />
        <MakeHand result={result} />
      </Canvas>
    </div >
  );
}

function MakeHand({ result }) {
  const hands = useRef(null);
  return <mesh ref={hands} >
    {result.map((i, nums) => {
      return <>
        <Makeline array={i.slice(0, 5)} />
        <Makeline array={i.slice(5, 9)} />
        <Makeline array={i.slice(9, 13)} />
        <Makeline array={i.slice(13, 17)} />
        <Makeline array={i.slice(17, 21)} />
        <Makeline array={[i[0], i[5], i[9], i[13], i[17], i[0]]} />
        {/* {i?.map((j, n) => <mesh key={n} position={[10 - j.x * 10, 10 - j.y * 10, j.z * 10 + 5]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <Html style={{ fontSize: '10px' }}>{int2Alpha(nums - 32)}.{int2Alpha(n)}</Html>
          <meshStandardMaterial color={'orange'} />
        </mesh>)} */}
      </>
    })}</mesh >
}

function Makeline({ array }) {
  const points = [];
  //eslint-disable-next-line
  array.map((i, n) => {
    points.push(new THREE.Vector3(10 - i.x * 10, 10 - i.y * 10, i.z * 10 + 5));
  })
  const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
  return <group>
    <line geometry={lineGeo}>
      <lineBasicMaterial attach={'material'} color={'green'} linewidth={2} linecap={'round'} linejoin={'round'} />
    </line>
  </group>;
}

//eslint-disable-next-line
function int2Alpha(n) {
  return String.fromCharCode(('a'.charCodeAt()) + n);
}

const LookatComponent = () => {
  const { camera } = useThree();
  const target = useRef();
  useFrame(e => {
    camera.lookAt(target.current.position);
  });
  return <mesh position={[5, 5, 5]} ref={target}>
    {/* This is your lookAt target */}
    <meshBasicMaterial color="red" />
  </mesh>;
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