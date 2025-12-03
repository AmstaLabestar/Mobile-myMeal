import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCartOrder } from "../../src/context/CartOrderContext";

const COLORS = {
  primary: "#FF7043",
  secondary: "#1E88E5",
  background: "#F7F8F9",
  card: "#FFFFFF",
  text: "#212121",
  subtitle: "#757575",
  accentGreen: "#4CAF50",
  placeholderText: "#A0A0A0",
  border: "#E0E0E0",
  danger: "#EF5350",
};

export default function CartScreen() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, createOrderFromCart } = useCartOrder();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryOption, setDeliveryOption] = useState<"livraison" | "retrait">("livraison");

  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      "Supprimer l'article",
      "Voulez-vous retirer cet article du panier ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", onPress: () => removeFromCart(itemId), style: "destructive" },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      "Vider le panier",
      "Voulez-vous supprimer tous les articles ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Vider", onPress: () => clearCart(), style: "destructive" },
      ]
    );
  };

  const handleCreateOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert("Panier vide", "Ajoutez des plats avant de commander.");
      return;
    }
    setModalVisible(true);
  };

  const handleConfirmOrder = async () => {
    if (deliveryOption === "livraison" && deliveryAddress.trim().length < 5) {
      Alert.alert("Adresse invalide", "Veuillez entrer une adresse de livraison valide.");
      return;
    }
try {
    await createOrderFromCart(deliveryAddress, deliveryOption);
    setModalVisible(false);
    setDeliveryAddress("");
    
    // Alert.alert(
    //   "Commande créée ! 🎉",
    //   "Votre commande a été envoyée avec succès. Consultez l'onglet Commandes pour suivre son statut.",
    //   [{ text: "OK" }]
    // );

 } catch (error) {
  console.error("Erreur lors de la création de la commande :", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la création de la commande. Veuillez réessayer plus tard."
      );
    }
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, styles.placeholderImage]}>
            <Feather name="image" size={30} color={COLORS.placeholderText} />
          </View>
        )}
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemCooker}>{item.cooker}</Text>
        <Text style={styles.itemPrice}>{item.price.toLocaleString()} FCFA</Text>
      </View>

      <View style={styles.itemActions}>
        <View style={styles.quantityControls}>
          <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
            <Feather name="minus-circle" size={24} color={COLORS.subtitle} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
            <Feather name="plus-circle" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.deleteButton}>
          <Feather name="trash-2" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Panier 🛒</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearButton}>Vider</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={COLORS.placeholderText} />
          <Text style={styles.emptyText}>Votre panier est vide</Text>
          <Text style={styles.emptySubtext}>Ajoutez des plats pour commencer !</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
          />

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{cartTotal.toLocaleString()} FCFA</Text>
            </View>
            <TouchableOpacity style={styles.orderButton} onPress={handleCreateOrder}>
              <Text style={styles.orderButtonText}>Commander</Text>
              <Feather name="arrow-right" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* MODAL DE CONFIRMATION */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Finaliser la commande</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={COLORS.subtitle} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Mode de réception</Text>
            <View style={styles.deliveryOptions}>
              <TouchableOpacity
                style={[styles.optionButton, deliveryOption === "livraison" && styles.optionButtonActive]}
                onPress={() => setDeliveryOption("livraison")}
              >
                <Feather name="truck" size={20} color={deliveryOption === "livraison" ? COLORS.card : COLORS.subtitle} />
                <Text style={[styles.optionText, deliveryOption === "livraison" && styles.optionTextActive]}>
                  Livraison
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, deliveryOption === "retrait" && styles.optionButtonActive]}
                onPress={() => setDeliveryOption("retrait")}
              >
                <Feather name="shopping-bag" size={20} color={deliveryOption === "retrait" ? COLORS.card : COLORS.subtitle} />
                <Text style={[styles.optionText, deliveryOption === "retrait" && styles.optionTextActive]}>
                  Retrait
                </Text>
              </TouchableOpacity>
            </View>

            {deliveryOption === "livraison" && (
              <>
                <Text style={styles.modalLabel}>Adresse de livraison</Text>
                <TextInput
                  style={styles.addressInput}
                  placeholder="Entrez votre adresse complète..."
                  placeholderTextColor={COLORS.placeholderText}
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  multiline
                />
              </>
            )}

            <View style={styles.modalFooter}>
              <Text style={styles.modalTotal}>Total: {cartTotal.toLocaleString()} FCFA</Text>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
                <Text style={styles.confirmButtonText}>Confirmer la commande</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === "android" ? 40 : 0 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  clearButton: { color: COLORS.danger, fontWeight: "600", fontSize: 16 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  cartItem: { flexDirection: "row", backgroundColor: COLORS.card, borderRadius: 12, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  itemImageContainer: { marginRight: 12 },
  itemImage: { width: 70, height: 70, borderRadius: 8 },
  placeholderImage: { justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  itemDetails: { flex: 1, justifyContent: "center" },
  itemName: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  itemCooker: { fontSize: 12, color: COLORS.primary, marginBottom: 6 },
  itemPrice: { fontSize: 15, fontWeight: "600", color: COLORS.accentGreen },
  itemActions: { justifyContent: "space-between", alignItems: "center" },
  quantityControls: { flexDirection: "row", alignItems: "center", gap: 10 },
  quantityText: { fontSize: 16, fontWeight: "700", color: COLORS.text, minWidth: 25, textAlign: "center" },
  deleteButton: { marginTop: 10, padding: 5 },
  footer: { backgroundColor: COLORS.card, paddingHorizontal: 20, paddingVertical: 15, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  totalLabel: { fontSize: 18, fontWeight: "600", color: COLORS.subtitle },
  totalAmount: { fontSize: 22, fontWeight: "800", color: COLORS.primary },
  orderButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, gap: 8 },
  orderButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyText: { fontSize: 20, fontWeight: "700", color: COLORS.text, marginTop: 20 },
  emptySubtext: { fontSize: 14, color: COLORS.subtitle, marginTop: 8, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", backgroundColor: COLORS.card, borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  modalLabel: { fontSize: 15, fontWeight: "600", color: COLORS.text, marginBottom: 10, marginTop: 10 },
  deliveryOptions: { flexDirection: "row", gap: 10, marginBottom: 15 },
  optionButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 8, backgroundColor: COLORS.background, borderWidth: 2, borderColor: COLORS.border, gap: 8 },
  optionButtonActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  optionText: { fontSize: 14, fontWeight: "600", color: COLORS.subtitle },
  optionTextActive: { color: COLORS.card },
  addressInput: { backgroundColor: COLORS.background, borderRadius: 8, padding: 12, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, minHeight: 80, textAlignVertical: "top" },
  modalFooter: { marginTop: 20 },
  modalTotal: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 15, textAlign: "center" },
  confirmButton: { backgroundColor: COLORS.accentGreen, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  confirmButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});