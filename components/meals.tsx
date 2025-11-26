import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, // Importé pour le bouton d'ajout au panier
  View,
} from "react-native";
import api from "../src/api/api"; // Assurez-vous que le chemin est correct

// === COULEURS MODERNES ===
const COLORS = {
  primary: "#FF7043",       // Orange Chaud
  background: "#F7F8F9",    // Fond clair
  card: "#FFFFFF",
  text: "#212121",
  price: "#228B22",         // Vert pour le prix
  placeholderText: "#A0A0A0",
  secondaryText: "#757575",
};

interface Meal {
  _id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

// Fonction utilitaire pour simuler l'action d'ajout au panier
const handleAddToCart = (mealId: string) => {
    // Logique d'ajout au panier ici
    console.log(`Repas ${mealId} ajouté au panier.`);
    // Vous pouvez ajouter une petite notification de succès ici.
};

// Composant de Carte Repas optimisé pour la grille (2 colonnes)
const MealCard = ({ item }: { item: Meal }) => (
    <TouchableOpacity 
        style={styles.card}
        // Action au clic sur la carte (pour aller au détail du repas)
        onPress={() => console.log("Naviguer vers les détails du repas:", item._id)} 
    >
        {/* Image / Placeholder */}
        {item.imageUrl ? (
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
            />
        ) : (
            <View style={[styles.cardImage, styles.placeholderImage]}>
                <Ionicons
                    name="fast-food-outline"
                    size={40}
                    color={COLORS.placeholderText}
                />
            </View>
        )}

        <View style={styles.cardText}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            
            {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                </Text>
            ) : (
                <View style={{ height: 32 }} /> // Garder l'espace si pas de description
            )}
        </View>

        <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>
                {item.price.toLocaleString()} FCFA
            </Text>
            
            {/* Bouton d'ajout rapide au panier */}
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddToCart(item._id)}
            >
                <Ionicons name="add-outline" size={24} color={COLORS.card} />
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
);


export default function MealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/meals");
        // Assurez-vous que res.data.data ou res.data est un tableau
        setMeals(res.data.data || res.data);
      } catch (e: any) {
        console.error("Erreur fetch meals:", e.response?.data || e.message);
        setError("Impossible de charger les repas.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  // Filtrage des repas
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
        <Text style={{ marginTop: 10, color: COLORS.secondaryText }}>
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
        <Text style={{ color: COLORS.primary, fontWeight: "bold", marginTop: 10 }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Explorer les Repas Locaux</Text>
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
          placeholder="Rechercher par nom ou description..."
          placeholderTextColor={COLORS.placeholderText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* MEALS LIST (Affichage en Grille) */}
      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <MealCard item={item} />}
        numColumns={2} // ⭐ AFFICHAGE EN 2 COLONNES
        columnWrapperStyle={styles.row} // Style pour l'espace entre les colonnes
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search-outline"
              size={50}
              color={COLORS.placeholderText}
              style={{ marginBottom: 10 }}
            />
            <Text style={{ textAlign: "center", color: COLORS.secondaryText }}>
              {search
                ? "Aucun repas trouvé pour cette recherche."
                : "Aucun repas n'est disponible pour le moment."}
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
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12, // Coins plus arrondis
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  row: {
    justifyContent: 'space-between', // Espace égal entre les colonnes
    marginBottom: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
    marginHorizontal: 30,
  },
  // ===================================
  // NOUVEAU STYLE DE CARTE (GRILLE)
  // ===================================
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: "hidden",
    flex: 1, // Permet le flex dans la grille
    marginHorizontal: 6, // Espace sur les côtés
    maxWidth: '48%', // Assure que deux tiennent sur une ligne (100% - 4% d'espace)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: 120, // Hauteur fixe pour les images de grille
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  cardText: {
    padding: 10,
    minHeight: 85, // Pour que toutes les cartes aient la même hauteur de texte
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 5,
  },
  cardPrice: {
    fontSize: 16,
    color: COLORS.price,
    fontWeight: "700",
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  }
});