import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Pressable,
  Dimensions,
  Animated,
} from 'react-native';
import { useTheme } from '@hooks/use-theme';

const { width: screenWidth } = Dimensions.get('window');

export default function OtpInput({
  length = 4,
  onChange = () => {},
  containerStyle,
  boxStyle,
  textStyle,
  fixedBoxWidth = null,
}) {
  const { theme } = useTheme();
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isFocused && value.length < length) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      blinkAnimation.start();
      
      return () => {
        blinkAnimation.stop();
        cursorOpacity.setValue(1);
      };
    } else {
      cursorOpacity.setValue(0);
    }
  }, [isFocused, value.length, length, cursorOpacity]);

  /* ---------- helpers ---------- */
  const handleChange = useCallback(
    (txt) => {
      const clean = txt.replace(/\D/g, '').slice(0, length);
      setValue(clean);
      onChange(clean);
    },
    [length, onChange],
  );

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  const digits = value.split('');
  const boxes = Array.from({ length });

  // Memoize calculated values
  const { gap, maxOtpRowWidth, calculatedBoxWidth } = useMemo(() => {
    const themeGap = 16;
    const otpRowWidth = Math.min(screenWidth, 600);
    const boxWidth =
      fixedBoxWidth || ((otpRowWidth - 48) - themeGap * (length - 1)) / length;
    return {
      gap: themeGap,
      maxOtpRowWidth: otpRowWidth,
      calculatedBoxWidth: boxWidth,
    };
  }, [fixedBoxWidth, length]);

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    inputArea: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2,
      backgroundColor: "transparent",
    },
    hiddenInput: {
      width: '100%',
      height: '100%',
      fontSize: 1,
      color: 'transparent',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textAlign: 'center',
      caretHidden: Platform.OS === 'android',
    },
    row: {
      flexDirection: 'row',
      columnGap: gap,
      position: "relative",
      width: maxOtpRowWidth,
    },
    box: {
      width: calculatedBoxWidth,
      aspectRatio: 0.70,
      borderRadius: 12,
      backgroundColor: theme.colors?.secondaryAlpha?.[10],
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    boxActive: { 
      // borderColor: theme.colors?.primary || '#3B82F6',
      // borderWidth: 2,
    },
    boxFilled: {
      // borderColor: theme.colors?.secondary || '#2A996B',
      // backgroundColor: theme.colors?.primaryAlpha?.[5] || '#F0F9FF',
    },
    text: { 
      fontSize: Math.min(calculatedBoxWidth * 0.8, 48),
      color: theme.colors?.primary,
    },
    cursor: {
      position: 'absolute',
      width: 3,
      height: 32,
      backgroundColor: theme.colors?.primary,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable onPress={handleContainerPress} style={styles.inputArea}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="number-pad"
          maxLength={length}
          style={styles.hiddenInput}
          returnKeyType="done"
          textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : 'none'}
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
          placeholder=" "
          placeholderTextColor="transparent"
          selectionColor="transparent"
          autoFocus
        />
      </Pressable>
      <View style={styles.row} pointerEvents="none">
        {boxes.map((_, i) => (
          <View
            key={i}
            style={[
              styles.box,
              isFocused && i === value.length && value.length < length && styles.boxActive,
              value.length > i && styles.boxFilled,
              boxStyle,
            ]}
          >
            <Text style={[styles.text, textStyle]}>{digits[i] ?? ''}</Text>
            {isFocused && i === value.length && (
              <Animated.View 
                style={[
                  styles.cursor,
                  { opacity: cursorOpacity }
                ]} 
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}