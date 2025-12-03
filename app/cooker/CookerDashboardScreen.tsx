import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";

import {
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import api from '../../src/api/api';

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
// 📊 TYPES ET COMPOSANTS RÉUTILISABLES
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

export interface OrderItem {
    id: string;
    client: string;
    time: string;
    status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'cancelled';
    items: number;
    totalPrice: number;
    deliveryAddress?: string;
    deliveryOption?: string;
    createdAt?: string;
}

const OrderRow: React.FC<{ order: OrderItem, onPress: () => void }> = ({ order, onPress }) => {
    const getStatusStyle = (status: OrderItem['status']) => {
        switch (status) {
            case 'pending':
                return { color: COLORS.warning, text: 'Reçue', icon: 'bell-ring' };
            case 'preparing':
                return { color: COLORS.secondary, text: 'En Cuisine', icon: 'fire' };
            case 'ready':
                return { color: COLORS.success, text: 'Prête', icon: 'check-circle' };
            case 'delivering':
                return { color: COLORS.primary, text: 'En Livraison', icon: 'bike' };
            case 'cancelled':
                return { color: COLORS.danger, text: 'Annulée', icon: 'close-circle' };
            default:
                return { color: COLORS.subtitle, text: 'Inconnu', icon: 'help' };
        }
    };

    const statusInfo = getStatusStyle(order.status);

    return (
        <TouchableOpacity 
            style={staticStyles.orderRow} 
            onPress={onPress} 
            activeOpacity={0.7}
            disabled={order.status === 'cancelled'}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[staticStyles.statusIndicator, { backgroundColor: statusInfo.color }]} />
                
                <View style={{ flex: 1 }}>
                    <Text style={staticStyles.orderIdText}>#{order.id.substring(order.id.length - 6).toUpperCase()}</Text>
                    <Text style={staticStyles.orderClientText}>{order.client} • {order.items} article{order.items > 1 ? 's' : ''}</Text>
                </View>
            </View>
            
            <View style={{ alignItems: 'flex-end' }}>
                <View style={[staticStyles.statusBadge, { borderColor: statusInfo.color }]}>
                    <MaterialCommunityIcons name={statusInfo.icon as any} size={14} color={statusInfo.color} style={{ marginRight: 4 }} />
                    <Text style={[staticStyles.orderStatus, { color: statusInfo.color }]}>
                        {statusInfo.text}
                    </Text>
                </View>
                <Text style={staticStyles.orderTime}>{order.time}</Text>
                <Text style={staticStyles.orderPrice}>{order.totalPrice.toLocaleString()} FCFA</Text>
            </View>
        </TouchableOpacity>
    );
};

// ===============================================
// 👨‍🍳 COMPOSANT PRINCIPAL
// ===============================================

export default function CookerDashboardScreen() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        activeMeals: 0,
        activeOrders: 0,
        averageRating: '0.0 / 5'
    });

    // ✅ MAPPING CORRECT DES STATUTS
    const mapBackendStatusToFrontend = (status: string): OrderItem['status'] => {
        switch (status) {
            case 'reçu': return 'pending';
            case 'acceptée': return 'preparing';
            case 'préparée': return 'ready';
            case 'en_livraison': return 'delivering';
            case 'refusée': 
            case 'cancelled': return 'cancelled';
            default: return 'pending';
        }
    };

    // ✅ FORMAT INTELLIGENT DE LA DATE/HEURE
    const formatOrderTime = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            // Moins d'une heure : "Il y a X min"
            if (diffMins < 60) {
                return diffMins <= 1 ? "À l'instant" : `Il y a ${diffMins} min`;
            }
            
            // Moins de 24h : "Il y a X h"
            if (diffHours < 24) {
                return `Il y a ${diffHours}h`;
            }
            
            // Moins de 7 jours : "Il y a X jours"
            if (diffDays < 7) {
                return `Il y a ${diffDays}j`;
            }
            
            // Sinon : format date court
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        } catch (error) {
            return 'Date invalide';
        }
    };
    
    // ✅ FETCHING CORRIGÉ DES COMMANDES
    const fetchCookOrders = async () => {
        try {
            console.log('📡 Chargement des commandes cuisinier...');
            
            const response = await api.get('/order/cooker-orders'); 
            
            console.log('📦 Réponse brute:', JSON.stringify(response.data, null, 2));
            
            // Gestion flexible de la structure de réponse
            const rawOrders = response.data.data?.orders 
                || response.data.orders 
                || response.data.data 
                || [];

            console.log(`✅ ${rawOrders.length} commande(s) reçue(s)`);

            // ✅ MAPPING ROBUSTE DES DONNÉES
            const formattedOrders: OrderItem[] = rawOrders.map((order: any) => {
                // Extraction sécurisée des données utilisateur
                const user = order.user || order.client || {};
                const clientName = user.prenom && user.nom 
                    ? `${user.prenom} ${user.nom}` 
                    : user.name || 'Client';

                // Calcul du nombre d'items
                const orderItems = order.orderItems || order.items || [];
                const itemsCount = orderItems.reduce((sum: number, item: any) => 
                    sum + (item.quantity || 1), 0
                );

                // Extraction du total
                const totalPrice = order.totalAmount || order.total || 0;

                // Format de la date
                const createdAt = order.createdAt || order.date || new Date().toISOString();

                return {
                    id: order._id || order.id,
                    client: clientName,
                    time: formatOrderTime(createdAt),
                    createdAt: createdAt,
                    status: mapBackendStatusToFrontend(order.status || 'reçu'),
                    items: itemsCount,
                    totalPrice: totalPrice,
                    deliveryAddress: order.deliveryAddress,
                    deliveryOption: order.deliveryOption,
                };
            });

            // Tri par date décroissante (plus récent en premier)
            formattedOrders.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });

            console.log('✅ Commandes formatées:', formattedOrders.length);

            setOrders(formattedOrders);

            // Mise à jour des stats
            setStats({
                activeMeals: stats.activeMeals, // À connecter à une vraie API
                activeOrders: formattedOrders.filter(o => 
                    o.status !== 'cancelled' && o.status !== 'delivering'
                ).length,
                averageRating: stats.averageRating, // À connecter à une vraie API
            });

        } catch (error: any) {
            console.error("❌ Erreur chargement commandes cuisinier:", error);
            console.error("Détails:", error.response?.data);
            
            Alert.alert(
                "Erreur de chargement", 
                error.response?.data?.message || "Impossible de charger les commandes"
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    
    // ✅ MISE À JOUR DU STATUT CORRIGÉE
    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            console.log(`🔄 Mise à jour: ${orderId} → ${newStatus}`);
            
            await api.patch(`/order/${orderId}/status`, { status: newStatus });
            
            // Recharger les commandes
            await fetchCookOrders();
            
            Alert.alert("Succès ✅", `Commande passée au statut "${newStatus}"`);
        } catch (error: any) {
            console.error("❌ Erreur mise à jour statut:", error);
            console.error("Détails:", error.response?.data);
            
            Alert.alert(
                "Erreur", 
                error.response?.data?.message || "Impossible de mettre à jour le statut"
            );
        }
    };

    // ✅ GESTION DES CLICS SUR COMMANDES
    const handleOrderPress = (order: OrderItem) => {
        let backendStatus = '';
        let actionLabel = '';

        if (order.status === 'pending') {
            backendStatus = 'acceptée';
            actionLabel = 'Accepter et démarrer la préparation 🍳';
        } else if (order.status === 'preparing') {
            backendStatus = 'préparée';
            actionLabel = 'Marquer comme prêt à livrer ✅';
        } else if (order.status === 'ready') {
            backendStatus = 'en_livraison';
            actionLabel = 'Marquer en livraison 🚴';
        } else {
            // Pour delivered ou cancelled : afficher juste les détails
            const deliveryInfo = order.deliveryOption === 'livraison' 
                ? `\nAdresse: ${order.deliveryAddress || 'Non spécifiée'}`
                : '\nMode: Retrait sur place';

            Alert.alert(
                "Détails Commande", 
                `Commande #${order.id.substring(order.id.length - 6)}\nClient: ${order.client}\n${order.items} article(s)\nTotal: ${order.totalPrice.toLocaleString()} FCFA${deliveryInfo}`,
                [{ text: "OK", style: "cancel" }]
            );
            return;
        }

        Alert.alert(
            "Action Commande",
            `${actionLabel}\n\nCommande: #${order.id.substring(order.id.length - 6)}\nClient: ${order.client}`,
            [
                { text: "Annuler", style: "cancel" },
                { 
                    text: "Confirmer", 
                    onPress: () => updateOrderStatus(order.id, backendStatus) 
                }
            ]
        );
    };

    // Charge les données quand l'écran est focus
    useFocusEffect(
        useCallback(() => {
            fetchCookOrders();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchCookOrders();
    };

    const statsData = [
        { icon: "food-drumstick", label: "Plats Actifs", value: stats.activeMeals, color: COLORS.primary },
        { icon: "receipt", label: "Commandes Actives", value: stats.activeOrders, color: COLORS.secondary },
        { icon: "star-circle", label: "Note Moyenne", value: stats.averageRating, color: COLORS.success },
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
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
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
                        <Text style={staticStyles.orderCountText}>{orders.length}</Text>
                    </View>
                </View>
                <View style={staticStyles.card}>
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ margin: 20 }} />
                    ) : orders.length > 0 ? (
                        orders.map((order, index) => (
                            <React.Fragment key={order.id}>
                                <OrderRow 
                                    order={order} 
                                    onPress={() => handleOrderPress(order)} 
                                />
                                {index < orders.length - 1 && <View style={staticStyles.divider} />}
                            </React.Fragment>
                        ))
                    ) : (
                        <View style={staticStyles.emptyState}>
                            <Ionicons name="restaurant-outline" size={48} color={COLORS.subtitle} style={{ marginBottom: 10 }} />
                            <Text style={staticStyles.noDataText}>Aucune commande pour le moment.</Text>
                            <Text style={staticStyles.noDataSubtext}>Les nouvelles commandes apparaîtront ici.</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* ACTIONS RAPIDES */}
            <View style={staticStyles.sectionContainer}>
                <Text style={staticStyles.sectionTitle}>⚡ Gestion Rapide</Text>
                <View style={staticStyles.actionGrid}>
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
        fontSize: 11,
        color: COLORS.placeholderText,
        marginBottom: 2,
    },
    orderPrice: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: '600',
    },
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noDataText: {
        textAlign: 'center',
        color: COLORS.text,
        fontWeight: '600',
        fontSize: 15,
    },
    noDataSubtext: {
        textAlign: 'center',
        color: COLORS.subtitle,
        fontSize: 13,
        marginTop: 6,
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