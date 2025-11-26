
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";

import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
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
    warning: "#FFC107",
};

// ===============================================
// 📊 Composants Réutilisables
// ===============================================

interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
    <View style={staticStyles.statCard}>
        <View style={[staticStyles.statIconContainer, { backgroundColor: color + '20' }]}>
            <MaterialCommunityIcons name={icon as any} size={28} color={color} />
        </View>
        <Text style={staticStyles.statLabel}>{label}</Text>
        <Text style={[staticStyles.statValue, { color: color }]}>{value}</Text>
    </View>
);

interface OrderItem {
    id: string;
    client: string;
    time: string;
    status: 'pending' | 'preparing' | 'ready';
    items: number;
}

const OrderRow: React.FC<{ order: OrderItem }> = ({ order }) => {
    const getStatusStyle = (status: OrderItem['status']) => {
        switch (status) {
            case 'pending':
                return { color: COLORS.warning, text: 'En Attente', icon: 'clock-outline' };
            case 'preparing':
                return { color: COLORS.secondary, text: 'En Préparation', icon: 'fire' };
            case 'ready':
                return { color: COLORS.success, text: 'Prête', icon: 'check-circle' };
        }
    };

    const statusInfo = getStatusStyle(order.status);

    return (
        <TouchableOpacity 
            style={staticStyles.orderRow} 
            onPress={() => Alert.alert("Détail Commande", `Commande #${order.id.substring(0, 8)}\n${order.items} articles`)}
            activeOpacity={0.7}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[staticStyles.statusIndicator, { backgroundColor: statusInfo.color }]} />
                
                <View style={{ flex: 1 }}>
                    <Text style={staticStyles.orderIdText}>#{order.id.substring(0, 8)}</Text>
                    <Text style={staticStyles.orderClientText}>{order.client} • {order.items} articles</Text>
                </View>
            </View>
            
            <View style={{ alignItems: 'flex-end' }}>
                <View style={[staticStyles.statusBadge, { borderColor: statusInfo.color }]}>
                    <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} style={{ marginRight: 4 }} />
                    <Text style={[staticStyles.orderStatus, { color: statusInfo.color }]}>
                        {statusInfo.text}
                    </Text>
                </View>
                <Text style={staticStyles.orderTime}>{order.time}</Text>
            </View>
        </TouchableOpacity>
    );
};

// ===============================================
// 👨‍🍳 COMPOSANT PRINCIPAL
// ===============================================

export default function CookerDashboardScreen() {
    const statsData = [
        { icon: "food-drumstick", label: "Plats Actifs", value: 45, color: COLORS.primary },
        { icon: "receipt", label: "Commandes J-1", value: 12, color: COLORS.secondary },
        { icon: "star-circle", label: "Note Moyenne", value: '4.7 / 5', color: COLORS.success },
    ];

    const currentOrders: OrderItem[] = [
        { id: 'ORD001234', client: 'Alice Dupont', time: '12:35', status: 'preparing', items: 3 },
        { id: 'ORD001235', client: 'Bob Martin', time: '12:40', status: 'pending', items: 2 },
        { id: 'ORD001236', client: 'Charlie Lee', time: '12:45', status: 'pending', items: 1 },
        { id: 'ORD001237', client: 'Diana Prince', time: '12:55', status: 'ready', items: 4 },
    ];

    const handleManagementAction = (action: string) => {
        if (action === "Liste des Plats") {
            router.push('/cooker/ManageDishesScreen');
        } else if (action === "Ajouter un Nouveau Plat") {
            router.push('/cooker/AddDishScreen');
        } else {
            Alert.alert("Action", `Naviguer vers: ${action}`); 
        }
    };

    return (
        <ScrollView 
            style={staticStyles.container} 
            contentContainerStyle={staticStyles.scrollContent}
        >
            {/* HEADER */}
            <View style={staticStyles.header}>
                <View>
                    <Text style={staticStyles.welcomeText}>Bienvenue,</Text>
                    <Text style={staticStyles.dashboardTitle}>Espace Cuisinier 👨‍🍳</Text>
                </View>
                <TouchableOpacity style={staticStyles.profileButton}>
                    <Ionicons name="person-circle-outline" size={36} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* STATISTIQUES */}
            <View style={staticStyles.sectionContainer}>
                <Text style={staticStyles.sectionTitle}>📊 Statistiques Rapides</Text>
                <View style={staticStyles.statsGrid}>
                    {statsData.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </View>
            </View>

            {/* COMMANDES EN COURS */}
            <View style={staticStyles.sectionContainer}>
                <View style={staticStyles.sectionHeader}>
                    <Text style={staticStyles.sectionTitle}>🔥 Commandes en Cours</Text>
                    <View style={staticStyles.orderCountBadge}>
                        <Text style={staticStyles.orderCountText}>{currentOrders.length}</Text>
                    </View>
                </View>
                <View style={staticStyles.card}>
                    {currentOrders.length > 0 ? (
                        currentOrders.map((order, index) => (
                            <React.Fragment key={order.id}>
                                <OrderRow order={order} />
                                {index < currentOrders.length - 1 && <View style={staticStyles.divider} />}
                            </React.Fragment>
                        ))
                    ) : (
                        <View style={staticStyles.emptyState}>
                            <Ionicons name="checkmark-done-circle-outline" size={48} color={COLORS.success} style={{ marginBottom: 10 }} />
                            <Text style={staticStyles.noDataText}>Aucune commande en préparation.</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* ACTIONS RAPIDES */}
            <View style={staticStyles.sectionContainer}>
                <Text style={staticStyles.sectionTitle}>⚡ Gestion Rapide</Text>
                <View style={staticStyles.actionGrid}>
                    {/* Action 1 */}
                    <TouchableOpacity
                        style={[staticStyles.actionCard, { borderLeftWidth: 4, borderLeftColor: COLORS.primary }]}
                        onPress={() => handleManagementAction("Liste des Plats")}
                        activeOpacity={0.8}
                    >
                        <View style={[staticStyles.actionIconContainer, { backgroundColor: COLORS.primary + '15' }]}>
                            <Ionicons name="restaurant-outline" size={26} color={COLORS.primary} />
                        </View>
                        <Text style={staticStyles.actionTitle}>Gérer mes Plats</Text>
                        <Text style={staticStyles.actionSubtitle}>Voir & éditer</Text>
                    </TouchableOpacity>

                    {/* Action 2 */}
                    <TouchableOpacity
                        style={[staticStyles.actionCard, { borderLeftWidth: 4, borderLeftColor: COLORS.secondary }]}
                        onPress={() => handleManagementAction("Ajouter un Nouveau Plat")}
                        activeOpacity={0.8}
                    >
                        <View style={[staticStyles.actionIconContainer, { backgroundColor: COLORS.secondary + '15' }]}>
                            <Ionicons name="add-circle-outline" size={26} color={COLORS.secondary} />
                        </View>
                        <Text style={staticStyles.actionTitle}>Ajouter un Plat</Text>
                        <Text style={staticStyles.actionSubtitle}>Créer nouveau</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
        </ScrollView>
    );
}

// ===============================================
// STYLES
// ===============================================

const staticStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === "android" ? 40 : 0,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingVertical: 18,
        paddingHorizontal: 20,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    profileButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    welcomeText: {
        fontSize: 14,
        color: COLORS.subtitle,
        fontWeight: '500',
    },
    dashboardTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
        marginTop: 4,
    },
    sectionContainer: {
        marginHorizontal: 20,
        marginTop: 22,
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
    },
    statCard: {
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: 14,
        width: '31%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    statIconContainer: {
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.subtitle,
        textAlign: 'center',
        marginBottom: 6,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    statusIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 12,
    },
    orderIdText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    orderClientText: {
        fontSize: 13,
        color: COLORS.subtitle,
        marginTop: 3,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1.5,
        marginBottom: 4,
    },
    orderStatus: {
        fontSize: 12,
        fontWeight: '700',
    },
    orderTime: {
        fontSize: 12,
        color: COLORS.placeholderText,
    },
    emptyState: {
        paddingVertical: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noDataText: {
        textAlign: 'center',
        color: COLORS.subtitle,
        fontWeight: '500',
        fontSize: 15,
    },
    orderCountBadge: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        minWidth: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderCountText: {
        color: COLORS.card,
        fontSize: 13,
        fontWeight: '800',
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        paddingBottom: 8,
    },
    actionCard: {
        flex: 1,
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 18,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: COLORS.border,
        minHeight: 140,
        justifyContent: 'space-between',
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    actionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
    },
    actionSubtitle: {
        fontSize: 12,
        color: COLORS.subtitle,
        marginTop: 4,
    },
});