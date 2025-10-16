import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Perfil({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Logo no topo */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      {/* Título */}
      <Text style={styles.title}>Meu Perfil</Text>

      {/* Ícone de perfil */}
      <View style={styles.iconContainer}>
        <Ionicons name="person-circle-outline" size={120} color="#ffffffff" />
      </View>

      {/* Informações do usuário */}
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nome de usuário</Text>
          <Text style={styles.info}>Gustavo Martins</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.info}>martins@martins.com</Text>
        </View>
      </View>

      {/* Link para redefinir senha */}
      <TouchableOpacity onPress={() => navigation.navigate('EsqueceuSenha')} style={styles.leftAlign}>
        <Text style={styles.link}>Esqueceu sua senha?</Text>
      </TouchableOpacity>

      {/* Botão sair */}
      <TouchableOpacity
        style={[styles.logoutButton, styles.leftAlign]}
        onPress={() => navigation.replace('Login')}
      >
        <Ionicons name="log-out-outline" size={18} color="#fff" />
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
    width: 200,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 25,
  },
  iconContainer: {
    marginBottom: 30,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#022b35',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  infoRow: {
    marginBottom: 15,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 2,
  },
  info: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  link: {
    color: '#ffffffff',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  leftAlign: {
    alignSelf: 'flex-start',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53935',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 10,
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
