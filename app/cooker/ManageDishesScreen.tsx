import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Import du hook personnalisé (depuis votre fichier de contexte)
import { Order, OrderStatus, useCartOrder } from "../../src/context/CartOrderContext";
// NOTE: Assurez-vous que le chemin d'importation vers votre contexte est correct.

// === COULEURS MODERNES ===
const COLORS = {
    primary: "#FF7043", // Couleur pour le Total / Important
    secondary: "#1E88E5", // Couleur pour les actions / titres
    background: "#F7F8F9",
    card: "#FFFFFF",
    text: "#212121",
    subtitle: "#757575",
    placeholderText: "#A0A0A0",
    danger: "#EF5350",
    success: "#4CAF50",
    warning: "#FFC107", // Ajouté pour les statuts en attente
    info: "#03A9F4", // Ajouté pour les statuts 'en_livraison'
    border: "#E0E0E0",
};

// ===============================================
// 🛠️ FONCTION UTILITAIRE : Déterminer la couleur du statut
// ===============================================

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'acceptée':
        case 'livrée':
            return COLORS.success;
        case 'refusée':
        case 'cancelled':
            return COLORS.danger;
        case 'préparée':
            return COLORS.warning;
        case 'en_livraison':
            return COLORS.info;
        case 'reçu':
        default:
            return COLORS.secondary;
    }
};

const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
        case 'reçu': return 'Nouvelle';
        case 'acceptée': return 'Acceptée';
        case 'refusée': return 'Refusée';
        case 'préparée': return 'Prête';
        case 'en_livraison': return 'En Livraison';
        case 'livrée': return 'Livrée';
        case 'cancelled': return 'Annulée';
        default: return 'Inconnu';
    }
};

// ===============================================
// 🛠️ COMPOSANT : Ligne de Commande
// ===============================================
interface OrderRowProps {
    order: Order;
    onViewDetails: (order: Order) => void;
}

const OrderRow: React.FC<OrderRowProps> = ({ order, onViewDetails }) => {
    const statusColor = getStatusColor(order.status);
    const statusLabel = getStatusLabel(order.status);
    
    // Formater la date
    const date = order.createdAt ? new Date(order.createdAt) : new Date(order.date);
    const timeString = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateString = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

    // Raccourcir l'ID de la commande
    const shortId = `${order.id.slice(0, 4)}...${order.id.slice(-4)}`;

    return (
        <TouchableOpacity style={staticStyles.orderRow} onPress={() => onViewDetails(order)}>
            
            <View style={staticStyles.orderIdContainer}>
                <Text style={staticStyles.orderIdText} numberOfLines={1}>
                    # {shortId}
                </Text>
                <Text style={staticStyles.orderDateText}>{dateString} à {timeString}</Text>
            </View>

            <View style={staticStyles.orderStatusContainer}>
                <View style={[staticStyles.statusBadge, { backgroundColor: statusColor + '15', borderColor: statusColor }]}>
                    <Text style={[staticStyles.statusText, { color: statusColor }]}>
                        {statusLabel}
                    </Text>
                </View>
            </View>

            <View style={staticStyles.orderTotalContainer}>
                <Text style={staticStyles.orderTotal}>${order.total.toFixed(2)}</Text>
                <Text style={staticStyles.orderItemsCount}>{order.itemsCount} {order.itemsCount > 1 ? 'articles' : 'article'}</Text>
            </View>
            
            <Ionicons name="chevron-forward-outline" size={20} color={COLORS.subtitle} />
        </TouchableOpacity>
    );
};

// ===============================================
// 📋 COMPOSANT PRINCIPAL : ManageOrdersScreen (Ancien ManageDishesScreen)
// ===============================================
export default function ManageOrdersScreen() {
    const { orders, loadOrders } = useCartOrder(); // Utilisation du hook
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // 1. Chargement des données au montage
    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            await loadOrders(); // Appel de la fonction du contexte
            setIsLoading(false);
        };

        fetchOrders();
    }, [loadOrders]); // S'exécute une seule fois au montage

    // Compteurs de statut pour le titre (Exemple pour les commandes en cours)
    const newOrdersCount = orders.filter(o => o.status === 'reçu').length;
    
    const handleViewDetails = (order: Order) => {
        Alert.alert("Détails de la commande", `Naviguer vers l'écran de détail pour la commande : #${order.id.slice(0, 8)}...`);
        // Exemple : router.push({ pathname: '/cooker/OrderDetailsScreen', params: { orderId: order.id } });
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        await loadOrders();
        setIsLoading(false);
    };

    return (
        <ScrollView 
            style={staticStyles.container} 
            contentContainerStyle={staticStyles.scrollContent}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} /> // Ajout d'un contrôle de rafraîchissement
            }
        >
            <View style={staticStyles.header}>
                <Text style={staticStyles.screenTitle}>
                    Vos Commandes ({newOrdersCount}/{orders.length})
                </Text>
                
                <TouchableOpacity style={staticStyles.addButton} onPress={handleRefresh}>
                    <Ionicons name="refresh-outline" size={20} color={COLORS.card} />
                    <Text style={staticStyles.addButtonText}>Actualiser</Text>
                </TouchableOpacity>
            </View>
            
            <View style={staticStyles.sectionContainer}>
                <Text style={staticStyles.sectionTitle}>Toutes les Commandes</Text>
                
                <View style={staticStyles.card}>
                    {isLoading ? (
                        <View style={staticStyles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                            <Text style={staticStyles.loadingText}>Chargement des commandes...</Text>
                        </View>
                    ) : orders.length > 0 ? (
                        // Affiche les commandes triées par date la plus récente en premier
                        orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((order, index) => (
                            <React.Fragment key={order.id}>
                                <OrderRow 
                                    order={order} 
                                    onViewDetails={handleViewDetails}
                                />
                                {index < orders.length - 1 && <View style={staticStyles.divider} />}
                            </React.Fragment>
                        ))
                    ) : (
                        <Text style={staticStyles.noDataText}>Aucune commande trouvée pour le moment.</Text>
                    )}
                </View>
            </View>

            <View style={[staticStyles.sectionContainer, { marginTop: 10 }]}>
                <View style={staticStyles.infoBox}>
                    <Feather name="info" size={16} color={COLORS.secondary} style={{ marginRight: 8 }} />
                    <Text style={staticStyles.infoText}>
                        {"Cliquez sur une commande pour voir les détails et gérer son statut."}
                    </Text>
                </View>
            </View>

        </ScrollView>
    );
}


// ===============================================
// STYLES (Adaptés aux commandes)
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
    
    // Styles pour OrderRow (adapté de dishRow)
    orderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, justifyContent: 'space-between' },
    
    orderIdContainer: { flex: 2.5, marginRight: 10 },
    orderIdText: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    orderDateText: { fontSize: 12, color: COLORS.subtitle, marginTop: 2 },
    
    orderStatusContainer: { flex: 2.5, alignItems: 'center' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
    statusText: { fontSize: 12, fontWeight: '600' },

    orderTotalContainer: { flex: 1.5, alignItems: 'flex-end', marginRight: 10 },
    orderTotal: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
    orderItemsCount: { fontSize: 12, color: COLORS.subtitle, marginTop: 2 },
    
    noDataText: { padding: 30, textAlign: 'center', color: COLORS.placeholderText, fontStyle: 'italic', fontSize: 16 },
    infoBox: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: COLORS.secondary + '10', borderRadius: 8 },
    infoText: { fontSize: 13, color: COLORS.secondary, fontWeight: '500' },
    
    // Nouveaux styles pour le chargement
    loadingContainer: { padding: 40, alignItems: 'center' },
    loadingText: { marginTop: 10, color: COLORS.subtitle, fontSize: 14 },
});