import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Linking } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function Inicio() {
  const [location, setLocation] = useState(null);
  const [MapComponents, setMapComponents] = useState({ MapView: null, Marker: null });
  const [address, setAddress] = useState('');
  const [brTime, setBrTime] = useState('');
  const [destCoords, setDestCoords] = useState(null);
  const [destName, setDestName] = useState('Terminal Rodoviaria Caçapava - Caçapava');
  const [distanceStr, setDistanceStr] = useState('');

  // Função utilitária para formatar placemark do expo-location
  const formatPlacemark = (p) => {
    const street = p.street || p.name || '';
    const city = p.city || p.region || '';
    return street ? (city ? `${street} - ${city}` : street) : (city || 'Endereço desconhecido');
  };
  
  // Importação dinâmica de react-native-maps apenas no mobile
  useEffect(() => {
    // carregar mapa nativo no mobile
    if (Platform.OS !== 'web') {
      const MapView = require('react-native-maps').default;
      const Marker = require('react-native-maps').Marker;
      setMapComponents({ MapView, Marker });
    }

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let coords;
      if (status !== 'granted') {
        console.log('Permissão negada para acessar localização');
        coords = { latitude: -23.099, longitude: -45.707 };
        setLocation({ coords });
      } else {
        let loc = await Location.getCurrentPositionAsync({});
        coords = loc.coords;
        setLocation(loc);
      }

      // Reverse geocoding: mobile via expo-location, web via Nominatim (OpenStreetMap)
      try {
        if (Platform.OS === 'web') {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`
          );
          const data = await resp.json();
          if (data) {
            const display = data.address
              ? [
                  data.address.road,
                  data.address.neighbourhood,
                  data.address.suburb,
                  data.address.city || data.address.town || data.address.village,
                ]
                  .filter(Boolean)
                  .join(', ')
              : data.display_name;
            setAddress(display || 'Endereço desconhecido');
          }
        } else {
          const placemarks = await Location.reverseGeocodeAsync(coords);
          if (placemarks && placemarks.length > 0) {
            setAddress(formatPlacemark(placemarks[0]));
          }
        }
        // Geocode do destino (Terminal) para obter coordenadas
        try {
          const query = 'Terminal Rodoviaria Caçapava, Caçapava, Brasil';
          if (Platform.OS === 'web') {
            const s = await fetch(
              `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1`
            );
            const r = await s.json();
            if (r && r.length > 0) {
              setDestCoords({ latitude: parseFloat(r[0].lat), longitude: parseFloat(r[0].lon) });
              setDestName(r[0].display_name || destName);
            }
          } else {
            const res = await Location.geocodeAsync(query);
            if (res && res.length > 0) {
              setDestCoords({ latitude: res[0].latitude, longitude: res[0].longitude });
            }
          }
        } catch (err) {
          console.log('Erro no geocoding do destino:', err);
        }
      } catch (err) {
        console.log('Erro no reverse geocoding:', err);
      }
    })();
  }, []);
  
  // Atualiza o horário de Brasília a cada minuto
  useEffect(() => {
    const updateTime = () => {
      try {
        const formatter = new Intl.DateTimeFormat('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Sao_Paulo',
        });
        setBrTime(formatter.format(new Date()));
      } catch (err) {
        // fallback simples
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        setBrTime(`${hh}:${mm}`);
      }
    };

    updateTime();
    const id = setInterval(updateTime, 60 * 1000);
    return () => clearInterval(id);
  }, []);
  
  // calcula distância (metros) usando haversine
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000; // metros
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  
  // atualiza distância quando local ou destino mudam
  useEffect(() => {
    if (location && location.coords && destCoords) {
      const d = haversineDistance(
        location.coords.latitude,
        location.coords.longitude,
        destCoords.latitude,
        destCoords.longitude
      );
      if (d < 1000) setDistanceStr(`${Math.round(d)}m`);
      else setDistanceStr(`${(d / 1000).toFixed(1)} km`);
    }
  }, [location, destCoords]);
  
  // abre rota no Google Maps (web abre em nova aba)
  const openRoute = () => {
    if (!location || !location.coords || !destCoords) return;
    const origin = `${location.coords.latitude},${location.coords.longitude}`;
    const destination = `${destCoords.latitude},${destCoords.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };
  
  const { MapView, Marker } = MapComponents;
  
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="eye-outline" size={30} color="#fff" />
        <Text style={styles.logo}>SecureStep</Text>
      </View>
      <View style={{ marginTop: 40 }} />

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
                {destCoords && (
                  <Marker
                    coordinate={{ latitude: destCoords.latitude, longitude: destCoords.longitude }}
                    pinColor="green"
                    title={destName}
                  />
                )}
              </MapView>
            )
          )
        ) : (
          <Text style={{ color: '#aaa', textAlign: 'center' }}>Carregando localização...</Text>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.endereco}>{address || 'Carregando endereço...'}</Text>
          <Text style={styles.hora}>{brTime || '...'}</Text>
        </View>
      </View>

      {/* Local desejado */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Local desejado</Text>
        <TouchableOpacity style={styles.micButton}>
          <MaterialIcons name="keyboard-voice" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={openRoute} style={{ marginTop: 6 }}>
          <View style={styles.infoRow}>
            <Text style={styles.endereco}>{destName}</Text>
            <Text style={styles.distancia}>{distanceStr || '...'} </Text>
          </View>
          <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 6 }}>
            Toque para abrir rota no Maps
          </Text>
        </TouchableOpacity>
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
