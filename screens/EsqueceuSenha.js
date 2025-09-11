import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function EsqueceuSenha({ navigation }) {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  return (
    <View style={styles.container}>
      {/* Logo e nome do app */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <Text style={styles.title}>Nova Senha</Text>

      {/* Campo Nova Senha */}
      <Text style={styles.label}>Nova Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite sua nova senha"
        placeholderTextColor="#ccc"
        secureTextEntry
        value={novaSenha}
        onChangeText={setNovaSenha}
      />

      {/* Campo Confirmar Senha */}
      <Text style={styles.label}>Confirmar Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirme sua nova senha"
        placeholderTextColor="#ccc"
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      {/* Botão Redefinir Senha */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Redefinir Senha</Text>
      </TouchableOpacity>

      {/* Voltar para Login */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Voltar para Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011a1f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    color: '#fff',
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#9acd32',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
