import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function Perfil({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const {
          data: { user: authUser },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
          console.log('Erro ao obter usuário auth:', userError.message || userError);
        }
        if (!authUser) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        if (mounted) setUser(authUser);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        if (error) {
          console.log('Erro ao carregar profile:', error.message || error);
        } else if (mounted) {
          setProfile(data || null);
        }
      } catch (err) {
        console.log('Erro ao carregar dados do perfil:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleNotificationResponse = (response) => {
    setModalVisible(false);
    Alert.alert(
      'Notificações',
      response ? 'Você aceitou receber notificações.' : 'Você recusou receber notificações.'
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#011a1f' }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 180 : 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header com logo */}
        <View style={styles.header}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Meu Perfil</Text>
        </View>

        {/* Card de perfil */}
        <View style={styles.profileCard}>
          {/* Avatar com ícone */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBackground}>
              {loading ? (
                <ActivityIndicator size={48} color="#022b35" />
              ) : profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={{ width: 96, height: 96, borderRadius: 48 }} />
              ) : (
                <Ionicons name="person" size={80} color="#022b35" />
              )}
            </View>
            <View style={styles.editIcon}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </View>

          {/* Informações do usuário */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <View style={styles.infoHeader}>
                <Ionicons name="person-outline" size={18} color="#9FE870" />
                <Text style={styles.infoLabel}>Nome</Text>
              </View>
              <Text style={styles.infoValue}>{loading ? 'Carregando...' : profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Nome não definido'}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoItem}>
              <View style={styles.infoHeader}>
                <Ionicons name="mail-outline" size={18} color="#9FE870" />
                <Text style={styles.infoLabel}>Email</Text>
              </View>
              <Text style={styles.infoValue}>{loading ? 'Carregando...' : user?.email || 'Email não disponível'}</Text>
            </View>

            {/* seção "Telefone" removida */}
          </View>
        </View>

        {/* Ações rápidas */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('EsqueceuSenha')}
          >
            <View style={styles.actionContent}>
              <View style={[styles.actionIcon, { backgroundColor: '#022b35' }]}>
                <Ionicons name="key-outline" size={20} color="#9FE870" />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Alterar Senha</Text>
                <Text style={styles.actionSubtitle}>Atualize sua senha de acesso</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9FE870" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.actionContent}>
              <View style={[styles.actionIcon, { backgroundColor: '#022b35' }]}>
                <Ionicons name="notifications-outline" size={20} color="#9FE870" />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Notificações</Text>
                <Text style={styles.actionSubtitle}>Gerencie suas notificações</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9FE870" />
          </TouchableOpacity>
        </View>

        {/* Botão sair */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            try {
              await supabase.auth.signOut();
            } catch (err) {
              console.log('Erro ao deslogar', err);
            }
            navigation.replace('Login');
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#e53935" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para notificações */}
      {modalVisible && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notificações</Text>
            <Text style={styles.modalMessage}>Você aceita receber notificações?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#388E3C' }]}
                onPress={() => handleNotificationResponse(true)}
              >
                <Text style={styles.modalButtonText}>Aceitar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#D32F2F' }]}
                onPress={() => handleNotificationResponse(false)}
              >
                <Text style={styles.modalButtonText}>Recusar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011a1f',
    paddingHorizontal: 20,
    paddingBottom: 0, // removido; agora controlado pelo contentContainerStyle do ScrollView
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    width: 180,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  profileCard: {
    backgroundColor: '#022b35',
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#011a1f',
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: '35%',
    backgroundColor: '#939090ff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#022b35',
  },
  infoSection: {
    width: '100%',
  },
  infoItem: {
    marginVertical: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    color: '#9FE870',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 26,
  },
  separator: {
    height: 1,
    backgroundColor: '#034150',
    marginVertical: 8,
  },
  actionsSection: {
    backgroundColor: '#022b35',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    color: '#aaa',
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e53935',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 30, // ajustado
    gap: 12,
    zIndex: 10,       // eleva visualmente o botão
    elevation: 12,    // android
  },
  logoutText: {
    color: '#e53935',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#022b35',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});