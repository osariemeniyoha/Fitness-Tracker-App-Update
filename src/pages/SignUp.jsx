import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      
      await sendEmailVerification(user);

      setMessage("✅ Registration successful! Please verify your email.");

      
      const checkVerification = setInterval(async () => {
        await user.reload(); 
        if (user.emailVerified) {
          clearInterval(checkVerification);
          navigate("/dashboard"); 
        }
      }, 3000); 
    } catch (error) {
     
      switch (error.code) {
        case "auth/email-already-in-use":
          setMessage("❌ Already a user. Try logging in.");
          break;
        case "auth/invalid-email":
          setMessage("❌ Invalid email. Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setMessage("❌ Weak password. Please use at least 6 characters.");
          break;
        default:
          setMessage("❌ " + error.message);
      }
    }
  };

  return (
    <div className="flex justify-center items-center flex-col min-h-screen">
      <form onSubmit={handleSignUp} className="w-full max-w-md sm:max-w-lg font-inter">
        <h1 className="text-[24px] sm:text-[32px] font-bold mb-1 font-montserrat">
          Sign Up
        </h1>
        <h2 className="font-overlock text-[13px] font-regular mb-4">
          Sign Up to start tracking your fitness
          and making progress
        </h2>

        
        <input
          type="text"
          placeholder="Full Name"
          className="bg-[#000748] p-2 w-full mb-3 rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        
        <input
          type="email"
          placeholder="Email"
          className="bg-[#000748] p-2 w-full mb-3 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="bg-[#000748] p-2 w-full mb-3 rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-2 top-5 transform -translate-y-1/2 text-gray-600 text-sm"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

       
        <button
          type="submit"
          className="bg-[#06E959] hover:bg-[#00d14d] text-white font-montserrat py-2 px-17 sm:px-32 mx-auto block rounded-full font-bold transition duration-300"
        >
          Sign Up
        </button>

        
        {message && <p className="text-center text-sm mt-3 font-overlock">{message}</p>}
      </form>
    </div>
  );
};

export default SignUp;
