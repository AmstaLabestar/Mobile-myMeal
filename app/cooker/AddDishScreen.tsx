
import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// === COULEURS MODERNES ===
const COLORS = {
    primary: "#FF7043",
    secondary: "#1E88E5",
    background: "#F7F8F9", 
    card: "#FFFFFF",
    text: "#212121", 
    subtitle: "#757575", 
    placeholderText: "#A0A0A0",
    border: "#E0E0E0",
    danger: "#EF5350", 
    success: "#4CAF50",
};

const CATEGORIES = ["Plat Principal", "Entrée", "Dessert", "Boisson", "Végétarien"];

// === COMPOSANT INPUT FIELD RÉUTILISABLE ===
interface InputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric';
    iconName?: string;
    required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ 
    label, placeholder, value, onChangeText, multiline = false, keyboardType = 'default', iconName, required = false
}) => (
    <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            {required && <Text style={styles.requiredAsterisk}>*</Text>}
        </View>
        <View style={styles.inputContainer}>
            {iconName && (
                <Ionicons name={iconName as any} size={18} color={COLORS.secondary} style={{ marginRight: 10 }} />
            )}
            <TextInput
                style={[styles.input, multiline && styles.multilineInput]}
                placeholder={placeholder}
                placeholderTextColor={COLORS.placeholderText}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                keyboardType={keyboardType}
            />
        </View>
    </View>
);

// ===============================================
// 🍽️ COMPOSANT PRINCIPAL
// ===============================================

export default function AddDishScreen() {
    const [dishName, setDishName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [ingredients, setIngredients] = useState("");
    const [isAvailable, setIsAvailable] = useState(true);
    const [imageUploaded, setImageUploaded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCategoryChange = () => {
        const currentIndex = CATEGORIES.indexOf(category);
        const nextIndex = (currentIndex + 1) % CATEGORIES.length;
        setCategory(CATEGORIES[nextIndex]);
    };

    const handleImageUpload = () => {
        Alert.alert("📷 Téléchargement d'Image", "Intégrer ici 'expo-image-picker' pour choisir une photo du plat.", [
            { text: "Simuler l'upload", onPress: () => setImageUploaded(true) },
            { text: "Annuler", style: "cancel" }
        ]);
    };

    const handleSaveDish = async () => {
        if (!dishName.trim()) {
            Alert.alert("❌ Erreur", "Le nom du plat est obligatoire.");
            return;
        }
        if (!price.trim()) {
            Alert.alert("❌ Erreur", "Le prix est obligatoire.");
            return;
        }

        setLoading(true);
        const dishData = {
            dishName: dishName.trim(),
            description: description.trim(),
            price: parseFloat(price.replace(',', '.')),
            category,
            ingredients: ingredients.trim(),
            isAvailable,
        };

        setTimeout(() => {
            console.log("Plat à envoyer à l'API:", dishData);
            setLoading(false);
            Alert.alert(
                "✅ Succès !",
                `"${dishName}" a été ajouté avec succès et est maintenant ${isAvailable ? 'visible aux clients.' : 'en brouillon.'}`,
                [{ 
                    text: "OK", 
                    onPress: () => {
                        setDishName("");
                        setDescription("");
                        setPrice("");
                        setIngredients("");
                        setCategory(CATEGORIES[0]);
                        setIsAvailable(true);
                        setImageUploaded(false);
                    }
                }]
            );
        }, 800);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* HEADER */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerSmall}>Créer un Nouveau</Text>
                    <Text style={styles.screenTitle}>Plat Délicieux 🍽️</Text>
                </View>
            </View>

            {/* SECTION DÉTAILS */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>📝 Détails du Plat</Text>
                <View style={styles.card}>
                    <InputField
                        label="Nom du Plat"
                        placeholder="Ex: Tarte aux légumes"
                        value={dishName}
                        onChangeText={setDishName}
                        iconName="restaurant-outline"
                        required
                    />
                    
                    <View style={styles.divider} />
                    
                    <InputField
                        label="Description"
                        placeholder="Décrivez ce qui rend ce plat unique..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        iconName="document-text-outline"
                    />
                </View>
            </View>

            {/* SECTION INGRÉDIENTS */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>🥬 Ingrédients & Composition</Text>
                <View style={styles.card}>
                    <InputField
                        label="Ingrédients Clés"
                        placeholder="Ex: Blé, œufs, tomates, basilic..."
                        value={ingredients}
                        onChangeText={setIngredients}
                        iconName="leaf-outline"
                    />
                </View>
            </View>

            {/* SECTION PRIX & CATÉGORIE */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>💰 Prix & Catégorisation</Text>
                <View style={styles.card}>
                    <InputField
                        label="Prix (FCFA)"
                        placeholder="Ex: 5500"
                        value={price}
                        onChangeText={text => setPrice(text.replace(/[^0-9,.]/g, ''))}
                        keyboardType="numeric"
                        iconName="cash-outline"
                        required
                    />
                    
                    <View style={styles.divider} />
                    
                    <TouchableOpacity 
                        style={styles.categorySelector} 
                        onPress={handleCategoryChange}
                        activeOpacity={0.7}
                    >
                        <View style={styles.categoryLeft}>
                            <View style={[styles.categoryIconBox, { backgroundColor: COLORS.secondary + '20' }]}>
                                <Ionicons name="bookmark-outline" size={18} color={COLORS.secondary} />
                            </View>
                            <View>
                                <Text style={styles.inputLabel}>Catégorie</Text>
                                <Text style={styles.categoryValue}>{category}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.placeholderText} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* SECTION MÉDIA & STATUT */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>📷 Média & Disponibilité</Text>
                <View style={styles.card}>
                    {/* Image Upload */}
                    <TouchableOpacity 
                        style={[
                            styles.imageUploadButton,
                            imageUploaded && styles.imageUploadedState
                        ]}
                        onPress={handleImageUpload}
                        activeOpacity={0.8}
                    >
                        <View style={[
                            styles.uploadIconContainer,
                            imageUploaded && { backgroundColor: COLORS.success + '20' }
                        ]}>
                            <Feather 
                                name={imageUploaded ? "check-circle" : "upload-cloud"} 
                                size={28} 
                                color={imageUploaded ? COLORS.success : COLORS.primary} 
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.imageUploadText}>
                                {imageUploaded ? "Photo Ajoutée ✓" : "Ajouter une Photo"}
                            </Text>
                            <Text style={styles.imageUploadSubtext}>
                                {imageUploaded ? "Appuyez pour changer" : "JPEG, PNG - Max 5MB"}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* Availability Toggle */}
                    <View style={styles.availabilityContainer}>
                        <View style={styles.availabilityLeft}>
                            <View style={[styles.statusIconBox, { backgroundColor: isAvailable ? COLORS.success + '20' : COLORS.danger + '20' }]}>
                                <Ionicons 
                                    name={isAvailable ? "eye-outline" : "eye-off-outline"} 
                                    size={18} 
                                    color={isAvailable ? COLORS.success : COLORS.danger} 
                                />
                            </View>
                            <View>
                                <Text style={styles.availabilityLabel}>Visibilité</Text>
                                <Text style={styles.availabilitySubLabel}>
                                    {isAvailable ? "Visible par les clients" : "Masqué (brouillon)"}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            onValueChange={setIsAvailable}
                            value={isAvailable}
                            trackColor={{ false: COLORS.border, true: COLORS.success + '40' }}
                            thumbColor={isAvailable ? COLORS.success : COLORS.danger}
                        />
                    </View>
                </View>
            </View>

            {/* BOUTON SAVE */}
            <TouchableOpacity 
                style={[styles.saveButton, loading && { opacity: 0.7 }]} 
                onPress={handleSaveDish}
                disabled={loading}
                activeOpacity={0.85}
            >
                {loading ? (
                    <>
                        <Text style={styles.saveButtonText}>⏳ Enregistrement...</Text>
                    </>
                ) : (
                    <>
                        <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.card} style={{ marginRight: 8 }} />
                        <Text style={styles.saveButtonText}>Enregistrer le Plat</Text>
                    </>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

// ===============================================
// STYLES
// ===============================================

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === "android" ? 20 : 0,
    },
    scrollContent: { 
        paddingBottom: 40,
    },
    header: { 
        paddingHorizontal: 20, 
        paddingVertical: 18,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginBottom: 12,
    },
    headerSmall: {
        fontSize: 14,
        color: COLORS.subtitle,
        fontWeight: '500',
        marginBottom: 2,
    },
    screenTitle: { 
        fontSize: 26, 
        fontWeight: '800', 
        color: COLORS.text 
    },
    sectionContainer: { 
        marginHorizontal: 20, 
        marginTop: 20,
    },
    sectionTitle: { 
        fontSize: 15, 
        fontWeight: '700', 
        color: COLORS.text, 
        marginBottom: 12,
    },
    card: { 
        backgroundColor: COLORS.card, 
        borderRadius: 14, 
        paddingHorizontal: 16,
        paddingVertical: 0,
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 4, 
        elevation: 2, 
        borderWidth: 1, 
        borderColor: COLORS.border 
    },
    inputGroup: { 
        paddingVertical: 14,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    inputLabel: { 
        fontSize: 13, 
        color: COLORS.subtitle, 
        fontWeight: "600",
    },
    requiredAsterisk: {
        fontSize: 14,
        color: COLORS.danger,
        marginLeft: 4,
        fontWeight: '700',
    },
    inputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: COLORS.background, 
        borderRadius: 10, 
        paddingHorizontal: 12, 
        borderWidth: 1, 
        borderColor: COLORS.border,
    },
    input: { 
        flex: 1, 
        fontSize: 15, 
        color: COLORS.text, 
        paddingVertical: Platform.OS === 'ios' ? 12 : 10,
        fontWeight: '500',
    },
    multilineInput: { 
        height: 100, 
        textAlignVertical: 'top', 
        paddingVertical: 12 
    },
    divider: { 
        height: 1, 
        backgroundColor: COLORS.border, 
        marginHorizontal: -16,
    },
    categorySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryValue: { 
        fontSize: 15, 
        color: COLORS.text, 
        fontWeight: '600',
        marginTop: 2,
    },
    imageUploadButton: { 
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 10,
        marginVertical: 8,
    },
    imageUploadedState: {
        backgroundColor: COLORS.success + '08',
    },
    uploadIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '15',
        marginRight: 12,
    },
    imageUploadText: { 
        fontSize: 15, 
        fontWeight: '700', 
        color: COLORS.text 
    },
    imageUploadSubtext: {
        fontSize: 12,
        color: COLORS.subtitle,
        marginTop: 3,
    },
    availabilityContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 14,
    },
    availabilityLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusIconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    availabilityLabel: { 
        fontSize: 15, 
        fontWeight: '600', 
        color: COLORS.text 
    },
    availabilitySubLabel: { 
        fontSize: 12, 
        color: COLORS.subtitle, 
        marginTop: 2,
    },
    saveButton: { 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary, 
        paddingVertical: 16, 
        borderRadius: 14, 
        marginHorizontal: 20, 
        marginTop: 28,
        marginBottom: 20,
        shadowColor: COLORS.primary, 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 5, 
        elevation: 5 
    },
    saveButtonText: { 
        color: COLORS.card, 
        fontSize: 16, 
        fontWeight: '700'
    },
});