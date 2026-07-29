import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  type StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';

export type BottomSheetDismiss = (afterClose?: () => void) => void;

type Props = {
  visible: boolean;
  surfaceColor: string;
  borderColor: string;
  onClose: () => void;
  sheetStyle?: StyleProp<ViewStyle>;
  children: (dismiss: BottomSheetDismiss) => React.ReactNode;
};

const OPEN_DURATION = 300;
const CLOSE_DURATION = 240;

export default function BottomSheetModal({
  visible,
  surfaceColor,
  borderColor,
  onClose,
  sheetStyle,
  children,
}: Props) {
  const { height: screenHeight } = useWindowDimensions();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(screenHeight)).current;
  const closing = useRef(false);

  useEffect(() => {
    if (!visible) return;
    closing.current = false;
    backdropOpacity.setValue(0);
    sheetTranslateY.setValue(screenHeight);
    const animation = Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: OPEN_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [backdropOpacity, screenHeight, sheetTranslateY, visible]);

  const dismiss: BottomSheetDismiss = (afterClose) => {
    if (closing.current) return;
    closing.current = true;
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: screenHeight,
        duration: CLOSE_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      closing.current = false;
      if (!finished) return;
      if (afterClose) afterClose();
      else onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => dismiss()}
    >
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => dismiss()}
            accessibilityRole="button"
            accessibilityLabel="Close bottom sheet"
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: surfaceColor, borderColor },
            sheetStyle,
            { transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          {children(dismiss)}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  sheet: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
