import { getTranslation } from '@/Translations/i18n';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// API Base URL
const API_BASE_URL = 'https://bluebackkk.vercel.app';

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

interface ChartBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

interface StatisticsModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  data?: {
    totalCO2: number;
    totalDevices: number;
    activeDevices: number;
    inactiveDevices: number;
    averageConsumption: number;
    highestImpactDevice: string;
    savingsEquivalent: string;
  };
  email: string;
  team_code: string;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({
  visible,
  onClose,
  title = "Estadísticas de Consumo",
  data = {
    totalCO2: 0,
    totalDevices: 0,
    activeDevices: 0,
    inactiveDevices: 0,
    averageConsumption: 0,
    highestImpactDevice: "N/A",
    savingsEquivalent: "N/A",
  },
  email,
  team_code
}) => {
  const [C02, setCO2] = useState(0);
  const [watts, setWatts] = useState(0);
  const [dev, setDev] = useState(0);
  const [trees, setTrees] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/readstatisdics_peruser`, {
          method: "POST",
           headers: {
                    "Content-Type": "application/json"
                },
          body: JSON.stringify({ email, team_code }),
        });
        
        const data = await response.json();
        console.log(data);
        
        if (response.ok && data.success) {
          setCO2(data.data.CO2);
          setWatts(data.data.watts);
          setDev(data.data.numdevices);
          setTrees(data.data.trees);
        } else {
          console.error("Error fetching statistics:", data.error);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (visible && email && team_code) {
      fetchStatistics();
    }
  }, [visible, email, team_code]);

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
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{getTranslation("Cargando estadísticas...")}</Text>
              </View>
            ) : (
              <>
                {/* Summary Cards */}
                <View style={styles.summarySection}>
                  <StatCard
                    title={getTranslation("Huella Total")}
                    value={`${C02} kg`}
                    subtitle={"CO₂"}
                    icon="🌍"
                    color="#4F46E5"
                  />
                  <StatCard
                    title={getTranslation("Dispositivos")}
                    value={dev.toString()}
                    subtitle={getTranslation("Dispositivos Totales")}
                    icon="💻"
                    color="#10B981"
                  />
                  <StatCard
                    title={getTranslation("Consumo en Watts")}
                    value={`${watts/1000} kW`}
                    subtitle={getTranslation("Avarage Consumtion")}
                    icon="⚡"
                    color="#F59E0B"
                  />
                  <StatCard
                    title={getTranslation("Equivalente en Árboles")}
                    value={trees.toString()}
                    subtitle={getTranslation("Basado en el consumo de todos los dispositivos")}
                    icon="🌳"
                    color="#10B981"
                  />
                </View>
              </>
            )}
          </ScrollView>
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
  summarySection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  statCard: {
    width: (width - 48 - 16) / 2,
    backgroundColor: '#EFF6FF', // Azul muy claro para tarjetas
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#3B82F6', // Sombra azulada
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
    color: '#64748B', // Gris azulado para textos secundarios
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
  chartSection: {
    marginBottom: 32,
  },
  chartContainer: {
    backgroundColor: '#EFF6FF', // Azul muy claro para contenedor de gráficos
    borderRadius: 16,
    padding: 20,
  },
  chartBarContainer: {
    marginBottom: 16,
  },
  chartBarLabel: {
    fontSize: 14,
    color: '#475569', // Gris azulado para etiquetas
    marginBottom: 8,
  },
  chartBarTrack: {
    height: 8,
    backgroundColor: '#BFDBFE', // Azul claro para barra de fondo
    borderRadius: 4,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6', // Azul medio para barra de progreso
    borderRadius: 4,
  },
  chartBarValue: {
    fontSize: 12,
    color: '#64748B', // Gris azulado para valores
    marginTop: 4,
    textAlign: 'right',
  },
  noDataText: {
    fontSize: 14,
    color: '#64748B', // Gris azulado para texto sin datos
    textAlign: 'center',
    paddingVertical: 20,
  },
  impactSection: {
    marginBottom: 32,
  },
  impactCard: {
    backgroundColor: '#EFF6FF', // Azul muy claro para tarjeta de impacto
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#3B82F6', // Sombra azulada
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  impactIconContainer: {
    marginRight: 16,
  },
  impactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB', // Azul vibrante para icono principal
    justifyContent: 'center',
    alignItems: 'center',
  },
  impactIconText: {
    fontSize: 28,
    color: '#FFFFFF', // Texto blanco para contraste
  },
  impactContent: {
    flex: 1,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro para título
    marginBottom: 4,
  },
  impactSubtitle: {
    fontSize: 14,
    color: '#64748B', // Gris azulado para subtítulo
  },
  impactArrow: {
    marginLeft: 16,
  },
  impactArrowText: {
    fontSize: 24,
    color: '#2563EB', // Azul vibrante para flecha
  },
  activitySection: {
    marginBottom: 32,
  },
  activityContainer: {
    backgroundColor: '#EFF6FF', // Azul muy claro para contenedor de actividades
    borderRadius: 16,
    padding: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIconContainer: {
    marginRight: 16,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE', // Azul muy claro para iconos de actividad
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3B82F6', // Azul medio para iconos
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#64748B', // Gris azulado para títulos de actividad
    marginBottom: 2,
  },
  activityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro para valores de actividad
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

export default StatisticsModal;