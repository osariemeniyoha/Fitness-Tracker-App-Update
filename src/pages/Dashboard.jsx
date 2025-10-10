import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import Sidebar from "../components/Sidebar";
import { Dumbbell, Flame, CheckCircle2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";

const Dashboard = () => {
  const [userName, setUserName] = useState("User");
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || "User");
      fetchUserWorkouts(user.uid);
    }
  }, []);

  
  const fetchUserWorkouts = async (userId) => {
    try {
      const colRef = collection(db, "users", userId, "workouts");
      const snapshot = await getDocs(colRef);
      const workouts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    
      const completed = workouts.filter((w) => w.completed);
      setCompletedWorkouts(completed);

      
      const total = completed.reduce((acc, w) => acc + Number(w.calories || 0), 0);
      setTotalCalories(total);

     
      const grouped = completed.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = 0;
        acc[item.type] += Number(item.calories || 0);
        return acc;
      }, {});
      const chartFormatted = Object.entries(grouped).map(([name, calories]) => ({
        name,
        calories,
      }));
      setChartData(chartFormatted);
    } catch (err) {
      console.error("Error fetching workouts:", err);
    }
  };

  return (
    <div className="flex bg-[#030835] min-h-screen text-white">
      
      <Sidebar />

      
      <div className="ml-16 sm:ml-20 p-6 w-full">
        <h2 className="text-gray-300 text-sm font-montserrat">Good Morning</h2>
        <h1 className="text-2xl font-bold font-montserrat mb-6">
          Welcome back, {userName} 👋
        </h1>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
          
          <div className="bg-[#030C60] p-5 rounded-xl flex justify-between items-center">
            <div>
              <p className="font-semibold font-inter">Workouts Completed</p>
              <h3 className="text-3xl font-inter font-bold mt-1">
                {completedWorkouts.length}
              </h3>
            </div>
            <Dumbbell size={40} className="text-[#06E959]" />
          </div>

          
          <div className="bg-[#030C60] p-5 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="font-semibold font-inter">Calories Burned</p>
              <Flame size={40} className="text-orange-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-600 h-2 rounded-full overflow-hidden">
                
                <div
                  className="h-2 bg-gradient-to-r from-green-400 to-white"
                  style={{ width: `${Math.min((totalCalories / 1000) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-right mt-1 text-lg font-inter font-bold">
                {totalCalories} kcal
              </p>
            </div>
          </div>

          
          <div className="bg-[#030C60] p-5 rounded-xl flex justify-between items-center">
            <div>
              <p className="font-semibold font-inter">Goals Progress</p>
              <h3 className="text-3xl font-bold font-inter mt-1">
                {completedWorkouts.length > 0 ? "Active" : "Pending"}
              </h3>
            </div>
            <CheckCircle2 size={40} className="text-[#06E959]" />
          </div>

         
          <div className="bg-[#030C60] p-5 rounded-xl">
            <h3 className="font-semibold font-inter mb-4">Calories Burned by Workout</h3>
            <div className="w-full h-48">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2A78" />
                    <XAxis dataKey="name" stroke="#ffffff" />
                    <YAxis stroke="#ffffff" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020C66",
                        borderRadius: "10px",
                        border: "none",
                        color: "#fff",
                      }}
                    />
                    <Bar
                      dataKey="calories"
                      fill="#06E959"
                      radius={[10, 10, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center">No data yet</p>
              )}
            </div>
          </div>
        </div>

        
        <div className="bg-[#030C60] p-6 rounded-xl">
          <h2 className="text-xl font-inter font-bold mb-4">Recent Completed Workouts</h2>
          <table className="w-full text-sm sm:text-base">
            <thead>
              <tr className="text-gray-300 font-inter text-left">
                <th>Date</th>
                <th>Workout</th>
                <th>Duration</th>
                <th>Calories</th>
              </tr>
            </thead>
            <tbody>
              {completedWorkouts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-400">
                    No completed workouts yet
                  </td>
                </tr>
              ) : (
                completedWorkouts
                  .slice(-5)
                  .reverse()
                  .map((w) => (
                    <tr key={w.id} className="border-t font-overlock border-gray-700">
                      <td className="py-2">{w.date}</td>
                      <td>{w.type}</td>
                      <td>{w.duration}</td>
                      <td>{w.calories}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
