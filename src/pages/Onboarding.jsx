import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/logo.png"
import gmail from "../assets/gmail.png"
import google from "../assets/google.png"

const Onboarding = () => {
    const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("User:", user);
      alert(`Welcome ${user.displayName || "User"}!`);
      navigate("/dashboard"); 
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert("❌ Google Sign-In failed. Try again later.");
    }
  };
  return (
    <div className='flex justify-center items-center flex-col min-h-screen '>

        <img src={logo} alt="logo" className='h-25 w-25 sm:h-50 sm:w-50 '/>

        <h1 className='font-Montserrat font-bold text-[16px] sm:text-[32px] mb-1 ' > 
            Stretch Fitness Tracker
        </h1>
        <h2 className='font-inter font-bold mb-5 sm:mb-10 text-[11px] sm:text-[14px]'>
            Track & Progress
        </h2>


    <Link to="/signup">
        <div>
            <button className='flex items-center py-2 px-9 sm:px-23 cursor-pointer text-[11px] sm:text-[17px]
            justify-center gap-3 bg-[#06E959] rounded-lg font-inter font-bold'>
                <img src= {gmail} alt="" className='h-4 mt-1'/>
                Sign up with Email
            </button>
        </div>
        </Link>


         <div>
            <button
            onClick={handleGoogleSignIn}
             className='flex items-center py-2 px-8 sm:px-22 cursor-pointer text-black mt-2.5 sm:mt-5
            justify-center gap-3 bg-[#ffffff] rounded-lg font-inter font-bold text-[11px] sm:text-[17px]'>
                <img src= {google} alt="" className='h-4 mt-1 '/>
                Sign up with Google
            </button>
        </div>

        <p className='mt-9 font-inter font-medium text-[11px] sm:text-[14px] sm:mt-15'>
            Have an account? 
             <Link to="/signin" className='hover:underline text-[#06E959]'> Sign In </Link>
            
        </p>


        


    </div>
  )
}

export default Onboarding