// import { router } from 'expo-router';
// import React, { useState } from 'react';
// import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { useAuth } from '../../src/context/AuthContext';

// interface SignupData {
//   nom: string;
//   prenom: string;
//   email?: string;
//   telephone?: string;
//   motDePasse: string;
//   adresse?: string;
//   role?: string;
// }

// const initialFormState: SignupData = {
//   nom: '',
//   prenom: '',
//   email: '',
//   telephone: '',
//   motDePasse: '',
//   adresse: '',
//   role: 'client',
// };

// type Field = {
//   key: keyof SignupData;
//   placeholder: string;
//   keyboardType?: any;
//   secureTextEntry?: boolean;
// };

// const fields: Field[] = [
//   { key: 'nom', placeholder: 'Nom' },
//   { key: 'prenom', placeholder: 'Prénom' },
//   { key: 'email', placeholder: 'Email (optionnel)', keyboardType: 'email-address' },
//   { key: 'telephone', placeholder: 'Téléphone (optionnel)', keyboardType: 'phone-pad' },
//   { key: 'motDePasse', placeholder: 'Mot de passe', secureTextEntry: true },
//   { key: 'adresse', placeholder: 'Adresse (optionnel)' },
// ];

// export default function RegisterScreen() {
//   const { signup } = useAuth();
//   const [form, setForm] = useState<SignupData>(initialFormState);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleChange = (key: keyof SignupData, value: string) => {
//     setForm({ ...form, [key]: value });
//     setError('');
//   };

//   const handleSignup = async () => {
//     setError('');

//     if (!form.nom || !form.prenom || !form.motDePasse || (!form.email && !form.telephone)) {
//       setError("Veuillez remplir votre nom, prénom, mot de passe et fournir un email ou un téléphone.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const dataToSend: SignupData = {
//         nom: form.nom,
//         prenom: form.prenom,
//         motDePasse: form.motDePasse,
//         email: form.email || undefined,
//         telephone: form.telephone || undefined,
//         adresse: form.adresse || undefined,
//         role: form.role,
//       };

//       await signup(dataToSend);

//       // Après inscription réussie, navigation gérée dans AuthContext ou layout
//        router.replace('/');
//     } catch (e: any) {
//       const errorMessage =
//         e.message || e.status === 'error'
//           ? e.message
//           : "Erreur d'inscription. Veuillez vérifier vos informations.";

//       Alert.alert("Échec de l'inscription", errorMessage);
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Créer un compte</Text>

//       {error ? <Text style={styles.errorText}>{error}</Text> : null}

//       {fields.map((field) => (
//         <TextInput
//           key={field.key}
//           style={styles.input}
//           placeholder={field.placeholder}
//           secureTextEntry={field.secureTextEntry}
//           keyboardType={field.keyboardType}
//           value={form[field.key] || ''}
//           onChangeText={(v) => handleChange(field.key, v)}
//           autoCapitalize={field.key === 'email' ? 'none' : 'words'}
//         />
//       ))}

//       <TouchableOpacity
//         style={styles.button}
//         onPress={handleSignup}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>S&apos;inscrire</Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
//         <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f9f9f9' },
//   title: { fontSize: 28, fontWeight: '700', marginBottom: 30, textAlign: 'center' },
//   input: {
//     padding: 14,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     marginBottom: 15,
//     backgroundColor: '#fff',
//   },
//   button: {
//     backgroundColor: '#007AFF',
//     padding: 15,
//     borderRadius: 8,
//     marginTop: 10,
//     marginBottom: 20,
//     minHeight: 50,
//     justifyContent: 'center',
//   },
//   btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
//   errorText: { color: 'red', textAlign: 'center', marginBottom: 15 },
//   linkText: { color: '#007AFF', textAlign: 'center', marginTop: 15 },
// });


// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import LottieView from "lottie-react-native";
// import React, { useState } from "react";
// import { Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";

// import registerAnimation from "../../assets/animations/register.json";

// export default function Register() {
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === "dark";

//   const [form, setForm] = useState({
//     fullname: "",
//     email: "",
//     password: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);

//   const handleChange = (key: string, value: string) => {
//     setForm({ ...form, [key]: value });
//   };

//   const handleRegister = () => {
//     router.push({ pathname: "/(auth)/login" })

//   };

//   return (
//     <View
//       style={{
//         flex: 1,
//         paddingHorizontal: 22,
//         backgroundColor: isDark ? "#0d0d0d" : "#f9f9f9",
//         justifyContent: "center",
//       }}
//     >
//       {/* Animation */}
//       <View style={{ alignItems: "center", marginBottom: 20 }}>
//         <LottieView
//           source={registerAnimation}
//           autoPlay
//           loop
//           style={{ width: 200, height: 200 }}
//         />
//       </View>

//       {/* Title */}
//       <Text
//         style={{
//           fontSize: 32,
//           fontWeight: "bold",
//           textAlign: "center",
//           color: isDark ? "white" : "#111",
//           marginBottom: 20,
//         }}
//       >
//         Créer un compte
//       </Text>

//       {/* Fullname */}
//       <View
//         style={{
//           marginBottom: 15,
//           backgroundColor: isDark ? "#1a1a1a" : "#fff",
//           borderRadius: 12,
//           paddingHorizontal: 15,
//           paddingVertical: 12,
//           elevation: 1,
//         }}
//       >
//         <TextInput
//           placeholder="Nom complet"
//           placeholderTextColor={isDark ? "#888" : "#999"}
//           value={form.fullname}
//           onChangeText={(t) => handleChange("fullname", t)}
//           style={{ color: isDark ? "white" : "#111", fontSize: 16 }}
//         />
//       </View>

//       {/* Email */}
//       <View
//         style={{
//           marginBottom: 15,
//           backgroundColor: isDark ? "#1a1a1a" : "#fff",
//           borderRadius: 12,
//           paddingHorizontal: 15,
//           paddingVertical: 12,
//           elevation: 1,
//         }}
//       >
//         <TextInput
//           placeholder="Email"
//           placeholderTextColor={isDark ? "#888" : "#999"}
//           value={form.email}
//           onChangeText={(t) => handleChange("email", t)}
//           keyboardType="email-address"
//           style={{ color: isDark ? "white" : "#111", fontSize: 16 }}
//         />
//       </View>

//       {/* Password */}
//       <View
//         style={{
//           marginBottom: 15,
//           flexDirection: "row",
//           alignItems: "center",
//           backgroundColor: isDark ? "#1a1a1a" : "#fff",
//           borderRadius: 12,
//           paddingHorizontal: 15,
//           paddingVertical: 12,
//           elevation: 1,
//         }}
//       >
//         <TextInput
//           placeholder="Mot de passe"
//           placeholderTextColor={isDark ? "#888" : "#999"}
//           secureTextEntry={!showPassword}
//           value={form.password}
//           onChangeText={(t) => handleChange("password", t)}
//           style={{
//             flex: 1,
//             color: isDark ? "white" : "#111",
//             fontSize: 16,
//           }}
//         />

//         <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//           <Ionicons
//             name={showPassword ? "eye-off" : "eye"}
//             size={22}
//             color={isDark ? "#bbb" : "#444"}
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Register Button */}
//       <TouchableOpacity onPress={handleRegister} style={{ marginTop: 10 }}>
//         <LinearGradient
//           colors={["#ff9a3c", "#ff6f00"]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={{
//             paddingVertical: 15,
//             borderRadius: 14,
//             alignItems: "center",
//             elevation: 3,
//           }}
//         >
//           <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
//             {"S'inscrire"}
//           </Text>
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* Already Account */}
//       <TouchableOpacity
//         onPress={() => router.push("/(auth)/login")}
//         style={{ marginTop: 25 }}
//       >
//         <Text
//           style={{
//             textAlign: "center",
//             color: isDark ? "#bbb" : "#333",
//           }}
//         >
//           Déjà un compte ?{" "}
//           <Text style={{ color: "#ff6f00", fontWeight: "bold" }}>
//             Connexion
//           </Text>
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }





// ========================================================================================


import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

interface SignupData {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  motDePasse: string;
  adresse?: string;
  role: 'client' | 'cuisinier' | 'livreur' | 'admin'; // Ajout des rôles valides
}

const initialFormState: SignupData = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  motDePasse: '',
  adresse: '',
  role: 'client', // Client par défaut
};

type Field = {
  key: keyof SignupData;
  placeholder: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
  icon: keyof typeof Feather.glyphMap;
};

// Réorganisation pour un meilleur flux utilisateur
const fields: Field[] = [
  { key: 'nom', placeholder: 'Nom', icon: 'tag' },
  { key: 'prenom', placeholder: 'Prénom', icon: 'tag' },
  { key: 'email', placeholder: 'Email (optionnel)', keyboardType: 'email-address', icon: 'mail' },
  { key: 'telephone', placeholder: 'Téléphone (optionnel)', keyboardType: 'phone-pad', icon: 'phone' },
  { key: 'motDePasse', placeholder: 'Mot de passe', secureTextEntry: true, icon: 'lock' },
  { key: 'adresse', placeholder: 'Adresse (optionnel)', icon: 'map-pin' },
];

const ROLES: { value: SignupData['role']; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { value: 'client', label: 'Client', icon: 'shopping-bag' },
    { value: 'cuisinier', label: 'Cuisinier', icon: 'award' }, // Rôle spécifique
];


export default function RegisterScreen() {
  const { signup } = useAuth();
  const [form, setForm] = useState<SignupData>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (key: keyof SignupData, value: string) => {
    setForm({ ...form, [key]: value });
    setError('');
  };

  const handleSignup = async () => {
    setError('');

    if (!form.nom || !form.prenom || !form.motDePasse || (!form.email && !form.telephone)) {
      setError("Veuillez remplir les champs obligatoires (Nom, Prénom, Mot de passe, Email OU Téléphone).");
      return;
    }

    setLoading(true);
    try {
      const dataToSend: SignupData = {
        ...form,
        email: form.email || undefined,
        telephone: form.telephone || undefined,
        adresse: form.adresse || undefined,
      };

      await signup(dataToSend);
      router.replace('/(tabs)');
    } catch (e: any) {
      const errorMessage = e.message || e.status === 'error' ? e.message : "Erreur d'inscription. Veuillez vérifier vos informations.";
      Alert.alert("Échec de l'inscription", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Créez votre compte</Text>
        <Text style={styles.subtitle}>Rejoignez notre communauté</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Champs de saisie */}
        {fields.map((field) => (
          <View key={field.key} style={styles.inputContainer}>
            <Feather name={field.icon} size={20} color="#777" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={field.placeholder}
              secureTextEntry={field.secureTextEntry && !showPassword}
              keyboardType={field.keyboardType}
              value={form[field.key] || ''}
              onChangeText={(v) => handleChange(field.key, v)}
              autoCapitalize={field.key === 'email' ? 'none' : 'words'}
              placeholderTextColor="#999"
            />
            {field.key === 'motDePasse' && (
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#777" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Sélecteur de Rôle */}
        <Text style={styles.roleTitle}>Quel est votre rôle ?</Text>
        <View style={styles.roleSelector}>
          {ROLES.map(({ value, label, icon }) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.roleCard,
                form.role === value && styles.roleCardActive,
              ]}
              onPress={() => handleChange('role', value)}
            >
              <Feather name={icon} size={24} color={form.role === value ? '#fff' : '#007AFF'} />
              <Text style={[styles.roleLabel, form.role === value && styles.roleLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>


        {/* Bouton d'inscription */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>
              {"S'inscrire"}
              </Text>
          )}
        </TouchableOpacity>

        {/* Lien vers Connexion */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ?</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.linkText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },
  container: { paddingHorizontal: 30, backgroundColor: '#F5F7FA' }, 
  title: { fontSize: 32, fontWeight: '800', marginBottom: 5, textAlign: 'center', color: '#1A1A1A' },
  subtitle: { fontSize: 16, fontWeight: '500', marginBottom: 30, textAlign: 'center', color: '#777' },

  // Style pour l'input avec icône
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12, // Coins plus arrondis
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Bordure subtile
  },
  icon: {
    paddingLeft: 15,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 15,
  },

  // Bouton
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12, 
    marginTop: 30,
    minHeight: 55,
    justifyContent: 'center',
    shadowColor: '#007AFF', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 18 },
  
  // Rôles
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  roleCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  roleLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  roleLabelActive: {
    color: '#fff',
  },

  // Liens
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#555',
    marginRight: 5,
  },
  linkText: { 
    color: '#007AFF', 
    fontWeight: '700', 
    fontSize: 16 
  },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 15, fontWeight: '600' },
});