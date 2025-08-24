import { getTranslation } from '@/Translations/i18n';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RadarChart } from "react-native-gifted-charts";
import CarbonFootprintModal from '../componentes/ModalCO2';

// API Base URL
const API_BASE_URL = 'https://bluebackkk.vercel.app';

// Define the Device interface for type safety
export interface Device {
  id: string;
  nombre: string;
  state: boolean;
  created_at: any;
  categoria: string;
  watts: number; 
  stringid: string;
  color: string;
  favorite: boolean;
  team_code: string;
}

interface StadisticsScreenProps {
  email: string;
}

// Statistics Screen Component
const StatisticsScreen: React.FC<StadisticsScreenProps> = ({ email }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [totalCarbonFootprint, setTotalCarbonFootprint] = useState<number[][]>([]);
  const [CO2, setCO2] = useState<number>(0);
  const [newDate, setNewDate] = useState("");
  const [mordev, setMordev] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      if (!email) return;
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/get_devices`, {
          method: "POST",
           headers: {
                    "Content-Type": "application/json"
                },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (response.ok) {
          setDevices(data);
          // Obtener huellas de carbono por dispositivo
          const response2 = await fetch(`${API_BASE_URL}/read_perDev`, {
            method: "POST",
             headers: {
                    "Content-Type": "application/json"
                },
            body: JSON.stringify({ data }),
          });
          const huellas = await response2.json();
          if (response2.ok && Array.isArray(huellas)) {
            console.log(huellas[0][0])
            setTotalCarbonFootprint(huellas);
            
          } else {
            console.error(getTranslation("Error obteniendo huellas de carbono:"), huellas);
            setTotalCarbonFootprint([]);
          }
        } else {
          console.error(getTranslation("Error en respuesta del servidor o no hay equipos:"), data);
        }
      } catch (error) {
        console.error(getTranslation("Error fetching teams:"), error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDevices();
  }, [email]);

  // Filter devices based on search term
  const filteredDevices = !searchTerm
    ? devices
    : devices.filter(device =>
        device.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Prepare data for the bar chart
  const radarValues = filteredDevices.map((device, index) => {
    return (index !== -1 && totalCarbonFootprint[index])
      ? totalCarbonFootprint[index][0]
      : 0; // valor por defecto si no existe
  });

  const radarLabels = filteredDevices.map(device =>
    device.nombre.length > 6 ? device.nombre.substring(0, 8) + '...' : device.nombre
  );

  const CO2func = async () => {
    if (!email) return;
    try {
      const response = await fetch(`${API_BASE_URL}/read-CO2`, {
        method: "POST",
         headers: {
                    "Content-Type": "application/json"
                },
        body: JSON.stringify({ email: email })
      });
      const data = await response.json();
      if (response.ok) {
        console.log(getTranslation("CO2:"), data);
        setCO2(data.total_CO2);
        const maxDevice = data.device_mas_CO2;
        if (maxDevice) {
          setMordev(`${maxDevice.nombre}`);
        } else {
          setMordev(getTranslation("No hay dispositivo registrado"));
        }
      } else {
        console.error(getTranslation("Error en respuesta del servidor o no hay dispositivos:"), data);
      }
    } catch (e) {
      console.error(getTranslation("Error fetching CO2:"), e);
    }
  };

  const generateTicket = () => {
    setNewDate(new Date().toLocaleString("en-US", { 
      month: "long", 
      day: "numeric", 
      year: "numeric", 
      hour: "numeric", 
      minute: "2-digit", 
      hour12: true 
    }));
    CO2func();
    setModalVisible(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>{getTranslation("Cargando estadísticas...")}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>{getTranslation("Estadísticas")}</Text>
          <Text style={styles.screenSubtitle}>{getTranslation("Análisis de consumo y huella de carbono")}</Text>
        </View>
        <TouchableOpacity 
          onPress={generateTicket}
          style={styles.ticketButton}
        >
          <Text style={styles.ticketButtonText}>🎫</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={getTranslation("Buscar dispositivo...")}
            placeholderTextColor="#90A4AE"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryCardsContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardIconContainer}>
            <Text style={styles.summaryCardIcon}>💻</Text>
          </View>
          <Text style={styles.summaryCardLabel}>{getTranslation("Dispositivos")}</Text>
          <Text style={styles.summaryCardValue}>{devices.length}</Text>
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardIconContainer}>
            <Text style={styles.summaryCardIcon}>✅</Text>
          </View>
          <Text style={styles.summaryCardLabel}>{getTranslation("Activos")}</Text>
          <Text style={styles.summaryCardValue}>
            {devices.filter(d => d.state === true).length}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardIconContainer}>
            <Text style={styles.summaryCardIcon}>❌</Text>
          </View>
          <Text style={styles.summaryCardLabel}>{getTranslation("Inactivos")}</Text>
          <Text style={styles.summaryCardValue}>
            {devices.filter(d => d.state === false).length}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardIconContainer}>
            <Text style={styles.summaryCardIcon}>🌱</Text>
          </View>
          <Text style={styles.summaryCardLabel}>{getTranslation("Huella Total")}</Text>
          <Text style={styles.summaryCardValue}>
            {totalCarbonFootprint
              .reduce((accumulator, currentValue) => accumulator + currentValue[0], 0)
              .toFixed(2)} kg
          </Text>
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{getTranslation("Huella de Carbono por Dispositivo")}</Text>
          <Text style={styles.chartSubtitle}>{getTranslation("Comparativa de consumo energético")}</Text>
        </View>
        <View style={styles.chartContent}>
          {filteredDevices.length > 0 ? (
            <RadarChart
              data={radarValues}
              labels={radarLabels}
              maxValue={Math.max(...radarValues, 5)}
            />
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartEmoji}>📈</Text>
              <Text style={styles.emptyChartText}>{getTranslation("No hay datos para mostrar")}</Text>
              <Text style={styles.emptyChartSubtext}>{getTranslation("Añade dispositivos para ver estadísticas")}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Table Section */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableTitle}>{getTranslation("Detalles de Dispositivos")}</Text>
          <Text style={styles.tableSubtitle}>{getTranslation("Información detallada por dispositivo")}</Text>
        </View>
        <View style={styles.tableContent}>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>{getTranslation("Dispositivo")}</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>{getTranslation("Estado")}</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>{getTranslation("Huella")}</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>{getTranslation("Horas")}</Text>
          </View>
          
          {filteredDevices.length > 0 ? (
            filteredDevices.map((device, index) => (
              <View key={device.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 3 }]}>
                  {device.nombre.length > 12 ? device.nombre.substring(0, 12) + '...' : device.nombre}
                </Text>
                <View style={[]}>
                  <View style={[
                    styles.statusChip,
                    device.state ? styles.statusChipActive : styles.statusChipInactive,
                  ]}>
                    <Text style={[
                      styles.statusChipText,
                      device.state ? styles.statusChipTextActive : styles.statusChipTextInactive,styles.tableCell, { flex: 2, alignItems: 'center' }
                    ]}>
                      {device.state ? getTranslation("Activo") : getTranslation("Inactivo")}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {totalCarbonFootprint[index] !== undefined
                    ? totalCarbonFootprint[index][0].toFixed(2)
                    : "N/A"}
                </Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {totalCarbonFootprint[index] !== undefined
                    ? totalCarbonFootprint[index][1].toFixed(2)
                    : "N/A"}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyTable}>
              <Text style={styles.emptyTableEmoji}>📱</Text>
              <Text style={styles.emptyTableText}>{getTranslation("No se encontraron dispositivos")}</Text>
              <Text style={styles.emptyTableSubtext}>{getTranslation("Intenta con otra búsqueda")}</Text>
            </View>
          )}
        </View>
      </View>

      <CarbonFootprintModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLeftButtonPress={() => null}
        leftButtonText={getTranslation("Compartir")}
        leftButtonIcon="⤴"
        title={getTranslation("Reporte de Huella de Carbono")}
        imageSource=""
        co2Score={CO2}
        highestImpactDevice={mordev}
        equivalentSavings={getTranslation("Equivalente a")+ " "+ Math.ceil(CO2 / 22)+" "+ getTranslation("árboles plantados")}
        dateTime={newDate}
        accentColor="#2E7D32"
        backgroundColor="#E8F5E9"
      />
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7E3D6', // Sisal Light Shade
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E7E3D6', // Sisal Light Shade
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#928D7C', // Sisal Dark Shade
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#344E7E', // East Bay Base
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#928D7C', // Sisal Dark Shade
  },
  ticketButton: {
    backgroundColor: '#344E7E', // East Bay Base
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#344E7E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ticketButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E7E3D6', // Sisal Light Shade
  },
  searchBarContainer: {
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    color: '#928D7C', // Sisal Dark Shade
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#283F70', // East Bay Dark Shade
    paddingVertical: 12,
  },
  clearButton: {
    padding: 8,
  },
  clearIcon: {
    fontSize: 16,
    color: '#928D7C', // Sisal Dark Shade
  },
  summaryCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  summaryCard: {
    width: (width - 40 - 16) / 2,
    backgroundColor: '#FFFFFF', // Sisal Light Shade
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryCardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E7E3D6', // Sisal Light Shade
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryCardIcon: {
    fontSize: 24,
  },
  summaryCardLabel: {
    fontSize: 14,
    color: '#928D7C', // Sisal Dark Shade
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#344E7E', // East Bay Base
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  chartHeader: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#283F70', // East Bay Dark Shade
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#928D7C', // Sisal Dark Shade
  },
  chartContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
  },
  emptyChart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyChartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283F70', // East Bay Dark Shade
    marginBottom: 8,
  },
  emptyChartSubtext: {
    fontSize: 14,
    color: '#928D7C', // Sisal Dark Shade
    textAlign: 'center',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  tableHeader: {
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#283F70', // East Bay Dark Shade
    marginBottom: 4,
  },
  tableSubtitle: {
    fontSize: 14,
    color: '#928D7C', // Sisal Dark Shade
  },
  tableContent: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E7E3D6', // Sisal Light Shade
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#E7E3D6', // Sisal Light Shade
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E3D6', 
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#283F70', // East Bay Dark Shade
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E3D6', // Sisal Light Shade
  },
  tableCell: {
    fontSize: 14,
    color: '#283F70', // East Bay Dark Shade
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusChipActive: {
    backgroundColor: '#E7E3D6', // Sisal Light Shade
  },
  statusChipInactive: {
    backgroundColor: '#FFE8E8', // Light Red / alert
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: '#344E7E', // East Bay Base
  },
  statusChipTextInactive: {
    color: '#EF5350', // Coral Red
  },
  emptyTable: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTableEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTableText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283F70', // East Bay Dark Shade
    marginBottom: 8,
  },
  emptyTableSubtext: {
    fontSize: 14,
    color: '#928D7C', // Sisal Dark Shade
    textAlign: 'center',
  },
});


export default StatisticsScreen;