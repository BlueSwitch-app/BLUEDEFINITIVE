import { getTranslation } from '@/Translations/i18n';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { sendPasswordResetEmail, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth2 } from '../firebaseConfig';

// API Base URL
const API_BASE_URL = 'https://bluebackkk.vercel.app';

const { width } = Dimensions.get('window');

interface props{
  email: string;
}

const ProfileSettingsScreen: React.FC<props> = ({email}) => {
  const [activePanel, setActivePanel] = useState('profile');

  interface UserData {
    nombre: string;
    email: string;
    avatar: string;
    phone: string;
    city : string;
    // agrega aquí otras propiedades que tenga tu usuario
  }

  const pickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (result.canceled){
      console.log('User cancelled image picker');
    }
    
    if(result){
      const response = await fetch(`${API_BASE_URL}/upload_avatar`, {
        method: 'POST',
         headers: {
                    "Content-Type": "application/json"
                },
        body: JSON.stringify({
          email,
          imageUri: result.assets?.[0].uri
        })
      });
      const data = await response.json();
      console.log(data);
    }
  };

  const [userdata, setUserData] = useState<UserData>({
    nombre: '',   // valor inicial
    email: '',    // valor inicial
    avatar: '',
    phone: '',
    city: ''   // valor inicial
  });

  useEffect(() => {
    const fetchDevices = async () => {
      if (!email) return;
      try {
        const response = await fetch(`${API_BASE_URL}/get_user`, {
          method: "POST",
           headers: {
                    "Content-Type": "application/json"
                },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } 
    };
    fetchDevices();
  }, [email]);

  const [newprofileData, setnewProfileData] = useState({
    nombre: userdata["nombre"],   
    avatar: userdata["avatar"],
    phone: userdata["phone"],
    city: userdata["city"] 
  });

  const showPanel = (panelId:any) => {
    setActivePanel(panelId);
  };

  const handleProfileUpdate = async () => {
    try {
      // Crear un objeto con los datos actualizados o los existentes
      const updatedData = {
        nombre: newprofileData.nombre || userdata.nombre,
        avatar: newprofileData.avatar || userdata.avatar,
        phone: newprofileData.phone || userdata.phone,
        city: newprofileData.city || userdata.city,
        email: userdata.email // para identificar el usuario en el servidor
      };
      
      const response = await fetch(`${API_BASE_URL}/update_user`, {
        method: "POST",
         headers: {
                    "Content-Type": "application/json"
                },
        body: JSON.stringify(updatedData),
      });
      
      const data = await response.json();
      if (data.success) {
        alert("Profile updated successfully!");
        setUserData(updatedData); // Actualizar en el estado local
      } else {
        alert("Error updating profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating.");
    }
  };

  const renderSidebar = () => (
    <View style={styles.sidebar}>
      <View style={styles.userSection}>
        <TouchableOpacity onPress={pickAvatar} style={styles.avatar}>
          <Image
            source={{ uri: userdata.avatar }}
            style={{ width: 50, height: 50, borderRadius: 25 }}
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.userName}>{userdata["nombre"]}</Text>
          <Text style={styles.userEmail}>{email}</Text>
          <TouchableOpacity onPress={
            async ()=>{
              await signOut(auth2)
            }
          } style={styles.primaryButton}>
            <Text style={styles.buttonText} >{getTranslation("Log Out")}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.navMenu}>
        {[
          { id: 'profile', icon: 'person-outline', label: getTranslation('Edit Profile') },
          { id: 'security', icon: 'shield-checkmark-outline', label: getTranslation('Security') },
          { id: 'terms', icon: 'document-text-outline', label: getTranslation('Terms & Conditions') },
          { id: 'help', icon: 'help-circle-outline', label: getTranslation('Help & Support') },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              activePanel === item.id && styles.navItemActive,
            ]}
            onPress={() => showPanel(item.id)}
          >
            <Ionicons
              icon={item.icon}
              size={20}
              color={activePanel === item.id ? '#319795' : '#4a5568'}
            />
            <Text style={[
              styles.navItemText,
              activePanel === item.id && styles.navItemTextActive,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderProfilePanel = () => (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>{getTranslation("Edit Profile")}</Text>
        <Text style={styles.panelSubtitle}>{getTranslation("Update your personal information and preferences")}</Text>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>{getTranslation("Name")}</Text>
        <TextInput
          style={styles.formInput}
          placeholder={userdata["nombre"]}
          onChangeText={(text) => setnewProfileData(prev => ({ ...prev, nombre: text }))}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>{getTranslation("Email Address")}</Text>
        <Text>{email}</Text>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>{getTranslation("Phone Number")}</Text>
        <TextInput
          style={styles.formInput}
          value={userdata["phone"]}
          onChangeText={(text) => setnewProfileData(prev => ({ ...prev, phone: text }))}
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>{getTranslation("City")}</Text>
        <TextInput
          style={styles.formInput}
          placeholder={userdata["city"]}
          onChangeText={(text) => setnewProfileData(prev => ({ ...prev, city: text }))}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton} onPress={handleProfileUpdate}>
          <Ionicons name="save-outline" size={18} color="white" />
          <Text style={styles.buttonText}>{getTranslation("Save Changes")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSecurityPanel = () => (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>{getTranslation("Security")}</Text>
        <Text style={styles.panelSubtitle}>{getTranslation("Manage your account security and privacy settings")}</Text>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{getTranslation("Change Password")}</Text>
        </View>
        <TouchableOpacity 
          onPress={async () => {
            await sendPasswordResetEmail(auth2, email);
          }}
          style={styles.secondaryButton}>
          <Ionicons name="key-outline" size={18} color="#4a5568" />
          <Text style={styles.secondaryButtonText}>{getTranslation("Change Password")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTermsPanel = () => (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>{getTranslation("Terms & Conditions")}</Text>
        <Text style={styles.panelSubtitle}>{getTranslation("Review our terms of service and privacy policy")}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <iframe
          src="https://drive.google.com/file/d/1i1r4xRQnzhvCVsNH3EestwHwd7rI5ewx/preview"
          style={{ width: '100%', height: 550 }}
          title="PDF Viewer"
        />
      </View>
    </View>
  );

  const renderHelpPanel = () => (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>{getTranslation("Help & Support")}</Text>
        <Text style={styles.panelSubtitle}>{getTranslation("Get help and find answers to common questions")}</Text>
      </View>
      <Text style={styles.sectionTitle}>{getTranslation("Frequently Asked Questions")}</Text>
      
      <View style={styles.faqItem}>
        <Text style={styles.faqQuestion}>{getTranslation("How do I reset my password?")}</Text>
        <Text style={styles.faqAnswer}>{getTranslation("Click on Forgot Password on the login page and follow the instructions sent to your email.")}</Text>
        <Text style={styles.faqAnswer}> </Text>
        <Text style={styles.faqAnswer}>{getTranslation("Click on Security on the Settings page and follow the instructions sent to your email.")}</Text>
      </View>
      <Text style={styles.sectionTitle}>{getTranslation("Contact Support")}</Text>
      
      <View style={styles.contactGrid}>
        <TouchableOpacity style={styles.contactCard}>
          <Ionicons name="mail-outline" size={24} color="#319795" />
          <Text style={styles.contactTitle}>{getTranslation("Email Support")}</Text>
          <Text style={styles.contactInfo}>blueswitch.app.soporte@gmail.com
</Text>
          <Text style={styles.contactDetail}>{getTranslation("Response within 24 hours")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {width > 768 ? renderSidebar() : null}
      <ScrollView style={styles.content}>
        {width <= 768 && (
          <View style={styles.mobileHeader}>
            <Text style={styles.mobileTitle}>{getTranslation("Settings")}</Text>
          </View>
        )}
        
        {width <= 768 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mobileNav}>
            {[
              { id: 'profile', icon: 'person-outline', label: 'Profile' },
              { id: 'security', icon: 'shield-checkmark-outline', label: 'Security' },
              { id: 'terms', icon: 'document-text-outline', label: 'Terms' },
              { id: 'help', icon: 'help-circle-outline', label: 'Help' },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.mobileNavItem,
                  activePanel === item.id && styles.mobileNavItemActive,
                ]}
                onPress={() => showPanel(item.id)}
              >
                <Ionicons
                  icon={item.icon}
                  size={20}
                  color={activePanel === item.id ? '#319795' : '#4a5568'}
                />
                <Text style={[
                  styles.mobileNavText,
                  activePanel === item.id && styles.mobileNavTextActive,
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {activePanel === 'profile' && renderProfilePanel()}
        {activePanel === 'security' && renderSecurityPanel()}
        {activePanel === 'terms' && renderTermsPanel()}
        {activePanel === 'help' && renderHelpPanel()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', // Fondo blanco obligatorio
  },
  sidebar: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#BFDBFE', // Borde azul claro
    paddingVertical: 30,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE', // Borde azul claro
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DBEAFE', // Azul muy claro
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#3B82F6', // Sombra azulada
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarText: {
    color: '#1E40AF', // Azul oscuro
    fontSize: 18,
    fontWeight: '500',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B', // Gris azulado
  },
  navMenu: {
    paddingTop: 20,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 30,
  },
  navItemActive: {
    backgroundColor: '#DBEAFE', // Azul muy claro
    borderRightWidth: 3,
    borderRightColor: '#1E40AF', // Azul oscuro
  },
  navItemText: {
    marginLeft: 15,
    fontSize: 15,
    color: '#64748B', // Gris azulado
    fontWeight: '500',
  },
  navItemTextActive: {
    color: '#1E40AF', // Azul oscuro
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF', // Fondo blanco
  },
  mobileHeader: {
    marginBottom: 20,
  },
  mobileTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro
  },
  mobileNav: {
    marginBottom: 20,
  },
  mobileNavItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE', // Borde azul claro
    minWidth: 80,
  },
  mobileNavItemActive: {
    backgroundColor: '#DBEAFE', // Azul muy claro
    borderColor: '#1E40AF', // Azul oscuro
  },
  mobileNavText: {
    fontSize: 12,
    color: '#64748B', // Gris azulado
    marginTop: 5,
  },
  mobileNavTextActive: {
    color: '#1E40AF', // Azul oscuro
  },
  panel: {
    backgroundColor: '#FFFFFF', // Fondo blanco
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#3B82F6', // Sombra azulada
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE', // Borde azul claro
  },
  panelHeader: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE', // Borde azul claro
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro
    marginBottom: 8,
  },
  panelSubtitle: {
    fontSize: 15,
    color: '#64748B', // Gris azulado
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#BFDBFE', // Borde azul claro
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1E40AF', // Azul oscuro
    backgroundColor: '#FFFFFF', // Fondo blanco
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E40AF', // Azul oscuro
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    marginTop: 5
  },
  buttonText: {
    color: '#FFFFFF', // Texto blanco para contraste
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // Fondo blanco
    borderWidth: 1,
    borderColor: '#BFDBFE', // Borde azul claro
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
  },
  secondaryButtonText: {
    color: '#1E40AF', // Azul oscuro
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF', // Fondo blanco
    shadowColor: '#3B82F6', // Sombra azulada
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE', // Borde azul claro
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748B', // Gris azulado
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro
    marginBottom: 16,
    marginTop: 20,
  },
  securityTip: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE', // Azul muy claro
    borderWidth: 1,
    borderColor: '#3B82F6', // Borde azul medio
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  tipContent: {
    marginLeft: 10,
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#64748B', // Gris azulado
  },
  termsContent: {
    backgroundColor: '#FFFFFF', // Fondo blanco
    borderWidth: 1,
    borderColor: '#BFDBFE', // Borde azul claro
    borderRadius: 12,
    padding: 20,
    maxHeight: 400,
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro
    marginBottom: 16,
  },
  termsSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro
    marginTop: 20,
    marginBottom: 10,
  },
  termsText: {
    fontSize: 14,
    color: '#64748B', // Gris azulado
    lineHeight: 22,
    marginBottom: 16,
  },
  faqItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF', // Fondo blanco
    shadowColor: '#3B82F6', // Sombra azulada
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE', // Borde azul claro
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro
    marginBottom: 5,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748B', // Gris azulado
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  contactCard: {
    flex: 1,
    minWidth: width > 480 ? '30%' : '100%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Fondo blanco
    shadowColor: '#3B82F6', // Sombra azulada
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE', // Borde azul claro
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro
    marginTop: 10,
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 14,
    color: '#64748B', // Gris azulado
    marginBottom: 5,
    textAlign: 'center',
  },
  contactDetail: {
    fontSize: 12,
    color: '#64748B', // Gris azulado
    textAlign: 'center',
  },
  primaryButtonSmall: {
    backgroundColor: '#1E40AF', // Azul oscuro
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonTextSmall: {
    color: '#FFFFFF', // Texto blanco para contraste
    fontSize: 12,
    fontWeight: '500',
  },
  resourceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});


export default ProfileSettingsScreen;