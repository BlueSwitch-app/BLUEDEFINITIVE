import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { auth2 } from '../firebaseConfig'; // ajusta ruta si es necesario
import DashboardScreen from "./DashboardScreen";
import ProfileSettingsScreen from "./ProfileSettings";
import StatisticsScreen from "./StadisticsScreen";
import TeamsScreen from "./TeamsScreens";


const App = () => {
  const [activeScreen, setActiveScreen] = useState("dashboard");

const [email, setEmail] = useState<string | "">("");
  useEffect(() => {
    const currentUser = auth2.currentUser;
    setEmail(currentUser?.email || "");
  }, []);



  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appContainer}>
        {/* Header */}


        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {activeScreen === "dashboard" && (
            <DashboardScreen email= {email}/>
          )}
          {activeScreen === "Teams" && <TeamsScreen email= {email} />}
          {activeScreen === "reports" && <StatisticsScreen email= {email} />}
          {activeScreen === "settings" && (
        
              <ProfileSettingsScreen email= {email} />
           
          )}
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            onPress={() => setActiveScreen("dashboard")}
            style={styles.navItem}
          >
            <Text
              style={[
                styles.navIcon,
                activeScreen === "dashboard" && styles.navIconActive,
              ]}
            >
              🏠
            </Text>
            <Text
              style={[
                styles.navText,
                activeScreen === "dashboard" && styles.navTextActive,
              ]}
            >
              Inicio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveScreen("Teams")}
            style={styles.navItem}
          >
            <Text
              style={[
                styles.navIcon,
                activeScreen === "Teams" && styles.navIconActive,
              ]}
            >
              📱
            </Text>
            <Text
              style={[
                styles.navText,
                activeScreen === "Teams" && styles.navTextActive,
              ]}
            >
              Teams
            </Text>
          </TouchableOpacity>
       
          <TouchableOpacity
            onPress={() => setActiveScreen("reports")}
            style={styles.navItem}
          >
            <Text
              style={[
                styles.navIcon,
                activeScreen === "reports" && styles.navIconActive,
              ]}
            >
              📊
            </Text>
            <Text
              style={[
                styles.navText,
                activeScreen === "reports" && styles.navTextActive,
              ]}
            >
              Informes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveScreen("settings")}
            style={styles.navItem}
          >
            <Text
              style={[
                styles.navIcon,
                activeScreen === "settings" && styles.navIconActive,
              ]}
            >
              ⚙️
            </Text>
            <Text
              style={[
                styles.navText,
                activeScreen === "settings" && styles.navTextActive,
              ]}
            >
              Ajustes
            </Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
};

// Styles for React Native components
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Fondo blanco obligatorio
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  appContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FFFFFF", // Fondo blanco
    shadowColor: "#3B82F6", // Sombra azulada
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#BFDBFE", // Borde azul claro
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E40AF", // Azul oscuro
  },
  settingsIcon: {
    padding: 4,
  },
  iconText: {
    fontSize: 24,
    color: "#3B82F6", // Azul medio
  },
  mainContent: {
    flex: 1,
    paddingBottom: 50,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF", // Fondo blanco
    borderTopWidth: 1,
    borderTopColor: "#BFDBFE", // Borde azul claro
    shadowColor: "#3B82F6", // Sombra azulada
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 64,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: "#64748B", // Gris azulado para inactivo
  },
  navIconActive: {
    color: "#1E40AF", // Azul oscuro para activo
  },
  navText: {
    fontSize: 12,
    color: "#64748B", // Gris azulado para inactivo
  },
  navTextActive: {
    color: "#1E40AF", // Azul oscuro para activo
    fontWeight: "600",
  },
  // Optional card-style wrapper (to match dashboard feel)
  card: {
    backgroundColor: "#FFFFFF", // Fondo blanco
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#3B82F6", // Sombra azulada
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#BFDBFE", // Borde azul claro
  },
});


export default App;
