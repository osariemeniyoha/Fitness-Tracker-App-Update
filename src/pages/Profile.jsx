import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Sidebar from "../components/Sidebar";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: "",
    height: "",
    weight: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setProfile({
            name: user.displayName || "",
            email: user.email || "",
            age: "",
            height: "",
            weight: "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, profile);
      alert("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[#030835] min-h-screen text-white items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex bg-[#030835] min-h-screen text-white">
      <Sidebar />
      <div className="ml-16 sm:ml-20 p-6 w-full">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        <div className="bg-[#030C60] p-6 rounded-xl w-full max-w-xl">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm mb-1 text-gray-300">Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                readOnly={!editMode}
                className={`w-full p-2 rounded bg-[#060F8F] ${
                  editMode ? "border border-green-400" : "opacity-70"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                readOnly
                className="w-full p-2 rounded bg-[#060F8F] opacity-70"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-300">Age</label>
                <input
                  type="number"
                  name="age"
                  value={profile.age}
                  onChange={handleChange}
                  readOnly={!editMode}
                  className={`w-full p-2 rounded bg-[#060F8F] ${
                    editMode ? "border border-green-400" : "opacity-70"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-300">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={profile.height}
                  onChange={handleChange}
                  readOnly={!editMode}
                  className={`w-full p-2 rounded bg-[#060F8F] ${
                    editMode ? "border border-green-400" : "opacity-70"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-300">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={profile.weight}
                  onChange={handleChange}
                  readOnly={!editMode}
                  className={`w-full p-2 rounded bg-[#060F8F] ${
                    editMode ? "border border-green-400" : "opacity-70"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-black font-semibold px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="bg-[#06E959] text-black font-semibold px-4 py-2 rounded"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;