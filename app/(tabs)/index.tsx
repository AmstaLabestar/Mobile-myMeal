
import { Feather, Ionicons } from "@expo/vector-icons";
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
};

// Mappage des catégories
const CATEGORY_MAP = {
  all: { label: "Tous les plats", icon: "grid" },
  plat_principal: { label: "Plats Principaux", icon: "box" },
  accompagnement: { label: "Accompagnements", icon: "layers" },
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
  cooker: { nom: string; prenom: string };
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
    if (comment.trim().length < 3) {
      Alert.alert("Avis trop court", "Veuillez ajouter un petit commentaire.");
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
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Envoyer mon avis</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// === COMPOSANT STAR RATING ===
const StarRating = ({ average, count }: { average: number; count: number }) => {
  const roundedRating = Math.round(average * 10) / 10;
  return (
    <View style={mealCardStyles.ratingContainer}>
      <Feather name="star" size={14} color="#FFC107" />
      <Text style={mealCardStyles.ratingText}>{roundedRating || 0}</Text>
      <Text style={mealCardStyles.ratingCountText}>({count || 0})</Text>
    </View>
  );
};

// === COMPOSANT MEAL CARD ===
const MealCard = ({ 
  item, 
  onRatePress, 
  onAddToCartPress, 
  onDetailsPress 
}: { 
  item: Meal; 
  onRatePress: (meal: Meal) => void; 
  onAddToCartPress: (meal: Meal) => void;
  onDetailsPress: (meal: Meal) => void;
}) => (
  <TouchableOpacity 
    style={mealCardStyles.card} 
    activeOpacity={0.9}
    onPress={() => onDetailsPress(item)}
  >
    <View style={mealCardStyles.imageContainer}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={mealCardStyles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[mealCardStyles.image, mealCardStyles.placeholderImage]}>
          <Feather name="image" size={50} color={COLORS.placeholderText} />
        </View>
      )}
      
      <View style={mealCardStyles.topInfoContainer}>
        <TouchableOpacity onPress={() => onRatePress(item)} activeOpacity={0.7}>
          <StarRating average={item.ratingAverage ?? 0} count={item.ratingCount ?? 0} />
        </TouchableOpacity>
      </View>
    </View>

    <View style={mealCardStyles.textContainer}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <Text style={mealCardStyles.name} numberOfLines={1}>{item.name}</Text>
      </View>
      
      <Text style={mealCardStyles.cookerName}>
        Par {item.cooker.prenom} {item.cooker.nom.charAt(0)}.
      </Text>
      
      <Text style={mealCardStyles.desc} numberOfLines={2}>
        {item.description || "Aucune description fournie."}
      </Text>

      <View style={mealCardStyles.footerContainer}>
        <View style={mealCardStyles.infoItem}>
          <Feather name="clock" size={14} color={COLORS.subtitle} />
          <Text style={mealCardStyles.infoText}>{item.preparationTime} min</Text>
        </View>

        <View style={mealCardStyles.priceAndAction}>
          <View style={mealCardStyles.priceContainer}>
            <Text style={mealCardStyles.price}>
              {item.price !== undefined ? `${item.price.toLocaleString()} FCFA` : "N/A"}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={mealCardStyles.addToCartButton} 
            onPress={(e) => {
              e.stopPropagation();
              onAddToCartPress(item);
            }} 
            activeOpacity={0.8}
          >
            <Feather name="plus" size={20} color={COLORS.card} />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={mealCardStyles.rateAction} 
        onPress={(e) => {
          e.stopPropagation();
          onRatePress(item)
        }}
      >
        <Feather name="edit-2" size={14} color={COLORS.primary} />
        <Text style={mealCardStyles.rateActionText}>Noter ce plat</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

// === ECRAN PRINCIPAL ===
export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [isSearching, setIsSearching] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  
  const handleDetailsPress = (meal: Meal) => {
    console.log(`Naviguer vers les détails du plat : ${meal.name}`);
    Alert.alert("Détails du plat", `Vous navigueriez maintenant vers l'écran de détails pour ${meal.name}.`);
  }

  const handleAddToCart = (meal: Meal) => {
    console.log(`Ajout de ${meal.name} au panier...`);
    Alert.alert("Ajouté !", `${meal.name} a été ajouté à votre panier (simulé).`);
    setCartCount(prev => prev + 1);
  };

  const handleGoToCart = () => {
    if (cartCount === 0) {
      Alert.alert("Panier vide", "Veuillez ajouter des plats à votre panier.");
      return;
    }
    console.log("Naviguer vers l'écran Panier/Checkout...");
    Alert.alert("Aller au Panier", `Vous avez ${cartCount} articles dans votre panier. Navigation vers la page de commande.`);
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Oui, Déconnexion", onPress: () => logout(), style: "destructive" },
      ],
      { cancelable: true }
    );
  };

  const fetchMeals = async (category: CategoryKey = "all", searchTerm: string = "") => {
    setLoading(true);
    setError("");
    let url = "/meals";
    let params: { category?: string; search?: string } = {};

    if (category !== "all") {
      params.category = category;
    }
    if (searchTerm) {
      params.search = searchTerm;
      url = "/meals/search";
    }

    try {
      const response = await api.get(url, { params });
      const mealsData = response.data?.data?.meals || [];
      setMeals(mealsData);
    } catch (e: any) {
      console.error("Erreur fetch meals:", e.response?.data || e.message);
      setError("Impossible de récupérer les repas. Veuillez vérifier la connexion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals(selectedCategory);
  }, [selectedCategory]);

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
      await api.post(`/meals/${selectedMeal._id}/reviews`, {
        rating: rating,
        review: comment
      });

      Alert.alert("Merci !", "Votre avis a été ajouté avec succès.");
      setModalVisible(false);
      fetchMeals(selectedCategory, search); 
      
    } catch (e: any) {
      console.error(e);
      const msg = e.response?.data?.message || "Erreur lors de l'envoi de l'avis.";
      Alert.alert("Oups", msg);
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderCategoryChip = ({ item }: { item: CategoryKey }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.categoryChipActive,
      ]}
      onPress={() => {
        setSelectedCategory(item);
        setSearch("");
      }}
    >
      <Feather
        name={CATEGORY_MAP[item].icon as keyof typeof Feather.glyphMap}
        size={16}
        color={selectedCategory === item ? COLORS.card : COLORS.subtitle}
        style={{ marginRight: 5 }}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.categoryTextActive,
        ]}
      >
        {CATEGORY_MAP[item].label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !isSearching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.subtitle }}>
          Chargement des repas...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={50} color={COLORS.primary} />
        <Text style={{ color: COLORS.primary, fontWeight: "bold", marginTop: 10 }}>
          {error}
        </Text>
        <Text style={{ color: COLORS.subtitle, marginTop: 5 }}>
          Veuillez réessayer plus tard.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER OPTIMISÉ */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Bonjour, {user?.prenom || "Utilisateur"}!</Text>
          <Text style={styles.headerTitle}>Trouvez votre Repas Idéal 🍽️</Text>
        </View>
        
        <View style={styles.headerRight}>
          {/* BOUTON PANIER - PLUS VISIBLE */}
          <TouchableOpacity 
            onPress={handleGoToCart} 
            style={[
              styles.headerButton, 
              cartCount > 0 && styles.cartButtonActive
            ]}
          >
            <Feather name="shopping-cart" size={22} color={cartCount > 0 ? COLORS.card : COLORS.secondary} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* BOUTON LOGOUT - PLUS VISIBLE */}
          <TouchableOpacity 
            onPress={handleLogout} 
            style={styles.headerButton}
          >
            <Feather name="log-out" size={22} color={COLORS.primary} />
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
        {isSearching && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 10 }} />}
      </View>

      {/* CATEGORIES CHIPS */}
      <View style={{ height: 60, marginBottom: 15 }}>
        <FlatList
          data={Object.keys(CATEGORY_MAP) as CategoryKey[]}
          keyExtractor={(item) => item}
          renderItem={renderCategoryChip}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryListContent}
        />
      </View>

      {/* MEALS LIST */}
      <FlatList
        data={meals}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MealCard 
            item={item} 
            onRatePress={handleOpenRateModal} 
            onAddToCartPress={handleAddToCart}
            onDetailsPress={handleDetailsPress}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Feather name="frown" size={50} color={COLORS.placeholderText} style={{ marginBottom: 10 }} />
            <Text style={{ textAlign: "center", color: COLORS.subtitle }}>
              {search
                ? "Aucun plat trouvé pour votre recherche ou catégorie."
                : "Il n'y a pas de plats disponibles dans cette catégorie."}
            </Text>
          </View>
        }
      />

      {/* MODAL DE NOTATION */}
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

// === STYLES OPTIMISÉS ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === "android" ? 40 : 0 },
  
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 16, 
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  
  greeting: { fontSize: 13, color: COLORS.subtitle, fontWeight: "500" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text, marginTop: 2 },
  
  headerButton: { 
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    position: 'relative',
  },
  
  cartButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  
  cartBadge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  
  cartBadgeText: {
    color: COLORS.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  searchBar: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: COLORS.card, 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    marginHorizontal: 16, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  searchInput: { flex: 1, fontSize: 16, color: COLORS.text },
  categoryListContent: { paddingHorizontal: 16, alignItems: "center" },
  categoryChip: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: COLORS.border },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryText: { fontSize: 14, fontWeight: "600", color: COLORS.subtitle },
  categoryTextActive: { color: COLORS.card },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 250 },
  
  // Styles Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.subtitle,
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  commentInput: {
    width: "100%",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 15,
    height: 100,
    textAlignVertical: "top",
    color: COLORS.text,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  submitButton: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16
  },
});

const mealCardStyles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 20, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5 },
  imageContainer: { width: "100%", height: 200 },
  image: { width: "100%", height: "100%" },
  placeholderImage: { justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  topInfoContainer: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0, 0, 0, 0.6)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, flexDirection: "row", alignItems: "center" },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: { color: COLORS.card, fontWeight: "700", marginLeft: 5 },
  ratingCountText: { fontSize: 12, marginLeft: 3, color: "#E0E0E0" },
  textContainer: { padding: 15 },
  name: { fontSize: 20, fontWeight: "bold", color: COLORS.text, flex: 1 },
  cookerName: { fontSize: 13, color: COLORS.primary, fontWeight: "500", marginBottom: 5 },
  desc: { fontSize: 14, color: COLORS.subtitle, marginTop: 5, marginBottom: 10 },
  footerContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginTop: 10, 
    paddingTop: 10, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border 
  },
  priceAndAction: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoItem: { flexDirection: "row", alignItems: "center" },
  infoText: { marginLeft: 5, fontSize: 14, color: COLORS.subtitle, fontWeight: "500" },
  priceContainer: {},
  price: { fontSize: 18, color: COLORS.accentGreen, fontWeight: "800" },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10, 
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    height: 40,
  },
  rateAction: { flexDirection: 'row', alignItems: 'center', marginTop: 10, alignSelf: 'flex-start' },
  rateActionText: { color: COLORS.primary, marginLeft: 5, fontWeight: "600", fontSize: 14 }
});