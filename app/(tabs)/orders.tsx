import { Feather, Ionicons } from "@expo/vector-icons";
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
    success: "#4CAF50", // Succès (Livré)
    warning: "#FFC107", // Avertissement (Préparation)
    info: "#1E88E5", // Info (En Route)
};

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
type OrderType = 'active' | 'history';

interface Order {
    id: string;
    date: string;
    total: number;
    status: OrderStatus;
    itemsCount: number;
}

// === DONNÉES MOCK des Commandes ===
const MOCK_ORDERS: Order[] = [
    // Commandes Actives
    { id: 'ORD001240', date: 'Aujourd\'hui, 13:15', total: 35.50, status: 'delivering', itemsCount: 4 },
    { id: 'ORD001239', date: 'Aujourd\'hui, 12:45', total: 22.90, status: 'preparing', itemsCount: 2 },
    // Commandes Historiques
    { id: 'ORD001238', date: 'Hier, 19:30', total: 48.00, status: 'completed', itemsCount: 5 },
    { id: 'ORD001237', date: '25/11/2025, 12:00', total: 15.00, status: 'cancelled', itemsCount: 1 },
    { id: 'ORD001236', date: '24/11/2025, 20:00', total: 31.75, status: 'completed', itemsCount: 3 },
];

// ===============================================
// 🏷️ UTILS : Status & Couleurs
// ===============================================

const getStatusDetails = (status: OrderStatus) => {
    switch (status) {
        case 'pending':
            return { color: COLORS.warning, label: 'En Attente' };
        case 'preparing':
            return { color: COLORS.warning, label: 'En Préparation' };
        case 'ready':
            return { color: COLORS.primary, label: 'Prête à l\'Envoi' };
        case 'delivering':
            return { color: COLORS.info, label: 'En Route' };
        case 'completed':
            return { color: COLORS.success, label: 'Livrée' };
        case 'cancelled':
            return { color: COLORS.danger, label: 'Annulée' };
        default:
            return { color: COLORS.placeholderText, label: 'Inconnu' };
    }
};

// ===============================================
// 📦 COMPOSANT : Ligne de Commande
// ===============================================

const OrderRow: React.FC<{ order: Order }> = ({ order }) => {
    const statusDetails = getStatusDetails(order.status);

    return (
        <TouchableOpacity 
            style={staticStyles.orderRow} 
            onPress={() => Alert.alert("Détail Commande", `Afficher les détails de la commande #${order.id}`)}
        >
            <View style={staticStyles.rowLeft}>
                <Ionicons 
                    name="receipt-outline" 
                    size={22} 
                    color={COLORS.secondary} 
                    style={{ marginRight: 15 }}
                />
                <View>
                    <Text style={staticStyles.orderIdText}>Commande **#{order.id.substring(3)}**</Text>
                    <Text style={staticStyles.orderDateText}>{order.date}</Text>
                    <Text style={staticStyles.orderItemCountText}>{order.itemsCount} article(s)</Text>
                </View>
            </View>
            
            <View style={staticStyles.rowRight}>
                <Text style={[staticStyles.orderStatus, { color: statusDetails.color }]}>
                    {statusDetails.label}
                </Text>
                <Text style={staticStyles.orderTotal}>${order.total.toFixed(2)}</Text>
                <Ionicons name="chevron-forward-outline" size={18} color={COLORS.placeholderText} style={{ marginTop: 5 }} />
            </View>
        </TouchableOpacity>
    );
};

// ===============================================
// 📋 COMPOSANT PRINCIPAL : OrdersScreen
// ===============================================

export default function OrdersScreen() {
    const [selectedType, setSelectedType] = useState<OrderType>('active');
    
    // Filtrage des commandes basé sur le type sélectionné
    const filteredOrders = MOCK_ORDERS.filter(order => {
        const isActive = order.status !== 'completed' && order.status !== 'cancelled';
        return selectedType === 'active' ? isActive : !isActive;
    });

    return (
        <ScrollView 
            style={staticStyles.container} 
            contentContainerStyle={staticStyles.scrollContent}
        >
            <Text style={staticStyles.screenTitle}>Mes Commandes</Text>
            
            {/* SÉLECTION DE TYPE (Filtres/Onglets) */}
            <View style={staticStyles.tabContainer}>
                <TouchableOpacity
                    style={[staticStyles.tabButton, selectedType === 'active' && staticStyles.tabButtonActive]}
                    onPress={() => setSelectedType('active')}
                >
                    <Text style={[staticStyles.tabText, selectedType === 'active' && staticStyles.tabTextActive]}>
                        <Feather name="clock" size={14} /> En Cours
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[staticStyles.tabButton, selectedType === 'history' && staticStyles.tabButtonActive]}
                    onPress={() => setSelectedType('history')}
                >
                    <Text style={[staticStyles.tabText, selectedType === 'history' && staticStyles.tabTextActive]}>
                        <Feather name="check-square" size={14} /> Historique
                    </Text>
                </TouchableOpacity>
            </View>

            {/* LISTE DES COMMANDES FILTRÉES */}
            <View style={staticStyles.sectionContainer}>
                <View style={staticStyles.card}>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order, index) => (
                            <React.Fragment key={order.id}>
                                <OrderRow order={order} />
                                {index < filteredOrders.length - 1 && <View style={staticStyles.divider} />}
                            </React.Fragment>
                        ))
                    ) : (
                        <Text style={staticStyles.noOrdersText}>
                            {selectedType === 'active' 
                                ? "Vous n'avez aucune commande en cours." 
                                : "Votre historique de commandes est vide."}
                        </Text>
                    )}
                </View>
            </View>

        </ScrollView>
    );
}

// ===============================================
// DÉFINITION DES STYLES STATIQUES
// ===============================================

const staticStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 40,
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
        overflow: 'hidden',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
    },
    // --- Styles Onglets ---
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 10,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabButtonActive: {
        backgroundColor: COLORS.secondary,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.subtitle,
    },
    tabTextActive: {
        color: COLORS.card,
        fontWeight: '700',
    },
    // --- Styles Ligne de Commande (OrderRow) ---
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 2,
    },
    orderIdText: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    orderDateText: {
        fontSize: 13,
        color: COLORS.subtitle,
    },
    orderItemCountText: {
        fontSize: 12,
        color: COLORS.placeholderText,
        marginTop: 4,
    },
    rowRight: {
        alignItems: 'flex-end',
        flex: 1.5,
    },
    orderStatus: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 4,
    },
    orderTotal: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.primary,
    },
    noOrdersText: {
        padding: 30,
        textAlign: 'center',
        color: COLORS.placeholderText,
        fontStyle: 'italic',
        fontSize: 16,
    },
});