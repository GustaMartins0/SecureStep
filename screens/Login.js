import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function Login({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Login</Text>
      <Button title="Entrar" onPress={() => navigation.replace('MainTabs')} />
      <Button title="Cadastro" onPress={() => navigation.navigate('Cadastro')} />
      <Button title="Esqueceu a Senha" onPress={() => navigation.navigate('EsqueceuSenha')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h1: { fontSize: 40, fontWeight: 'bold', color: 'green', marginBottom: 20 }
});
