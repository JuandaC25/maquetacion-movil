import React from 'react';
import { View, Text } from 'react-native';
import { SolicitudesStyles } from '../../../styles/Solicitudes/Solicitudes';

export default function SolicitudesScreen() {
  return (
    <View style={SolicitudesStyles.container}>
      <View style={SolicitudesStyles.notification}>
        <View style={SolicitudesStyles.notificationInner}>
          <View style={SolicitudesStyles.leftAccent} />
          <Text style={SolicitudesStyles.notititle}>Welcome To Uiverse</Text>
          <Text style={SolicitudesStyles.notibody}>Contribute to Open Source UI Elements</Text>
        </View>
      </View>
    </View>
  );
}
