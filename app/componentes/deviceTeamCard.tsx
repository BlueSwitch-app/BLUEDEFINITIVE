import { getTranslation } from "@/Translations/i18n";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DeviceCardProps {
  name: string;
  type: string;
  status: boolean;
  carbonFootprint: number;
  id: string;
  favorite: boolean;
}



const DeviceCard: React.FC<DeviceCardProps> = ({

  name,
  type,
  status,
  carbonFootprint,
 
}) => {



  return (
    <View style={styles.container}>
   
      
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.type}>{type}</Text>
      </View>
      
      <View style={styles.footer}>
        <Text
        style={{
          color: status ? "#065F46" : "#991B1B",
          fontWeight: "bold",
        }}
      >
        {status ? getTranslation("Activo") : getTranslation("Inactivo")}
      </Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  type: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    alignItems: 'flex-end',
  },
  footprint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 180,
  },
  menuItemIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  menuItemText: {
    fontSize: 14,
  },
  popoverContent: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default DeviceCard;