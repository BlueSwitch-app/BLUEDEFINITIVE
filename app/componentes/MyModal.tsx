import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { SelectedFile } from "@/components/ui/file-picker";
import { getTranslation } from "@/Translations/i18n";
import * as React from "react";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ColorPicker from "react-native-wheel-color-picker";
import { Device } from "../(auth)/DashboardScreen";
import { getContrastColor } from "../utils/getContrastColor";
// Define la interfaz del equipo para el combobox
interface UserTeam {
  name: string;
  code: string;
  role: string;
}
interface MyModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  email: string;
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
}
// Categorías
const categories = [
  { value: "electronica", label: "Electrónica", searchValue: "electronica" },
  { value: "electrodomesticos", label: "Electrodomésticos", searchValue: "electrodomesticos" },
  { value: "iluminacion", label: "Iluminación", searchValue: "iluminacion" },
  { value: "transporte", label: "Transporte", searchValue: "transporte" },
  { value: "climatizacion", label: "Climatización", searchValue: "climatizacion" },
  { value: "otros", label: "Otros", searchValue: "otros" },
];
export default function MyModal({
  isModalOpen,
  setIsModalOpen,
  email,
  devices,
  setDevices,
}: MyModalProps) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [watts, setWatts] = useState("");
  const [color, setColor] = useState("#2E7D32"); // Changed default color to Forest Green
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [showColorModal, setShowColorModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado que contendrá el array completo de equipos
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  // Estado que contendrá solo los nombres de los equipos como una lista
  const [teamNamesList, setTeamNamesList] = useState<string[]>([]);
  // Estado para guardar el equipo seleccionado
  const [selectedTeam, setSelectedTeam] = useState("no_team");
  useEffect(() => {
  const fetchTeams = async () => {
    if (!email) return;

    try {
      const response = await fetch("https://blueswitch-jet.vercel.app/read_teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      interface ReadTeamsResponse {
        teams?: UserTeam[];
      }

      const data: ReadTeamsResponse = await response.json();

      const defaultTeam: UserTeam = { name: getTranslation("Sin equipo"), code: "no_team", role: "none" };

      if (response.ok && data.teams) {
        const teamsWithDefault: UserTeam[] = [defaultTeam, ...data.teams];
        setUserTeams(teamsWithDefault);
        setTeamNamesList(teamsWithDefault.map(team => team.name));
      } else {
        setUserTeams([defaultTeam]);
        setTeamNamesList([defaultTeam.name]);
      }
    } catch (error) {
      const defaultTeam: UserTeam = { name: getTranslation("Sin equipo"), code: "no_team", role: "none" };
      setUserTeams([defaultTeam]);
      setTeamNamesList([defaultTeam.name]);
    }
  };

  fetchTeams();
}, [email]);
  const handleSave = async () => {
    if (!nombre || !categoria || !watts) {
      Alert.alert(getTranslation("Campos incompletos"), getTranslation("Por favor completa todos los campos obligatorios"));
      return;
    }
    setIsLoading(true);
    
    const deviceData = {
      nombre,
      categoria,
      watts,
      color,
      imagen: selectedFiles.length > 0 ? selectedFiles[0].name : "",
      email,
      team_code: selectedTeam,
    };
    
    try {
      const response = await fetch("https://blueswitch-jet.vercel.app/crear-device", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deviceData),
      });
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        const nuevoDispositivo: Device = {
          id: "nuevo_id",
          nombre: nombre,
          categoria: categoria,
          watts: parseInt(watts),
          color: color,
          created_at: new Date().toISOString(),
          state: true,
          stringid: "stringid_generado",
          favorite: false,
          team: selectedTeam,
        };
        setDevices([...devices, nuevoDispositivo]);
        resetForm();
        setIsModalOpen(false);
      } else {
        Alert.alert(getTranslation("Error"), data.mensaje || getTranslation("No se pudo crear el dispositivo"));
      }
    } catch (error) {
      Alert.alert(getTranslation("Error de conexión"), getTranslation("No se pudo conectar con el servidor"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const resetForm = () => {
    setNombre("");
    setCategoria("");
    setWatts("");
    setColor("#2E7D32"); // Reset to Forest Green
    setSelectedFiles([]);
    setSelectedTeam("no_team");
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };
  return (
    <Modal 
      visible={isModalOpen} 
      animationType="slide" 
      transparent={true} 
      onRequestClose={handleCloseModal}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{getTranslation("Añadir Nuevo Dispositivo")}</Text>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{getTranslation("Nombre del dispositivo")}</Text>
              <TextInput
                style={styles.input}
                placeholder={getTranslation("Ej: Laptop, TV, etc.")}
                placeholderTextColor="#90A4AE" // Neutral Baseline
                value={nombre}
                onChangeText={setNombre}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{getTranslation("Categoría")}</Text>
              <View style={styles.comboboxContainer}>
                <Combobox value={categoria} onValueChange={setCategoria}>
                  <ComboboxTrigger style={styles.comboboxTrigger}>
                    <ComboboxValue placeholder={getTranslation("Selecciona una categoría")} />
                  </ComboboxTrigger>
                  <ComboboxContent>
                    <ComboboxInput placeholder={getTranslation("Buscar categorías...")} />
                    <ComboboxList>
                      <ComboboxEmpty>{getTranslation("No se encontró la categoría")}</ComboboxEmpty>
                      {categories.map((cat) => (
                        <ComboboxItem 
                          key={cat.value} 
                          value={cat.value} 
                          searchValue={cat.searchValue}
                        >
                          {cat.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{getTranslation("Equipo")}</Text>
              <View style={styles.comboboxContainer}>
                <Combobox value={selectedTeam} onValueChange={setSelectedTeam}>
                  <ComboboxTrigger style={styles.comboboxTrigger}>
                    <Text style={styles.comboboxText}>
                      {userTeams.find((team) => team.code === selectedTeam)?.name ?? getTranslation("Selecciona el equipo")}
                    </Text>
                  </ComboboxTrigger>
                  <ComboboxContent>
                    <ComboboxInput placeholder={getTranslation("Buscar equipo...")} />
                    <ComboboxList>
                      <ComboboxEmpty>{getTranslation("No se encontraron equipos")}</ComboboxEmpty>
                      {userTeams.map((team: UserTeam) => (
                        <ComboboxItem
                          key={team.code}
                          value={team.code}
                          searchValue={team.name}
                        >
                          {team.name}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{getTranslation("Consumo en Watts")}</Text>
              <TextInput
                style={styles.input}
                placeholder={getTranslation("Ej: 60")}
                placeholderTextColor="#90A4AE" // Neutral Baseline
                value={watts}
                onChangeText={setWatts}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{getTranslation("Color")}</Text>
              <TouchableOpacity
                style={[styles.colorPickerButton, { backgroundColor: color }]}
                onPress={() => setShowColorModal(true)}
              >
                <Text style={[styles.colorPickerText, { color: getContrastColor(color) }]}>
                  Seleccionar Color
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>{getTranslation("Guardar Dispositivo")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {/* Color Picker Modal */}
      <Modal visible={showColorModal} animationType="slide">
        <View style={styles.colorModalContainer}>
          <View style={styles.colorModalHeader}>
            <Text style={styles.colorModalTitle}>{getTranslation("Selecciona un Color")}</Text>
            <TouchableOpacity onPress={() => setShowColorModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.colorPickerContainer}>
            <ColorPicker
              color={color}
              onColorChange={setColor}
              onColorChangeComplete={(newColor) => setColor(newColor)}
              thumbSize={40}
              sliderSize={40}
              noSnap={true}
              row={false}
              swatchesLast={true}
              swatches={true}
              discrete={false}
              useNativeDriver={false}
            />
          </View>
          
          <View style={styles.colorButtonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={() => setShowColorModal(false)}
            >
              <Text style={styles.confirmButtonText}>{getTranslation("Confirmar")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    maxHeight: "85%",
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
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#37474F", // Charcoal Gray
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderColor: "#ECEFF1", // Cloud Gray
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#37474F", // Charcoal Gray
  },
  comboboxContainer: {
    height: 56,
  },
  comboboxTrigger: {
    height: 56,
    borderColor: "#ECEFF1", // Cloud Gray
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  comboboxText: {
    fontSize: 16,
    color: "#37474F", // Charcoal Gray
  },
  colorPickerButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2E7D32", // Forest Green
  },
  colorPickerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#2E7D32", // Forest Green
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  // Color Picker Modal Styles
  colorModalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  colorModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  colorModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E7D32", // Forest Green
  },
  colorPickerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  colorButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  confirmButton: {
    backgroundColor: "#2E7D32", // Forest Green
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});