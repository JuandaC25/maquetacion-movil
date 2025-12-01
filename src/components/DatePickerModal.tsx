import React from 'react';
import { Platform, View, Modal, TouchableOpacity, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  visible: boolean;
  mode: 'date' | 'time';
  value: Date;
  onChange: (event: any, date?: Date) => void;
  onClose: () => void;
}

export default function DatePickerModal({ visible, mode, value, onChange, onClose }: Props) {
  // Forzar display 'spinner' en Android para time (AM/PM), 'default' para date
  const display = Platform.OS === 'android' && mode === 'time' ? 'spinner' : (Platform.OS === 'ios' ? 'inline' : 'default');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} activeOpacity={1} onPress={onClose}>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 }}>
          <DateTimePicker
            value={value}
            mode={mode}
            display={display}
            onChange={onChange}
            style={{ width: '100%' }}
          />
          <TouchableOpacity onPress={onClose} style={{ marginTop: 12, alignSelf: 'flex-end' }}>
            <Text style={{ color: '#00ff4cff', fontWeight: 'bold', fontSize: 16 }}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
