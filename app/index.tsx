import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { View } from '@/components/ui/view';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getTranslation } from '@/Translations/i18n';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Eye, EyeOff, Lock, Mail, MapPin, Phone, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { auth2 } from './firebaseConfig';

// API Base URL
const API_BASE_URL = 'https://bluebackend-blues-projects-c71d4d1f.vercel.app';


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
    const borderColor = error ? '#EF5350' : isFocused ? '#1565C0' : '#E5E7EB';
    const backgroundColor = error ? '#FFEBEE' : isFocused ? '#E3F2FD' : '#FFFFFF';
    
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

export default function AuthScreen() {
    const { toast } = useToast();
    const [tab, setTab] = useState<'login' | 'signup'>('login');
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const emailError = email && !email.includes('@') ? getTranslation('Please enter a valid email address') : '';
    const passwordError = password && password.length < 6 ? getTranslation('Password must be at least 6 characters') : '';
    const muted = useThemeColor({}, 'mutedForeground');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignup = async () => {
        if (!nombre || !email || !password || !city || !phone) {
            toast({
                title: getTranslation('Warning!'),
                description: getTranslation('All fields must be filled.'),
                variant: 'warning',
                duration: 2000
            });
            return;
        }
        
        setLoading(true);
        try {
            // Create user in Firebase
            await createUserWithEmailAndPassword(auth2, email, password);
            
            // Create user in backend
            const response = await fetch(`${API_BASE_URL}/create_user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({ nombre, email, password, city, phone }),
            });
            
            const data = await response.json();
            console.log(data);
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user in backend');
            }
            
            toast({
                title: getTranslation('Success!'),
                description: getTranslation('User created successfully.'),
                variant: 'success',
                duration: 2000
            });
            
            router.push({ pathname: '/home', params: { email } });
        } catch (e: any) {
            console.error('Signup error:', e);
            toast({
                title: getTranslation('Error!'),
                description: e.message || getTranslation('An error occurred during signup'),
                variant: 'error',
                duration: 2000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            toast({
                title: getTranslation('Warning!'),
                description: getTranslation('All fields must be filled.'),
                variant: 'warning',
                duration: 2000
            });
            return;
        }
        
        setLoading(true);
        try {
            // Sign in with Firebase
            await signInWithEmailAndPassword(auth2, email, password);
            
            // Get user data from backend
            const response = await fetch(`${API_BASE_URL}/get_user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({ email }),
            });
            
            const data = await response.json();
            console.log(data);
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to get user data');
            }
            
            toast({
                title: getTranslation('Success!'),
                description: getTranslation('Logged in successfully.'),
                variant: 'success',
                duration: 2000
            });
            
            router.push({ pathname: '/home', params: { email } });
        } catch (e: any) {
            console.error('Login error:', e);
            toast({
                title: getTranslation('Error!'),
                description: e.message || getTranslation('An error occurred during login'),
                variant: 'error',
                duration: 2000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.logo}>{getTranslation("BLUE SWITCH")}</Text>
                <Text style={styles.tagline}>{getTranslation("Control your energy, control your future")}</Text>
                
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Spinner color="#1565C0" />
                    </View>
                ) : (
                    <View style={styles.card}>
                        {/* Tab Navigation */}
                        <View style={styles.tabContainer}>
                            <Pressable
                                style={[styles.tab, tab === 'login' && styles.activeTab]}
                                onPress={() => setTab('login')}
                            >
                                <Text style={[styles.tabText, tab === 'login' && styles.activeTabText]}>{getTranslation("Login")}</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.tab, tab === 'signup' && styles.activeTab]}
                                onPress={() => setTab('signup')}
                            >
                                <Text style={[styles.tabText, tab === 'signup' && styles.activeTabText]}>{getTranslation("Sign Up")}</Text>
                            </Pressable>
                        </View>
                        
                        {tab === 'signup' && (
                            <View style={styles.formContainer}>
                                <CustomInput
                                    placeholder={getTranslation('Full Name')}
                                    icon={<User size={22} color="#1976D2" />}
                                    onChangeText={setNombre}
                                />
                                <CustomInput
                                    placeholder={getTranslation('Email Address')}
                                    icon={<Mail size={22} color="#1976D2" />}
                                    keyboardType='email-address'
                                    onChangeText={setEmail}
                                    error={emailError}
                                />
                                <CustomInput
                                    placeholder={getTranslation('Password')}
                                    icon={<Lock size={22} color="#1976D2" />}
                                    secureTextEntry={!showPassword}
                                    onChangeText={setPassword}
                                    error={passwordError}
                                    rightComponent={
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            {showPassword ? (
                                                <EyeOff size={22} color="#1976D2" />
                                            ) : (
                                                <Eye size={22} color="#1976D2" />
                                            )}
                                        </TouchableOpacity>
                                    }
                                />
                                <CustomInput
                                    placeholder={getTranslation('Phone Number')}
                                    icon={<Phone size={22} color="#1976D2" />}
                                    keyboardType='phone-pad'
                                    onChangeText={setPhone}
                                />
                                <CustomInput
                                    placeholder={getTranslation('City')}
                                    icon={<MapPin size={22} color="#1976D2" />}
                                    onChangeText={setCity}
                                />
                                
                                <Pressable style={styles.button} onPress={handleSignup}>
                                    <Text style={styles.buttonText}>{getTranslation("Create Account")}</Text>
                                </Pressable>
                                
                                <Pressable
                                    onPress={() => Linking.openURL('https://drive.google.com/file/d/1i1r4xRQnzhvCVsNH3EestwHwd7rI5ewx/view?usp=sharing')}
                                >
                                    <Text style={styles.terms}>{getTranslation("Terms & Conditions")}</Text>
                                </Pressable>
                            </View>
                        )}
                        
                        {tab === 'login' && (
                            <View style={styles.formContainer}>
                                <CustomInput
                                    placeholder={getTranslation('Email Address')}
                                    icon={<Mail size={22} color="#1976D2" />}
                                    value={email}
                                    onChangeText={setEmail}
                                    error={emailError}
                                    keyboardType='email-address'
                                />
                                <CustomInput
                                    placeholder={getTranslation('Password')}
                                    icon={<Lock size={22} color="#1976D2" />}
                                    secureTextEntry={!showPassword}
                                    onChangeText={setPassword}
                                    rightComponent={
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            {showPassword ? (
                                                <EyeOff size={22} color="#1976D2" />
                                            ) : (
                                                <Eye size={22} color="#1976D2" />
                                            )}
                                        </TouchableOpacity>
                                    }
                                />
                                
                                <Pressable style={styles.button} onPress={handleLogin}>
                                    <Text style={styles.buttonText}>{getTranslation("Sign In")}</Text>
                                </Pressable>
                                
                                <Link href="./ForgotPswd" asChild>
                                    <Pressable>
                                        <Text style={styles.forgotPasswordLink}>{getTranslation("Forgot Password?")}</Text>
                                    </Pressable>
                                </Link>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    logo: {
        fontSize: 36,
        fontWeight: '700',
        color: '#1565C0', // Azul oscuro
        marginBottom: 8,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 16,
        color: '#42A5F5', // Azul brillante
        marginBottom: 40,
        textAlign: 'center',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD', // Azul claro
        borderRadius: 16,
        marginBottom: 32,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: '#1565C0', // Azul oscuro
    },
    tabText: {
        color: '#1976D2', // Azul medio
        fontWeight: '600',
        fontSize: 16,
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    formContainer: {
        width: '100%',
    },
    button: {
        backgroundColor: '#1565C0', // Azul oscuro
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    terms: {
        color: '#0288D1', // Azul cielo
        fontSize: 14,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    forgotPasswordLink: {
        color: '#0288D1', // Azul cielo
        fontSize: 14,
        textAlign: 'center',
        textDecorationLine: 'underline',
        marginTop: 8,
    },
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputIcon: {
        marginRight: 16,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#37474F', // Gris carbón
    },
    inputRight: {
        marginLeft: 16,
    },
    inputError: {
        color: '#EF5350', // Rojo coral
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
});