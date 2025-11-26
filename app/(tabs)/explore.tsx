import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// === COULEURS MODERNES (Reprise de votre palette) ===
const COLORS = {
    primary: "#FF7043", // Orange Chaud
    secondary: "#1E88E5", // Bleu
    background: "#F7F8F9", 
    card: "#FFFFFF",
    text: "#212121", 
    subtitle: "#757575", 
    placeholderText: "#A0A0A0",
    border: "#E0E0E0",
    danger: "#EF5350", 
    success: "#4CAF50",
};

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    cooker: string;
}

// === DONNÉES MOCK du Panier (À remplacer par votre état global) ===
const initialCartItems: CartItem[] = [
    { id: 'D001', name: 'Poulet Yassa Maison', price: 12.50, quantity: 2, cooker: 'Cuisine d\'Aïcha' },
    { id: 'D002', name: 'Salade César Gourmande', price: 9.90, quantity: 1, cooker: 'Traiteur Paul' },
    { id: 'D003', name: 'Jus de Bissap (1L)', price: 3.00, quantity: 3, cooker: 'Cuisine d\'Aïcha' },
];


// ===============================================
// 🛍️ COMPOSANT : Article du Panier
// ===============================================

interface CartItemRowProps {
    item: CartItem;
    onQuantityChange: (id: string, newQuantity: number) => void;
    onRemove: (id: string) => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item, onQuantityChange, onRemove }) => {
    
    // Total de la ligne
    const total = (item.price * item.quantity).toFixed(2);

    return (
        <View style={staticStyles.itemRow}>
            {/* Nom et Cuisinier */}
            <View style={staticStyles.itemInfo}>
                <Text style={staticStyles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={staticStyles.itemCooker}>{item.cooker}</Text>
            </View>

            {/* Prix Unitaire */}
            <View style={staticStyles.itemPriceContainer}>
                <Text style={staticStyles.itemPriceUnit}>${item.price.toFixed(2)}</Text>
            </View>

            {/* Contrôle de Quantité */}
            <View style={staticStyles.quantityControl}>
                <TouchableOpacity 
                    onPress={() => item.quantity > 1 ? onQuantityChange(item.id, item.quantity - 1) : onRemove(item.id)}
                    style={staticStyles.quantityButton}
                >
                    <Ionicons name={item.quantity > 1 ? "remove-outline" : "trash-outline"} size={20} color={item.quantity > 1 ? COLORS.text : COLORS.danger} />
                </TouchableOpacity>

                <Text style={staticStyles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity 
                    onPress={() => onQuantityChange(item.id, item.quantity + 1)}
                    style={staticStyles.quantityButton}
                >
                    <Ionicons name="add-outline" size={20} color={COLORS.text} />
                </TouchableOpacity>
            </View>
            
            {/* Total de la Ligne */}
            <Text style={staticStyles.itemTotalText}>${total}</Text>
        </View>
    );
};

// ===============================================
// 🛒 COMPOSANT PRINCIPAL : CartScreen
// ===============================================

export default function CartScreen() {
    const [cartItems, setCartItems] = useState(initialCartItems);
    
    // Calculs de totaux
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 0 ? 5.00 : 0.00; // Frais de livraison fixe ou conditionnel
    const total = subtotal + deliveryFee;

    // Fonction de modification de quantité
    const handleQuantityChange = (id: string, newQuantity: number) => {
        setCartItems(prevItems => 
            prevItems.map(item => 
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    // Fonction de suppression d'article
    const handleRemoveItem = (id: string) => {
        Alert.alert(
            "Confirmer la suppression",
            "Êtes-vous sûr de vouloir retirer cet article du panier ?",
            [
                { text: "Annuler", style: "cancel" },
                { 
                    text: "Supprimer", 
                    style: "destructive",
                    onPress: () => setCartItems(prevItems => prevItems.filter(item => item.id !== id)),
                },
            ]
        );
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            Alert.alert("Panier vide", "Ajoutez des plats avant de commander !");
            return;
        }
        // Logique de navigation vers l'écran de paiement/livraison
        Alert.alert("Paiement", `Passer à la commande de ${total.toFixed(2)} $`);
        // router.push('/checkout');
    };

    return (
        <View style={staticStyles.fullContainer}>
            <ScrollView 
                style={staticStyles.container} 
                contentContainerStyle={staticStyles.scrollContent}
            >
                <Text style={staticStyles.screenTitle}>Mon Panier ({cartItems.length})</Text>

                {/* 1. Liste des Articles */}
                <View style={staticStyles.sectionContainer}>
                    <Text style={staticStyles.sectionTitle}>Articles Commandés</Text>
                    <View style={staticStyles.card}>
                        {cartItems.length > 0 ? (
                            cartItems.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <CartItemRow 
                                        item={item} 
                                        onQuantityChange={handleQuantityChange}
                                        onRemove={handleRemoveItem}
                                    />
                                    {index < cartItems.length - 1 && <View style={staticStyles.divider} />}
                                </React.Fragment>
                            ))
                        ) : (
                            <Text style={staticStyles.emptyCartText}>Votre panier est vide. 😭</Text>
                        )}
                    </View>
                </View>

                {/* 2. Récapitulatif de la Commande */}
                <View style={staticStyles.sectionContainer}>
                    <Text style={staticStyles.sectionTitle}>Récapitulatif</Text>
                    <View style={staticStyles.card}>
                        <View style={staticStyles.summaryRow}>
                            <Text style={staticStyles.summaryLabel}>Sous-total des articles</Text>
                            <Text style={staticStyles.summaryValue}>${subtotal.toFixed(2)}</Text>
                        </View>
                        
                        <View style={staticStyles.divider} />
                        
                        <View style={staticStyles.summaryRow}>
                            <Text style={staticStyles.summaryLabel}>Frais de livraison</Text>
                            <Text style={[staticStyles.summaryValue, deliveryFee > 0 && { color: COLORS.secondary }]}>
                                {deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'GRATUIT'}
                            </Text>
                        </View>

                        <View style={[staticStyles.divider, { marginVertical: 10 }]} />
                        
                        {/* Total Final */}
                        <View style={staticStyles.totalRow}>
                            <Text style={staticStyles.totalLabel}>Total à Payer</Text>
                            <Text style={staticStyles.totalValue}>${total.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
                
                {/* Espace pour ne pas que le contenu soit caché par le bouton fixe */}
                <View style={{ height: 120 }} /> 
            </ScrollView>

            {/* BOUTON FLOTTANT DE PAIEMENT */}
            <View style={staticStyles.checkoutContainer}>
                <TouchableOpacity 
                    style={staticStyles.checkoutButton}
                    onPress={handleCheckout}
                    disabled={cartItems.length === 0}
                >
                    <Ionicons name="cart-outline" size={20} color={COLORS.card} style={{ marginRight: 10 }} />
                    <Text style={staticStyles.checkoutButtonText}>
                        Payer | ${total.toFixed(2)}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ===============================================
// DÉFINITION DES STYLES STATIQUES
// ===============================================

const staticStyles = StyleSheet.create({
    fullContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
        paddingTop: Platform.OS === "android" ? 20 : 0,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    sectionContainer: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.subtitle,
        marginBottom: 10,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden', // Pour les bordures des dividers
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
    },
    // --- Styles Article du Panier (CartItemRow) ---
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        justifyContent: 'space-between',
    },
    itemInfo: {
        flex: 2,
        marginRight: 10,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    itemCooker: {
        fontSize: 12,
        color: COLORS.subtitle,
    },
    itemPriceContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
    itemPriceUnit: {
        fontSize: 14,
        color: COLORS.subtitle,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 5,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    quantityButton: {
        padding: 4,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginHorizontal: 8,
    },
    itemTotalText: {
        flex: 1.2,
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
        textAlign: 'right',
    },
    emptyCartText: {
        padding: 20,
        textAlign: 'center',
        color: COLORS.placeholderText,
        fontStyle: 'italic',
    },
    // --- Styles Récapitulatif ---
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    summaryLabel: {
        fontSize: 15,
        color: COLORS.subtitle,
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: COLORS.background, // Fond légèrement différent pour le total
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.primary,
    },
    // --- Bouton de Paiement Fixe ---
    checkoutContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.success, // Couleur de succès pour l'action finale (Paiement)
        paddingVertical: 18,
        borderRadius: 12,
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    checkoutButtonText: {
        color: COLORS.card,
        fontSize: 18,
        fontWeight: '700',
    },
});