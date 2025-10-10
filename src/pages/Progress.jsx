import React, { useEffect, useState } from "react";

import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Flame, Star } from "lucide-react";

const Progress = () => {
  const [workouts, setWorkouts] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [goalProgress, setGoalProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [distribution, setDistribution] = useState([]);

  const user = auth.currentUser;
  const COLORS = ["#06E959", "#3B82F6", "#A855F7", "#FBBF24", "#EF4444"];

  
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
      calculateStats(userWorkouts);
    };
    fetchWorkouts();
  }, [user]);

 
  const calculateStats = (data) => {
    if (!data.length) return;

   
    const completedWorkouts = data.filter((w) => w.completed);
    const totalCals = completedWorkouts.reduce(
    (sum, w) => sum + Number(w.calories || 0),
    0
    );
    setTotalCalories(totalCals);

    
    const grouped = data.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    const chartData = Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }));
    setDistribution(chartData);

    
    const goal = 12;
    const completedCount = data.filter((w) => w.completed).length;
    setGoalProgress((completedCount / goal) * 100);

    
    const dates = [
      ...new Set(
        data
          .filter((w) => w.completed)
          .map((w) => new Date(w.date).toDateString())
      ),
    ].sort((a, b) => new Date(a) - new Date(b));

    let maxStreak = 0,
      currentStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) currentStreak++;
      else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    setStreak(Math.max(maxStreak, currentStreak));
  };

  
  const monthlyData = (() => {
    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];
    const grouped = {};
    workouts.forEach((w) => {
      const m = new Date(w.date).getMonth();
      grouped[months[m]] = (grouped[months[m]] || 0) + 1;
    });
    return months.map((m) => ({
      month: m,
      workouts: grouped[m] || 0,
    }));
  })();

  return (
    <div className="flex bg-[#030835] min-h-screen text-white">
      <Sidebar />

      <div className="ml-16 sm:ml-20 p-6 w-full">
        <h1 className="text-2xl font-bold mb-6">Progress</h1>

       
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#030C60] p-5 rounded-xl text-center">
            <p className="text-gray-300 text-sm">Total Workouts</p>
            <h2 className="text-3xl font-bold">{workouts.length}</h2>
          </div>
          <div className="bg-[#030C60] p-5 rounded-xl text-center">
            <p className="text-gray-300 text-sm">Calories Burned</p>
            <h2 className="text-3xl font-bold">{totalCalories}</h2>
          </div>
          <div className="bg-[#030C60] p-5 rounded-xl text-center">
            <p className="text-gray-300 text-sm">Longest Streak</p>
            <h2 className="text-3xl font-bold">{streak} days</h2>
          </div>
          <div className="bg-[#030C60] p-5 rounded-xl text-center">
            <p className="text-gray-300 text-sm">Current Goal</p>
            <h2 className="text-3xl font-bold">
              {Math.round((goalProgress / 100) * 12)}/12
            </h2>
          </div>
        </div>

        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          <div className="bg-[#030C60] p-6 rounded-xl">
            <h2 className="font-semibold mb-4">Workout Frequency</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2A78" />
                <XAxis dataKey="month" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020C66",
                    borderRadius: "10px",
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Line type="monotone" dataKey="workouts" stroke="#E91E63" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          
          <div className="bg-[#030C60] p-6 rounded-xl">
            <h2 className="font-semibold mb-4">Goals Progress</h2>
            <div className="mb-6">
              <div className="w-full bg-gray-700 h-3 rounded-full">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-400 to-white"
                  style={{ width: `${goalProgress}%` }}
                ></div>
              </div>
              <p className="text-sm mt-2 text-gray-300">
                Streak Counter: <span className="text-orange-400">🔥 {streak}-day streak</span>
              </p>
            </div>
          </div>
        </div>

        
        <div className="grid md:grid-cols-2 gap-6">
          
          <div className="bg-[#030C60] p-6 rounded-xl">
            <h2 className="font-semibold mb-4">Workout Type Distribution</h2>
            {distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No data available</p>
            )}
          </div>

          
          <div className="bg-[#030C60] p-6 rounded-xl flex flex-col justify-center items-center">
            <h2 className="font-semibold mb-6">Goals Counter</h2>
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 border-2 border-[#06E959] rounded-full flex justify-center items-center text-2xl font-bold">
                  {workouts.length}
                </div>
                <p className="mt-2 text-sm">Workouts</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 border-2 border-orange-400 rounded-full flex justify-center items-center text-2xl font-bold">
                  {totalCalories}
                </div>
                <p className="mt-2 text-sm">Calories</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 border-2 border-[#3B82F6] rounded-full flex justify-center items-center">
                  <Star className="text-[#3B82F6]" size={30} />
                </div>
                <p className="mt-2 text-sm">First Week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
