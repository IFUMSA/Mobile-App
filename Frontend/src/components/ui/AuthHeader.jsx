import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from '@components/ui/Text';

const AuthHeader = ({ title }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.heading}>
      <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
        <Image
          source={require('@assets/icons/back-icon.png')}
          width={24}
          height={24}
        />
      </TouchableOpacity>
      <View style={styles.headingText}>
        <Text variant="heading" fontSize={20}>
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    marginTop: 72,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headingText: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -44,
  },
});

export default AuthHeader; 