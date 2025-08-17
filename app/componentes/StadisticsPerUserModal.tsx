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
    useEffect(() => {
      const fetchTeams = async () => {
        try {
          const response = await fetch("https://buedefinitiveb-production.up.railway.app/readstatisdics_peruser", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({email, team_code}),
          });
          const data = await response.json();
          console.log(data)
          setCO2(data.data["CO2"])
          setWatts(data.data["watts"])
          setDev(data.data["numdevices"])
          setTrees(data.data["trees"])
            
        } catch (error) {
          console.error(error);
        }
      };
      fetchTeams();
    }, []);
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
    backgroundColor: '#FFFFFF',
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
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
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
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statCardIconText: {
    fontSize: 24,
  },
  statCardContent: {
    flex: 1,
  },
  statCardTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statCardSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chartSection: {
    marginBottom: 32,
  },
  chartContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
  },
  chartBarContainer: {
    marginBottom: 16,
  },
  chartBarLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  chartBarTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartBarValue: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  impactSection: {
    marginBottom: 32,
  },
  impactCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
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
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  impactIconText: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  impactContent: {
    flex: 1,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  impactSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  impactArrow: {
    marginLeft: 16,
  },
  impactArrowText: {
    fontSize: 24,
    color: '#4F46E5',
  },
  activitySection: {
    marginBottom: 32,
  },
  activityContainer: {
    backgroundColor: '#F9FAFB',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconText: {
    fontSize: 20,
    fontWeight: '600',
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  activityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});

export default StatisticsModal;