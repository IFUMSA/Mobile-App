import React from 'react';
import { StyleSheet, View, ScrollView, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const Container = ({
  children,
  style,
  scrollable = false,
  keyboardAware = false,
  contentContainerStyle,
  withPadding = true,
  backgroundColor,
  ...rest
}) => {
  
  const containerStyles = [
    styles.container,
    withPadding && styles.padding,
    { backgroundColor: backgroundColor },
    style
  ];

  const contentStyles = [
    styles.content,
    contentContainerStyle
  ];

  if (keyboardAware) {
    return (
      <KeyboardAwareScrollView
        style={containerStyles}
        contentContainerStyle={contentStyles}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={Platform.OS === 'android' ? 50 : 20}
        resetScrollToCoords={{ x: 0, y: 0 }}
        scrollEnabled={true}
        nestedScrollEnabled={Platform.OS === 'android'}
        keyboardOpeningTime={Platform.OS === 'android' ? 500 : 250}
        {...rest}
      >
        {children}
      </KeyboardAwareScrollView>
    );
  }

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyles}
        contentContainerStyle={contentStyles}
        showsVerticalScrollIndicator={false}
        {...rest}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={containerStyles} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  padding: {
    paddingHorizontal: 24,
  },
  content: {
    flexGrow: 1,
  }
});

export default Container;
