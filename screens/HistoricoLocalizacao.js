import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HistoricoLocalizacao() {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>HistoricoLocalizacao</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h1: { fontSize: 40, fontWeight: 'bold', color: 'brown' }
});
