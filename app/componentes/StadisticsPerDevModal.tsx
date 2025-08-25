import { getTranslation } from '@/Translations/i18n';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// API Base URL
const API_BASE_URL = 'https://bluebackkk.vercel.app';

interface DeviceData {
  name: string;
  type: string;
  status: boolean;
  carbonFootprint: number;
  watts: number;
  color: string;
  favorite: boolean;
  team_code: string;
  created_at: string;
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statCardIcon, { backgroundColor: `${color}20` }]}>
      <Text style={[styles.statCardIconText, { color }]}>{icon}</Text>
    </View>
    <View style={styles.statCardContent}>
      <Text style={styles.statCardTitle}>{title}</Text>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      <Text style={styles.statCardSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

interface DeviceDetailCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
}

const DeviceDetailCard: React.FC<DeviceDetailCardProps> = ({ label, value, icon, color }) => (
  <View style={styles.deviceDetailCard}>
    <View style={[styles.deviceDetailIcon, { backgroundColor: `${color}20` }]}>
      <Text style={[styles.deviceDetailIconText, { color }]}>{icon}</Text>
    </View>
    <View style={styles.deviceDetailContent}>
      <Text style={styles.deviceDetailLabel}>{label}</Text>
      <Text style={styles.deviceDetailValue}>{value}</Text>
    </View>
  </View>
);

interface StatisticsModalProps {
  visible: boolean;
  onClose: () => void;
  device: DeviceData;
}

const StatisticsPerDevModal: React.FC<StatisticsModalProps> = ({
  visible,
  onClose,
  device
}) => {
  // Calculate tree equivalent based on carbon footprint
  const [treeEquivalent, setTreeEquivalent] = React.useState(0);
  const [Co2, setCo2] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeviceData = async () => {
      if (!device) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/read_perDev`, {
          method: "POST",
           headers: {
                    "Content-Type": "application/json"
                },
          body: JSON.stringify({ data: [device] }),
        });
        
        const data = await response.json();
        console.log(data);
        
        if (response.ok) {
          // Assuming the response is the CO2 value directly
          const co2Value = data;
          setCo2(co2Value);
          setTreeEquivalent(Math.ceil(co2Value / 22));
        } else {
          console.error("Error fetching device data:", data);
        }
      } catch (error) {
        console.error("Error fetching device data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (visible && device) {
      fetchDeviceData();
    }
  }, [visible, device]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{getTranslation("Detalles de Dispositivos")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            {/* Device Info Card */}
            <View style={styles.deviceInfoCard}>
              <View style={styles.deviceInfoHeader}>
                <View style={[styles.deviceStatusIndicator, { 
                  backgroundColor: device.status ? '#4CAF50' : '#90A4AE' 
                }]}>
                  <Text style={styles.deviceStatusText}>
                    {device.status ? getTranslation('Activo') : getTranslation('Inactivo')}
                  </Text>
                </View>
                {device.favorite && (
                  <View style={styles.favoriteBadge}>
                    <Text style={styles.favoriteText}>⭐</Text>
                  </View>
                )}
              </View>
              <View style={styles.deviceNameContainer}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceType}>{device.type}</Text>
              </View>
            </View>
            
            {/* Loading State */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{getTranslation("Calculando estadísticas...")}</Text>
              </View>
            ) : (
              <>
                {/* Summary Cards */}
                <View style={styles.summarySection}>
                  <StatCard
                    title={getTranslation("Mi Carbon Footprint")}
                    value={`${Co2} kg`}
                    subtitle={"CO₂"}
                    icon="🌍"
                    color="#2E7D32"
                  />
                  <StatCard
                    title={getTranslation("Consumo en Watts")}
                    value={`${device.watts/1000} KW`}
                    subtitle={getTranslation("Average Consumption")}
                    icon="⚡"
                    color="#FFA726"
                  />
                  <StatCard
                    title={getTranslation("Equivalente en Árboles")}
                    value={`${treeEquivalent} tree(s)`}
                    subtitle={getTranslation("Árboles necesarios para compensar esta huella")}
                    icon="🌳"
                    color="#4CAF50"
                  />
                </View>
                
                {/* Device Details in Two Columns */}
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>{getTranslation("Detalles de Dispositivos")}</Text>
                  <View style={styles.detailsContainer}>
                    {/* First Column */}
                    <View style={styles.detailsColumn}>
                      <DeviceDetailCard
                        label="Status"
                        value={device.status ? getTranslation("Activo") : getTranslation("Inactivo")}
                        icon={device.status ? "✅" : "❌"}
                        color={device.status ? "#4CAF50" : "#90A4AE"}
                      />
                      <DeviceDetailCard
                        label="Favorite"
                        value={device.favorite ? getTranslation("Yes") : getTranslation("No")}
                        icon={device.favorite ? "⭐" : "☆"}
                        color="#FFCA28"
                      />
                    </View>
                    
                    {/* Second Column */}
                    <View style={styles.detailsColumn}>
                      <DeviceDetailCard
                        label={getTranslation("Categoría")}
                        value={device.type}
                        icon="📱"
                        color="#0288D1"
                      />
                      <DeviceDetailCard
                        label={getTranslation("Código del equipo")}
                        value={device.team_code}
                        icon="🔑"
                        color="#00897B"
                      />
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF', // Fondo blanco obligatorio
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E40AF', // Azul oscuro para títulos
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE', // Azul muy claro para botón de cierre
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#3B82F6', // Azul medio para icono de cierre
  },
  modalBody: {
    paddingHorizontal: 24,
  },
  deviceInfoCard: {
    backgroundColor: '#EFF6FF', // Azul muy claro para tarjeta de dispositivo
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#3B82F6', // Sombra azulada
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  deviceInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  deviceStatusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#3B82F6', // Azul medio para indicador de estado
  },
  deviceStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF', // Texto blanco para contraste
  },
  favoriteBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB', // Azul vibrante para badge de favorito
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteText: {
    fontSize: 14,
    color: '#FFFFFF', // Texto blanco para contraste
  },
  deviceNameContainer: {
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E40AF', // Azul oscuro para nombre de dispositivo
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 14,
    color: '#64748B', // Gris azulado para tipo de dispositivo
  },
  summarySection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    width: (width - 48 - 16) / 2,
    backgroundColor: '#FFFFFF', // Fondo blanco
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#3B82F6', // Sombra azulada
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#BFDBFE', // Borde azul claro
  },
  statCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE', // Azul muy claro para iconos
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statCardIconText: {
    fontSize: 24,
    color: '#2563EB', // Azul vibrante para iconos
  },
  statCardContent: {
    flex: 1,
  },
  statCardTitle: {
    fontSize: 12,
    color: '#64748B', // Gris azulado para títulos
    marginBottom: 2,
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF', // Azul oscuro para valores
    marginBottom: 2,
  },
  statCardSubtitle: {
    fontSize: 12,
    color: '#94A3B8', // Gris azulado más claro
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro para títulos de sección
    marginBottom: 16,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', // Fondo blanco
    borderRadius: 16,
    padding: 16,
    shadowColor: '#3B82F6', // Sombra azulada
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#BFDBFE', // Borde azul claro
  },
  detailsColumn: {
    flex: 1,
  },
  deviceDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  deviceDetailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE', // Azul muy claro para iconos
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceDetailIconText: {
    fontSize: 20,
    color: '#3B82F6', // Azul medio para iconos
  },
  deviceDetailContent: {
    flex: 1,
  },
  deviceDetailLabel: {
    fontSize: 14,
    color: '#64748B', // Gris azulado para etiquetas
    marginBottom: 2,
  },
  deviceDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro para valores
  },
  impactSection: {
    marginBottom: 24,
  },
  impactCard: {
    backgroundColor: '#FFFFFF', // Fondo blanco
    borderRadius: 16,
    padding: 20,
    shadowColor: '#3B82F6', // Sombra azulada
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#BFDBFE', // Borde azul claro
  },
  impactTextContainer: {
    alignItems: 'center',
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro para título
    marginBottom: 8,
  },
  impactValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB', // Azul vibrante para valor de impacto
    marginBottom: 8,
  },
  impactDescription: {
    fontSize: 14,
    color: '#64748B', // Gris azulado para descripción
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B', // Gris azulado para texto de carga
  },
});

export default StatisticsPerDevModal;