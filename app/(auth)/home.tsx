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
    backgroundColor: "#F3F4F6", // Equivalent to bg-gray-100
  },
    headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  appContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FFFFFF", // bg-white
    shadowColor: "#000", // shadow-sm
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2, // For Android shadow
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937", // text-gray-900
  },

  settingsIcon: {
    padding: 4, // Add some padding for touchability
  },
  iconText: {
    fontSize: 24, // Adjust size as needed for emoji/placeholder
  },
  mainContent: {
    flex: 1,
    paddingBottom: 80, // Space for bottom navigation
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB", // border-gray-200
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 64, // h-16
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  navIcon: {
    fontSize: 24, // h-6 w-6 equivalent for emoji
    marginBottom: 4, // mb-1
    color: "#6B7280", // text-gray-500
  },
  navIconActive: {
    color: "#16A34A", // text-green-600
  },
  navText: {
    fontSize: 12, // text-sm
    color: "#6B7280", // text-gray-500
  },
  navTextActive: {
    color: "#16A34A", // text-green-600
    fontWeight: "600", // font-semibold
  },





});

export default App;
