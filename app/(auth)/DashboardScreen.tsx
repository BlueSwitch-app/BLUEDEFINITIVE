import { getTranslation } from "@/Translations/i18n";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import MyModal from "../componentes/MyModal";
import DeviceCard from "../componentes/deviceCard";

// Define the Device interface
export interface Device {
  id: string;
  nombre: string;
  state: boolean;
  created_at: string;
  categoria: string;
  watts: number; 
  stringid: string;
  color: string;
  favorite: boolean;
  team: string;
}

interface DashboardScreenProps {
  email: string;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ email }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalFootprint, setTotalFootprint] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
const apiUrl = 'https://bluebackkk.vercel.app';
const diagnoseNetwork = async () => {
  try {
    // Prueba 1: Conexión básica
    const test1 = await fetch(`${apiUrl}/connection`, { method: 'GET' });
    console.log("Test 1 (conexión básica):", test1.status);
    
    // Prueba 2: Preflight OPTIONS
    const test2 = await fetch(`${apiUrl}/get_devices`, { 
      method: 'OPTIONS',
      headers: { 'Content-Type': 'application/json' }
      
    });
    console.log("Test 2 (preflight):", test2.status);
    
    // Prueba 3: Solicitud real
    const test3 = await fetch(`${apiUrl}/get_devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    console.log("Test 3 (solicitud real):", test3.status);
    const test4 = await fetch(`${apiUrl}/read-CO2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'crisesv4@gmail.com' })
    });
    console.log("Test 4 CO2 (solicitud real):", test4.status);
  } catch (error) {
    console.error("Diagnóstico de red falló:", error);
  }
};

diagnoseNetwork();

  // Memoize filtered devices for performance
  const filteredDevices = useMemo(() => {
    if (!searchTerm) return devices;
    return devices.filter(device =>
      device.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [devices, searchTerm]);

  // Fetch devices data - MODIFICADO
const fetchDevices = useCallback(async () => {
    if (!email) return;
    
    try {
      console.log("Intentando obtener dispositivos para:", email);
      console.log("URL de la API:", `${apiUrl}/get_devices`);
      
      const response = await fetch(`${apiUrl}/get_devices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email }),
      });
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.error || errorData.mensaje || 'Error desconocido'}`);
      }
      
      const data = await response.json();
      console.log("Respuesta del servidor:", data);
      
      // Transformar los datos para que coincidan con la interfaz Device
      const transformedDevices = data.map((device: any) => ({
        nombre: device.nombre,
        state: device.state,
        created_at: device.created_at[0][0], // Tomar la primera fecha de inicio
        categoria: device.categoria,
        watts: device.watts,
        stringid: device.stringid,
        color: device.color,
        favorite: device.favorite || false,
        team: device.team
      }));
      
      setDevices(transformedDevices);
      setError(null);
    } catch (err:any) {
      console.error("Error detallado:", err);
      setError(`Error fetching devices: ${err.message}`);
    }
  }, [email, apiUrl]);

  // Fetch CO2 data - MODIFICADO
  const fetchCO2Data = useCallback(async () => {
    if (!email) return;
    
    try {
      const response = await fetch(`${apiUrl}/read-CO2`, {
        method: "POST",
         headers: {
                    "Content-Type": "application/json"
                    
                },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTotalFootprint(data.total_CO2 || 0);
        console.log("Huella de carbono:", data.total_CO2);
      } else {
        setError("Error fetching CO2 data");
        console.error("CO2 error:", data);
      }
    } catch (err) {
      setError("Error fetching CO2 data");
      console.error("Error fetching CO2:", err);
    }
  }, [email, apiUrl]);

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    await Promise.all([
      fetchDevices(),
      fetchCO2Data()
    ]);
    
    setIsLoading(false);
  }, [fetchDevices, fetchCO2Data]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when modal closes
  const handleModalClose = () => {
    setIsModalOpen(false);
    loadData();
  };

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [{ text: "OK" }]);
    }
  }, [error]);

  // Sort devices by favorite status
  const sortedDevices = useMemo(() => {
    return [...filteredDevices].sort((a, b) => Number(b.favorite) - Number(a.favorite));
  }, [filteredDevices]);

  if (isLoading) {
    return (
      <View style={dashboardStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={dashboardStyles.loadingText}>Cargando tus dispositivos...</Text>
      </View>
    );
  }

  return (
    <View style={dashboardStyles.container}>
      <ScrollView 
        style={dashboardStyles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={dashboardStyles.contentContainer}
      >
        {/* Header */}
        <View style={dashboardStyles.header}>
          <View>
            <Text style={dashboardStyles.headerTitle}>{getTranslation("BLUE SWITCH")}</Text>
            <Text style={dashboardStyles.headerSubtitle}>{getTranslation("Controla tu huella de carbono")}</Text>
          </View>
          <TouchableOpacity 
            style={dashboardStyles.refreshButton}
            onPress={loadData}
          >
            <Text style={dashboardStyles.refreshIcon}>↻</Text>
          </TouchableOpacity>
        </View>

        {/* Carbon Footprint Card */}
        <View style={dashboardStyles.footprintCard}>
          <View style={dashboardStyles.footprintHeader}>
            <Text style={dashboardStyles.footprintTitle}>{getTranslation("Huella de Carbono")}</Text>
          </View>
          <View style={dashboardStyles.footprintValueContainer}>
            <Text style={dashboardStyles.footprintValue}>{totalFootprint.toFixed(2)}</Text>
            <Text style={dashboardStyles.footprintUnit}>kg CO₂</Text>
          </View>
          <View style={dashboardStyles.footprintDescriptionContainer}>
            <Text style={dashboardStyles.footprintDescription}>
              {getTranslation("Basado en el consumo de tus dispositivos")}
            </Text>
          </View>
        </View>

        {/* Devices Section */}
        <View style={dashboardStyles.devicesSection}>
          <View style={dashboardStyles.sectionHeader}>
            <Text style={dashboardStyles.sectionTitle}>{getTranslation("Tus Dispositivos")}</Text>
            <TouchableOpacity
              onPress={() => setIsModalOpen(true)}
              style={dashboardStyles.addButton}
            >
              <Text style={dashboardStyles.addButtonText}>{getTranslation("+ Añadir")}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <View style={dashboardStyles.searchBarContainer}>
            <View style={dashboardStyles.searchBar}>
              <Text style={dashboardStyles.searchIcon}>🔍</Text>
              <TextInput
                style={dashboardStyles.searchInput}
                placeholder={getTranslation("Buscar dispositivo...")}
                placeholderTextColor="#9E9E9E"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity 
                  style={dashboardStyles.clearButton}
                  onPress={() => setSearchTerm('')}
                >
                  <Text style={dashboardStyles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Device List */}
          <View style={dashboardStyles.deviceList}>
            {sortedDevices.length > 0 ? (
              sortedDevices.map((device: Device) => (
                <DeviceCard
                  key={device.stringid}
                  id={device.stringid}
                  name={device.nombre}
                  status={device.state}
                  type={device.categoria}
                  favorite={device.favorite}
                  watts={device.watts}
                  color={device.color}
                  teamcode={device.team}
                  created_at={device.created_at}
                />
              ))
            ) : (
              <View style={dashboardStyles.emptyState}>
                <Text style={dashboardStyles.emptyStateEmoji}>📱</Text>
                <Text style={dashboardStyles.emptyStateTitle}>{getTranslation("No tienes dispositivos")}</Text>
                <Text style={dashboardStyles.emptyStateDescription}>
                  {getTranslation("Añade tu primer dispositivo para comenzar a monitorear tu consumo")}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsModalOpen(true)}
                  style={dashboardStyles.emptyStateButton}
                >
                  <Text style={dashboardStyles.emptyStateButtonText}>{getTranslation("Añadir Dispositivo")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal */}
      <MyModal
        isModalOpen={isModalOpen}
        setIsModalOpen={handleModalClose}
        email={email}
        devices={devices}
        setDevices={setDevices}
      />
    </View>
  );
};

const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7E3D6', // Sisal Light Shade 01
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#E7E3D6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#928D7C', // Sisal Dark Shade 02
    fontFamily: 'System',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#344E7E', // East Bay Base
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#928D7C', // Sisal Dark Shade 02
    marginTop: 4,
    fontFamily: 'System',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#44619120', // East Bay Light Shade 01 translúcido
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 20,
    color: '#344E7E', // East Bay Base
  },
  // Carbon Footprint Card
  footprintCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  footprintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  footprintTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283F70', // East Bay Dark Shade 01
    fontFamily: 'System',
  },
  footprintValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  footprintValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#344E7E', // East Bay Base
    lineHeight: 56,
    fontFamily: 'System',
  },
  footprintUnit: {
    fontSize: 18,
    fontWeight: '500',
    color: '#928D7C', // Sisal Dark Shade 02
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: 'System',
  },
  footprintDescriptionContainer: {
    marginBottom: 20,
  },
  footprintDescription: {
    fontSize: 14,
    color: '#928D7C', // Sisal Dark Shade 02
    fontFamily: 'System',
  },
  // Devices Section
  devicesSection: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#283F70', // East Bay Dark Shade 01
    fontFamily: 'System',
  },
  addButton: {
    backgroundColor: '#344E7E', // East Bay Base
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#1B3062',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#E7E3D6', // Sisal Light Shade 01
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
  // Search Bar
  searchBarContainer: {
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#928D7C', // Sisal Dark Shade 02
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#283F70', // East Bay Dark Shade 01
    fontFamily: 'System',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#928D7C', // Sisal Dark Shade 02
  },
  // Device List
  deviceList: {
    paddingBottom: 16,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283F70', // East Bay Dark Shade 01
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#928D7C', // Sisal Dark Shade 02
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: 'System',
  },
  emptyStateButton: {
    backgroundColor: '#344E7E', // East Bay Base
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#1B3062',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyStateButtonText: {
    color: '#E7E3D6', // Sisal Light Shade 01
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
});


export default DashboardScreen;