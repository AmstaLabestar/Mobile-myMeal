// import { router } from 'expo-router';
// import React, { useState } from 'react';
// import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { useAuth } from '../../src/context/AuthContext';

// export default function LoginScreen() {
//   const { login } = useAuth();
//   const [identifier, setIdentifier] = useState('');
//   const [motDePasse, setMotDePasse] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     setError('');

//     if (!identifier || !motDePasse) {
//       setError("Veuillez saisir votre identifiant et votre mot de passe.");
//       return;
//     }

//     setLoading(true);
//     try {
//       await login(identifier, motDePasse);

//       // Navigation automatique gérée dans AuthContext ou layout
//       router.replace('/(tabs)');
//     } catch (e: any) {
//       const errorMessage =
//         e.message || e.status === 'error'
//           ? e.message
//           : 'Identifiants incorrects.';
//       Alert.alert("Erreur de connexion", errorMessage);
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Connexion</Text>

//       {error ? <Text style={styles.errorText}>{error}</Text> : null}

//       <TextInput
//         style={styles.input}
//         placeholder="Email ou téléphone"
//         value={identifier}
//         onChangeText={setIdentifier}
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Mot de passe"
//         secureTextEntry
//         value={motDePasse}
//         onChangeText={setMotDePasse}
//       />

//       <TouchableOpacity
//         style={styles.button}
//         onPress={handleLogin}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>Se connecter</Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
//         <Text style={styles.linkText}>Créer un compte</Text>
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
// import {
//   ActivityIndicator,
//   Appearance,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useAuth } from "../../src/context/AuthContext";

// export default function LoginScreen() {
//   const { login } = useAuth();

//   const [identifier, setIdentifier] = useState("");
//   const [motDePasse, setMotDePasse] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const colorScheme = Appearance.getColorScheme();
//   const isDark = colorScheme === "dark";

//   const handleLogin = async () => {
//     setError("");

//     if (!identifier || !motDePasse) {
//       return setError("Veuillez remplir tous les champs.");
//     }

//     setLoading(true);

//     try {
//       await login(identifier, motDePasse);
//       router.replace("/(tabs)");
//     } catch (e: any) {
//       const msg = e.message || "Identifiants incorrects.";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: isDark ? "#0D0D0D" : "#F7F7F7" }]}>

//       {/* Animation Lottie */}
//       <LottieView
//         source={require("../../assets/lottie/login-animation.json")}
//         autoPlay
//         loop
//         style={{ width: 220, height: 220, marginBottom: -20 }}
//       />

//       <Text style={[styles.title, { color: isDark ? "#fff" : "#111" }]}>
//         Bienvenue 👋
//       </Text>

//       {error ? <Text style={styles.errorText}>{error}</Text> : null}

//       {/* Champ identifiant */}
//       <View style={styles.inputContainer}>
//         <Ionicons
//           name="person-outline"
//           size={20}
//           color="#999"
//           style={{ marginRight: 8 }}
//         />
//         <TextInput
//           placeholder="Email ou téléphone"
//           value={identifier}
//           onChangeText={setIdentifier}
//           autoCapitalize="none"
//           placeholderTextColor="#999"
//           style={styles.input}
//         />
//       </View>

//       {/* Champ mot de passe */}
//       <View style={styles.inputContainer}>
//         <Ionicons
//           name="lock-closed-outline"
//           size={20}
//           color="#999"
//           style={{ marginRight: 8 }}
//         />

//         <TextInput
//           placeholder="Mot de passe"
//           secureTextEntry={!showPassword}
//           value={motDePasse}
//           onChangeText={setMotDePasse}
//           placeholderTextColor="#999"
//           style={styles.input}
//         />

//         <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//           <Ionicons
//             name={showPassword ? "eye-outline" : "eye-off-outline"}
//             size={20}
//             color="#999"
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Bouton login */}
//       <TouchableOpacity disabled={loading} onPress={handleLogin}>
//         <LinearGradient
//           colors={["#FF7F50", "#FF4E16"]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={styles.button}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.btnText}>Connexion</Text>
//           )}
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* Lien inscription */}
//       <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
//         <Text style={styles.registerText}>
//           Pas de compte ? <Text style={styles.registerLink}>Créer un compte</Text>
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 25,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "700",
//     marginBottom: 20,
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 15,
//     fontSize: 14,
//   },
//   inputContainer: {
//     width: "100%",
//     height: 55,
//     borderRadius: 14,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//     backgroundColor: "rgba(255,255,255,0.25)",
//     flexDirection: "row",
//     alignItems: "center",
//     backdropFilter: "blur(15px)",
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     color: "#111",
//   },
//   button: {
//     width: "100%",
//     height: 55,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 5,
//     marginBottom: 15,
//   },
//   btnText: {
//     fontSize: 18,
//     color: "#fff",
//     fontWeight: "600",
//   },
//   registerText: {
//     fontSize: 15,
//     marginTop: 8,
//     color: "#777",
//   },
//   registerLink: {
//     color: "#FF4E16",
//     fontWeight: "600",
//   },
// });


// ============================================================================




import { Feather } from '@expo/vector-icons'; // Assurez-vous d'avoir @expo/vector-icons installé
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Pour afficher/masquer le mot de passe

  // ... (handleLogin reste inchangé)
  const handleLogin = async () => {
    if (loading) return; 
    if (!identifier || !motDePasse) {
      Alert.alert("Erreur", "Veuillez saisir votre identifiant et votre mot de passe.");
      return;
    }

    setLoading(true);
    try {
      await login(identifier, motDePasse);
      router.replace('/(tabs)');
    } catch (e: any) {
      const errorMessage = e.message || e.status === 'error' ? e.message : 'Identifiants incorrects.';
      Alert.alert("Erreur de connexion", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue !</Text>
      <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

      {/* Input Identifiant */}
      <View style={styles.inputContainer}>
        <Feather name="user" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email ou Téléphone"
          value={identifier}
          onChangeText={setIdentifier}
          keyboardType="email-address" // Fonctionne aussi pour le téléphone si l'utilisateur change d'avis
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
      </View>

      {/* Input Mot de passe */}
      <View style={styles.inputContainer}>
        <Feather name="lock" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          secureTextEntry={!showPassword}
          value={motDePasse}
          onChangeText={setMotDePasse}
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setShowPassword(!showPassword)}
        >
          <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#777" />
        </TouchableOpacity>
      </View>

      {/* Lien Mot de passe oublié */}
      <TouchableOpacity 
        style={styles.forgotPassword} 
        onPress={() => Alert.alert('Fonctionnalité', 'Redirection vers la page Mot de passe oublié...')} // À implémenter
      >
        <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
      </TouchableOpacity>

      {/* Bouton de connexion */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Se connecter</Text>
        )}
      </TouchableOpacity>

      {/* Lien vers Inscription */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Pas encore de compte ?</Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
          <Text style={styles.linkText}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#F5F7FA' }, // Fond plus doux
  title: { fontSize: 32, fontWeight: '800', marginBottom: 5, textAlign: 'center', color: '#1A1A1A' },
  subtitle: { fontSize: 16, fontWeight: '500', marginBottom: 40, textAlign: 'center', color: '#777' },
  
  // Style pour l'input avec icône
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12, // Coins plus arrondis
    marginBottom: 20,
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
    borderRadius: 12, // Coins arrondis du bouton
    marginTop: 20,
    minHeight: 55,
    justifyContent: 'center',
    shadowColor: '#007AFF', // Ombre pour l'effet "pop"
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 18 },
  
  // Liens
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
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
});