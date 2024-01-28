import React, { useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { URL } from "../url";
import { Link, useNavigate } from "react-router-dom";

const Menu = () => {
	const navigate= useNavigate()
	const { user, setUser } = useContext(UserContext);
	

	const handleLogout = async () => {
		try {
			const res = await axios.get(URL + "/api/auth/logout", {	withCredentials: true,});
			//console.log(res)
			navigate("/login");
			setUser(null);
		
		} catch (err) {
			console.log(err);
		}
	};
	useEffect(() => {
		console.log(user); // Log the user state after it has been updated
	}, [user]);

	return (
		<div className="bg-black w-[200px] z-10 flex flex-col items-start absolute top-12 right-6 md:right-32 rounded-md p-4 space-y-4">
			{!user && (
				<h3 className="text-white text-sm hover:text-gray-500 cursor-pointer">
					<Link to="/login">Login</Link>
				</h3>
			)}
			{!user && (
				<h3 className="text-white text-sm hover:text-gray-500 cursor-pointer">
					<Link to="/register">Register</Link>
				</h3>
			)}
			{user && (
				<h3 className="text-white text-sm hover:text-gray-500 cursor-pointer">
					<Link to={"/profile/" + user._id}>Profile</Link>
				</h3>
			)}
			{user && (
				<h3 className="text-white text-sm hover:text-gray-500 cursor-pointer">
					<Link to="/write">Write</Link>
				</h3>
			)}
			{user && (
				<h3 className="text-white text-sm hover:text-gray-500 cursor-pointer">
					<Link to={"/myblogs/" + user._id}>My blogs</Link>
				</h3>
			)}
			{user && (
				<button
					onClick={handleLogout}
					className="text-white text-sm hover:text-gray-500 cursor-pointer logout-btn"
					data-testid="logout-trigger" >
					Logout
				</button>
			)}
		</div>
	);
};

export default Menu;
