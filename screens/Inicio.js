import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function Inicio() {
  const [location, setLocation] = useState(null);
  const [MapComponents, setMapComponents] = useState({ MapView: null, Marker: null });

  // Importação dinâmica de react-native-maps apenas no mobile
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const MapView = require('react-native-maps').default;
      const Marker = require('react-native-maps').Marker;
      setMapComponents({ MapView, Marker });
    }

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão negada para acessar localização');
        setLocation({
          coords: { latitude: -23.099, longitude: -45.707 },
        });
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const { MapView, Marker } = MapComponents;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="eye-outline" size={30} color="#fff" />
        <Text style={styles.logo}>SecureStep</Text>
      </View>
      <View style={{ marginTop: 30 }} />

      <Text style={styles.title}>Localização</Text>

      {/* Localização atual */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Localização atual</Text>

        {location ? (
          Platform.OS === 'web' ? (
            <iframe
              title="Mapa"
              style={{
                width: '100%',
                height: 180,
                borderRadius: 12,
                border: 'none',
                marginBottom: 10,
              }}
              src={`https://maps.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}&z=15&output=embed`}
            />
          ) : (
            MapView &&
            Marker && (
              <MapView
                style={styles.mapa}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="Você está aqui"
                />
              </MapView>
            )
          )
        ) : (
          <Text style={{ color: '#aaa', textAlign: 'center' }}>Carregando localização...</Text>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.endereco}>Av. Monsenhor Theodomiro Lobo - Caçapava</Text>
          <Text style={styles.hora}>16:30</Text>
        </View>
      </View>

      {/* Local desejado */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Local desejado</Text>
        <TouchableOpacity style={styles.micButton}>
          <MaterialIcons name="keyboard-voice" size={32} color="white" />
        </TouchableOpacity>
        <View style={styles.infoRow}>
          <Text style={styles.endereco}>Terminal Rodoviaria Caçapava - Caçapava</Text>
          <Text style={styles.distancia}>500m</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#001A1A',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 10,
  },
  mapa: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  endereco: {
    color: 'white',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  hora: {
    color: 'white',
    fontWeight: 'bold',
  },
  distancia: {
    color: '#9FE870',
    fontWeight: 'bold',
  },
  micButton: {
    alignSelf: 'center',
    backgroundColor: '#D32F2F',
    padding: 18,
    borderRadius: 50,
    marginBottom: 10,
    marginTop: 10,
  },
});
