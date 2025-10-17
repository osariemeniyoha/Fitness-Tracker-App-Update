import React, { useState, useEffect, useRef } from "react";
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
import { CheckCircle2, Trash2, PlayCircle, Square } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


const MET_VALUES = {
  Walking: 3.5,
  Jogging: 7.0,
  Running: 9.8,
  Cycling: 7.5,
  Yoga: 3.0,
  Swimming: 8.0,
  "Weight Training": 6.0,
};

const AddWorkout = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState("");
  const [workouts, setWorkouts] = useState([]);
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [distribution, setDistribution] = useState([]);

  const timerRefs = useRef({});
  const [timers, setTimers] = useState({});

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
      const userWorkouts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      setSavedWorkouts(userWorkouts.filter((w) => !w.completed));
      setWorkouts(userWorkouts.filter((w) => w.completed));
      calculateDistribution(userWorkouts.filter((w) => w.completed));
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

  
  const calculateCalories = (exercise, minutes, weightKg = 70) => {
    const met = MET_VALUES[exercise] || 5;
    return ((met * 3.5 * weightKg * minutes) / 200).toFixed(0);
  };

  
  const handleAddWorkout = async () => {
    if (!selectedExercise || !duration || !date)
      return alert("Please fill all fields");

    const calories = calculateCalories(selectedExercise, duration);
    try {
      const colRef = collection(db, "users", user.uid, "workouts");
      await addDoc(colRef, {
        type: selectedExercise,
        duration,
        calories: Number(calories),
        date,
        completed: false,
      });
      alert("Workout saved!");
      
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  
  const startWorkout = async (workout) => {
    if (timers[workout.id]) return;
    const totalSeconds = workout.duration * 60;
    setTimers((prev) => ({ ...prev, [workout.id]: totalSeconds }));

    timerRefs.current[workout.id] = setInterval(async () => {
      setTimers((prev) => {
        const newTime = prev[workout.id] - 1;
        if (newTime <= 0) {
          clearInterval(timerRefs.current[workout.id]);
          handleCompleteWorkout(workout);
          return { ...prev, [workout.id]: 0 };
        }
        return { ...prev, [workout.id]: newTime };
      });
    }, 1000);
  };

  
  const stopWorkout = (id) => {
    clearInterval(timerRefs.current[id]);
    const updatedTimers = { ...timers };
    delete updatedTimers[id];
    setTimers(updatedTimers);
  };

  
 
  const handleCompleteWorkout = async (workout) => {
    try {
      const beep = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      beep.play();

      const workoutRef = doc(db, "users", user.uid, "workouts", workout.id);
      await updateDoc(workoutRef, { completed: true });

     
      const goalsCol = collection(db, "goals", user.uid, "userGoals");
      const goalsSnap = await getDocs(goalsCol);
      const goals = goalsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const workoutDate = new Date(workout.date);

      for (const g of goals) {
        if (g.status !== "active") continue;

       
        const goalCreatedAt = g.createdAt ? new Date(g.createdAt) : null;
        if (goalCreatedAt && workoutDate < goalCreatedAt) {
          continue;
        }

        const current = Number(g.currentCalories || 0) + Number(workout.calories || 0);
        const target = Number(g.targetCalories || parseInt(g.targetCalories || 0, 10) || 0);

        const newProgress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
        const updates = {
          currentCalories: current,
          progress: newProgress,
        };

        if (newProgress >= 100 && g.status === "active") {
          updates.status = "achieved";
          updates.completedAt = new Date().toISOString();
        }

        const goalRef = doc(db, "goals", user.uid, "userGoals", g.id);
        await updateDoc(goalRef, updates);
      }

      alert(`${workout.type} completed! You burned ${workout.calories} cal 🔥`);
      // keep same UX (reload)
      window.location.reload();
    } catch (err) {
      console.error("Error completing workout:", err);
    }
  };

  
  const deleteWorkout = async (id) => {
    try {
      const workoutRef = doc(db, "users", user.uid, "workouts", id);
      await deleteDoc(workoutRef);
      alert("Workout deleted!");
      window.location.reload();
    } catch (err) {
      console.error("Error deleting workout:", err);
    }
  };

  return (
    <div className="flex bg-[#030835] min-h-screen text-white">
      <Sidebar />
      <div className="ml-16 sm:ml-20 p-6 w-full">
        <h1 className="text-2xl font-bold mb-6">Workouts</h1>

        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#030C60] p-6 rounded-xl">
            <h2 className="font-semibold mb-4">Add New Workout</h2>
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
                placeholder="Duration (mins)"
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

            <p className="mt-2 text-gray-300">
              Estimated Calories:{" "}
              <span className="text-[#06E959] font-semibold">
                {selectedExercise && duration
                  ? calculateCalories(selectedExercise, duration)
                  : 0}{" "}
                kcal
              </span>
            </p>

            <button
              onClick={handleAddWorkout}
              className="bg-[#06E959] text-black w-full py-2 mt-4 rounded font-semibold"
            >
              Save Workout
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
              <p className="text-gray-400">No workouts yet</p>
            )}
          </div>
        </div>

        
        <div className="bg-[#030C60] p-6 rounded-xl mb-6">
          <h2 className="font-semibold mb-4">Saved Workouts</h2>
          {savedWorkouts.length === 0 && <p>No saved workouts yet</p>}
          {savedWorkouts.map((w) => (
            <div
              key={w.id}
              className="flex justify-between items-center border-b border-gray-700 py-2"
            >
              <div>
                <p className="font-medium">{w.type}</p>
                <p className="text-sm text-gray-400">
                  {w.duration} mins – {w.calories} cal
                </p>
                {timers[w.id] && (
                  <p className="text-green-400">
                    Time Left: {Math.floor(timers[w.id] / 60)}:
                    {(timers[w.id] % 60).toString().padStart(2, "0")}
                  </p>
                )}
              </div>

              <div className="flex gap-3 items-center">
                {!timers[w.id] ? (
                  <button
                    onClick={() => startWorkout(w)}
                    className="bg-[#06E959] text-black px-3 py-1 rounded flex items-center gap-1"
                  >
                    <PlayCircle size={18} /> Start
                  </button>
                ) : (
                  <button
                    onClick={() => stopWorkout(w.id)}
                    className="bg-yellow-400 text-black px-3 py-1 rounded flex items-center gap-1"
                  >
                    <Square size={18} /> Stop
                  </button>
                )}

                <button onClick={() => deleteWorkout(w.id)}>
                  <Trash2 size={20} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

       
        <div className="bg-[#030C60] p-6 rounded-xl">
          <h2 className="font-semibold mb-4">Workout History</h2>
          {workouts.length === 0 && <p>No completed workouts</p>}
          {workouts.map((w) => (
            <div
              key={w.id}
              className="flex justify-between items-center border-b border-gray-700 py-2"
            >
              <div>
                <p className="font-medium">{w.type}</p>
                <p className="text-sm text-gray-400">
                  {w.duration} mins – {w.calories} cal
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <CheckCircle2 size={20} className="text-green-400" />
                <button onClick={() => deleteWorkout(w.id)}>
                  <Trash2 size={20} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddWorkout;
