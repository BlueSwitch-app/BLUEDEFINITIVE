import { getTranslation } from "@/Translations/i18n";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DeviceCard from "../componentes/deviceTeamCard";
import { Device, Team, TeamMember } from "./types";

interface MemberTeamScreenProps {
  team: Team;
  email: string;
}

const { width } = Dimensions.get('window');

const MemberTeamScreen: React.FC<MemberTeamScreenProps> = ({
  team,
  email
}) => {
  const [viewAdmin, setViewAdmin] = useState<"Devices" | "Members" | "Statistics">("Devices");
  const [devices, setDevices] = useState<Device[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const leaveTeam = async () => {
    Alert.alert(
      getTranslation("Abandonar Equipo"),
      `${getTranslation("¿Estás seguro de que quieres abandonar el equipo")} ${team.name} ${getTranslation("Esta acción no se puede deshacer.")}`,
      [
        {
          text: getTranslation("Cancelar"),
          style: "cancel"
        },
        {
          text: getTranslation("Abandonar"),
          style: "destructive",
          onPress: async () => {
            if (!team.code || !email) return;
            try {
              const response = await fetch("http://127.0.0.1:5000/leave_team", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ teamcode: team.code, email: email }),
              });
              const data = await response.json();
              if (response.ok) {
                Alert.alert("Éxito", data.mensaje);
              } else {
                Alert.alert("Error", data.mensaje || "No se pudo abandonar el equipo");
              }
            } catch (e) {
              Alert.alert("Error", "No se pudo conectar con el servidor");
              console.log(e);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const fetchTeamsDevices = async () => {
      if (!team.code) return;
      try {
        const response = await fetch("http://127.0.0.1:5000/get_devices", {
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

  useEffect(() => {
    const fetchTeamsMembers = async () => {
      if (!team.code) return;
      try {
        const response = await fetch("http://127.0.0.1:5000/get_members", {
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamsMembers();
  }, [team.code]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{getTranslation("Cargando datos del equipo...")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{team.name}</Text>
        <Text style={styles.subtitle}>{getTranslation("Member Panel")}</Text>
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
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionText}>{getTranslation("Invitar")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={leaveTeam} style={styles.leaveButton}>
          <Text style={styles.leaveIcon}>🚪</Text>
          <Text style={styles.leaveText}>{getTranslation("Abandonar")}</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {viewAdmin === "Devices" && (
          <ScrollView style={styles.contentScroll}>
            {devices.length > 0 ? (
              [...devices]
                .sort((a, b) => Number(b.favorite) - Number(a.favorite))
                .map((device: Device) => (
                  <DeviceCard
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
                <Text style={styles.emptyStateTitle}>{getTranslation("No hay dispositivos")}</Text>
                <Text style={styles.emptyStateDescription}>
                  {getTranslation("Este equipo aún no tiene dispositivos registrados")}
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {viewAdmin === "Members" && (
          <ScrollView style={styles.contentScroll}>
            {members.length > 0 ? (
              members.map((member, index) => {
                const activeDevicesCount = devices.filter(
                  (device) => device.email === member.email && device.state === true
                ).length;
                return (
                  <View key={index} style={styles.memberCard}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                      <Text style={styles.memberRole}>{member.role}</Text>
                    </View>
                    <View style={styles.memberDevicesContainer}>
                      <Text style={styles.memberDevicesCount}>{activeDevicesCount}</Text>
                      <Text style={styles.memberDevicesLabel}>{getTranslation("activos")}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>👥</Text>
                <Text style={styles.emptyStateTitle}>{getTranslation("No hay miembros")}</Text>
                <Text style={styles.emptyStateDescription}>
                  {getTranslation("Este equipo aún no tiene miembros además de ti")}
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {viewAdmin === "Statistics" && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>{getTranslation("Dispositivos Totales")}</Text>
              <Text style={styles.statValue}>{devices.length}</Text>
              <Text style={styles.statDescription}>
                {getTranslation("Número total de dispositivos en el equipo")}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>{getTranslation("Dispositivos Activos")}</Text>
              <Text style={styles.statValue}>
                {devices.filter(d => d.state).length}
              </Text>
              <Text style={styles.statDescription}>
                {getTranslation("Dispositivos actualmente en uso")}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>{getTranslation("Miembros")}</Text>
              <Text style={styles.statValue}>{members.length}</Text>
              <Text style={styles.statDescription}>
                {getTranslation("Personas colaborando en este equipo")}
              </Text>
            </View>
          </View>
        )}
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F8E9", // Light Green
    borderRadius: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#607D8B", // Blue Gray
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
  leaveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: "#FFEBEE", // Light Red
    borderRadius: 8,
  },
  leaveIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  leaveText: {
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
  memberCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  memberInfo: {
    flex: 1,
  },
  memberEmail: {
    fontSize: 16,
    fontWeight: "600",
    color: "#37474F", // Charcoal Gray
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: "#607D8B", // Blue Gray
    textTransform: "capitalize",
  },
  memberDevicesContainer: {
    alignItems: "flex-end",
  },
  memberDevicesCount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0288D1", // Sky Blue
  },
  memberDevicesLabel: {
    fontSize: 12,
    color: "#607D8B", // Blue Gray
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

export default MemberTeamScreen;