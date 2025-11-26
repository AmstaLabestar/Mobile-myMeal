import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
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
    danger: "#EF5350",
    success: "#4CAF50",
    border: "#E0E0E0", // <-- Ajouté
};


interface Dish {
    id: string;
    name: string;
    price: number;
    category: string;
    isAvailable: boolean;
}

const INITIAL_DISHES: Dish[] = [
    { id: 'D001', name: 'Poulet Yassa Maison', price: 12.50, category: 'Plat Principal', isAvailable: true },
    { id: 'D002', name: 'Salade César Gourmande', price: 9.90, category: 'Entrée', isAvailable: true },
    { id: 'D003', name: 'Tarte aux Pommes Artisanale', price: 5.00, category: 'Dessert', isAvailable: false },
    { id: 'D004', name: 'Curry Végétarien (Épicé)', price: 14.90, category: 'Végétarien', isAvailable: true },
];

// ===============================================
// 🛠️ COMPOSANT : Ligne de Gestion de Plat
// ===============================================
interface DishRowProps {
    dish: Dish;
    onToggleAvailability: (id: string, isAvailable: boolean) => void;
    onEdit: (dish: Dish) => void;
}

const DishRow: React.FC<DishRowProps> = ({ dish, onToggleAvailability, onEdit }) => {
    const statusColor = dish.isAvailable ? COLORS.success : COLORS.danger;

    return (
        <View style={staticStyles.dishRow}>
            <View style={staticStyles.dishInfo}>
                <Text style={[staticStyles.dishName, { color: statusColor }]} numberOfLines={1}>
                    {dish.name}
                </Text>
                <Text style={staticStyles.dishCategory}>{dish.category}</Text>
            </View>

            <View style={staticStyles.dishPriceContainer}>
                <Text style={staticStyles.dishPrice}>${dish.price.toFixed(2)}</Text>
            </View>

            <View style={staticStyles.availabilitySwitch}>
                <Switch
                    onValueChange={(value) => onToggleAvailability(dish.id, value)}
                    value={dish.isAvailable}
                    trackColor={{ false: COLORS.border, true: COLORS.success }}
                    thumbColor={COLORS.card}
                />
            </View>

            <TouchableOpacity 
                style={staticStyles.editButton} 
                onPress={() => onEdit(dish)}
            >
                <Ionicons name="create-outline" size={22} color={COLORS.secondary} />
            </TouchableOpacity>
        </View>
    );
};

// ===============================================
// 📋 COMPOSANT PRINCIPAL : ManageDishesScreen
// ===============================================
export default function ManageDishesScreen() {
    const [dishes, setDishes] = useState<Dish[]>(INITIAL_DISHES);
    const availableCount = dishes.filter(d => d.isAvailable).length;
    const router = useRouter();

    const handleToggleAvailability = (id: string, isAvailable: boolean) => {
        setDishes(prevDishes => 
            prevDishes.map(dish => 
                dish.id === id ? { ...dish, isAvailable } : dish
            )
        );
        const dishName = dishes.find(d => d.id === id)?.name ?? '';
        Alert.alert("Statut Mis à Jour", `${dishName} est maintenant ${isAvailable ? 'disponible' : 'masqué'}.`);
    };

    const handleEditDish = (dish: Dish) => {
        Alert.alert("Édition", `Naviguer vers l&apos;écran d'édition pour le plat : ${dish.name}`);
        // router.push({ pathname: '/cooker/EditDishScreen', params: { dishId: dish.id } });
    };

    const handleAddNewDish = () => {
        router.push('/cooker/AddDishScreen'); 
    };

    return (
        <ScrollView 
            style={staticStyles.container} 
            contentContainerStyle={staticStyles.scrollContent}
        >
            <View style={staticStyles.header}>
                <Text style={staticStyles.screenTitle}>Gestion des Plats ({availableCount}/{dishes.length})</Text>
                
                <TouchableOpacity style={staticStyles.addButton} onPress={handleAddNewDish}>
                    <Ionicons name="add-circle-outline" size={20} color={COLORS.card} />
                    <Text style={staticStyles.addButtonText}>Ajouter un Plat</Text>
                </TouchableOpacity>
            </View>
            
            <View style={staticStyles.sectionContainer}>
                <Text style={staticStyles.sectionTitle}>Votre Menu Actuel</Text>
                <View style={staticStyles.card}>
                    {dishes.length > 0 ? (
                        dishes.map((dish, index) => (
                            <React.Fragment key={dish.id}>
                                <DishRow 
                                    dish={dish} 
                                    onToggleAvailability={handleToggleAvailability}
                                    onEdit={handleEditDish}
                                />
                                {index < dishes.length - 1 && <View style={staticStyles.divider} />}
                            </React.Fragment>
                        ))
                    ) : (
                        <Text style={staticStyles.noDataText}>Aucun plat trouvé. Ajoutez votre première recette !</Text>
                    )}
                </View>
            </View>

            <View style={[staticStyles.sectionContainer, { marginTop: 10 }]}>
                <View style={staticStyles.infoBox}>
                    <Feather name="info" size={16} color={COLORS.secondary} style={{ marginRight: 8 }} />
                    <Text style={staticStyles.infoText}>
                        {"Utilisez l'interrupteur pour masquer/afficher rapidement un plat."}
                    </Text>
                </View>
            </View>

        </ScrollView>
    );
}

// ===============================================
// STYLES
// ===============================================

const staticStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { paddingBottom: 40, paddingTop: Platform.OS === "android" ? 20 : 0 },
    header: { paddingHorizontal: 20, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    screenTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, flex: 1 },
    addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginLeft: 10 },
    addButtonText: { color: COLORS.card, fontSize: 14, fontWeight: '600', marginLeft: 4 },
    sectionContainer: { marginHorizontal: 20, marginTop: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.subtitle, marginBottom: 10 },
    card: { backgroundColor: COLORS.card, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
    divider: { height: 1, backgroundColor: COLORS.border },
    dishRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, justifyContent: 'space-between' },
    dishInfo: { flex: 3, marginRight: 10 },
    dishName: { fontSize: 16, fontWeight: '700' },
    dishCategory: { fontSize: 12, color: COLORS.subtitle, marginTop: 2 },
    dishPriceContainer: { flex: 1.2, alignItems: 'flex-start' },
    dishPrice: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
    availabilitySwitch: { flex: 1.5, alignItems: 'flex-end', marginRight: 10 },
    editButton: { padding: 5 },
    noDataText: { padding: 30, textAlign: 'center', color: COLORS.placeholderText, fontStyle: 'italic', fontSize: 16 },
    infoBox: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: COLORS.secondary + '10', borderRadius: 8 },
    infoText: { fontSize: 13, color: COLORS.secondary, fontWeight: '500' },
});
