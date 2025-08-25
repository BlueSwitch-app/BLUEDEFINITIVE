import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getTranslation } from "@/Translations/i18n";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import StatisticsModal from "./StadisticsPerUserModal"; // Import the StatisticsModal component

// API Base URL
const API_BASE_URL = 'https://bluebackkk.vercel.app';

interface MenuItemProps {
  icon: string;
  label: string;
  destructive?: boolean;
  onPress: () => void;
}

function MenuItem({
  icon,
  label,
  destructive = false,
  onPress,
}: MenuItemProps) {
  const textColor = useThemeColor(
    {},
    destructive ? "destructive" : "foreground"
  );
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.menuItemIcon, { color: textColor }]}>
        {icon}
      </Text>
      <Text style={[styles.menuItemText, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

interface MembersAdminCardProps {
  email: string;
  role: string;
  activeDevicesCount: number;
  index: number;
  teamcode: string;
  onSelectOption: (option: string) => void;
}

const MembersAdminCard: React.FC<MembersAdminCardProps> = ({
  email,
  role,
  activeDevicesCount,
  teamcode
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const handleActions = async (action: string) => {
    setIsPopoverOpen(false);
    
    if (action === "statistics") {
      setShowStatsModal(true);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/update_members`, {
        method: 'POST',
         headers: {
                    "Content-Type": "application/json"
                },
        body: JSON.stringify({ team_code: teamcode, email, action })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(data);
        // Actualizar la lista de miembros después de una acción exitosa
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('refreshMembers'));
        }
      } else {
        console.log(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Get role color based on role
  const getRoleColor = () => {
    switch (role) {
      case 'admin':
        return '#4F46E5';
      case 'assistant':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  // Get role display text
  const getRoleDisplay = () => {
    switch (role) {
      case 'admin':
        return getTranslation('Admin');
      case 'assistant':
        return getTranslation('Asistente');
      default:
        return getTranslation('Miembro');
    }
  };

  // Sample data for the statistics modal
  const statsData = {
    totalCO2: 0,                  // en kg o toneladas
    totalDevices: 0,              // cantidad total de dispositivos
    activeDevices: 0,             // dispositivos encendidos
    inactiveDevices: 0,           // dispositivos apagados
    averageConsumption: 0,        // consumo promedio (kWh)
    highestImpactDevice: "N/A",   // dispositivo con mayor huella
    savingsEquivalent: "0 árboles" // equivalente en ahorro
  };

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <TouchableOpacity style={styles.memberCard}>
            <View style={styles.memberInfo}>
              <Text style={styles.memberEmail}>{email}</Text>
              <View style={styles.memberRoleContainer}>
                <Text style={[styles.memberRole, { color: getRoleColor() }]}>
                  {getRoleDisplay()}
                </Text>
              </View>
            </View>
            <View style={styles.memberStats}>
              <Text style={styles.memberDevicesCount}>{activeDevicesCount}</Text>
              <Text style={styles.memberDevicesLabel}>{getTranslation("activos")}</Text>
            </View>
          </TouchableOpacity>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" style={styles.popoverContent}>
          <MenuItem
            icon="📊"
            label={getTranslation("View Statistics")}
            onPress={() => handleActions("statistics")}
          />
          {role === "member" && (
            <MenuItem
              icon="⬆️"
              label={getTranslation("Promover a asistente")}
              onPress={() => handleActions("promote")}
            />
          )}
          {role === "assistant" && (
            <MenuItem
              icon="⬇️"
              label={getTranslation("Degradar a miembro")}
              onPress={() => handleActions("demote")}
            />
          )}
          {role !== "admin" && (
            <MenuItem
              icon="🗑️"
              label={getTranslation("Eliminar miembro")}
              destructive
              onPress={() => handleActions("delete")}
            />
          )}
        </PopoverContent>
      </Popover>
      
      {/* Statistics Modal */}
      <StatisticsModal
        visible={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        data={statsData}
        email={email}
        team_code={teamcode}
      />
    </>
  );
};

const styles = StyleSheet.create({
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Fondo blanco obligatorio
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#3B82F6', // Sombra azulada
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#BFDBFE', // Borde azul claro
  },
  memberInfo: {
    flex: 1,
  },
  memberEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro para email
    marginBottom: 4,
  },
  memberRoleContainer: {
    alignSelf: 'flex-start',
  },
  memberRole: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#DBEAFE', // Azul muy claro para fondo de rol
    color: '#1E40AF', // Azul oscuro para texto de rol
  },
  memberStats: {
    alignItems: 'flex-end',
  },
  memberDevicesCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB', // Azul vibrante para contador de dispositivos
  },
  memberDevicesLabel: {
    fontSize: 12,
    color: '#64748B', // Gris azulado para etiqueta
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 180,
    backgroundColor: '#FFFFFF', // Fondo blanco
  },
  menuItemIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
    textAlign: 'center',
    color: '#3B82F6', // Azul medio para iconos
  },
  menuItemText: {
    fontSize: 14,
    color: '#1E40AF', // Azul oscuro para texto
  },
  popoverContent: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF', // Fondo blanco
    shadowColor: '#3B82F6', // Sombra azulada
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#BFDBFE', // Borde azul claro
  },
});
export default MembersAdminCard;