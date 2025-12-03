import { Feather, Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../../src/api/api"; // <-- Vérifiez que ce chemin est correct

// === COULEURS MODERNES & UX ===
const COLORS = {
    primary: "#FF7043", // Orange Chaud
    secondary: "#1E88E5", // Bleu Vif
    background: "#F7F8F9", // Arrière-plan léger
    card: "#FFFFFF",
    text: "#212121",
    subtitle: "#757575",
    border: "#E0E0E0",
    error: "#EF5350",
    success: "#4CAF50",
};

// ===============================================
// 📋 COMPOSANT PRINCIPAL : AddMealScreen
// ===============================================
export default function AddMealScreen() {
    // --- États du Formulaire ---
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [price, setPrice] = useState("");
    const [preparationTime, setPreparationTime] = useState("");
    const [category, setCategory] = useState("plat_principal");
    const [image, setImage] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);

    // --- LOGIQUE D'UPLOAD D'IMAGE (Optimisé pour la robustesse) ---
    const uploadImage = async (): Promise<string | null> => {
        if (!image) return null;

        try {
            // Assure-toi que le nom et le type sont corrects pour le backend
            const fileExtension = image.split('.').pop();
            const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
            
            const formData = new FormData();
            formData.append("file", {
                uri: image,
                name: `meal.${fileExtension}`,
                type: mimeType,
            } as any);

            // Affiche un message de chargement temporaire
            Alert.alert("Téléchargement", "Image en cours d'envoi...");
            
            const response = await api.post("/upload/image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // L'alerte disparaîtra lors du Alert.alert de succès/erreur global
            return response.data.url; // L'URL publique de l'image
        } catch (error: any) {
            console.error("❌ Erreur upload:", error.response?.data || error.message);
            Alert.alert(
                "Erreur d'Upload", 
                error.response?.data?.message || "Échec de l'upload de l'image. Veuillez réessayer."
            );
            return null;
        }
    };

    // --- LOGIQUE DE SÉLECTION D'IMAGE ---
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission requise", "Nous avons besoin de la permission d'accéder à la galerie pour choisir une image.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsEditing: true,
            aspect: [4, 3], // Format d'édition conseillé
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // --- LOGIQUE DE SOUMISSION DU FORMULAIRE (Création du Repas) ---
    const handleSubmit = async () => {
        // Validation basique
        if (!name || !price || !preparationTime) {
            return Alert.alert("Champs Manquants", "Veuillez remplir au moins le nom, le prix et le temps de préparation.");
        }
        
        const numericPrice = parseFloat(price.replace(',', '.')); // Gère la virgule
        const numericTime = parseInt(preparationTime, 10);

        if (isNaN(numericPrice) || numericPrice <= 0 || isNaN(numericTime) || numericTime <= 0) {
             return Alert.alert("Erreur de Format", "Le prix et le temps de préparation doivent être des nombres positifs valides.");
        }

        setLoading(true);

        let uploadedImageUrl = null;

        // 1. Upload de l'image si elle est présente
        if (image) {
            uploadedImageUrl = await uploadImage();
            // Si l'upload échoue, uploadImage affiche déjà l'alerte et retourne null, on arrête
            if (!uploadedImageUrl) {
                setLoading(false);
                return;
            }
        }

        // 2. Envoi des données du repas
        try {
            const payload = {
                name,
                description,
                // Assure la robustesse, même si la chaîne est vide
                ingredients: ingredients.split(',').map(s => s.trim()).filter(s => s.length > 0), 
                price: numericPrice,
                preparationTime: numericTime,
                category,
                imageUrl: uploadedImageUrl,
            };

            const response = await api.post("/meals", payload);

            Alert.alert("Succès 🎉", `Le plat "${response.data.data.meal.name}" a été ajouté à votre menu.`);
            
            // Réinitialisation du formulaire
            setName("");
            setDescription("");
            setIngredients("");
            setPrice("");
            setPreparationTime("");
            setCategory("plat_principal");
            setImage(null);

        } catch (error: any) {
            console.error("❌ Erreur de création du plat:", error.response?.data || error.message);
            Alert.alert(
                "Échec de l'ajout", 
                error.response?.data?.message || "Une erreur est survenue lors de la création du plat."
            );
        } finally {
            setLoading(false);
        }
    };

    // --- RENDU UI/UX ---
    // Dans AddMealScreen.tsx

return (
  <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
  >
      <Text style={styles.screenTitle}>Ajouter un Nouveau Plat ✨</Text>

      {/* Section Image */}
      <View style={styles.sectionContainer}>
          <Text style={styles.label}>Photo du Plat</Text>
          
          {image ? (
              <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
                      <Ionicons name="close-circle" size={24} color={COLORS.card} />
                  </TouchableOpacity>
              </View>
          ) : (
              <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={30} color={COLORS.subtitle} />
                  <Text style={styles.placeholderText}>Ajouter une belle photo pour attirer les clients</Text>
              </View>
          )}
          
          <TouchableOpacity
              onPress={pickImage}
              style={[styles.actionButton, { backgroundColor: COLORS.secondary }]}
          >
              <Feather name="image" size={18} color={COLORS.card} />
              <Text style={styles.actionButtonText}>Choisir une image</Text>
          </TouchableOpacity>
      </View>
      
      <View style={styles.divider} />

      {/* Section Détails */}
      <View style={styles.sectionContainer}>
          
          {/* Nom */}
          <Text style={styles.label}>Nom du plat <Text style={{ color: COLORS.error }}>*</Text></Text>
          <TextInput
              placeholder="Ex : Poulet Yassa Traditionnel"
              value={name}
              onChangeText={setName}
              style={styles.input}
          />

          {/* Catégorie */}
          <Text style={styles.label}>Catégorie <Text style={{ color: COLORS.error }}>*</Text></Text>
          <View style={styles.pickerContainer}>
              <Picker 
                  selectedValue={category} 
                  onValueChange={(v) => setCategory(v)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
              >
                  <Picker.Item label="Plat principal" value="plat_principal" />
                  <Picker.Item label="Entrée" value="entrée" />
                  <Picker.Item label="Accompagnement" value="accompagnement" />
                  <Picker.Item label="Dessert" value="dessert" />
                  <Picker.Item label="Boisson" value="boisson" />
                  <Picker.Item label="Autre" value="autre" />
              </Picker>
          </View>

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
              placeholder="Décrivez brièvement le goût et l'expérience du repas."
              value={description}
              onChangeText={setDescription}
              multiline
              style={[styles.input, styles.textArea]}
          />

          {/* Ingrédients */}
          <Text style={styles.label}>Ingrédients (Séparés par une virgule)</Text>
          <TextInput
              placeholder="Ex : riz, oignons, poulet, moutarde, citron"
              value={ingredients}
              onChangeText={setIngredients}
              style={styles.input}
          />

      </View>

      <View style={styles.divider} />

      {/* Section Tarification/Temps */}
      <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Tarification et Logistique</Text>
          <View style={styles.row}>
              
              {/* Prix */}
              <View style={styles.halfInput}>
                  <Text style={styles.label}>Prix (FCFA) <Text style={{ color: COLORS.error }}>*</Text></Text>
                  <TextInput
                      placeholder="1500"
                      keyboardType="decimal-pad"
                      value={price}
                      onChangeText={setPrice}
                      style={styles.input}
                  />
              </View>

              {/* Temps de préparation */}
              <View style={styles.halfInput}>
                  <Text style={styles.label}>Temps de prép. (min) <Text style={{ color: COLORS.error }}>*</Text></Text>
                  <TextInput
                      placeholder="30"
                      keyboardType="numeric"
                      value={preparationTime}
                      onChangeText={setPreparationTime}
                      style={styles.input}
                  />
              </View>
          </View>
      </View>

      {/* BTN SUBMIT */}
      <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitButton, loading && { opacity: 0.6 }]}
      >
          {loading ? (
              <ActivityIndicator color={COLORS.card} />
          ) : (
              <Text style={styles.submitButtonText}>Ajouter le Plat au Menu</Text>
          )}
      </TouchableOpacity>

      <View style={{ height: 50 }} />
  </ScrollView>
);
}
// ===============================================
// STYLES DÉTAILLÉS (Meilleure UI/UX)
// ===============================================

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.background,
    },
    scrollContent: { 
        padding: 20, 
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: COLORS.text,
        marginBottom: 25,
        textAlign: 'center',
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.secondary,
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 15,
    },
    label: {
        fontWeight: "600",
        color: COLORS.text,
        marginBottom: 6,
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        padding: Platform.OS === 'ios' ? 14 : 10,
        marginBottom: 15,
        backgroundColor: COLORS.card,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top', 
        paddingTop: 14,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    halfInput: {
        width: '48%',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: COLORS.card,
        // Correction pour Android
        overflow: Platform.OS === 'android' ? 'hidden' : 'visible', 
    },
    picker: {
        height: 50,
        width: '100%',
    },
    pickerItem: { // Amélioration pour iOS
        fontSize: 16,
    },
    
    // --- Styles d'Image ---
    imagePlaceholder: {
        backgroundColor: COLORS.border + '30',
        height: 180,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        marginBottom: 15,
    },
    placeholderText: {
        color: COLORS.subtitle,
        marginTop: 5,
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    imagePreviewContainer: {
        marginBottom: 15,
    },
    imagePreview: { 
        width: "100%", 
        height: 200, 
        borderRadius: 10, 
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: COLORS.error,
        borderRadius: 15,
        padding: 2,
        zIndex: 10,
    },
    
    // --- Styles du Bouton d'Action ---
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
    },
    actionButtonText: {
        color: COLORS.card,
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },

    // --- Styles du Bouton de Soumission ---
    submitButton: {
        backgroundColor: COLORS.success,
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    submitButtonText: {
        color: COLORS.card,
        fontWeight: "800",
        fontSize: 18,
    },
});