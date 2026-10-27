const getDistance = (pointA, pointB) => {
  if (!pointA || !pointB) return null;

  const visibilityA = pointA.visibility ?? 1;
  const visibilityB = pointB.visibility ?? 1;

  if (visibilityA < 0.5 || visibilityB < 0.5) {
    return null;
  }

  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;

  return Math.sqrt(dx * dx + dy * dy);
};

const getAverage = (valueA, valueB) => {
  if (valueA === null || valueB === null) return null;
  return (valueA + valueB) / 2;
};

const roundValue = (value) => {
  if (value === null || !Number.isFinite(value)) return null;
  return Number(value.toFixed(3));
};

export const analyzeBodyProportions = (landmarks) => {
  if (!Array.isArray(landmarks) || landmarks.length < 33) {
    return {
      success: false,
      message: "Insufficient body landmarks detected.",
      proportions: null,
    };
  }

  // MediaPipe Pose landmark indices:
  // 11: Left shoulder, 12: Right shoulder
  // 23: Left hip, 24: Right hip
  // 25: Left knee, 26: Right knee
  // 27: Left ankle, 28: Right ankle

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  const shoulderWidth = getDistance(leftShoulder, rightShoulder);
  const hipWidth = getDistance(leftHip, rightHip);

  const leftTorsoLength = getDistance(leftShoulder, leftHip);
  const rightTorsoLength = getDistance(rightShoulder, rightHip);

  const torsoLength = getAverage(leftTorsoLength, rightTorsoLength);

  const leftLegLength = getDistance(leftHip, leftAnkle);
  const rightLegLength = getDistance(rightHip, rightAnkle);

  const legLength = getAverage(leftLegLength, rightLegLength);

  const leftThighLength = getDistance(leftHip, leftKnee);
  const rightThighLength = getDistance(rightHip, rightKnee);

  const thighLength = getAverage(leftThighLength, rightThighLength);

  const leftLowerLegLength = getDistance(leftKnee, leftAnkle);
  const rightLowerLegLength = getDistance(rightKnee, rightAnkle);

  const lowerLegLength = getAverage(
    leftLowerLegLength,
    rightLowerLegLength
  );

  const shoulderToHipRatio =
    shoulderWidth !== null && hipWidth !== null && hipWidth > 0
      ? shoulderWidth / hipWidth
      : null;

  const torsoToLegRatio =
    torsoLength !== null && legLength !== null && legLength > 0
      ? torsoLength / legLength
      : null;

  return {
    success: true,
    message: "Body proportions calculated successfully.",
    proportions: {
      shoulderWidth: roundValue(shoulderWidth),
      hipWidth: roundValue(hipWidth),
      torsoLength: roundValue(torsoLength),
      legLength: roundValue(legLength),
      thighLength: roundValue(thighLength),
      lowerLegLength: roundValue(lowerLegLength),
      shoulderToHipRatio: roundValue(shoulderToHipRatio),
      torsoToLegRatio: roundValue(torsoToLegRatio),
    },
    note:
      "These are approximate image-relative proportions, not physical measurements. " +
      "Camera angle, pose, clothing, and hidden landmarks may affect the results.",
  };
};