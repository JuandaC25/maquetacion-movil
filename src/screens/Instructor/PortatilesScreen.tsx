import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SoliPortMovil } from '../../components/SoliPortMovil';
import HeaderWithDrawer from './Header/Header';

export default function PortatilesScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithDrawer title="Portátiles" navigation={navigation} />
      <SoliPortMovil />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
