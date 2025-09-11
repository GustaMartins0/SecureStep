import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EsqueceuSenha() {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>EsqueceuSenha</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h1: { fontSize: 40, fontWeight: 'bold', color: 'orange' }
});
