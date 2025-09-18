import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // biblioteca de ícones

export default function Perfil({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Logo no topo */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      {/* Título */}
      <Text style={styles.title}>Perfil</Text>

      {/* Ícone de perfil */}
      <View style={styles.iconContainer}>
        <Ionicons name="person-circle-outline" size={100} color="#ccc" />
      </View>

      {/* Informações do usuário */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>Nome de usuário</Text>
        <Text style={styles.info}>Gustavo Martins</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.info}>martins@martins.com</Text>
      </View>

      {}
      <TouchableOpacity onPress={() => navigation.navigate('EsqueceuSenha')} style={styles.leftAlign}>
        <Text style={styles.link}>Esqueceu sua senha?</Text>
      </TouchableOpacity>

      {/* Botão sair */}
      <TouchableOpacity style={[styles.logoutButton, styles.leftAlign]} onPress={() => navigation.replace('Login')}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011a1f',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  logo: {
    width: 250,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  infoBox: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 2,
  },
  info: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  link: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  leftAlign: {
    alignSelf: 'flex-start',
  },
  logoutButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
