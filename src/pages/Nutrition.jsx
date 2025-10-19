import React, { useState, useEffect } from "react";
import axios from "axios";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import { Progress } from "../components/ui/Progress";
import { Trash2 } from "lucide-react";

const Nutrition = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [meals, setMeals] = useState([]);
  const [dailySummary, setDailySummary] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
  });

  const user = auth.currentUser;

  
  const fetchMeals = async () => {
    if (!user) return;
    const colRef = collection(db, "users", user.uid, "nutrition");
    const q = query(colRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const mealData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setMeals(mealData);
    calculateSummary(mealData);
  };

  useEffect(() => {
    fetchMeals();
  }, [user]);

  
  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await axios.post(
        "https://trackapi.nutritionix.com/v2/natural/nutrients",
        { query: searchQuery },
        {
          headers: {
            "x-app-id": import.meta.env.VITE_NUTRITIONIX_APP_ID,
            "x-app-key": import.meta.env.VITE_NUTRITIONIX_APP_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      setSearchResults(res.data.foods || []);
    } catch (error) {
      console.error("Error fetching food data:", error);
      alert("Unable to fetch food info. Check your Nutritionix key or query.");
    }
  };

  
  const handleAddMeal = async (food) => {
    if (!user) return alert("Please log in first");
    try {
      const colRef = collection(db, "users", user.uid, "nutrition");
      await addDoc(colRef, {
        name: food.food_name,
        calories: food.nf_calories,
        protein: food.nf_protein,
        carbs: food.nf_total_carbohydrate,
        fat: food.nf_total_fat,
        timestamp: new Date(),
      });
      alert("Meal added successfully!");
      fetchMeals();
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error adding meal:", error);
    }
  };

  const handleDeleteMeal = async (id) => {
    const ref = doc(db, "users", user.uid, "nutrition", id);
    await deleteDoc(ref);
    fetchMeals();
  };

  
  const calculateSummary = (meals) => {
    const total = meals.reduce(
      (acc, m) => {
        acc.calories += m.calories || 0;
        acc.carbs += m.carbs || 0;
        acc.protein += m.protein || 0;
        acc.fat += m.fat || 0;
        return acc;
      },
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );
    setDailySummary(total);
  };

  const dailyGoal = 2000; 

  return (
    <div className="flex bg-[#030835] min-h-screen text-white">
      <Sidebar />
      <div className="ml-16 sm:ml-20 p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">Nutrition</h1>

        
        <div className="bg-[#030C60] p-6 rounded-xl mb-6">
          <h2 className="text-lg font-semibold mb-4">Daily Overview</h2>
          <div className="flex flex-col md:flex-row justify-between">
            <div className="text-center mb-4 md:mb-0">
              <p className="text-3xl font-bold text-[#06E959]">
                {dailySummary.calories.toFixed(0)} / {dailyGoal}
              </p>
              <p className="text-gray-300">Calories Goal</p>
            </div>
            <div className="space-y-2 w-full md:w-1/2">
              <div>
                <p>Carbs: {dailySummary.carbs.toFixed(0)}g</p>
                <Progress value={(dailySummary.carbs / 300) * 100} />
              </div>
              <div>
                <p>Protein: {dailySummary.protein.toFixed(0)}g</p>
                <Progress value={(dailySummary.protein / 150) * 100} />
              </div>
              <div>
                <p>Fats: {dailySummary.fat.toFixed(0)}g</p>
                <Progress value={(dailySummary.fat / 70) * 100} />
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-[#030C60] p-6 rounded-xl mb-6">
          <h2 className="text-lg font-semibold mb-4">Search & Add Meal</h2>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Search for food (e.g. Banana, Rice, Chicken)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 rounded bg-[#060F8F] text-white"
            />
            <button
              onClick={handleSearch}
              className="bg-[#06E959] text-black px-4 rounded font-semibold"
            >
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="bg-[#060F8F] rounded-lg p-4">
              {searchResults.map((food, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b border-gray-700 py-2"
                >
                  <div>
                    <p className="font-medium capitalize">{food.food_name}</p>
                    <p className="text-sm text-gray-300">
                      {food.nf_calories} cal | P:{food.nf_protein}g C:
                      {food.nf_total_carbohydrate}g F:{food.nf_total_fat}g
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddMeal(food)}
                    className="bg-[#06E959] text-black px-3 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        
        <div className="bg-[#030C60] p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Logged Meals</h2>
          {meals.length === 0 ? (
            <p className="text-gray-400">No meals logged today</p>
          ) : (
            meals.map((meal) => (
              <div
                key={meal.id}
                className="flex justify-between items-center border-b border-gray-700 py-2"
              >
                <div>
                  <p className="font-medium capitalize">{meal.name}</p>
                  <p className="text-sm text-gray-400">
                    {meal.calories} cal | P:{meal.protein}g C:{meal.carbs}g F:
                    {meal.fat}g
                  </p>
                </div>
                <button onClick={() => handleDeleteMeal(meal.id)}>
                  <Trash2 size={20} className="text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Nutrition;