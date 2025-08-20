import { getTranslation } from "@/Translations/i18n";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AdminTeamScreen from "./AdminTeamScreen";
import AssistantTeamScreen from "./AssistanTeamScreen";
import MemberTeamScreen from "./MemberTeamScreen";
import { Team } from "./types";

// API Base URL
const API_BASE_URL = 'https://bluebackend-blues-projects-c71d4d1f.vercel.app';

// Interface para MessageBox
interface MessageBoxProps {
  message: string;
  onClose: () => void;
}

// MessageBox Component
const MessageBox: React.FC<MessageBoxProps> = ({ message, onClose }) => (
  <Modal
    transparent={true}
    animationType="fade"
    visible={true}
    onRequestClose={onClose}
  >
    <View style={styles.messageBoxOverlay}>
      <View style={styles.messageBoxContent}>
        <Text style={styles.messageBoxText}>{message}</Text>
        <TouchableOpacity onPress={onClose} style={styles.messageBoxButton}>
          <Text style={styles.messageBoxButtonText}>{getTranslation("Entendido")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// Interface para CreateTeamModal
interface CreateTeamModalProps {
  isVisible: boolean;
  onClose: () => void;
  showMessageBox: (message: string) => void;
  email: string;
}

// CreateTeamModal Component
const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isVisible,
  onClose,
  showMessageBox,
  email,
}) => {
  const [newTeamName, setNewTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (newTeamName.trim() === "" || newTeamName.length < 3) {
      showMessageBox(getTranslation("El nombre del equipo debe tener al menos 3 caracteres"));
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Teams/create_team`, {
        method: "POST",
         headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
        body: JSON.stringify({ team_name: newTeamName, email: email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert("Éxito", data.mensaje);
        onClose();
      } else {
        showMessageBox(data.mensaje || getTranslation("No se pudo crear el equipo"));
      }
    } catch (error) {
      showMessageBox(getTranslation("Error de conexión. Inténtalo de nuevo"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{getTranslation("Crear Nuevo Equipo")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.modalInput}
            placeholder={getTranslation("Nombre del equipo")}
            placeholderTextColor="#90A4AE"
            value={newTeamName}
            onChangeText={setNewTeamName}
          />
          
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalButton, styles.modalCancelButton]}
            >
              <Text style={styles.modalCancelButtonText}>{getTranslation("Cancelar")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreate}
              style={[styles.modalButton, styles.modalConfirmButton]}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.modalButtonText}>{getTranslation("Creando...")}</Text>
              ) : (
                <Text style={styles.modalButtonText}>{getTranslation("Crear")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Interface para JoinTeamModal
interface JoinTeamModalProps {
  isVisible: boolean;
  onClose: () => void;
  showMessageBox: (message: string) => void;
  email: string;
}

// JoinTeamModal Component
const JoinTeamModal: React.FC<JoinTeamModalProps> = ({
  isVisible,
  onClose,
  showMessageBox,
  email,
}) => {
  const [joinTeamName, setJoinTeamName] = useState("");
  const [joinTeamCode, setJoinTeamCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (joinTeamName.trim() === "" || joinTeamCode.trim() === "") {
      showMessageBox(getTranslation("Por favor, ingresa el nombre y el código del equipo"));
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Teams/join_team`, {
        method: "POST",
         headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
        body: JSON.stringify({
          email: email,
          team_name: joinTeamName,
          team_code: joinTeamCode,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(getTranslation("Éxito"), data.mensaje);
        onClose();
      } else {
        showMessageBox(data.mensaje || getTranslation("No se pudo unir al equipo"));
      }
    } catch (error) {
      showMessageBox(getTranslation("Error de conexión. Inténtalo de nuevo"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{getTranslation("Unirse a un Equipo")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.modalInput}
            placeholder={getTranslation("Nombre del equipo")}
            placeholderTextColor="#90A4AE"
            value={joinTeamName}
            onChangeText={setJoinTeamName}
          />
          
          <TextInput
            style={styles.modalInput}
            placeholder={getTranslation("Código del equipo")}
            placeholderTextColor="#90A4AE"
            value={joinTeamCode}
            onChangeText={setJoinTeamCode}
          />
          
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalButton, styles.modalCancelButton]}
            >
              <Text style={styles.modalCancelButtonText}>{getTranslation("Cancelar")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleJoin}
              style={[styles.modalButton, styles.modalConfirmButton]}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.modalButtonText}>{getTranslation("Uniéndose...")}</Text>
              ) : (
                <Text style={styles.modalButtonText}>{getTranslation("Unirse")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface TeamsScreenProps {
  email: string;
}

const { width } = Dimensions.get('window');

const TeamsScreen: React.FC<TeamsScreenProps> = ({ email }) => {
  const [allAvailableTeams, setAllAvailableTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isJoiningTeam, setIsJoiningTeam] = useState(false);
  const [messageBoxVisible, setMessageBoxVisible] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "member" | "assistant"| null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!email) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/Teams/read_teams`, {
          method: "POST",
           headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
          body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setAllAvailableTeams(data.teams || []);
        } else {
          console.error(getTranslation("Error en respuesta del servidor:"), data);
        }
      } catch (error) {
        console.error(getTranslation("Error fetching teams:"), error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeams();
  }, [email]);

  useEffect(() => {
    if (selectedTeamId) {
      const team = allAvailableTeams.find((t) => t.code === selectedTeamId);
      if (team) {
        setUserRole(team.role);
      }
    } else {
      setUserRole(null);
    }
  }, [selectedTeamId, allAvailableTeams]);

  const showMessageBox = (message: string) => {
    setMessageBoxContent(message);
    setMessageBoxVisible(true);
  };

  const hideMessageBox = () => {
    setMessageBoxVisible(false);
    setMessageBoxContent("");
  };

  const selectedTeam = allAvailableTeams.find(
    (team) => team.code === selectedTeamId
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{getTranslation("Cargando equipos...")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{getTranslation("Equipos")}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setIsCreatingTeam(true)}
              style={styles.actionButton}
            >
              <Text style={styles.actionIcon}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsJoiningTeam(true)}
              style={styles.actionButton}
            >
              <Text style={styles.actionIcon}>👥</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Content */}
        {allAvailableTeams.length > 0 ? (
          <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
            {/* Teams Section */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>{getTranslation("Tus Equipos")}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.teamsContainer}
              >
                {allAvailableTeams.map((team) => (
                  <TouchableOpacity
                    key={team.code}
                    onPress={() => setSelectedTeamId(team.code)}
                    style={[
                      styles.teamCard,
                      selectedTeamId === team.code && styles.teamCardSelected,
                    ]}
                  >
                    <Text style={styles.teamCardTitle}>{team.name}</Text>
                    <View style={styles.teamCardRole}>
                     <Text style={[
    styles.teamCardRoleText,
    team.role === "admin" ? styles.adminRole :
    team.role === "assistant" ? styles.assistantRole :
    styles.memberRole
]}>
    {team.role === "admin" ? getTranslation("Administrador") :
     team.role === "assistant" ? getTranslation("Asistente") :
     getTranslation("Miembro")}
</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Team Details */}
            {selectedTeamId && selectedTeam && userRole ? (
              <View style={styles.teamDetailsContainer}>
                {userRole === "admin" ? (
                  <AdminTeamScreen team={selectedTeam} />
                    ) : userRole === "assistant" ? (
    <AssistantTeamScreen team={selectedTeam} email={email} />
) : (
    <MemberTeamScreen team={selectedTeam} email={email} />
)}
              </View>
            ) : (
              <View style={styles.noTeamSelectedCard}>
                <Text style={styles.noTeamSelectedText}>
                  {getTranslation("Selecciona un equipo para ver sus detalles")}
                </Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.noTeamsCard}>
            <Text style={styles.noTeamsEmoji}>👥</Text>
            <Text style={styles.noTeamsTitle}>{getTranslation("No tienes equipos")}</Text>
            <Text style={styles.noTeamsText}>
              {getTranslation("Crea un equipo nuevo o únete a uno existente")}
            </Text>
            <View style={styles.noTeamsActions}>
              <TouchableOpacity
                onPress={() => setIsCreatingTeam(true)}
                style={styles.noTeamsButton}
              >
                <Text style={styles.noTeamsButtonText}>{getTranslation("Crear Equipo")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsJoiningTeam(true)}
                style={[styles.noTeamsButton, styles.noTeamsSecondaryButton]}
              >
                <Text style={[styles.noTeamsButtonText, styles.noTeamsSecondaryButtonText]}>
                  {getTranslation("Unirse a Equipo")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Modals */}
        <CreateTeamModal
          isVisible={isCreatingTeam}
          onClose={() => setIsCreatingTeam(false)}
          showMessageBox={showMessageBox}
          email={email}
        />
        <JoinTeamModal
          isVisible={isJoiningTeam}
          onClose={() => setIsJoiningTeam(false)}
          showMessageBox={showMessageBox}
          email={email}
        />
      </View>
      
      {/* Message Box */}
      {messageBoxVisible && (
        <MessageBox message={messageBoxContent} onClose={hideMessageBox} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffffff", // Light Green background
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#607D8B", // Blue Gray
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2E7D32", // Forest Green
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E9", // Light Green
    justifyContent: "center",
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 24,
    color: "#2E7D32", // Forest Green
  },
  contentArea: {
    flex: 1,
  },
  cardSection: {
    backgroundColor: "#F1F8E9",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#37474F", // Charcoal Gray
    marginBottom: 16,
  },
  teamsContainer: {
    paddingBottom: 8,
  },
  teamCard: {
    width: width * 0.7,
    backgroundColor: "#E8F5E9", // Light Green
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#ECEFF1", // Cloud Gray
  },
  teamCardSelected: {
    backgroundColor: "#E8F5E9", // Light Green
    borderColor: "#2E7D32", // Forest Green
  },
  teamCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#37474F", // Charcoal Gray
    marginBottom: 8,
  },
  teamCardRole: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamCardRoleText: {
    fontSize: 12,
    fontWeight: "500",
  },
  adminRole: {
    backgroundColor: "#E8F5E9", // Light Green
    color: "#2E7D32", // Forest Green
    borderRadius:10,
    padding:5
  },
  assistantRole: {
    backgroundColor: "#E1F5FE", // Light Blue
    color: "#0288D1", // Sky Blue
    borderRadius:10,
    padding:5
  },
  memberRole: {
    backgroundColor: "#ECEFF1", // Cloud Gray
    color: "#607D8B", // Blue Gray
    borderRadius:10,
    padding:5
  },
  teamDetailsContainer: {
    flex: 1,
  },
  noTeamSelectedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noTeamSelectedText: {
    fontSize: 16,
    color: "#607D8B", // Blue Gray
    textAlign: "center",
  },
  noTeamsCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noTeamsEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noTeamsTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#37474F", // Charcoal Gray
    marginBottom: 8,
  },
  noTeamsText: {
    fontSize: 16,
    color: "#607D8B", // Blue Gray
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  noTeamsActions: {
    width: "100%",
    gap: 16,
  },
  noTeamsButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#2E7D32", // Forest Green
    justifyContent: "center",
    alignItems: "center",
  },
  noTeamsSecondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECEFF1", // Cloud Gray
  },
  noTeamsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  noTeamsSecondaryButtonText: {
    color: "#2E7D32", // Forest Green
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E7D32", // Forest Green
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ECEFF1", // Cloud Gray
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#37474F", // Charcoal Gray
  },
  modalInput: {
    height: 56,
    borderColor: "#ECEFF1", // Cloud Gray
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#37474F", // Charcoal Gray
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#ECEFF1", // Cloud Gray
  },
  modalConfirmButton: {
    backgroundColor: "#2E7D32", // Forest Green
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#37474F", // Charcoal Gray
  },
  // Message Box Styles
  messageBoxOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  messageBoxContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    maxWidth: 300,
    width: "100%",
  },
  messageBoxText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#37474F", // Charcoal Gray
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  messageBoxButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#2E7D32", // Forest Green
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  messageBoxButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default TeamsScreen;