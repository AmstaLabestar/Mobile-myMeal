import { Feather } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../src/api/api";
import { useAuth } from "../../src/context/AuthContext";
import { useCartOrder } from "../../src/context/CartOrderContext";

// === COULEURS MODERNES ===
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
  red: "#EF5350",
};

const CATEGORY_MAP = {
  all: { label: "Tous", icon: "grid" },
  plat_principal: { label: "Plats", icon: "box" },
  accompagnement: { label: "Accompagnement", icon: "layers" },
  dessert: { label: "Desserts", icon: "coffee" },
  boisson: { label: "Boissons", icon: "droplet" },
  autre: { label: "Autres", icon: "more-horizontal" },
};

type CategoryKey = keyof typeof CATEGORY_MAP;

interface Meal {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  ratingAverage?: number;
  ratingCount?: number;
  preparationTime?: number;
  cooker: {_id: string; nom: string; prenom: string };
}

// === COMPOSANT MODAL DE NOTATION ===
const RateMealModal = ({
  visible,
  onClose,
  onSubmit,
  mealName,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  mealName: string;
  loading: boolean;
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert("Note manquante", "Veuillez sélectionner au moins une étoile.");
      return;
    }
    onSubmit(rating, comment);
    setRating(0);
    setComment("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: "100%", alignItems: "center" }}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Noter {mealName}</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color={COLORS.subtitle} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Quelle a été votre expérience ?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Feather
                    name="star"
                    size={36}
                    color={star <= rating ? "#FFC107" : "#E0E0E0"}
                    style={{ marginHorizontal: 5 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Écrivez votre avis ici..."
              placeholderTextColor={COLORS.placeholderText}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Envoyer</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// === COMPOSANT MEAL CARD ===
const MealCard = ({ item, onRatePress }: { item: Meal; onRatePress: (meal: Meal) => void }) => {
  const { addToCart } = useCartOrder();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(item);
    // Feedback visuel temporaire
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <TouchableOpacity style={mealCardStyles.card} activeOpacity={0.9}>
      <View style={mealCardStyles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={mealCardStyles.image} resizeMode="cover" />
        ) : (
          <View style={[mealCardStyles.image, mealCardStyles.placeholderImage]}>
            <Feather name="image" size={50} color={COLORS.placeholderText} />
          </View>
        )}
        <View style={mealCardStyles.topInfoContainer}>
            <View style={mealCardStyles.ratingContainer}>
              <Feather name="star" size={14} color="#FFC107" />
              <Text style={mealCardStyles.ratingText}>{Math.round((item.ratingAverage || 0) * 10) / 10}</Text>
              <Text style={mealCardStyles.ratingCountText}>({item.ratingCount || 0})</Text>
            </View>
        </View>
      </View>

      <View style={mealCardStyles.textContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <Text style={mealCardStyles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={mealCardStyles.price}>
              {item.price !== undefined ? `${item.price.toLocaleString()} FCFA` : "N/A"}
            </Text>
        </View>

        <Text style={mealCardStyles.cookerName}>Par {item.cooker.prenom} {item.cooker.nom.charAt(0)}.</Text>
        <Text style={mealCardStyles.desc} numberOfLines={2}>{item.description || "Aucune description."}</Text>

        <View style={mealCardStyles.footerContainer}>
          <View style={mealCardStyles.infoItem}>
            <Feather name="clock" size={14} color={COLORS.subtitle} />
            <Text style={mealCardStyles.infoText}>{item.preparationTime} min</Text>
          </View>
           <TouchableOpacity style={mealCardStyles.rateAction} onPress={() => onRatePress(item)}>
            <Feather name="edit-2" size={14} color={COLORS.primary} />
            <Text style={mealCardStyles.rateActionText}>Noter</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
              mealCardStyles.addToCartButton, 
              isAdded && { backgroundColor: COLORS.primary }
          ]} 
          onPress={handleAddToCart}
          disabled={isAdded}
        >
          <Feather name={isAdded ? "check" : "plus"} size={18} color="#FFF" />
          <Text style={mealCardStyles.addToCartButtonText}>
            {isAdded ? "Ajouté au panier" : "Ajouter"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};


// === ECRAN PRINCIPAL ===
export default function HomeScreen() {
  const { user, logout } = useAuth();
  
  // CORRECTION ICI : On utilise cartItems au lieu de cart
  const { cartItems } = useCartOrder(); 
  const navigation = useNavigation<NavigationProp<any>>();
  
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [isSearching, setIsSearching] = useState(false);

  // États pour la modale
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);

  // Calcul du nombre total d'articles (somme des quantités)
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment quitter ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Déconnexion", onPress: () => logout(), style: "destructive" },
      ]
    );
  };

const handleGoToCart = () => {
    
    navigation.navigate('explore'); 
  };

  const fetchMeals = async (category: CategoryKey = "all", searchTerm: string = "") => {
    setLoading(true);
    setError("");
    let url = "/meals";
    let params: { category?: string; search?: string } = {};

    if (category !== "all") params.category = category;
    if (searchTerm) {
      params.search = searchTerm;
      url = "/meals/search";
    }

    try {
      const response = await api.get(url, { params });
      setMeals(response.data?.data?.meals || []);
    } catch {
      // CORRECTION : Suppression de la variable 'e' inutilisée
      setError("Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeals(selectedCategory); }, [selectedCategory]);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.length > 2 || text.length === 0) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        fetchMeals("all", text);
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  };

  const handleOpenRateModal = (meal: Meal) => {
    setSelectedMeal(meal);
    setModalVisible(true);
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!selectedMeal) return;
    setSubmittingRating(true);
    try {
      await api.post(`/meals/${selectedMeal._id}/reviews`, { rating, review: comment });
      Alert.alert("Merci !", "Avis envoyé.");
      setModalVisible(false);
      fetchMeals(selectedCategory, search); 
    } catch {
      // CORRECTION : Suppression de la variable 'e' inutilisée
      Alert.alert("Oups", "Erreur lors de l'envoi.");
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderCategoryChip = ({ item }: { item: CategoryKey }) => (
    <TouchableOpacity
      style={[styles.categoryChip, selectedCategory === item && styles.categoryChipActive]}
      onPress={() => { setSelectedCategory(item); setSearch(""); }}
    >
      <Feather
        name={CATEGORY_MAP[item].icon as any}
        size={16}
        color={selectedCategory === item ? COLORS.card : COLORS.subtitle}
        style={{ marginRight: 6 }}
      />
      <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextActive]}>
        {CATEGORY_MAP[item].label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER AMÉLIORÉ */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTexts}>
          <Text style={styles.greeting}>Bonjour, {user?.prenom || "Gourmand"}</Text>
          <Text style={styles.headerTitle}>On mange quoi ? 😋</Text>
        </View>
        
        <View style={styles.headerActions}>
            {/* Bouton Panier (Header) */}
            <TouchableOpacity style={styles.iconButton} onPress={handleGoToCart}>
                <Feather name="shopping-bag" size={22} color={COLORS.text} />
                {cartItemCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{cartItemCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Bouton Logout */}
            <TouchableOpacity onPress={handleLogout} style={[styles.iconButton, { marginLeft: 10 }]}>
                <Feather name="log-out" size={22} color={COLORS.red} />
            </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchBar}>
        <Feather name="search" size={20} color={COLORS.placeholderText} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un plat..."
          placeholderTextColor={COLORS.placeholderText}
          value={search}
          onChangeText={handleSearch}
        />
        {isSearching && <ActivityIndicator size="small" color={COLORS.primary} />}
      </View>

      {/* CATEGORIES */}
      <View style={{ height: 50, marginBottom: 15 }}>
        <FlatList
          data={Object.keys(CATEGORY_MAP) as CategoryKey[]}
          keyExtractor={(item) => item}
          renderItem={renderCategoryChip}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>

      {/* LISTE OU LOADING */}
      {loading && !isSearching ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: COLORS.red }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <MealCard item={item} onRatePress={handleOpenRateModal} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: COLORS.subtitle }}>Aucun plat trouvé.</Text>
            </View>
          }
        />
      )}

      {/* FLOATING CART BUTTON (S'affiche s'il y a des articles) */}
      {cartItemCount > 0 && (
          <TouchableOpacity 
              style={styles.floatingButton} 
              activeOpacity={0.9}
              onPress={handleGoToCart} // <-- AJOUT DE L'ACTION ICI
          >
             <View style={styles.floatingBadge}>
                 <Text style={styles.floatingBadgeText}>{cartItemCount}</Text>
             </View>
             <Text style={styles.floatingButtonText}>Voir le panier</Text>
             <Feather name="chevron-right" size={20} color="#FFF" />
          </TouchableOpacity>
      )}

      {/* MODAL */}
      {selectedMeal && (
        <RateMealModal
          visible={modalVisible}
          mealName={selectedMeal.name}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSubmitRating}
          loading={submittingRating}
        />
      )}
    </View>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === "android" ? 40 : 50 },
  
  // Header Optimisé
  headerContainer: { 
      flexDirection: "row", 
      justifyContent: "space-between", 
      alignItems: "center", 
      paddingHorizontal: 20, 
      marginBottom: 20 
  },
  headerTexts: { flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  greeting: { fontSize: 14, color: COLORS.subtitle, fontWeight: "600", marginBottom: 2 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  
  iconButton: {
      padding: 10,
      borderRadius: 12,
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.border,
      position: 'relative', // Pour le badge
      justifyContent: 'center',
      alignItems: 'center'
  },
  badge: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: COLORS.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: COLORS.background
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 12, marginHorizontal: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: {width:0, height:2}, elevation: 2 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.text },
  
  categoryChip: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 25, marginRight: 10, borderWidth: 1, borderColor: COLORS.border },
  categoryChipActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  categoryText: { fontSize: 14, fontWeight: "600", color: COLORS.subtitle },
  categoryTextActive: { color: COLORS.card },
  
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Floating Button Style
  floatingButton: {
      position: 'absolute',
      bottom: 30,
      left: 20,
      right: 20,
      backgroundColor: COLORS.accentGreen,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 8,
  },
  floatingBadge: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginRight: 15
  },
  floatingBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  floatingButtonText: { flex: 1, color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalContent: { width: "100%", backgroundColor: COLORS.card, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, alignItems: "center", minHeight: 400 },
  modalHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: COLORS.text },
  modalSubtitle: { fontSize: 16, color: COLORS.subtitle, marginBottom: 20 },
  starsContainer: { flexDirection: "row", marginBottom: 25 },
  commentInput: { width: "100%", backgroundColor: COLORS.background, borderRadius: 12, padding: 15, height: 120, textAlignVertical: "top", color: COLORS.text, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  submitButton: { width: "100%", padding: 16, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: "center" },
  submitButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});

const mealCardStyles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 18, marginBottom: 25, overflow: "hidden", borderWidth: 1, borderColor: "#F0F0F0", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  imageContainer: { width: "100%", height: 180 },
  image: { width: "100%", height: "100%" },
  placeholderImage: { justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  topInfoContainer: { position: "absolute", top: 12, left: 12 },
  ratingContainer: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { color: COLORS.text, fontWeight: "700", marginLeft: 5, fontSize: 12 },
  ratingCountText: { fontSize: 10, marginLeft: 2, color: COLORS.subtitle },
  textContainer: { padding: 16 },
  name: { fontSize: 18, fontWeight: "800", color: COLORS.text, flex: 1, marginRight: 10 },
  cookerName: { fontSize: 13, color: COLORS.subtitle, marginBottom: 8 },
  desc: { fontSize: 14, color: COLORS.subtitle, lineHeight: 20, marginBottom: 15 },
  footerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  infoItem: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  infoText: { marginLeft: 5, fontSize: 12, color: COLORS.subtitle, fontWeight: "600" },
  price: { fontSize: 18, color: COLORS.primary, fontWeight: "800" },
  rateAction: { flexDirection: "row", alignItems: "center" },
  rateActionText: { color: COLORS.primary, marginLeft: 5, fontWeight: "600", fontSize: 13 },
  addToCartButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.accentGreen, paddingVertical: 12, borderRadius: 12 },
  addToCartButtonText: { color: "#FFF", fontWeight: "700", fontSize: 15, marginLeft: 8 },
});