import { getTranslation } from '@/Translations/i18n';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export interface TicketProps {
  title: string;
  imageSource: string;
  co2Score: number;
  highestImpactDevice: string;
  equivalentSavings: string;
  dateTime: string;
  accentColor: string;
  backgroundColor: string;
}

const { width } = Dimensions.get('window');

const GreenInfoTicket: React.FC<TicketProps> = ({
  title = getTranslation("Your Carbon Footprint Report"),
  imageSource,
  co2Score,
  highestImpactDevice,
  equivalentSavings,
  dateTime,

}) => {
  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content]}>
        {/* Header with image and title */}
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            <View style={[styles.imageWrapper, ]}>
              {imageSource ? (
                <Image source={{ uri: imageSource }} style={styles.image} />
              ) : (
                <View style={[styles.placeholderImage,]}>
                  <Text style={styles.placeholderText}>🌱</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <View style={[styles.titleUnderline]} />
          </View>
        </View>

        {/* CO2 Score Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{getTranslation("Huella de Carbono")}</Text>
          <View style={[styles.scoreContainer]}>
            <Text style={[styles.scoreValue]}>{co2Score} kg</Text>
            <Text style={styles.scoreSubtext}>{getTranslation("CO₂ equivalente")}</Text>
          </View>
        </View>

        {/* Highest Impact Device Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{getTranslation("Dispositivo de Mayor Impacto")}</Text>
          <View style={styles.infoCard}>
            <View style={[styles.iconContainer]}>
              <Text style={[styles.icon]}>⚡</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>{highestImpactDevice}</Text>
              <Text style={styles.infoSubtext}>{getTranslation("Mayor consumo energético")}</Text>
            </View>
          </View>
        </View>

        {/* Equivalent Savings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{getTranslation("Equivalente en Ahorros")}</Text>
          <View style={styles.infoCard}>
            <View style={[styles.iconContainer]}>
              <Text style={[styles.icon]}>🌳</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>{equivalentSavings}</Text>
              <Text style={styles.infoSubtext}>{getTranslation("Árboles para compensar")}</Text>
            </View>
          </View>
        </View>

        {/* Footer with date and time */}
        <View style={[styles.footer]}>
          <View style={styles.footerContent}>
            <Text style={styles.footerLabel}>{getTranslation("Fecha y Hora")}</Text>
            <Text style={styles.footerValue}>{dateTime}</Text>
          </View>
          <View style={[styles.footerIcon]}>
            <Text style={styles.footerIconText}>🌿</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    maxHeight: 600,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#1E40AF', // Azul oscuro
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    alignSelf: 'center',
    marginVertical: 20,
  },
  content: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#FFFFFF', // Fondo blanco obligatorio
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#1E40AF', // Azul oscuro
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  placeholderImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E40AF', // Azul oscuro
  },
  placeholderText: {
    fontSize: 40,
    color: '#FFFFFF', // Texto blanco para contraste
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E40AF', // Azul oscuro
    textAlign: 'center',
    marginBottom: 8,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E40AF', // Azul oscuro
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6', // Azul medio
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreContainer: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE', // Azul muy claro
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E40AF', // Azul oscuro
    marginBottom: 4,
  },
  scoreSubtext: {
    fontSize: 14,
    color: '#3B82F6', // Azul medio
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF', // Fondo blanco
    shadowColor: '#3B82F6', // Azul medio
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#BFDBFE', // Azul claro
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#DBEAFE', // Azul muy claro
  },
  icon: {
    fontSize: 24,
    color: '#1E40AF', // Azul oscuro
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF', // Azul oscuro
    marginBottom: 2,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#3B82F6', // Azul medio
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    backgroundColor: 'hsla(0, 0%, 100%, 1.00)', // Azul muy claro
    shadowColor: '#3B82F6', // Azul medio
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#BFDBFE', // Azul claro
  },
  footerContent: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6', // Azul medio
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E40AF', // Azul oscuro
  },
  footerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E40AF', // Azul oscuro
  },
  footerIconText: {
    fontSize: 20,
    color: '#FFFFFF', // Texto blanco para contraste
  },
});

export default GreenInfoTicket;