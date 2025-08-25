import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

// API Base URL
const API_BASE_URL = 'https://bluebackkk.vercel.app';

interface DeviceCardProps {
  name: string;
  type: string;
  status: boolean;
  carbonFootprint: number;
  id: string;
  favorite: boolean;
}

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

function MenuItem({
  icon,
  label,
  onPress,
  destructive = false,
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

const DeviceTeamAdCard: React.FC<DeviceCardProps> = ({
  id,
  name,
  type,
  status,
  carbonFootprint,
}) => {
  const [isToggled, setIsToggled] = useState(status);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleToggle = async (argumentValue: string) => {
    let newState = isToggled;
    console.log(argumentValue);
    
    switch (argumentValue) {
      case "Switch":
        newState = !isToggled;
        setIsToggled(newState);
        break;
      case "Delete":
        setIsPopoverOpen(false);
        break;
      case "Favorite":
        setIsPopoverOpen(false);
        break;
      default:
        console.warn(`Acción desconocida: ${argumentValue}`);
        return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/update-status`, {
        method: "POST", // Cambiado de PUT a POST para coincidir con el backend
         headers: {
                    "Content-Type": "application/json"
                },
        body: JSON.stringify({ id, status: newState, argument: argumentValue }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(data);
        // Si la operación fue exitosa, podríamos emitir un evento para actualizar la lista
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('refreshDevices'));
        }
      } else {
        console.log(data.mensaje);
        // Revertir el estado si la operación falló
        if (argumentValue === "Switch") {
          setIsToggled(!newState);
        }
      }
    } catch (error) {
      console.error(error);
      // Revertir el estado si hay un error
      if (argumentValue === "Switch") {
        setIsToggled(!newState);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.type}>{type}</Text>
      </View>
      
      <View style={styles.footer}>
        <Switch
          trackColor={{ false: "#E5E7EB", true: "#D1FAE5" }}
          thumbColor={isToggled ? "#10B981" : "#9CA3AF"}
          ios_backgroundColor="#E5E7EB"
          onValueChange={() => handleToggle("Switch")}
          value={isToggled}
        />
        <Text style={styles.footprint}>
          {carbonFootprint / 1000} kW
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE', // Azul muy claro para fondo de botón de icono
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 22,
    color: '#2563EB', // Azul vibrante para icono
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro para nombre
    marginBottom: 2,
  },
  type: {
    fontSize: 14,
    color: '#64748B', // Gris azulado para tipo
  },
  footer: {
    alignItems: 'flex-end',
  },
  footprint: {
    fontSize: 12,
    color: '#94A3B8', // Gris azulado más claro para huella
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
    color: '#3B82F6', // Azul medio para iconos de menú
  },
  menuItemText: {
    fontSize: 14,
    color: '#1E40AF', // Azul oscuro para texto de menú
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

export default DeviceTeamAdCard;