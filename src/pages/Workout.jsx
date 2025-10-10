import React, { useState, useEffect } from "react";

import axios from "axios";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import { CheckCircle2, Trash2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AddWorkout = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [date, setDate] = useState("");
  const [workouts, setWorkouts] = useState([]);
  const [distribution, setDistribution] = useState([]);

  const user = auth.currentUser;
  const COLORS = ["#06E959", "#E4FF00", "#FFD166", "#118AB2", "#EF476F", "#8338EC"];

  
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await axios.get("https://exercisedb.p.rapidapi.com/exercises", {
          headers: {
            "x-rapidapi-host": "exercisedb.p.rapidapi.com",
            "x-rapidapi-key": import.meta.env.VITE_EXERCISEDB_KEY,
          },
        });
        setExercises(res.data.slice(0, 20)); 
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };
    fetchExercises();
  }, []);

  
  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user) return;
      const colRef = collection(db, "users", user.uid, "workouts");
      const snapshot = await getDocs(colRef);
      const userWorkouts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWorkouts(userWorkouts);
      calculateDistribution(userWorkouts);
    };
    fetchWorkouts();
  }, [user]);

  
  const calculateDistribution = (data) => {
    const grouped = data.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    const chartData = Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }));
    setDistribution(chartData);
  };

  
  const handleAddWorkout = async () => {
    if (!selectedExercise || !duration || !calories || !date)
      return alert("Please fill all fields");

    try {
      const colRef = collection(db, "users", user.uid, "workouts");
      await addDoc(colRef, {
        type: selectedExercise,
        duration,
        calories,
        date,
        completed: false,
      });
      alert("Workout Added!");
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  
  const markCompleted = async (id) => {
    const workoutRef = doc(db, "users", user.uid, "workouts", id);
    await updateDoc(workoutRef, { completed: true });
    setWorkouts((prev) => {
      const updated = prev.map((w) =>
        w.id === id ? { ...w, completed: true } : w
      );
      calculateDistribution(updated);
      return updated;
    });
  };

  
  const deleteWorkout = async (id) => {
    const workoutRef = doc(db, "users", user.uid, "workouts", id);
    await deleteDoc(workoutRef);
    const updated = workouts.filter((w) => w.id !== id);
    setWorkouts(updated);
    calculateDistribution(updated);
  };

  return (
    <div className="flex bg-[#030835] min-h-screen text-white">
      <Sidebar />

      <div className="ml-16 sm:ml-20 p-6 w-full">
        <h1 className="text-2xl font-bold mb-6">Workouts</h1>

        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          <div className="bg-[#030C60] p-6 rounded-xl">
            <h2 className="font-semibold mb-4">Add Workout</h2>
            <div className="grid grid-cols-2 gap-4">
              
              <div className="col-span-2 relative">
                <input
                  type="text"
                  placeholder="Type or select exercise"
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  list="exerciseList"
                  className="p-2 w-full bg-[#060F8F] rounded"
                />
                <datalist id="exerciseList">
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.name} />
                  ))}
                </datalist>
              </div>

              <input
                type="number"
                placeholder="Calories"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="p-2 bg-[#060F8F] rounded"
              />
              <input
                type="text"
                placeholder="Duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="p-2 bg-[#060F8F] rounded"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-2 bg-[#060F8F] rounded"
              />
            </div>

            <button
              onClick={handleAddWorkout}
              className="bg-[#06E959] text-black w-full py-2 mt-4 rounded font-semibold"
            >
              Add Workout
            </button>
          </div>

          
          <div className="bg-[#030C60] p-6 rounded-xl">
            <h2 className="font-semibold mb-4">Workout Distribution</h2>
            {distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No workouts to display</p>
            )}
          </div>
        </div>

        
        <div className="bg-[#030C60] p-6 rounded-xl">
          <h2 className="font-semibold mb-4">Workout History</h2>
          <div className="overflow-y-auto max-h-64">
            {workouts.length === 0 && <p>No workouts yet</p>}
            {workouts.map((w) => (
              <div
                key={w.id}
                className="flex justify-between items-center border-b border-gray-700 py-2"
              >
                <div>
                  <p className="font-medium">{w.type}</p>
                  <p className="text-sm text-gray-400">{w.duration}</p>
                </div>
                <div className="flex gap-3 items-center">
                  {!w.completed && (
                    <button onClick={() => markCompleted(w.id)}>
                      <CheckCircle2 size={20} className="text-green-400" />
                    </button>
                  )}
                  <button onClick={() => deleteWorkout(w.id)}>
                    <Trash2 size={20} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddWorkout;
