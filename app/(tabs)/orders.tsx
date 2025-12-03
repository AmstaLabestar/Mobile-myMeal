import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useCartOrder } from "../../src/context/CartOrderContext";

/**
 * OrdersScreen - Version corrigée
 * 
 * CORRECTIONS APPORTÉES :
 * 1. ✅ Gestion robuste des données manquantes (date, items, total)
 * 2. ✅ Calcul automatique du total si manquant
 * 3. ✅ Formatage intelligent de la date
 * 4. ✅ Comptage correct des items
 * 5. ✅ Affichage du résumé même avec données partielles
 */

/* ===================== COULEURS ===================== */
const COLORS = {
  primary: "#FF7043",
  secondary: "#1E88E5",
  background: "#F2F4F8",
  card: "#FFFFFF",
  text: "#1A1A1A",
  subtitle: "#757575",
  placeholderText: "#A0A0A0",
  border: "#EEEEEE",
  dangerBg: "#FFEBEE",
  dangerText: "#D32F2F",
  successBg: "#E8F5E9",
  successText: "#2E7D32",
  warningBg: "#FFF8E1",
  warningText: "#FBC02D",
  infoBg: "#E3F2FD",
  infoText: "#1976D2",
};

/* ===================== TYPES ===================== */
type OrderStatus =
  | "reçu"
  | "acceptée"
  | "refusée"
  | "préparée"
  | "en_livraison"
  | "livrée"
  | "cancelled";

type Order = {
  id: string;
  date?: string;
  itemsCount?: number;
  total?: number;
  status: OrderStatus;
  items?: { name: string; quantity: number; price?: number }[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type OrderType = "active" | "history";

/* ===================== UTILITAIRES ===================== */

// Format la date de manière intelligente
const formatDate = (order: Order): string => {
  let dateToFormat: Date | null = null;

  // Essaie plusieurs sources de date
  if (order.date) {
    dateToFormat = new Date(order.date);
  } else if (order.createdAt) {
    dateToFormat = new Date(order.createdAt);
  } else if (order.updatedAt) {
    dateToFormat = new Date(order.updatedAt);
  }

  // Vérifie si la date est valide
  if (dateToFormat && !isNaN(dateToFormat.getTime())) {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateToFormat.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Si aujourd'hui
    if (diffDays === 0) {
      return `Aujourd'hui ${dateToFormat.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    // Si hier
    if (diffDays === 1) {
      return `Hier ${dateToFormat.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    // Sinon format complet
    return dateToFormat.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return "Date non disponible";
};

// Calcule le total si manquant
const calculateTotal = (order: Order): number => {
  // Si le total existe déjà, le retourner
  if (order.total !== undefined && order.total !== null && order.total > 0) {
    return order.total;
  }

  // Sinon, calculer depuis les items
  if (order.items && order.items.length > 0) {
    return order.items.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
  }

  return 0;
};

// Compte les items
const getItemsCount = (order: Order): number => {
  // Priorité au champ itemsCount s'il existe
  if (order.itemsCount !== undefined && order.itemsCount !== null && order.itemsCount > 0) {
    return order.itemsCount;
  }

  // Sinon compter les items
  if (order.items && order.items.length > 0) {
    return order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  return 0;
};

// Obtient le résumé des items
const getItemsSummary = (order: Order): string => {
  if (!order.items || order.items.length === 0) {
    return "Aucun article";
  }

  const names = order.items
    .filter(item => item.name)
    .map(item => item.name)
    .slice(0, 3);

  if (names.length === 0) {
    return "Aucun article";
  }

  const summary = names.join(", ");
  if (order.items.length > 3) {
    return `${summary}...`;
  }

  return summary;
};

const getStatus = (status: OrderStatus) => {
  switch (status) {
    case "reçu":
      return { bg: COLORS.warningBg, color: COLORS.warningText, label: "Reçue" };
    case "acceptée":
      return { bg: COLORS.infoBg, color: COLORS.infoText, label: "Acceptée" };
    case "refusée":
      return { bg: COLORS.dangerBg, color: COLORS.dangerText, label: "Refusée" };
    case "préparée":
      return { bg: COLORS.primary + "22", color: COLORS.primary, label: "Préparée" };
    case "en_livraison":
      return { bg: COLORS.infoBg, color: COLORS.infoText, label: "En livraison" };
    case "livrée":
      return { bg: COLORS.successBg, color: COLORS.successText, label: "Livrée" };
    default:
      return { bg: "#F5F5F5", color: "#9E9E9E", label: "Inconnu" };
  }
};

const formatOrderId = (rawId: string) => {
  if (!rawId) return "CMD-00000";
  const clean = rawId.replace(/[^0-9A-Za-z]/g, "");
  const tail = clean.slice(-5).toUpperCase();
  return `CMD-${tail}`;
};

/* ===================== ORDER CARD ===================== */
const OrderCard: React.FC<{ order: Order; onPress?: (o: Order) => void; width: number }> = ({
  order,
  onPress,
  width,
}) => {
  const status = getStatus(order.status);
  const compact = width < 360;
  
  // Utilise les fonctions utilitaires
  const formattedDate = formatDate(order);
  const itemsCount = getItemsCount(order);
  const total = calculateTotal(order);
  const summary = getItemsSummary(order);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        if (onPress) {
          onPress(order);
        } else {
          const items = order.items || [];
          const itemsList = items.length > 0
            ? items.map(i => `- ${i.name || "Article"} (x${i.quantity || 0})`).join("\n")
            : "Aucun article";
          
          Alert.alert(
            "Détail commande",
            `Commande ${formatOrderId(order.id)}\n\nArticles:\n${itemsList}\n\nTotal: ${total.toLocaleString()} FCFA`
          );
        }
      }}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Commande ${formatOrderId(order.id)}, ${itemsCount} articles, total ${Math.round(total)} FCFA`}
    >
      {/* Header: id + status */}
      <View style={styles.cardHeader}>
        <View style={styles.leftHeader}>
          <View style={styles.iconBox}>
            <Ionicons name="receipt" size={18} color={COLORS.primary} />
          </View>
          <View style={{ maxWidth: "70%" }}>
            <Text style={styles.orderId} numberOfLines={1} ellipsizeMode="tail">
              {formatOrderId(order.id)}
            </Text>
            <Text style={styles.orderDate} numberOfLines={1} ellipsizeMode="tail">
              {formattedDate}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]} accessibilityRole="text">
            {status.label.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Body: items / total */}
      <View style={styles.cardBody}>
        <View style={styles.infoColumn}>
          <Text style={styles.label}>Articles</Text>
          <Text style={[styles.value, compact && { fontSize: 13 }]} numberOfLines={1}>
            {itemsCount} élément{itemsCount > 1 ? 's' : ''}
          </Text>

          <Text style={[styles.label, { marginTop: 10 }]}>Résumé</Text>
          <Text style={[styles.value, { color: COLORS.subtitle }]} numberOfLines={2}>
            {summary}
          </Text>
        </View>

        <View style={styles.priceColumn}>
          <Text style={styles.label}>Total</Text>
          <Text style={[styles.totalPrice, compact && { fontSize: 16 }]}>
            {Math.round(total).toLocaleString()} FCFA
          </Text>
        </View>
      </View>

      {/* Chevron */}
      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={18} color={COLORS.placeholderText} />
      </View>
    </TouchableOpacity>
  );
};

/* ===================== SCREEN PRINCIPAL ===================== */
export default function OrdersScreen(): React.ReactElement {
  const { orders } = useCartOrder();
  const [selectedType, setSelectedType] = React.useState<OrderType>("active");
  const { width } = useWindowDimensions();

  // Sécurisation
  const safeOrders: Order[] = Array.isArray(orders) ? orders : [];
  
  const filtered = safeOrders.filter((o) => {
    if (!o || !o.status) return false;
    const isActive = !["livrée", "refusée"].includes(o.status);
    return selectedType === "active" ? isActive : !isActive;
  });

  const onPressOrder = (order: Order) => {
    const itemsCount = getItemsCount(order);
    const total = calculateTotal(order);
    const items = order.items || [];
    
    const itemsList = items.length > 0
      ? items.map(i => `- ${i.name || "Article"} (x${i.quantity || 0}) ${i.price ? `- ${i.price} FCFA` : ''}`).join("\n")
      : "Aucun article dans cette commande";

    Alert.alert(
      "Détails de la commande",
      `${formatOrderId(order.id)}\n\nDate: ${formatDate(order)}\n\nArticles (${itemsCount}):\n${itemsList}\n\nTotal: ${Math.round(total).toLocaleString()} FCFA\n\nStatut: ${getStatus(order.status).label}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Commandes</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, selectedType === "active" && styles.tabActive]}
            onPress={() => setSelectedType("active")}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedType === "active" }}
          >
            <Feather name="clock" size={14} color={selectedType === "active" ? COLORS.card : COLORS.subtitle} />
            <Text style={[styles.tabText, selectedType === "active" && styles.tabTextActive]}> En cours </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, selectedType === "history" && styles.tabActive]}
            onPress={() => setSelectedType("history")}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedType === "history" }}
          >
            <Feather name="check-square" size={14} color={selectedType === "history" ? COLORS.card : COLORS.subtitle} />
            <Text style={[styles.tabText, selectedType === "history" && styles.tabTextActive]}> Historique </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste */}
      <FlatList
        data={filtered}
        keyExtractor={(item, index) => item?.id || `order-${index}`}
        renderItem={({ item }) => <OrderCard order={item} onPress={onPressOrder} width={width} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name={selectedType === "active" ? "cart-outline" : "time-outline"} size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {selectedType === "active" ? "Aucune commande en cours" : "Historique vide"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedType === "active"
                ? "Vos commandes apparaîtront ici dès que vous commanderez."
                : "Vos commandes précédentes seront listées ici."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === "android" ? 20 : 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
    zIndex: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.subtitle,
    marginLeft: 8,
  },
  tabActive: {
    backgroundColor: COLORS.card,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  orderId: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.subtitle,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    minWidth: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  infoColumn: {
    flex: 1,
    paddingRight: 12,
  },
  priceColumn: {
    alignItems: "flex-end",
    minWidth: 110,
  },
  label: {
    fontSize: 10,
    color: COLORS.placeholderText,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: COLORS.subtitle,
    fontWeight: "600",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
  },
  chevron: {
    position: "absolute",
    right: 12,
    bottom: 12,
    opacity: 0.45,
  },
  empty: {
    marginTop: 80,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.subtitle,
    textAlign: "center",
    lineHeight: 20,
  },
});