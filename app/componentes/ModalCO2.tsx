import { getTranslation } from "@/Translations/i18n";
import * as Sharing from "expo-sharing"; // Si usas Expo
import React, { useRef } from "react";
import {
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import GreenInfoTicket, { TicketProps } from "./CO2Ticket";

interface CarbonFootprintModalProps extends TicketProps {
  visible: boolean;
  onClose: () => void;
  onLeftButtonPress?: () => void;
  leftButtonText?: string;
  leftButtonIcon?: string;
}

const CarbonFootprintModal: React.FC<CarbonFootprintModalProps> = ({
  visible,
  onClose,
  onLeftButtonPress,
  leftButtonText = "Share",
  leftButtonIcon,
  ...ticketProps
}) => {
  const viewToSnapshotRef = useRef<any>(null);

  const snapshotAndShare = async () => {
    try {
      if (Platform.OS === "web") {
        // Captura con html-to-image
        const htmlToImage = await import("html-to-image");
        const node = viewToSnapshotRef.current as HTMLElement | null;
        if (!node) return;
        const dataUrl = await htmlToImage.toPng(node, { cacheBust: true });

        // Usa la Web Share API si está disponible
        if (navigator.share) {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], "ticket.png", { type: blob.type });
          navigator.share({
            title: getTranslation("Mi Huella de Carbono"),
            text: getTranslation("Te comparto mi impacto ambiental"),
            files: [file],
          });
        } else {
          // Si no está disponible, abre la imagen en nueva pestaña
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "ticket.png";
          link.click();
        }
        return;
      }

      // Móvil: captura con react-native-view-shot
      if (viewToSnapshotRef.current) {
        const uri = await captureRef(viewToSnapshotRef.current, {
          format: "png",
          quality: 0.9,
        });

        // Si usas Expo: compartir directamente
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          // Ejemplo: abrir WhatsApp sin react-native-share
          const whatsappUrl = `whatsapp://send?text=${getTranslation("Te comparto mi impacto ambiental")}&attachment=${uri}`;

          Linking.openURL(whatsappUrl);
        }
      }
    } catch (error) {
      console.error(getTranslation("Error al capturar o compartir:"), error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {onLeftButtonPress && (
            <TouchableOpacity
              style={styles.leftButton}
              onPress={snapshotAndShare}
            >
              <View style={styles.leftButtonIcon}>
                <Text style={styles.leftButtonText}>
                  {leftButtonIcon || "⤴"}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <View style={styles.closeIcon}>
              <Text style={styles.closeIconText}>×</Text>
            </View>
          </TouchableOpacity>

          <View
            ref={viewToSnapshotRef}
            collapsable={false}
            style={{ padding: 0 }}
          >
            <GreenInfoTicket {...ticketProps} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF", // Fondo blanco obligatorio
    paddingTop: 8,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "rgba(219, 234, 254, 0.9)", // Azul muy claro con opacidad
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    width: 40,
    height: 40,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#BFDBFE", // Borde azul claro
  },
  closeIcon: {
    backgroundColor: "#3B82F6", // Azul medio
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    width: 30,
    height: 30,
  },
  closeIconText: { 
    color: "#FFFFFF", // Texto blanco para contraste
    fontWeight: "bold", 
    fontSize: 18 
  },
  leftButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: "rgba(219, 234, 254, 0.9)", // Azul muy claro con opacidad
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    width: 40,
    height: 40,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#BFDBFE", // Borde azul claro
  },
  leftButtonIcon: {
    backgroundColor: "#1E40AF", // Azul oscuro
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    width: 30,
    height: 30,
  },
  leftButtonText: { 
    color: "#FFFFFF", // Texto blanco para contraste
    fontWeight: "bold", 
    fontSize: 18 
  },
});
export default CarbonFootprintModal;
