
import { getTranslation } from "@/Translations/i18n";
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DeviceTeamAdCard from "../componentes/deviceTeamAdCard";
import MembersAdminCard from "../componentes/MemberCard";
import CarbonFootprintModal from "../componentes/ModalCO2";
import { Device, Team, TeamMember } from "./types";
interface AdminTeamScreenProps {
  team: Team;
}

const AdminTeamScreen: React.FC<AdminTeamScreenProps> = ({
  team,
}) => {
  const [viewAdmin, setViewAdmin] = useState<"Devices" | "Members" | "Statistics">("Devices");
  const [devices, setDevices] = useState<Device[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [CO2, setCO2] = useState<number>(0);
  const [newDate, setNewDate] = useState("");
  const [mordev, setMordev] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  
  const roleHierarchy = {
    admin: 1,
    assistant: 2,
    member: 3,
  };
  const sortedMembers = [...members].sort((a, b) => {
    const roleA = roleHierarchy[a.role];
    const roleB = roleHierarchy[b.role];
    return roleA - roleB;
  });
  // Effect to fetch devices
  useEffect(() => {
    const fetchTeamsDevices = async () => {
      if (!team.code) return;
      try {
        const response = await fetch("https://blueswitch-jet.vercel.app/get_devices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ team_code: team.code }),
        });
        const data = await response.json();
        if (response.ok) {
          setDevices(data);
        } else {
          console.error("Error en respuesta del servidor o no hay dispositivos:", data);
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };
    fetchTeamsDevices();
  }, [team.code]);
// Agrega esto debajo de tus otros useEffect
useEffect(() => {
  if (!team.code) return;
  const fetchCO2 = async () => {
    try {
      const response = await fetch("https://blueswitch-jet.vercel.app/read-CO2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_code: team.code }),
      });
      const data = await response.json();
      if (response.ok) {
        setCO2(data.total_CO2 || 0);
        const maxDevice = data.device_mas_CO2;
        if (maxDevice) {
          setMordev(`${maxDevice.nombre}\n${maxDevice.email}`);
        } else {
          setMordev("No hay dispositivo registrado");
        }
      } else {
        console.error("Error en respuesta del servidor o no hay dispositivos:", data);
      }
    } catch (e) {
      console.error("Error fetching CO2:", e);
    }
  };
  fetchCO2();
}, [team.code, devices]); // <-- se ejecuta cuando cambian los dispositivos o el código del equipo
 
  useEffect(() => {
    const fetchTeamsMembers = async () => {
      if (!team.code) return;
      try {
        const response = await fetch("https://blueswitch-jet.vercel.app/get_members", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ team_code: team.code }),
        });
        const data = await response.json();
        if (response.ok) {
          setMembers(data.members || []);
        } else {
          console.error("Error en respuesta del servidor o no hay miembros:", data);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };
    fetchTeamsMembers();
  }, [team.code]);
  const deleteTeam = async () => {
    Alert.alert(
      getTranslation("Eliminar Equipo"),
     `${getTranslation("¿Estás seguro de que quieres eliminar el equipo")} ${team.name} ${getTranslation("Esta acción no se puede deshacer.")}`,
      [
        {
          text: getTranslation("Cancelar"),
          style: "cancel"
        },
        {
          text: getTranslation("Eliminar"),
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch("https://blueswitch-jet.vercel.app/delete_team", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ team_code: team.code }),
              });
              const data = await response.json();
              if (response.ok) {
                Alert.alert(getTranslation("Éxito"), data.mensaje);
              } else {
                Alert.alert(getTranslation("Error"), data.mensaje);
              }
            } catch (error) {
              Alert.alert(getTranslation("Error"), getTranslation("No se pudo eliminar el equipo"));
              console.error( error);
            }
          }
        }
      ]
    );
  };
  const copyTeamCode = () => {
    Clipboard.setStringAsync(`${getTranslation("Nombre")}: ${team.name}\n${getTranslation("Código")}: ${team.code}`);

    Alert.alert(getTranslation("Código Copiado"), getTranslation("El código del equipo se ha copiado al portapapeles"));
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
    setModalVisible(true);
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{team.name}</Text>
        <Text style={styles.subtitle}>{getTranslation("Panel de Administrador")}</Text>
      </View>
      {/* Navigation Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setViewAdmin("Devices")}
            style={[
              styles.tabButton,
              viewAdmin === "Devices" && styles.activeTab
            ]}
          >
            <Text style={[
              styles.tabText,
              viewAdmin === "Devices" && styles.activeTabText
            ]}>{getTranslation("Dispositivos")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewAdmin("Members")}
            style={[
              styles.tabButton,
              viewAdmin === "Members" && styles.activeTab
            ]}
          >
            <Text style={[
              styles.tabText,
              viewAdmin === "Members" && styles.activeTabText
            ]}>{getTranslation("Miembros")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewAdmin("Statistics")}
            style={[
              styles.tabButton,
              viewAdmin === "Statistics" && styles.activeTab
            ]}
          >
            <Text style={[
              styles.tabText,
              viewAdmin === "Statistics" && styles.activeTabText
            ]}>{getTranslation("Estadísticas")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={copyTeamCode} style={styles.actionButton}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>{getTranslation("Copiar código")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={generateTicket} style={styles.actionButton}>
          <Text style={styles.actionIcon}>🎫</Text>
          <Text style={styles.actionText}>{getTranslation("Generar ticket")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={deleteTeam} style={styles.deleteButton}>
          <Text style={styles.deleteIcon}>🗑️</Text>
          <Text style={styles.deleteText}>{getTranslation("Eliminar equipo")}</Text>
        </TouchableOpacity>
      </View>
      {/* Content Area */}
      <View style={styles.contentContainer}>
        {viewAdmin === "Devices" && (
          <ScrollView style={styles.contentScroll}>
            {devices.length > 0 ? (
              devices.map((device: Device) => (
                <DeviceTeamAdCard
                  key={device.stringid}
                  id={device.stringid}
                  name={device.nombre}
                  status={device.state}
                  carbonFootprint={device.watts}
                  type={device.email}
                  favorite={device.favorite}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>💻</Text>
                <Text style={styles.emptyStateTitle}>{getTranslation("No tienes dispositivos")}</Text>
                <Text style={styles.emptyStateDescription}>
                  {getTranslation("Añade dispositivos para comenzar a monitorear el consumo")}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
        {viewAdmin === "Members" && (
          <ScrollView style={styles.contentScroll}>
            {members.length > 0 ? (
              sortedMembers.map((member, index) => {
                const activeDevicesCount = devices.filter(
                  (device) => device.email === member.email && device.state === true
                ).length;
                return (
                  <MembersAdminCard
                    key={member.email}
                    email={member.email}
                    role={member.role}
                    activeDevicesCount={activeDevicesCount}
                    index={index}
                    onSelectOption={() => {}}
                    teamcode={team.code}
                  />
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>👥</Text>
                <Text style={styles.emptyStateTitle}>{getTranslation("No hay miembros")}</Text>
                <Text style={styles.emptyStateDescription}>
                  {getTranslation("Invita miembros para colaborar en el equipo")}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
        {viewAdmin === "Statistics" && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>{getTranslation("Huella de Carbono Total")}</Text>
              <Text style={styles.statValue}>{CO2.toFixed(2)} kg</Text>
              <Text style={styles.statDescription}>
                {getTranslation("Basado en el consumo de todos los dispositivos")}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>{getTranslation("Dispositivo con Mayor Impacto")}</Text>
              <Text style={styles.statValue}>{mordev || "N/A"}</Text>
              <Text style={styles.statDescription}>
                {getTranslation("Dispositivo que más contribuye a la huella de carbono")}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>{getTranslation("Equivalente en Árboles")}</Text>
              <Text style={styles.statValue}>{Math.ceil(CO2 / 22)}</Text>
              <Text style={styles.statDescription}>
                {getTranslation("Árboles necesarios para compensar esta huella")}
              </Text>
            </View>
          </View>
        )}
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
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F8E9", // Light Green
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E7D32", // Forest Green
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#607D8B", // Blue Gray
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#ECEFF1", // Cloud Gray
  },
  activeTab: {
    backgroundColor: "#E8F5E9", // Light Green
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#607D8B", // Blue Gray
  },
  activeTabText: {
    color: "#2E7D32", // Forest Green
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: "#E8F5E9", // Light Green
    borderRadius: 8,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
    color: "#2E7D32", // Forest Green
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2E7D32", // Forest Green
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: "#FFEBEE", // Light Red
    borderRadius: 8,
  },
  deleteIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#EF5350", // Coral Red
  },
  contentContainer: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#37474F", // Charcoal Gray
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#607D8B", // Blue Gray
    textAlign: "center",
    lineHeight: 20,
  },
  statsContainer: {
    flex: 1,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statTitle: {
    fontSize: 14,
    color: "#607D8B", // Blue Gray
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E7D32", // Forest Green
    marginBottom: 8,
  },
  statDescription: {
    fontSize: 12,
    color: "#90A4AE", // Neutral Baseline
    lineHeight: 16,
  },
});
export default AdminTeamScreen;