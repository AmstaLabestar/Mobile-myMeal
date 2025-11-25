import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../src/api/api";
import { useAuth } from "../../src/context/AuthContext";

const COLORS = {
  primary: "#FF6347",
  secondary: "#1E90FF",
  background: "#F9F9F9",
  card: "#FFFFFF",
  text: "#333333",
  price: "#228B22",
  placeholderText: "#A0A0A0",
};

interface Meal {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

const MealCard = ({ item }: { item: Meal }) => (
  <TouchableOpacity style={styles.card}>
    <View style={styles.imageContainer}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.image,
            {
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: COLORS.background,
            },
          ]}
        >
          <Ionicons
            name="image-outline"
            size={50}
            color={COLORS.placeholderText}
          />
        </View>
      )}
    </View>

    <View style={styles.textContainer}>
      <Text style={styles.name}>{item.name}</Text>
      {item.description ? (
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      <View style={styles.priceContainer}>
        <Ionicons
          name="pricetag-outline"
          size={18}
          color={COLORS.primary}
          style={{ marginRight: 5 }}
        />
        {item.price !== undefined ? (
          <Text style={styles.price}>
            {item.price.toLocaleString()} FCFA
          </Text>
        ) : (
          <Text style={styles.price}>Prix non spécifié</Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui, Déconnexion",
          onPress: () => logout(),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/meals");

        // ✅ Extraire correctement le tableau de repas
        const mealsData = response.data?.data?.meals || [];
        setMeals(mealsData);

      } catch (e: any) {
        console.error("Erreur fetch meals:", e.response?.data || e.message);
        setError(
          "Impossible de récupérer les repas. Veuillez vérifier la connexion."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  // Filtrer les repas selon la recherche
  const filteredMeals = Array.isArray(meals)
    ? meals.filter(
        (meal) =>
          meal.name.toLowerCase().includes(search.toLowerCase()) ||
          meal.description?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.text }}>
          Chargement des repas...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={50}
          color={COLORS.primary}
        />
        <Text
          style={{
            color: COLORS.primary,
            fontWeight: "bold",
            marginTop: 10,
          }}
        >
          {error}
        </Text>
        <Text style={{ color: COLORS.text, marginTop: 5 }}>
          Veuillez réessayer plus tard.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Bonjour, {user?.prenom || "Utilisateur"} !
          </Text>
          <Text style={styles.headerTitle}>Découvrez nos Repas 🤤</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={20}
          color={COLORS.placeholderText}
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un plat..."
          placeholderTextColor={COLORS.placeholderText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* MEALS LIST */}
      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <MealCard item={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons
              name="search-outline"
              size={50}
              color={COLORS.placeholderText}
              style={{ marginBottom: 10 }}
            />
            <Text style={{ textAlign: "center", color: COLORS.text }}>
              {search
                ? "Aucun plat trouvé pour votre recherche."
                : "Il n'y a pas encore de plats disponibles."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 15,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.placeholderText,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
  },
  logoutButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.placeholderText + "30",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    padding: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  desc: {
    fontSize: 14,
    color: COLORS.placeholderText,
    marginTop: 5,
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  price: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: "700",
  },
});
