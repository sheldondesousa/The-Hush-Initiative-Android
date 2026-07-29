import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, LinearGradient, Line, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

export const BREATHING_READOUT_HEIGHT = 120;

type VisualPalette = {
  bg: string;
  text: string;
  muted: string;
  accent: string;
  tint: string;
  border: string;
};

type Props = {
  exerciseId: string;
  level: Animated.Value;
  phaseProgress?: Animated.Value;
  phaseIndex?: number;
  phaseCount?: number;
  cycle?: number;
  phaseLabel: string;
  count: number | string;
  palette: VisualPalette;
  width: number;
  height?: number;
};

type VisualFamily = 'gradient-orb' | 'smoke' | 'breathprint' | 'nose' | 'body' | 'orbit' | 'wave' | 'nostril' | 'lips' | 'sigh' | 'diaphragm' | 'humming';

const visualByExercise: Record<string, VisualFamily> = {
  box: 'gradient-orb',
  '478': 'orbit',
  coherent: 'wave',
  alternate: 'nostril',
  pursed: 'lips',
  sigh: 'sigh',
  diaphragmatic: 'diaphragm',
  humming: 'humming',
};

const smokeWisps = Array.from({ length: 18 }, (_, index) => ({
  left: ((index * 47) % 100) / 100,
  width: 0.36 + (index % 5) * 0.045,
  height: 0.13 + (index % 4) * 0.025,
  destination: ((index * 37) % 100) / 100,
  opacity: 0.055 + (index % 4) * 0.014,
  drift: 10 + (index % 5) * 5,
}));

const contourRings = Array.from({ length: 11 }, (_, index) => index);
const airWisps = Array.from({ length: 12 }, (_, index) => index);

export default function BreathingVisual({
  exerciseId,
  level,
  phaseProgress,
  phaseIndex = 0,
  phaseCount = 0,
  cycle = 1,
  phaseLabel,
  count,
  palette,
  width,
  height = width,
}: Props) {
  const family = visualByExercise[exerciseId] ?? 'breathprint';
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 5200, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 5200, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [drift]);

  const visual = useMemo(() => {
    if (family === 'gradient-orb') {
      return (
        <GradientBreathVisual
          phaseProgress={phaseProgress ?? level}
          phaseIndex={phaseIndex}
          palette={palette}
          width={width}
          height={height}
        />
      );
    }
    if (family === 'humming') {
      return (
        <HummingBeeVisual
          phaseProgress={phaseProgress ?? level}
          phaseIndex={phaseIndex}
          palette={palette}
          width={width}
          height={height}
        />
      );
    }
    if (family === 'diaphragm') {
      return (
        <DiaphragmaticVisual
          phaseProgress={phaseProgress ?? level}
          phaseIndex={phaseIndex}
          palette={palette}
          width={width}
          height={height}
        />
      );
    }
    if (family === 'sigh') {
      return (
        <PhysiologicalSighVisual
          phaseProgress={phaseProgress ?? level}
          phaseIndex={phaseIndex}
          palette={palette}
          width={width}
          height={height}
        />
      );
    }
    if (family === 'lips') {
      return (
        <PursedLipsVisual
          phaseProgress={phaseProgress ?? level}
          phaseIndex={phaseIndex}
          palette={palette}
          width={width}
          height={height}
        />
      );
    }
    if (family === 'nostril') {
      return (
        <AlternateNostrilVisual
          phaseProgress={phaseProgress ?? level}
          phaseIndex={phaseIndex}
          phaseCount={phaseCount}
          palette={palette}
          width={width}
          height={height}
        />
      );
    }
    if (family === 'wave') {
      return (
        <CoherentWaveVisual
          phaseProgress={phaseProgress ?? level}
          phaseIndex={phaseIndex}
          cycle={cycle}
          palette={palette}
          width={width}
          height={height}
        />
      );
    }
    if (family === 'orbit') {
      return (
        <Orbit478Visual
          phaseProgress={phaseProgress ?? level}
          phaseIndex={phaseIndex}
          palette={palette}
          width={width}
          height={height}
        />
      );
    }
    if (family === 'smoke') {
      return <SmokeVisual level={level} drift={drift} palette={palette} width={width} height={height} />;
    }
    if (family === 'nose') {
      return <NoseVisual level={level} drift={drift} palette={palette} width={width} height={height} />;
    }
    if (family === 'body') {
      return <BodyVisual level={level} drift={drift} palette={palette} width={width} height={height} />;
    }
    return <BreathprintVisual level={level} drift={drift} palette={palette} width={width} height={height} />;
  }, [cycle, drift, family, height, level, palette, phaseCount, phaseIndex, phaseProgress, width]);

  const displayPhase = (phaseLabel ?? 'BREATHE').toUpperCase();
  const normalizedPhase = displayPhase.toLowerCase();
  const hasHoldPhase = exerciseId === 'box' || exerciseId === '478' || (exerciseId === 'alternate' && phaseCount === 8);
  const breathPhase = normalizedPhase.includes('exhale')
    ? 'exhale'
    : normalizedPhase.includes('inhale')
      ? 'inhale'
      : hasHoldPhase && normalizedPhase.includes('hold')
        ? 'hold'
        : null;

  return (
    <View
      accessible
      accessibilityLabel={`${phaseLabel}, ${count}`}
      style={[styles.frame, { width, height: height + BREATHING_READOUT_HEIGHT }]}
    >
      <View
        pointerEvents="none"
        style={[styles.readout, { height: BREATHING_READOUT_HEIGHT }]}
      >
        <Text style={[styles.count, styles.countProminent, { color: palette.text }]}>
          {count}
        </Text>
        {breathPhase ? (
          <View style={styles.phaseToggle}>
            <Text
              numberOfLines={1}
              style={[
                styles.phaseToggleLabel,
                {
                  color: breathPhase === 'inhale' ? palette.text : palette.muted,
                  fontWeight: breathPhase === 'inhale' ? '700' : '400',
                  opacity: breathPhase === 'inhale' ? 1 : 0.35,
                },
              ]}
            >
              INHALE
            </Text>
            {hasHoldPhase && (
              <>
                <Text style={[styles.phaseToggleDivider, { color: palette.border }]}>|</Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.phaseToggleLabel,
                    {
                      color: breathPhase === 'hold' ? palette.text : palette.muted,
                      fontWeight: breathPhase === 'hold' ? '700' : '400',
                      opacity: breathPhase === 'hold' ? 1 : 0.35,
                    },
                  ]}
                >
                  HOLD
                </Text>
              </>
            )}
            <Text style={[styles.phaseToggleDivider, { color: palette.border }]}>|</Text>
            <Text
              numberOfLines={1}
              style={[
                styles.phaseToggleLabel,
                {
                  color: breathPhase === 'exhale' ? palette.text : palette.muted,
                  fontWeight: breathPhase === 'exhale' ? '700' : '400',
                  opacity: breathPhase === 'exhale' ? 1 : 0.35,
                },
              ]}
            >
              EXHALE
            </Text>
          </View>
        ) : (
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            style={[styles.phase, styles.phaseProminent, { color: palette.text }]}
          >
            {displayPhase}
          </Text>
        )}
      </View>
      <View style={[styles.animationStage, { width, height }]}>
        {visual}
      </View>
    </View>
  );
}


const HORIZONTAL_VISUAL_WIDTH_RATIO = 0.84;
const HORIZONTAL_VISUAL_HEIGHT_RATIO = 0.78;
const ALTERNATE_VISUAL_WIDTH_RATIO = 0.94;
const AnimatedGradientCircle = Animated.createAnimatedComponent(Circle);
const GRADIENT_ORB_MIN_RADIUS = 48;
const GRADIENT_ORB_MAX_RADIUS = 116;
const FOREST_SAGE = '#4A7C68';

function GradientBreathVisual({
  phaseProgress,
  phaseIndex,
  palette,
  width,
  height,
}: {
  phaseProgress: Animated.Value;
  phaseIndex: number;
  palette: VisualPalette;
  width: number;
  height: number;
}) {
  const safePhase = Math.min(Math.max(phaseIndex, 0), 3);
  const isInhale = safePhase === 0;
  const isExhale = safePhase === 2;
  const isHold = !isInhale && !isExhale;
  const isFullHold = safePhase === 1;
  const radius = phaseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: isInhale
      ? [GRADIENT_ORB_MIN_RADIUS, GRADIENT_ORB_MAX_RADIUS]
      : isExhale
        ? [GRADIENT_ORB_MAX_RADIUS, GRADIENT_ORB_MIN_RADIUS]
        : isFullHold
          ? [GRADIENT_ORB_MAX_RADIUS, GRADIENT_ORB_MAX_RADIUS]
          : [GRADIENT_ORB_MIN_RADIUS, GRADIENT_ORB_MIN_RADIUS],
  });
  const holdRadius = isFullHold ? GRADIENT_ORB_MAX_RADIUS : GRADIENT_ORB_MIN_RADIUS;
  const holdCircumference = 2 * Math.PI * holdRadius;
  const holdDashOffset = phaseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [holdCircumference, 0],
  });
  const auraRadius = Animated.multiply(radius, 1.32);
  const auraInnerRadius = Animated.multiply(radius, 1.16);
  const holdMarkerRotation = phaseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const stageScale = Math.min(width, height) / 312;
  const markerTrackSize = holdRadius * 2 * stageScale;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height} viewBox="0 0 312 312">
        <Defs>
          <RadialGradient id="box-breath-gradient" cx="38%" cy="32%" r="76%">
            <Stop offset={0} stopColor="#E8F0EC" stopOpacity={1} />
            <Stop offset={0.36} stopColor="#C8DFD8" stopOpacity={1} />
            <Stop offset={0.7} stopColor="#789B8D" stopOpacity={1} />
            <Stop offset={1} stopColor="#315F4D" stopOpacity={1} />
          </RadialGradient>
          <RadialGradient id="box-breath-aura" cx="50%" cy="50%" r="50%">
            <Stop offset={0} stopColor="#789B8D" stopOpacity={0.18} />
            <Stop offset={0.55} stopColor="#4A7C68" stopOpacity={0.1} />
            <Stop offset={1} stopColor="#315F4D" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <AnimatedGradientCircle
          cx={150}
          cy={161}
          r={auraRadius}
          fill="url(#box-breath-aura)"
          opacity={0.78}
        />
        <AnimatedGradientCircle
          cx={164}
          cy={150}
          r={auraInnerRadius}
          fill="url(#box-breath-aura)"
          opacity={0.58}
        />

        <AnimatedGradientCircle
          cx={156}
          cy={156}
          r={radius}
          fill="url(#box-breath-gradient)"
        />

        {isHold && (
          <>
            <Circle
              cx={156}
              cy={156}
              r={holdRadius}
              fill="none"
              stroke={FOREST_SAGE}
              strokeWidth={2.5}
              opacity={0.28}
            />
            <AnimatedGradientCircle
              cx={156}
              cy={156}
              r={holdRadius}
              fill="none"
              stroke={FOREST_SAGE}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${holdCircumference} ${holdCircumference}`}
              strokeDashoffset={holdDashOffset}
              transform="rotate(-90 156 156)"
            />
          </>
        )}
      </Svg>
      {isHold && (
        <Animated.View
          style={[
            styles.gradientHoldMarkerTrack,
            {
              width: markerTrackSize,
              height: markerTrackSize,
              left: (width - markerTrackSize) / 2,
              top: (height - markerTrackSize) / 2,
              transform: [{ rotate: holdMarkerRotation }],
            },
          ]}
        >
          <View
            style={[
              styles.gradientHoldMarker,
              {
                left: markerTrackSize / 2 - 6,
                backgroundColor: FOREST_SAGE,
                borderColor: palette.bg,
              },
            ]}
          />
        </Animated.View>
      )}
    </View>
  );
}

const PURSED_LIP_WIDTH = 312;
const PURSED_LIP_HEIGHT = 168;
const PURSED_LIP_CENTER_X = PURSED_LIP_WIDTH / 2;
const PURSED_LIP_CENTER_Y = PURSED_LIP_HEIGHT / 2;
const PURSED_LIP_LEFT = 28;
const PURSED_LIP_RIGHT = 284;
const PURSED_LIP_SIGMA = 64;
const PURSED_LIP_AMPLITUDE = 80;
const PURSED_LIP_REST_GAP = 4;
const PURSED_LIP_MIN_OPENING = 0.055;

function pursedLipPoints(upper: boolean, opening: number) {
  const edgeDistance = (PURSED_LIP_RIGHT - PURSED_LIP_LEFT) / 2;
  const edgeBell = Math.exp(-(edgeDistance * edgeDistance) / (2 * PURSED_LIP_SIGMA * PURSED_LIP_SIGMA));
  return Array.from({ length: 49 }, (_, index) => {
    const x = PURSED_LIP_LEFT + ((PURSED_LIP_RIGHT - PURSED_LIP_LEFT) * index) / 48;
    const distance = x - PURSED_LIP_CENTER_X;
    const bell = Math.exp(-(distance * distance) / (2 * PURSED_LIP_SIGMA * PURSED_LIP_SIGMA));
    const fixedEndpointBell = (bell - edgeBell) / (1 - edgeBell);
    const direction = upper ? -1 : 1;
    const y = PURSED_LIP_CENTER_Y + direction * (
      PURSED_LIP_REST_GAP + PURSED_LIP_AMPLITUDE * fixedEndpointBell * opening
    );
    return [x, y] as const;
  });
}

function pursedLipCurve(points: ReadonlyArray<readonly [number, number]>) {
  return points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ');
}

function pursedLipFillPath(opening: number) {
  const upperPoints = pursedLipPoints(true, opening);
  const lowerPoints = pursedLipPoints(false, opening);
  return [
    pursedLipCurve(upperPoints),
    pursedLipCurve([...lowerPoints].reverse()).replace(/^M/, 'L'),
    'Z',
  ].join(' ');
}

const PURSED_LIP_FILL_PATH = pursedLipFillPath(1);
const PURSED_LIP_COLLAPSED_PATH = pursedLipFillPath(PURSED_LIP_MIN_OPENING);
const PURSED_LIP_UPPER_EXPANDED_PATH = pursedLipCurve(pursedLipPoints(true, 1));
const PURSED_LIP_UPPER_COLLAPSED_PATH = pursedLipCurve(pursedLipPoints(true, PURSED_LIP_MIN_OPENING));
const PURSED_LIP_LOWER_EXPANDED_PATH = pursedLipCurve(pursedLipPoints(false, 1));
const PURSED_LIP_LOWER_COLLAPSED_PATH = pursedLipCurve(pursedLipPoints(false, PURSED_LIP_MIN_OPENING));
const AnimatedPursedLipPath = Animated.createAnimatedComponent(Path);

function PursedLipsShape({
  palette,
  active,
}: {
  palette: VisualPalette;
  active: boolean;
}) {
  const color = active ? palette.accent : palette.tint;

  return (
    <Svg width="100%" height="100%" viewBox="0 -2 312 172" preserveAspectRatio="none">
      <Path
        d={PURSED_LIP_FILL_PATH}
        fill={color}
        fillOpacity={active ? 0.12 : 0.08}
        stroke={active ? palette.accent : 'none'}
        strokeWidth={active ? 1.5 : 0}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PursedLipsVisual({
  phaseProgress,
  phaseIndex,
  palette,
  width,
  height,
}: {
  phaseProgress: Animated.Value;
  phaseIndex: number;
  palette: VisualPalette;
  width: number;
  height: number;
}) {
  const animatedPath = phaseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: phaseIndex === 0
      ? [PURSED_LIP_COLLAPSED_PATH, PURSED_LIP_FILL_PATH]
      : [PURSED_LIP_FILL_PATH, PURSED_LIP_COLLAPSED_PATH],
  });
  const animatedUpperPath = phaseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: phaseIndex === 0
      ? [PURSED_LIP_UPPER_COLLAPSED_PATH, PURSED_LIP_UPPER_EXPANDED_PATH]
      : [PURSED_LIP_UPPER_EXPANDED_PATH, PURSED_LIP_UPPER_COLLAPSED_PATH],
  });
  const animatedLowerPath = phaseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: phaseIndex === 0
      ? [PURSED_LIP_LOWER_COLLAPSED_PATH, PURSED_LIP_LOWER_EXPANDED_PATH]
      : [PURSED_LIP_LOWER_EXPANDED_PATH, PURSED_LIP_LOWER_COLLAPSED_PATH],
  });
  const shapeWidth = width * HORIZONTAL_VISUAL_WIDTH_RATIO;
  const shapeHeight = height * HORIZONTAL_VISUAL_HEIGHT_RATIO;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.horizontalVisual,
          {
            width: shapeWidth,
            height: shapeHeight,
            marginLeft: -shapeWidth / 2,
            marginTop: -shapeHeight / 2,
          },
        ]}
      >
        <PursedLipsShape palette={palette} active={false} />
        <Svg
          width="100%"
          height="100%"
          viewBox="0 -2 312 172"
          preserveAspectRatio="none"
          style={StyleSheet.absoluteFill}
        >
          <AnimatedPursedLipPath
            d={animatedPath}
            fill={palette.accent}
            fillOpacity={0.12}
          />
          <AnimatedPursedLipPath
            d={animatedUpperPath}
            fill="none"
            stroke={palette.accent}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <AnimatedPursedLipPath
            d={animatedLowerPath}
            fill="none"
            stroke={palette.accent}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </Svg>
      </View>
    </View>
  );
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedLine = Animated.createAnimatedComponent(Line);

const DIAPHRAGM_CHEST_Y = 84;
const DIAPHRAGM_MAX_DROP = 159;
const DIAPHRAGM_LINE_LEFT = 36;
const DIAPHRAGM_LINE_RIGHT = 276;

function DiaphragmaticVisual({
  phaseProgress,
  phaseIndex,
  palette,
  width,
  height,
}: {
  phaseProgress: Animated.Value;
  phaseIndex: number;
  palette: VisualPalette;
  width: number;
  height: number;
}) {
  const safePhase = Math.min(Math.max(phaseIndex, 0), 2);
  const fill = safePhase === 0
    ? phaseProgress
    : safePhase === 1
      ? phaseProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1],
        })
      : phaseProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0],
        });
  const bellyY = Animated.add(DIAPHRAGM_CHEST_Y, Animated.multiply(fill, DIAPHRAGM_MAX_DROP));
  const stageScale = Math.min(width, height) / 312;
  const bellyLabelTranslateY = fill.interpolate({
    inputRange: [0, 1],
    outputRange: [
      DIAPHRAGM_CHEST_Y * stageScale + 3,
      (DIAPHRAGM_CHEST_Y + DIAPHRAGM_MAX_DROP) * stageScale + 3,
    ],
  });
  const bellyOpacity = fill.interpolate({
    inputRange: [0, 0.08, 0.5, 1],
    outputRange: [0, 0, 0.7, 1],
  });
  const bellyStrokeWidth = fill.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 2.5],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height} viewBox="0 0 312 312">
        <AnimatedRect
          x={DIAPHRAGM_LINE_LEFT}
          y={DIAPHRAGM_CHEST_Y + 1}
          width={DIAPHRAGM_LINE_RIGHT - DIAPHRAGM_LINE_LEFT}
          height={Animated.multiply(fill, DIAPHRAGM_MAX_DROP - 1)}
          fill={palette.accent}
          fillOpacity={0.1}
        />

        <Line
          x1={DIAPHRAGM_LINE_LEFT}
          y1={DIAPHRAGM_CHEST_Y}
          x2={DIAPHRAGM_LINE_RIGHT}
          y2={DIAPHRAGM_CHEST_Y}
          stroke={palette.tint}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <AnimatedLine
          x1={DIAPHRAGM_LINE_LEFT}
          y1={bellyY}
          x2={DIAPHRAGM_LINE_RIGHT}
          y2={bellyY}
          stroke={palette.accent}
          strokeWidth={bellyStrokeWidth}
          strokeLinecap="round"
          opacity={bellyOpacity}
        />

        <SvgText x={DIAPHRAGM_LINE_LEFT} y={48} fill={palette.text} fontSize={14} fontWeight="500">
          Chest
        </SvgText>
        <SvgText x={DIAPHRAGM_LINE_LEFT} y={64} fill={palette.muted} fontSize={12} fontWeight="400">
          Remains Still
        </SvgText>
      </Svg>
      <Animated.View
        style={[
          styles.diaphragmBellyLabels,
          {
            left: DIAPHRAGM_LINE_LEFT * stageScale,
            opacity: bellyOpacity,
            transform: [{ translateY: bellyLabelTranslateY }],
          },
        ]}
      >
        <Svg width={150 * stageScale} height={32 * stageScale} viewBox="0 0 150 32">
          <SvgText x={0} y={14} fill={palette.text} fontSize={14} fontWeight="500">
            Belly
          </SvgText>
          <SvgText x={0} y={30} fill={palette.muted} fontSize={12} fontWeight="400">
            {safePhase === 2 ? 'Falls on Exhale' : 'Rises on Inhale'}
          </SvgText>
        </Svg>
      </Animated.View>
    </View>
  );
}


const NOSTRIL_APEX_Y = 112;
const NOSTRIL_BASE_Y = 268;
const NOSTRIL_FILL_HEIGHT = NOSTRIL_BASE_Y - NOSTRIL_APEX_Y;
const LEFT_NOSTRIL_PATH = 'M 153 120 Q 153 112 148.56 118.66 L 53.44 261.34 Q 49 268 57 268 L 145 268 Q 153 268 153 260 Z';
const RIGHT_NOSTRIL_PATH = 'M 163.44 118.66 Q 159 112 159 120 L 159 260 Q 159 268 167 268 L 255 268 Q 263 268 258.56 261.34 Z';

function AlternateNostrilVisual({
  phaseProgress,
  phaseIndex,
  phaseCount,
  palette,
  width,
  height,
}: {
  phaseProgress: Animated.Value;
  phaseIndex: number;
  phaseCount: number;
  palette: VisualPalette;
  width: number;
  height: number;
}) {
  const holdMode = phaseCount === 8;
  const safePhase = Math.min(Math.max(phaseIndex, 0), holdMode ? 7 : 3);
  const leftRanges = holdMode
    ? [[1, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 1], [1, 1]]
    : [[1, 0], [0, 0], [0, 0], [0, 1]];
  const rightRanges = holdMode
    ? [[0, 0], [0, 0], [0, 1], [1, 1], [1, 0], [0, 0], [0, 0], [0, 0]]
    : [[0, 0], [0, 1], [1, 0], [0, 0]];
  const leftFill = phaseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: leftRanges[safePhase],
  });
  const rightFill = phaseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: rightRanges[safePhase],
  });
  const leftActive = holdMode ? safePhase === 0 || safePhase === 6 : safePhase === 0 || safePhase === 3;
  const rightActive = holdMode ? safePhase === 2 || safePhase === 4 : safePhase === 1 || safePhase === 2;
  const visualWidth = width * ALTERNATE_VISUAL_WIDTH_RATIO;
  const visualHeight = height * HORIZONTAL_VISUAL_HEIGHT_RATIO;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.horizontalVisual,
          {
            width: visualWidth,
            height: visualHeight,
            marginLeft: -visualWidth / 2,
            marginTop: -visualHeight / 2,
          },
        ]}
      >
        <Svg
          width={visualWidth}
          height={visualHeight}
          viewBox="47 110 218 183"
          preserveAspectRatio="xMidYMid meet"
        >
        <Defs>
          <ClipPath id="left-nostril-clip">
            <Path d={LEFT_NOSTRIL_PATH} />
          </ClipPath>
          <ClipPath id="right-nostril-clip">
            <Path d={RIGHT_NOSTRIL_PATH} />
          </ClipPath>
        </Defs>

        <Path d={LEFT_NOSTRIL_PATH} fill={palette.tint} fillOpacity={0.15} />
        <Path d={RIGHT_NOSTRIL_PATH} fill={palette.tint} fillOpacity={0.15} />

        <AnimatedRect
          x={0}
          y={NOSTRIL_APEX_Y}
          width={312}
          height={Animated.multiply(leftFill, NOSTRIL_FILL_HEIGHT)}
          fill={palette.accent}
          fillOpacity={0.5}
          clipPath="url(#left-nostril-clip)"
        />
        <AnimatedRect
          x={0}
          y={NOSTRIL_APEX_Y}
          width={312}
          height={Animated.multiply(rightFill, NOSTRIL_FILL_HEIGHT)}
          fill={palette.accent}
          fillOpacity={0.5}
          clipPath="url(#right-nostril-clip)"
        />

        <Path
          d={LEFT_NOSTRIL_PATH}
          fill="none"
          stroke={leftActive ? palette.accent : palette.tint}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <Path
          d={RIGHT_NOSTRIL_PATH}
          fill="none"
          stroke={rightActive ? palette.accent : palette.tint}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />

        <SvgText
          x={101}
          y={291}
          textAnchor="middle"
          fill={leftActive ? palette.text : palette.muted}
          fontSize={12}
          fontWeight={leftActive ? '500' : '400'}
          letterSpacing={1.2}
        >
          LEFT
        </SvgText>
        <SvgText
          x={211}
          y={291}
          textAnchor="middle"
          fill={rightActive ? palette.text : palette.muted}
          fontSize={12}
          fontWeight={rightActive ? '500' : '400'}
          letterSpacing={1.2}
        >
          RIGHT
        </SvgText>
        </Svg>
      </View>
    </View>
  );
}

const WAVE_SAMPLES_PER_CYCLE = 32;
const WAVE_PATH_CYCLES = 12;

function CoherentWaveVisual({
  phaseProgress,
  phaseIndex,
  cycle,
  palette,
  width,
  height,
}: {
  phaseProgress: Animated.Value;
  phaseIndex: number;
  cycle: number;
  palette: VisualPalette;
  width: number;
  height: number;
}) {
  const waveWidth = width * HORIZONTAL_VISUAL_WIDTH_RATIO;
  const waveHeight = height * HORIZONTAL_VISUAL_HEIGHT_RATIO;
  const wavelength = waveWidth / 1.55;
  const amplitude = waveHeight * 0.44;
  const centerY = waveHeight / 2;
  const markerX = wavelength * (14 / WAVE_SAMPLES_PER_CYCLE);
  const pathWidth = waveWidth + WAVE_PATH_CYCLES * wavelength;
  const localStart = phaseIndex === 0 ? 0 : 0.5;
  const localEnd = phaseIndex === 0 ? 0.5 : 1;
  const cycleProgress = phaseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [localStart, localEnd],
  });
  const completedCycles = Math.max(cycle, 1) - 1;
  const translateX = cycleProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      -completedCycles * wavelength,
      -(completedCycles + 1) * wavelength,
    ],
  });
  const markerInput = Array.from(
    { length: WAVE_SAMPLES_PER_CYCLE + 1 },
    (_, index) => index / WAVE_SAMPLES_PER_CYCLE,
  );
  const markerOutput = markerInput.map(
    (progress) => centerY + amplitude * Math.cos(progress * Math.PI * 2) - 7,
  );
  const markerY = cycleProgress.interpolate({
    inputRange: markerInput,
    outputRange: markerOutput,
  });
  const pointCount = WAVE_PATH_CYCLES * WAVE_SAMPLES_PER_CYCLE;
  const wavePath = Array.from({ length: pointCount + 1 }, (_, index) => {
    const x = (index / WAVE_SAMPLES_PER_CYCLE) * wavelength;
    const progress = (x - markerX) / wavelength;
    const y = centerY + amplitude * Math.cos(progress * Math.PI * 2);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const movingWave = (
    <Animated.View
      style={[
        styles.coherentWaveTrack,
        {
          width: pathWidth,
          height: waveHeight,
          transform: [{ translateX }],
        },
      ]}
    >
      <Svg width={pathWidth} height={waveHeight} viewBox={`0 0 ${pathWidth} ${waveHeight}`}>
        <Path
          d={wavePath}
          fill="none"
          stroke={palette.tint}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );

  return (
    <View
      pointerEvents="none"
      style={[
        styles.horizontalVisual,
        {
          width: waveWidth,
          height: waveHeight,
          marginLeft: -waveWidth / 2,
          marginTop: -waveHeight / 2,
        },
      ]}
    >
      {movingWave}
      <View style={[styles.coherentWaveTrailClip, { width: markerX + 1, height: waveHeight }]}>
        <Animated.View
          style={[
            styles.coherentWaveTrack,
            {
              width: pathWidth,
              height: waveHeight,
              transform: [{ translateX }],
            },
          ]}
        >
          <Svg width={pathWidth} height={waveHeight} viewBox={`0 0 ${pathWidth} ${waveHeight}`}>
            <Path
              d={wavePath}
              fill="none"
              stroke={palette.accent}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>
      </View>
      <Animated.View
        style={[
          styles.coherentWaveMarker,
          {
            left: markerX - 7,
            backgroundColor: palette.text,
            transform: [{ translateY: markerY }],
          },
        ]}
      />
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIGH_VISUAL_SIZE_RATIO = 0.78;
const SIGH_INNER_RADIUS_RATIO = 0.8;

function PhysiologicalSighVisual({
  phaseProgress,
  phaseIndex,
  palette,
  width,
  height,
}: {
  phaseProgress: Animated.Value;
  phaseIndex: number;
  palette: VisualPalette;
  width: number;
  height: number;
}) {
  const size = Math.min(width, height) * SIGH_VISUAL_SIZE_RATIO;
  const center = size / 2;
  const radius = center - 3;
  const innerRadius = radius * SIGH_INNER_RADIUS_RATIO;
  const safePhase = Math.min(Math.max(phaseIndex, 0), 2);

  const animatedInnerRadius = safePhase === 0
    ? Animated.multiply(phaseProgress, innerRadius)
    : safePhase === 1
      ? innerRadius
      : phaseProgress.interpolate({
          inputRange: [0, 0.2, 1],
          outputRange: [innerRadius, innerRadius, 0],
        });
  const animatedOuterRadius = safePhase === 1
    ? phaseProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [innerRadius, radius],
      })
    : safePhase === 2
      ? phaseProgress.interpolate({
          inputRange: [0, 0.2, 1],
          outputRange: [radius, innerRadius, innerRadius],
        })
      : 0;
  const outerOpacity = safePhase === 1
    ? 1
    : safePhase === 2
      ? phaseProgress.interpolate({
          inputRange: [0, 0.199, 0.2, 1],
          outputRange: [1, 1, 0, 0],
        })
      : 0;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.sighVisual,
          {
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
          },
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="sigh-inner-gradient" x1={center} y1={0} x2={center} y2={size}>
              <Stop offset={0} stopColor={palette.accent} stopOpacity={0.08} />
              <Stop offset={0.5} stopColor={palette.accent} stopOpacity={0.18} />
              <Stop offset={1} stopColor={palette.accent} stopOpacity={0.3} />
            </LinearGradient>
            <LinearGradient id="sigh-outer-gradient" x1={center} y1={0} x2={center} y2={size}>
              <Stop offset={0} stopColor={palette.accent} stopOpacity={0.3} />
              <Stop offset={0.5} stopColor={palette.accent} stopOpacity={0.42} />
              <Stop offset={1} stopColor={palette.accent} stopOpacity={0.54} />
            </LinearGradient>
          </Defs>

          <AnimatedCircle
            cx={center}
            cy={center}
            r={animatedOuterRadius}
            fill="url(#sigh-outer-gradient)"
            opacity={outerOpacity}
          />
          <AnimatedCircle
            cx={center}
            cy={center}
            r={animatedInnerRadius}
            fill="url(#sigh-inner-gradient)"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={palette.tint}
            strokeWidth={1.5}
          />
        </Svg>
      </View>
    </View>
  );
}

const ORBIT_PHASES = [4, 7, 8];
const ORBIT_TOTAL = ORBIT_PHASES.reduce((sum, seconds) => sum + seconds, 0);

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function arcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarPoint(cx, cy, radius, endAngle);
  const end = polarPoint(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}


const HUM_PHASE_PROPORTIONS = [1 / 3, 2 / 3];
const HUM_GAP_DEGREES = 3.4;

function HummingBeeVisual({
  phaseProgress,
  phaseIndex,
  palette,
  width,
  height,
}: {
  phaseProgress: Animated.Value;
  phaseIndex: number;
  palette: VisualPalette;
  width: number;
  height: number;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phaseIndex !== 1) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const animation = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [phaseIndex, pulse]);

  const size = Math.min(width, height) * 0.78;
  const center = size / 2;
  const radius = center - 12;
  const circumference = 2 * Math.PI * radius;
  const safePhase = Math.min(Math.max(phaseIndex, 0), 1);
  const boundaries = [0, HUM_PHASE_PROPORTIONS[0], 1];
  const startAngle = boundaries[safePhase] * 360 + HUM_GAP_DEGREES / 2;
  const endAngle = boundaries[safePhase + 1] * 360 - HUM_GAP_DEGREES / 2;
  const activeArcLength = radius * ((endAngle - startAngle) * Math.PI / 180);
  const dashOffset = phaseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [activeArcLength, 0],
  });
  const markerRotation = phaseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [`${startAngle}deg`, `${endAngle}deg`],
  });
  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.24],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.13, 0],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.hummingOrbit,
          {
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
          },
        ]}
      >
        {safePhase === 1 && (
          <Animated.View
            style={[
              styles.hummingPulse,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderColor: palette.accent,
                opacity: pulseOpacity,
                transform: [{ scale: pulseScale }],
              },
            ]}
          />
        )}

        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {boundaries.slice(0, -1).map((boundary, index) => {
            const ghostStart = boundary * 360 + HUM_GAP_DEGREES / 2;
            const ghostEnd = boundaries[index + 1] * 360 - HUM_GAP_DEGREES / 2;
            return (
              <Path
                key={index}
                d={arcPath(center, center, radius, ghostStart, ghostEnd)}
                fill="none"
                stroke={palette.tint}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            );
          })}

          {safePhase === 1 && (
            <Path
              d={arcPath(
                center,
                center,
                radius,
                HUM_GAP_DEGREES / 2,
                HUM_PHASE_PROPORTIONS[0] * 360 - HUM_GAP_DEGREES / 2,
              )}
              fill="none"
              stroke={palette.accent}
              strokeWidth={3.5}
              strokeLinecap="round"
            />
          )}

          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={palette.accent}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeDasharray={`${activeArcLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            rotation={startAngle - 90}
            originX={center}
            originY={center}
          />
        </Svg>

        <Animated.View
          style={[
            styles.hummingMarkerTrack,
            {
              width: size,
              height: size,
              transform: [{ rotate: markerRotation }],
            },
          ]}
        >
          <View
            style={[
              styles.hummingMarker,
              {
                left: center - 6,
                top: center - radius - 6,
                backgroundColor: palette.text,
              },
            ]}
          />
        </Animated.View>
      </View>
    </View>
  );
}

function Orbit478Visual({
  phaseProgress,
  phaseIndex,
  palette,
  width,
  height,
}: {
  phaseProgress: Animated.Value;
  phaseIndex: number;
  palette: VisualPalette;
  width: number;
  height: number;
}) {
  const size = Math.min(width, height) * 0.78;
  const center = size / 2;
  const radius = center - 12;
  const circumference = 2 * Math.PI * radius;
  const safePhase = Math.min(Math.max(phaseIndex, 0), ORBIT_PHASES.length - 1);
  const elapsedBeforePhase = ORBIT_PHASES
    .slice(0, safePhase)
    .reduce((sum, seconds) => sum + seconds, 0);
  const startProgress = elapsedBeforePhase / ORBIT_TOTAL;
  const endProgress = (elapsedBeforePhase + ORBIT_PHASES[safePhase]) / ORBIT_TOTAL;
  const overallProgress = phaseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [startProgress, endProgress],
  });
  const dashOffset = overallProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });
  const markerRotation = overallProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const boundaries = [0, 4 / ORBIT_TOTAL, 11 / ORBIT_TOTAL, 1];
  const gapDegrees = 3.2;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.orbit478,
        {
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
        },
      ]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {boundaries.slice(0, -1).map((boundary, index) => {
          const startAngle = boundary * 360 + gapDegrees / 2;
          const endAngle = boundaries[index + 1] * 360 - gapDegrees / 2;
          return (
            <Path
              key={index}
              d={arcPath(center, center, radius, startAngle, endAngle)}
              fill="none"
              stroke={palette.tint}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          );
        })}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={palette.accent}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation={-90}
          originX={center}
          originY={center}
        />
      </Svg>
      <Animated.View
        style={[
          styles.orbit478MarkerTrack,
          {
            width: size,
            height: size,
            transform: [{ rotate: markerRotation }],
          },
        ]}
      >
        <View
          style={[
            styles.orbit478Marker,
            {
              left: center - 6,
              top: center - radius - 6,
              backgroundColor: palette.text,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

function SmokeVisual({
  level,
  drift,
  palette,
  width,
  height,
}: {
  level: Animated.Value;
  drift: Animated.Value;
  palette: VisualPalette;
  width: number;
  height: number;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {smokeWisps.map((wisp, index) => {
        const wispWidth = width * wisp.width;
        const wispHeight = height * wisp.height;
        const translateY = level.interpolate({
          inputRange: [0, 1],
          outputRange: [height + wispHeight, -height * wisp.destination],
        });
        const translateX = drift.interpolate({
          inputRange: [0, 1],
          outputRange: [-wisp.drift, wisp.drift],
        });
        const opacity = level.interpolate({
          inputRange: [0, 0.18, 1],
          outputRange: [0, wisp.opacity * 0.35, wisp.opacity],
        });
        const scale = level.interpolate({
          inputRange: [0, 1],
          outputRange: [0.72, 1.08],
        });
        return (
          <Animated.View
            key={index}
            style={[
              styles.smokeWisp,
              {
                left: width * wisp.left - wispWidth / 2,
                width: wispWidth,
                height: wispHeight,
                borderRadius: wispHeight / 2,
                backgroundColor: index % 3 === 0 ? palette.accent : palette.tint,
                opacity,
                transform: [{ translateX }, { translateY }, { scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function BreathprintVisual({
  level,
  drift,
  palette,
  width,
  height,
}: {
  level: Animated.Value;
  drift: Animated.Value;
  palette: VisualPalette;
  width: number;
  height: number;
}) {
  const centerSize = Math.min(width, height);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {contourRings.map((ring) => {
        const ringWidth = centerSize * (0.13 + ring * 0.055);
        const ringHeight = ringWidth * (0.64 + (ring % 3) * 0.035);
        const scale = level.interpolate({
          inputRange: [0, 1],
          outputRange: [0.68 + ring * 0.012, 1 + ring * 0.018],
        });
        const breathe = drift.interpolate({
          inputRange: [0, 1],
          outputRange: [ring % 2 === 0 ? -2 : 2, ring % 2 === 0 ? 2 : -2],
        });
        return (
          <Animated.View
            key={ring}
            style={[
              styles.contour,
              {
                width: ringWidth,
                height: ringHeight,
                marginLeft: -ringWidth / 2,
                marginTop: -ringHeight / 2,
                borderRadius: ringWidth / 2,
                borderColor: ring % 3 === 0 ? palette.accent : palette.muted,
                opacity: 0.2 + ring * 0.035,
                transform: [{ translateX: breathe }, { scale }],
              },
            ]}
          />
        );
      })}
      <Animated.View
        style={[
          styles.breathSeed,
          {
            backgroundColor: palette.accent,
            transform: [{
              scale: level.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1.18] }),
            }],
          },
        ]}
      />
    </View>
  );
}

function NoseVisual({
  level,
  drift,
  palette,
  width,
  height,
}: {
  level: Animated.Value;
  drift: Animated.Value;
  palette: VisualPalette;
  width: number;
  height: number;
}) {
  const scaleX = width / 420;
  const scaleY = height / 500;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height} viewBox="0 0 420 500">
        <Path
          d="M223 101 C201 157 207 215 180 267 C166 293 176 322 205 313 C226 306 231 278 229 243 C226 189 237 145 223 101 Z"
          fill={palette.tint}
          opacity={0.55}
        />
        <Path
          d="M252 58 C229 92 222 134 224 177 C225 214 213 239 187 263 C169 280 145 287 137 302 C129 317 143 330 164 329 C180 328 193 322 204 326 C219 331 220 350 233 365 C247 381 267 387 290 388"
          fill="none"
          stroke={palette.text}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.62}
        />
        <Path
          d="M158 315 C170 306 190 307 203 318"
          fill="none"
          stroke={palette.text}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.82}
        />
        <Path
          d="M235 365 C232 389 240 411 257 429"
          fill="none"
          stroke={palette.text}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.62}
        />
      </Svg>
      {airWisps.map((index) => {
        const travel = Animated.modulo(Animated.add(level, index / airWisps.length), 1);
        const translateX = travel.interpolate({
          inputRange: [0, 0.28, 0.62, 1],
          outputRange: [-22 * scaleX, 82 * scaleX, 176 * scaleX, 220 * scaleX],
        });
        const translateY = travel.interpolate({
          inputRange: [0, 0.28, 0.62, 1],
          outputRange: [342 * scaleY, 370 * scaleY, 304 * scaleY, 127 * scaleY],
        });
        const opacity = travel.interpolate({
          inputRange: [0, 0.12, 0.84, 1],
          outputRange: [0, 0.12, 0.12, 0],
        });
        const curl = drift.interpolate({
          inputRange: [0, 1],
          outputRange: [-(5 + index % 4) * scaleX, (5 + index % 4) * scaleX],
        });
        return (
          <Animated.View
            key={index}
            style={[
              styles.airWisp,
              {
                width: (24 + index % 4 * 5) * scaleX,
                height: (12 + index % 3 * 3) * scaleY,
                borderRadius: 18,
                backgroundColor: palette.accent,
                opacity,
                transform: [{ translateX }, { translateY }, { translateX: curl }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function BodyVisual({
  level,
  drift,
  palette,
  width,
  height,
}: {
  level: Animated.Value;
  drift: Animated.Value;
  palette: VisualPalette;
  width: number;
  height: number;
}) {
  const scaleX = width / 640;
  const scaleY = height / 500;
  const breathScaleX = level.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.06] });
  const breathScaleY = level.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.08] });
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          styles.bodyBreath,
          {
            left: 252 * scaleX,
            top: 187 * scaleY,
            width: 136 * scaleX,
            height: 108 * scaleY,
            borderRadius: 56 * scaleY,
            backgroundColor: palette.tint,
            borderColor: palette.accent,
            transform: [{ scaleX: breathScaleX }, { scaleY: breathScaleY }],
          },
        ]}
      />
      <Svg width={width} height={height} viewBox="0 0 640 500">
        <Path d="M318 342 C275 330 226 334 184 358 C148 379 135 410 157 434 C181 460 240 459 302 432 C327 421 352 402 369 380 C356 362 338 349 318 342 Z" fill={palette.tint} opacity={0.72} />
        <Path d="M322 340 C359 325 407 328 451 350 C493 371 516 402 499 427 C481 454 421 460 355 439 C324 429 293 412 270 389 C281 366 300 349 322 340 Z" fill={palette.tint} opacity={0.72} />
        <Circle cx={320} cy={44} r={17} fill="none" stroke={palette.text} strokeWidth={2} opacity={0.66} />
        <Path d="M320 61 C293 61 278 84 284 112 C289 137 302 151 320 151 C338 151 351 137 356 112 C362 84 347 61 320 61 Z" fill="none" stroke={palette.text} strokeWidth={2} opacity={0.66} />
        <Path d="M302 146 C305 164 294 174 268 181 C246 187 232 203 225 225 M338 146 C335 164 346 174 372 181 C394 187 408 203 415 225" fill="none" stroke={palette.text} strokeWidth={2} strokeLinecap="round" opacity={0.66} />
        <Path d="M268 181 C257 222 254 272 260 318 C266 348 286 365 320 366 M372 181 C383 222 386 272 380 318 C374 348 354 365 320 366" fill="none" stroke={palette.text} strokeWidth={2} strokeLinecap="round" opacity={0.66} />
        <Path d="M225 225 C215 258 196 295 168 322 C152 337 132 344 111 341 M415 225 C425 258 444 295 472 322 C488 337 508 344 529 341" fill="none" stroke={palette.text} strokeWidth={2} strokeLinecap="round" opacity={0.66} />
        <Path d="M113 341 C154 360 205 363 260 341 M527 341 C486 360 435 363 380 341 M260 318 C277 334 297 341 320 341 C343 341 363 334 380 318" fill="none" stroke={palette.text} strokeWidth={2} strokeLinecap="round" opacity={0.66} />
      </Svg>
      {airWisps.slice(0, 5).map((index) => {
        const travel = Animated.modulo(Animated.add(level, index / 5), 1);
        const translateY = travel.interpolate({
          inputRange: [0, 1],
          outputRange: [232 * scaleY, 92 * scaleY],
        });
        const opacity = travel.interpolate({
          inputRange: [0, 0.16, 0.84, 1],
          outputRange: [0, 0.36, 0.36, 0],
        });
        const curl = drift.interpolate({
          inputRange: [0, 1],
          outputRange: [-(4 + index) * scaleX, (4 + index) * scaleX],
        });
        return (
          <Animated.View
            key={index}
            style={[
              styles.bodyParticle,
              {
                left: width / 2 - 3,
                backgroundColor: palette.accent,
                opacity,
                transform: [{ translateY }, { translateX: curl }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    alignItems: 'center',
  },
  readout: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  animationStage: {
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    width: '100%',
    textAlign: 'center',
    fontSize: 58,
    lineHeight: 64,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  countProminent: {
    fontSize: 68,
    lineHeight: 74,
  },
  phaseToggle: {
    minHeight: 30,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  phaseToggleLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 1.4,
  },
  phaseToggleDivider: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  phase: {
    width: '100%',
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '400',
    letterSpacing: 2.2,
    marginTop: 4,
  },
  phaseProminent: {
    fontSize: 24,
    lineHeight: 30,
  },
  gradientHoldMarkerTrack: {
    position: 'absolute',
  },
  gradientHoldMarker: {
    position: 'absolute',
    top: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  diaphragmBellyLabels: {
    position: 'absolute',
    top: 0,
  },
  hummingOrbit: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
  hummingPulse: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderWidth: 12,
  },
  hummingMarkerTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  hummingMarker: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  sighVisual: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
  horizontalVisual: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
  coherentWaveTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  coherentWaveTrailClip: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
  coherentWaveMarker: {
    position: 'absolute',
    top: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  orbit478: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
  orbit478MarkerTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  orbit478Marker: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  smokeWisp: {
    position: 'absolute',
    top: 0,
  },
  contour: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderWidth: 1,
  },
  breathSeed: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 18,
    height: 18,
    marginLeft: -9,
    marginTop: -9,
    borderRadius: 9,
  },
  airWisp: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  bodyBreath: {
    position: 'absolute',
    zIndex: 0,
    borderWidth: 1,
  },
  bodyParticle: {
    position: 'absolute',
    top: 0,
    zIndex: 2,
    width: 6,
    height: 10,
    borderRadius: 5,
  },
});
