import React, { useState }  from 'react'

import Footer from "../components/Footer"
import axios from 'axios'
import {URL} from '../url'
import { Link, useNavigate } from "react-router-dom";
const Register = () => {

  const [username,setUsername]=useState("")
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [error,setError]=useState(false)
  const [usernameExists, setUsernameExists] = useState(false); // New state to track username existence
  const [emailExists, setEmailExists] = useState(false); // New state to track email existence
  

  const navigate=useNavigate()

  const handleRegister=async ()=>{
    try {
      // Check if the username already exists
      const usernameCheck = await axios.get(`${URL}/api/auth/check-username/${username}`);
      
      if (usernameCheck.data.exists) {
        // Username already exists, prompt the user
        setUsernameExists(true);
        setError(false); // Clear any previous errors
      } else {


          // Check if the email already exists
          const emailCheck = await axios.get(`${URL}/api/auth/check-email/${email}`);


          if (emailCheck.data.exists) {
            setEmailExists(true);
            setUsernameExists(false);
            setError(false);
          } else {
            // Proceed with registration if both username and email are available
            const res = await axios.post(`${URL}/api/auth/register`, { username, email, password });
            setUsername(res.data.username);
            setEmail(res.data.email);
            setPassword(res.data.password);
            setError(false);
            setUsernameExists(false);
            setEmailExists(false); // Reset email existence state
            navigate("/login");
          }
      }
    } catch (err) {
      setError(true);
      setUsernameExists(false); // Reset the username existence state
      setEmailExists(false);
      console.log(err);
    }

  }
  return (
    <>
     <div className="flex items-center justify-between px-6 md:px-[200px] py-4">
			<h1 className="text-lg md:text-xl font-extrabold">
				<Link to="/">Blog Market</Link>
			</h1>
            <h3><Link to ="/login">Login</Link></h3>
           </div> 
    
    <div className='w-full flex justify-center items-center h-[80vh]'>
    <div className='flex flex-col justify-center items-center space-y-4 w-[80%] md:w-[25%]'>
    <label htmlFor="loginText" className='text-xl font-bold text-left'>Create an account</label>
        <input onChange={(e)=>setUsername(e.target.value)} className='w-full px-4 py-2 border-2 border-black outline-0' type='text' placeholder='Enter your username'></input>
        <input onChange={(e)=>setEmail(e.target.value)} className='w-full px-4 py-2 border-2 border-black outline-0' type='email' placeholder='Enter your email'></input>
        <input onChange={(e)=>setPassword(e.target.value)} className='w-full px-4 py-2 border-2 border-black outline-0' type='password' placeholder='Enter your password'></input>
        <button onClick={handleRegister} className='w-full px-4 py-4 text-lg font-bold text-white bg-black rounded-lg hover:bg-gray-500 hover:text-black'>Register</button>
        {error && <h3 className="text-red-500 text-sm ">please enter correct username, email, & password</h3>}
        {usernameExists && <h3 className="text-red-500 text-sm">Username is already in use, please choose a new username.</h3>}
        {emailExists && <h3 className="text-red-500 text-sm">Email is already in use. Please use a different email address.</h3>}
        <div className='flex justify-center items-center space-x-4'>
           <p>Already have an account?</p> 
           <p className='text-gray-500 hover:text-black'><Link to="/login">Login</Link></p>
        </div>
    </div>
</div>
<Footer/>
</>
  )
}

export default Register