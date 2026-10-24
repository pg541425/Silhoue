
import {
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

let landmarkerPromise;

function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm"
      );

      return PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        },
        runningMode: "IMAGE",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
      });
    })().catch((error) => {
      landmarkerPromise = null;
      throw error;
    });
  }

  return landmarkerPromise;
}

function distanceBetween(a, b, width, height) {
  const dx = (a.x - b.x) * width;
  const dy = (a.y - b.y) * height;

  return Math.hypot(dx, dy);
}

export async function detectSilhouette(image) {
  const landmarker = await getLandmarker();
  const result = landmarker.detect(image);
  const landmarks = result.landmarks?.[0];

  if (!landmarks) {
    throw new Error(
      "No person detected. Try a clear, front-facing full-body photo."
    );
  }

  const requiredPoints = [11, 12, 23, 24, 27, 28];

  const pointsAreVisible = requiredPoints.every((index) => {
    const point = landmarks[index];

    return (
      point &&
      (point.visibility ?? 1) >= 0.5 &&
      point.x >= 0 &&
      point.x <= 1 &&
      point.y >= 0 &&
      point.y <= 1
    );
  });

  if (!pointsAreVisible) {
    throw new Error(
      "Important body points are not clearly visible. Try a front-facing photo with your shoulders, hips and feet in frame."
    );
  }

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;

  const shoulderWidth = distanceBetween(
    landmarks[11],
    landmarks[12],
    width,
    height
  );

  const hipWidth = distanceBetween(
    landmarks[23],
    landmarks[24],
    width,
    height
  );

  if (shoulderWidth < 1 || hipWidth < 1) {
    throw new Error(
      "We couldn't estimate your visible proportions. Try another photo."
    );
  }

  const ratio = shoulderWidth / hipWidth;

  let observation;
  let recommendations;

  if (ratio > 1.15) {
    observation =
      "The detected shoulder landmarks appear wider than the hip landmarks.";

    recommendations = [
      {
        tag: "TOPS",
        title: "Relaxed casual tops",
        description:
          "Explore comfortable shirts and simple tops in different cuts.",
        shopQuery: "men relaxed fit casual shirts",
      },
      {
        tag: "BOTTOMS",
        title: "Straight-fit trousers",
        description:
          "Try straight-leg or wide-leg trousers in a fit you enjoy.",
        shopQuery: "men straight fit trousers",
      },
      {
        tag: "LAYERS",
        title: "Open-front layers",
        description:
          "Explore overshirts and lightweight jackets for layering.",
        shopQuery: "men casual overshirts lightweight jackets",
      },
    ];
  } else if (ratio < 0.85) {
    observation =
      "The detected hip landmarks appear wider than the shoulder landmarks.";

    recommendations = [
      {
        tag: "TOPS",
        title: "Structured tops",
        description:
          "Explore tops with collars, textured fabrics or light structure.",
        shopQuery: "men structured casual shirts",
      },
      {
        tag: "BOTTOMS",
        title: "Straight-fit jeans",
        description:
          "Try straight-fit jeans and compare different rises and cuts.",
        shopQuery: "men straight fit jeans",
      },
      {
        tag: "LAYERS",
        title: "Versatile jackets",
        description:
          "Experiment with different jacket lengths and comfortable fits.",
        shopQuery: "men casual lightweight jackets",
      },
    ];
  } else {
    observation =
      "The detected shoulder and hip landmarks appear relatively balanced.";

    recommendations = [
      {
        tag: "TOPS",
        title: "Everyday essentials",
        description:
          "Explore T-shirts, casual shirts and versatile everyday tops.",
        shopQuery: "men casual t shirts and shirts",
      },
      {
        tag: "BOTTOMS",
        title: "Straight-cut bottoms",
        description:
          "Try straight-cut trousers or jeans for versatile outfits.",
        shopQuery: "men straight fit jeans trousers",
      },
      {
        tag: "LAYERS",
        title: "Smart casual layers",
        description:
          "Explore overshirts and unstructured blazers.",
        shopQuery: "men smart casual overshirts blazers",
      },
    ];
  }

  return {
    observation,
    recommendations,
    ratio: Number(ratio.toFixed(2)),
    note:
      "This is a rough estimate from pose landmarks, not a body measurement or definitive body-shape classification. Clothing, pose, camera angle and image framing can affect the result.",
  };
}
