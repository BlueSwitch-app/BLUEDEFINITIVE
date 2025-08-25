import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { Link, router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ArrowLeft, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { auth2 } from './firebaseConfig';

import { getTranslation } from '@/Translations/i18n';
// Custom Input Component
interface CustomInputProps {
    placeholder: string;
    icon: React.ReactNode;
    value?: string;
    onChangeText?: (text: string) => void;
    secureTextEntry?: boolean;
    error?: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    rightComponent?: React.ReactNode;
}
const CustomInput: React.FC<CustomInputProps> = ({
    placeholder,
    icon,
    value,
    onChangeText,
    secureTextEntry = false,
    error,
    keyboardType = 'default',
    rightComponent,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const borderColor = error ? '#EF5350' : isFocused ? '#2E7D32' : '#E5E7EB';
    const backgroundColor = error ? '#FFEBEE' : isFocused ? '#E8F5E9' : '#FFFFFF';
    return (
        <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { borderColor, backgroundColor }]}>
                <View style={styles.inputIcon}>
                    {icon}
                </View>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#9E9E9E"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {rightComponent && (
                    <TouchableOpacity style={styles.inputRight}>
                        {rightComponent}
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.inputError}>{error}</Text>}
        </View>
    );
};

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleResetPassword = async () => {
        if (!email) {
            toast({
                title: getTranslation('Warning!'),
                description: getTranslation('Please enter your email.'),
                variant: 'warning',
                duration: 2000,
            });
            return;
        }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth2, email);
            toast({
                title: getTranslation('Success!'),
                description: getTranslation('We\'ve sent you a reset link. Check your email.'),
                variant: 'success',
                duration: 2000,
            });
            setEmail('');
            router.push('/');
        } catch (error: any) {
            toast({
                title: getTranslation('Error!'),
                description: error.message,
                variant: 'error',
                duration: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Back Button */}
                <Link href="./" asChild>
                    <Pressable style={styles.backButton}>
                        <ArrowLeft size={24} color="#344E7E" />
                    </Pressable>
                </Link>
                
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Spinner color="#344E7E" />
                        <Text style={styles.loadingText}>{getTranslation("Sending reset link...")}</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.header}>
                            <Text style={styles.title}>{getTranslation("Forgot Password?")}</Text>
                            <Text style={styles.subtitle}>
                               {getTranslation("Enter your email address and we'll send you a link to reset your password.")}
                            </Text>
                        </View>
                        
                        <View style={styles.formContainer}>
                            <CustomInput
                                placeholder={getTranslation("Email Address")}
                                icon={<Mail size={22} color="#344E7E" />}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                            />
                            
                            <Pressable style={styles.button} onPress={handleResetPassword}>
                                <Text style={styles.buttonText}>{getTranslation("Send Reset Link")}</Text>
                            </Pressable>
                            
                            <Link href="./" asChild>
                                <Pressable style={styles.returnButton}>
                                    <Text style={styles.returnButtonText}>{getTranslation("Return to Sign In")}</Text>
                                </Pressable>
                            </Link>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Fondo blanco obligatorio
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 24,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#3B82F620', // Azul medio con opacidad (equivalente translúcido)
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1E40AF', // Azul oscuro (equivalente a East Bay base)
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B', // Gris azulado (equivalente a Sisal Dark Shade 02)
        textAlign: 'center',
        lineHeight: 24,
    },
    formContainer: {
        width: '100%',
        maxWidth: 320,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#64748B', // Gris azulado (equivalente a Sisal Dark Shade 01)
        marginTop: 16,
    },
    button: {
        backgroundColor: '#2563EB', // Azul vibrante (equivalente a East Bay Dark Shade 01)
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#1E40AF', // Sombra azulada
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#FFFFFF', // Texto blanco (máximo contraste)
        fontWeight: '600',
        fontSize: 16,
    },
    returnButton: {
        alignItems: 'center',
        marginTop: 24,
    },
    returnButtonText: {
        color: '#3B82F6', // Azul medio (equivalente a East Bay Light Shade 01)
        fontSize: 16,
        fontWeight: '500',
    },
    // Custom Input Styles
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 20,
        height: 56,
        backgroundColor: '#FFFFFF',
        borderColor: '#93C5FD', // Azul claro (equivalente a Sisal base)
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputIcon: {
        marginRight: 16,
        tintColor: '#3B82F6', // Azul medio para iconos
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1E40AF', // Azul oscuro (equivalente a East Bay base)
    },
    inputRight: {
        marginLeft: 16,
    },
    inputError: {
        color: '#DC2626', // Rojo para errores (mantiene visibilidad)
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
});
