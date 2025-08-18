import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getTranslation } from "@/Translations/i18n";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import StatisticsModal from "./StadisticsPerDevModal"; // Import the StatisticsModal component

interface DeviceCardProps {
  name: string;
  type: string;
  status: boolean;
  watts: number;
  id: string;
  favorite: boolean;
  teamcode: string;
  color: string;
  created_at: string;
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
const DeviceCard: React.FC<DeviceCardProps> = ({
  id,
  name,
  type,
  status,
  watts,
  favorite,
  teamcode,
  created_at
}) => {
  const [isToggled, setIsToggled] = useState(status);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const handleMenuAction = (action: string) => {
    console.log(`Menu action: ${action}`);
    setIsPopoverOpen(false);
    
    if (action === "stats") {
      setShowStatsModal(true);
    }
  };
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
      const response = await fetch("https://buedefinitiveb-1.onrender.com/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: newState, argument: argumentValue }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(data);
      }
      if (!response.ok) {
        console.log(data.mensaje);
      }
    } catch (error) {
      console.error(error);
      if (argumentValue === "Switch") {
        setIsToggled(!newState);
      }
    }
  };
  // Sample data for the statistics modal
  const statsData = {
    name: name,
    type: type,
    status: status,
    watts: watts,
     color: "blue",
     favorite: favorite,
     team_code: teamcode,
     carbonFootprint: 22,
     created_at: created_at
  };
  return (
    <>
      <View style={styles.container}>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsPopoverOpen(true)}
            >
              <Text style={styles.icon}>
                {favorite ? '⭐' : '💡'}
              </Text>
            </TouchableOpacity>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" style={styles.popoverContent}>
            <MenuItem
              icon="📊"
              label={getTranslation("View Statistics")}
              onPress={() => {
                handleMenuAction("stats");
              }}
            />
            <MenuItem
              icon={favorite ? '⭐' : '☆'}
              label={favorite ? getTranslation("Remove from Favorites") : getTranslation("Add to Favorites")}
              onPress={() => {
                handleToggle("Favorite");
              }}
            />
            <MenuItem
              icon="🗑️"
              label={getTranslation("Delete")}
              destructive
              onPress={() => handleToggle("Delete")}
            />
          </PopoverContent>
        </Popover>
        
        <View style={styles.content}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.type}>{type}</Text>
        </View>
        
        <View style={styles.footer}>
          <Switch
            trackColor={{ false: "#ECEFF1", true: "#E8F5E9" }}
            thumbColor={isToggled ? "#2E7D32" : "#90A4AE"}
            ios_backgroundColor="#ECEFF1"
            onValueChange={() => handleToggle("Switch")}
            value={isToggled}
          />
          <Text style={styles.footprint}>
            {watts / 1000} kW
          </Text>
        </View>
      </View>
      {/* Statistics Modal */}
      <StatisticsModal
        visible={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        device={statsData}
      />
    </>
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
    backgroundColor: '#E8F5E9', // Light Green
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 22,
    color: '#2E7D32', // Forest Green
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#37474F', // Charcoal Gray
    marginBottom: 2,
  },
  type: {
    fontSize: 14,
    color: '#607D8B', // Blue Gray
  },
  footer: {
    alignItems: 'flex-end',
  },
  footprint: {
    fontSize: 12,
    color: '#607D8B', // Blue Gray
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
    color: '#37474F', // Charcoal Gray
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