import {
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

let poseLandmarker = null;

export async function initializePoseDetection() {
  if (poseLandmarker) {
    return poseLandmarker;
  }

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm"
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      numPoses: 1,
      outputSegmentationMasks: true,
    }
  );

  return poseLandmarker;
}

export async function detectSilhouette(imageElement) {
  if (!imageElement || !imageElement.complete) {
    throw new Error("Please select a valid image.");
  }

  const detector = await initializePoseDetection();

  const results = detector.detect(imageElement);

  if (!results.landmarks?.length) {
    throw new Error(
      "No human body detected. Try a clear, full-body photograph."
    );
  }

  const landmarks = results.landmarks[0];

  const visibleLandmarks = landmarks.filter(
    (point) => (point.visibility ?? 1) > 0.5
  );

  const landmarkNames = [
    "Nose",
    "Left eye (inner)",
    "Left eye",
    "Left eye (outer)",
    "Right eye (inner)",
    "Right eye",
    "Right eye (outer)",
    "Left ear",
    "Right ear",
    "Mouth (left)",
    "Mouth (right)",
    "Left shoulder",
    "Right shoulder",
    "Left elbow",
    "Right elbow",
    "Left wrist",
    "Right wrist",
    "Left pinky",
    "Right pinky",
    "Left index",
    "Right index",
    "Left thumb",
    "Right thumb",
    "Left hip",
    "Right hip",
    "Left knee",
    "Right knee",
    "Left ankle",
    "Right ankle",
    "Left heel",
    "Right heel",
    "Left foot index",
    "Right foot index",
  ];

  const detectedLandmarks = landmarks.map((point, index) => ({
    name: landmarkNames[index] ?? `Landmark ${index}`,
    x: point.x,
    y: point.y,
    z: point.z,
    visibility: point.visibility ?? null,
  }));

  return {
    success: true,
    observation:
      `Detected ${landmarks.length} body landmarks, ` +
      `with ${visibleLandmarks.length} meeting the visibility threshold.`,
    note:
      "These are image-based pose estimates, not physical body measurements. " +
      "Body-shape classification and clothing recommendations are not yet enabled.",
    landmarks: detectedLandmarks,
    visibleLandmarkCount: visibleLandmarks.length,
    worldLandmarks: results.worldLandmarks?.[0] ?? [],
    segmentationMasks: results.segmentationMasks ?? [],
    recommendations: [],
  };
}

export function closePoseDetection() {
  if (poseLandmarker) {
    poseLandmarker.close();
    poseLandmarker = null;
  }
}