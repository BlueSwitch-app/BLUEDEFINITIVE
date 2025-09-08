import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getTranslation } from '@/Translations/i18n';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail, MapPin, Phone, User, XCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Animated, Easing, Linking, Pressable, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { auth2 } from './firebaseConfig';

// API Base URL
const API_BASE_URL = 'https://bluebackkk.vercel.app';

// Custom Toast Component
const CustomToast = ({ visible, message, type = 'success', onHide }: { 
  visible: boolean; 
  message: string; 
  type?: 'success' | 'error' | 'warning';
  onHide?: () => void;
}) => {
  const [opacity] = useState(new Animated.Value(0));
  const [position] = useState(new Animated.Value(100));
  
  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(position, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(position, {
        toValue: 100,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };
  
  if (!visible) return null;
  
  // Determine colors based on toast type
  let bgColor = '#FFFFFF';
  let textColor = '#1E40AF'; // Default blue
  let progressColor = '#3B82F6'; // Default blue
  let borderColor = '#3B82F6'; // Default blue
  let iconColor = '#3B82F6'; // Default blue
  
  if (type === 'error') {
    textColor = '#DC2626'; // Red for errors
    progressColor = '#DC2626';
    borderColor = '#FECACA';
    iconColor = '#DC2626';
  } else if (type === 'warning') {
    textColor = '#D97706'; // Orange for warnings
    progressColor = '#D97706';
    borderColor = '#FEF3C7';
    iconColor = '#D97706';
  }
  
  // Select icon based on type
  const renderIcon = () => {
    if (type === 'error') {
      return <XCircle size={20} color={iconColor} />;
    } else if (type === 'warning') {
      return <AlertCircle size={20} color={iconColor} />;
    } else {
      return <CheckCircle size={20} color={iconColor} />;
    }
  };
  
  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity: opacity,
          transform: [{ translateY: position }],
          backgroundColor: bgColor,
          borderColor: borderColor,
        },
      ]}
    >
      <View style={styles.toastContent}>
        <View style={styles.toastIcon}>
          {renderIcon()}
        </View>
        <Text style={[styles.toastMessage, { color: textColor }]}>{message}</Text>
      </View>
      <View style={styles.toastProgress}>
        <Animated.View
          style={[
            styles.toastProgressBar,
            { backgroundColor: progressColor },
            {
              width: opacity.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

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
    const [tab, setTab] = useState<'login' | 'signup'>('login');
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
    const router = useRouter();
    const emailError = email && !email.includes('@') ? getTranslation('Please enter a valid email address') : '';
    const passwordError = password && password.length < 6 ? getTranslation('Password must be at least 6 characters') : '';
    const muted = useThemeColor({}, 'mutedForeground');
    const [showPassword, setShowPassword] = useState(false);
    
    // Toast function
    const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
      setToastMessage(message);
      setToastType(type);
      setToastVisible(true);
    };
    
    // Verificar si hay un usuario autenticado al cargar la pantalla
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth2, (user) => {
            if (user) {
                router.push({ pathname: '/home', params: { email: user.email } });
            }
            setCheckingAuth(false);
        });
        return () => unsubscribe();
    }, []);
    
    const handleSignup = async () => {
        if (!nombre || !email || !password || !city || !phone) {
            showToast(getTranslation('All fields must be filled.'), 'warning');
            return;
        }
        
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth2, email, password);
            
            const response = await fetch(`${API_BASE_URL}/create_user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nombre, email, password, city, phone }),
            });
            
            const data = await response.json();
            console.log(data);
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user in backend');
            }
            
            showToast(getTranslation('User created successfully.'), 'success');
            router.push({ pathname: '/home', params: { email } });
        } catch (e: any) {
            console.error('Signup error:', e);
            showToast(e.message || getTranslation('An error occurred during signup'), 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const handleLogin = async () => {
        if (!email || !password) {
            showToast(getTranslation('All fields must be filled.'), 'warning');
            return;
        }
        
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth2, email, password);
            
            const response = await fetch(`${API_BASE_URL}/get_user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email }),
            });
            
            const data = await response.json();
            console.log(data);
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to get user data');
            }
            
            showToast(getTranslation('Logged in successfully.'), 'success');
            router.push({ pathname: '/home', params: { email } });
        } catch (e: any) {
            console.error('Login error:', e);
            showToast(e.message || getTranslation('An error occurred during login'), 'error');
        } finally {
            setLoading(false);
        }
    };
    
    if (checkingAuth) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <Spinner color="#1565C0" />
                </View>
            </View>
        );
    }
    
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
            
            {/* Custom Toast Component */}
            <CustomToast
                visible={toastVisible}
                message={toastMessage}
                type={toastType}
                onHide={() => setToastVisible(false)}
            />
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
        color: '#1E40AF',
        marginBottom: 8,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 16,
        color: '#3B82F6',
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
        shadowColor: '#1E40AF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#DBEAFE',
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
        backgroundColor: '#3B82F6',
    },
    tabText: {
        color: '#1E40AF',
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
        backgroundColor: '#2563EB',
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
        color: '#2563EB',
        fontSize: 14,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    forgotPasswordLink: {
        color: '#2563EB',
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
        borderColor: '#93C5FD',
        borderRadius: 16,
        paddingHorizontal: 20,
        height: 56,
        backgroundColor: '#FFFFFF',
        shadowColor: '#2563EB',
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
        color: '#1E40AF',
    },
    inputRight: {
        marginLeft: 16,
    },
    inputError: {
        color: '#DC2626',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    // Enhanced Toast styles
    toastContainer: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
        padding: 16,
        paddingBottom: 12,
    },
    toastContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    toastIcon: {
        marginRight: 12,
    },
    toastMessage: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    toastProgress: {
        height: 4,
        backgroundColor: '#E0E7FF',
        borderRadius: 2,
    },
    toastProgressBar: {
        height: '100%',
        borderRadius: 2,
    },
});