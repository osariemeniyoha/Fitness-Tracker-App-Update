import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "../components/Sidebar";
import {
  Plus,
  Target,
  Edit3,
  Trash2,
  Clock,
  RotateCcw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


const Progress = ({ value }) => (
  <div className="w-full bg-gray-700 rounded h-3 overflow-hidden">
    <div
      className="bg-green-500 h-3 rounded transition-all duration-500"
      style={{ width: `${Math.min(value, 100)}%` }}
    ></div>
  </div>
);


const GoalOverviewCard = ({
  totalGoals,
  completedGoals,
  chartData,
  onReset,
  filter,
  setFilter,
}) => (
  <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-xl text-white mb-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold">Goal Overview</h2>
      <button
        onClick={() => onReset(filter)}
        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-sm px-3 py-1 rounded transition"
      >
        <RotateCcw size={14} /> Reset{" "}
        {filter.charAt(0).toUpperCase() + filter.slice(1)}
      </button>
    </div>

    <p className="text-lg font-semibold mb-3">
      {completedGoals.length}/{totalGoals} goals completed
    </p>

    <div className="flex gap-2 mb-3">
      {["weekly", "monthly", "yearly"].map((type) => (
        <button
          key={type}
          onClick={() => setFilter(type)}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === type
              ? "bg-green-500 text-white"
              : "bg-[#0A1172] text-gray-300"
          }`}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}
    </div>

    <div className="bg-[#0A1172] p-4 rounded-lg">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData}>
          <XAxis dataKey="label" stroke="#ccc" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="completed" stroke="#22c55e" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);


const ActiveGoals = ({ goals, onEditGoal, onDeleteGoal }) => (
  <div className="bg-[#030C60] p-6 rounded-xl mb-6">
    <h3 className="font-semibold mb-4 flex items-center gap-2">
      <Target size={20} />
      Active Goals
    </h3>
    {goals.length === 0 ? (
      <p className="text-gray-400">No active goals yet.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-[#0A1172] p-4 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold capitalize">{goal.type}</h4>
                <p className="text-sm text-gray-400">
                  Target: {goal.targetCalories} cal •{" "}
                  {new Date(goal.deadline).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditGoal(goal)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{Math.round(goal.progress || 0)}%</span>
              </div>
              <Progress value={goal.progress || 0} />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock size={14} />
              <span>
                {Math.ceil(
                  (new Date(goal.deadline) - new Date()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days left
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);


const GoalHistory = ({ history, onDelete }) => (
  <div className="bg-[#030C60] p-6 rounded-xl mb-6">
    <h3 className="font-semibold mb-4">Goal History</h3>
    {history.length === 0 ? (
      <p className="text-gray-400">No goal history yet.</p>
    ) : (
      <div className="space-y-3">
        {history.map((goal) => (
          <div
            key={goal.id}
            className="flex justify-between items-center bg-[#0A1172] p-3 rounded-lg"
          >
            <div>
              <p className="font-medium capitalize">{goal.type}</p>
              <p className="text-sm text-gray-400">
                {goal.targetCalories} cal •{" "}
                {new Date(goal.deadline).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p
                className={`px-3 py-1 rounded-full text-sm ${
                  goal.status === "achieved"
                    ? "bg-green-600 text-green-100"
                    : "bg-red-600 text-red-100"
                }`}
              >
                {goal.status === "achieved" ? "Achieved" : "Missed"}
              </p>
              <button
                onClick={() => onDelete(goal.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);


const GoalForm = ({ isOpen, onClose, onSave, editGoal }) => {
  const [formData, setFormData] = useState({
    type: "weight",
    targetCalories: "",
    deadline: "",
  });

  useEffect(() => {
    if (editGoal) setFormData(editGoal);
  }, [editGoal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#030C60] p-6 rounded-xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {editGoal ? "Edit Goal" : "Add Goal"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full bg-[#0A1172] border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="weight">Lose Weight</option>
              <option value="cardio">Cardio</option>
              <option value="running">Running</option>
              <option value="strength">Strength</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Target Calories</label>
            <input
              type="number"
              value={formData.targetCalories}
              onChange={(e) =>
                setFormData({ ...formData, targetCalories: e.target.value })
              }
              className="w-full bg-[#0A1172] border border-gray-600 rounded px-3 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              className="w-full bg-[#0A1172] border border-gray-600 rounded px-3 py-2 text-white"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const Goals = () => {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState("monthly");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchGoals(currentUser.uid);
        fetchChartData(currentUser.uid);

        
        const workoutRef = collection(db, "users", currentUser.uid, "workouts");
        return onSnapshot(workoutRef, () => fetchGoals(currentUser.uid));
      }
    });
    return () => unsubscribe();
  }, []);

 
  const fetchGoals = async (uid) => {
    try {
      const goalsCollection = collection(db, "goals", uid, "userGoals");
      const querySnapshot = await getDocs(goalsCollection);
      const rawGoals = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      const workoutsCol = collection(db, "users", uid, "workouts");
      const wSnap = await getDocs(workoutsCol);
      const workouts = wSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const updatedGoals = [];

      for (const g of rawGoals) {
        const target = Number(g.targetCalories || 0);
        const createdAt = g.createdAt ? new Date(g.createdAt) : null;

        
        const burnedCalories = workouts
          .filter((w) => w.completed)
          .filter((w) => {
            const wd = new Date(w.date);
            return !createdAt || wd >= createdAt;
          })
          .reduce((sum, w) => sum + Number(w.calories || 0), 0);

        const progress = target > 0 ? Math.min((burnedCalories / target) * 100, 100) : 0;
        const status = progress >= 100 ? "achieved" : "active";

        const newGoal = {
          ...g,
          progress,
          currentCalories: burnedCalories,
          status,
        };

        
        const goalRef = doc(db, "goals", uid, "userGoals", g.id);
        await updateDoc(goalRef, {
          progress,
          currentCalories: burnedCalories,
          status,
        });

        updatedGoals.push(newGoal);
      }

      setGoals(updatedGoals);
    } catch (err) {
      console.error("Error fetching goals:", err);
    }
  };

  const fetchChartData = async (uid) => {
    try {
      const chartSnap = await getDocs(collection(db, "goals", uid, "charts"));
      if (!chartSnap.empty) {
        const data = chartSnap.docs[0].data();
        setChartData(data[filter] || []);
      } else setChartData([]);
    } catch {
      setChartData([]);
    }
  };

  const handleSaveGoal = async (goalData) => {
    if (!user) return alert("Please log in first.");
    const ref = collection(db, "goals", user.uid, "userGoals");

    if (editingGoal) {
      const goalRef = doc(db, "goals", user.uid, "userGoals", editingGoal.id);
      await updateDoc(goalRef, { ...goalData });
    } else {
      await addDoc(ref, {
        ...goalData,
        progress: 0,
        status: "active",
        createdAt: new Date().toISOString(),
        currentCalories: 0,
      });
    }

    await fetchGoals(user.uid);
  };

  const handleDeleteGoal = async (id) => {
    await deleteDoc(doc(db, "goals", user.uid, "userGoals", id));
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleReset = async (type) => {
    if (!user || !window.confirm(`Reset ${type} data?`)) return;
    const resetData = [
      { label: "Week 1", completed: 0 },
      { label: "Week 2", completed: 0 },
      { label: "Week 3", completed: 0 },
      { label: "Week 4", completed: 0 },
    ];
    setChartData(resetData);
    await setDoc(doc(db, "goals", user.uid, "charts", type), { [type]: resetData });
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "achieved");

  return (
    <div className="flex bg-[#030835] min-h-screen text-white">
      <Sidebar />
      <div className="ml-16 sm:ml-20 p-6 w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Goals</h1>
          <button
            onClick={() => setShowGoalForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} /> Add Goal
          </button>
        </div>

        <GoalOverviewCard
          totalGoals={goals.length}
          completedGoals={completedGoals}
          chartData={chartData}
          onReset={handleReset}
          filter={filter}
          setFilter={setFilter}
        />

        <ActiveGoals
          goals={activeGoals}
          onEditGoal={(goal) => {
            setEditingGoal(goal);
            setShowGoalForm(true);
          }}
          onDeleteGoal={handleDeleteGoal}
        />

        <GoalHistory history={completedGoals} onDelete={handleDeleteGoal} />

        <GoalForm
          isOpen={showGoalForm}
          onClose={() => {
            setShowGoalForm(false);
            setEditingGoal(null);
          }}
          onSave={handleSaveGoal}
          editGoal={editingGoal}
        />
      </div>
    </div>
  );
};

export default Goals;
