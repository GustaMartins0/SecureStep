import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HistoricoBotao() {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>HistoricoBotao</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h1: { fontSize: 40, fontWeight: 'bold', color: 'teal' }
});
