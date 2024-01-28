import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { URL } from "../url";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const EditComment = () => {
    const { id: commentId } = useParams(); // Get the comment ID
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [text, setText] = useState("");

    const fetchComment = async () => {
        try {
            const res = await axios.get(`${URL}/api/comments/${commentId}`);
            setText(res.data.comment); // Ensure this matches the structure of your comment object
        } catch (err) {
            console.log(err);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const updatedComment = {
            comment: text, // Use the state variable 'text' for the updated comment
            userId: user._id,
        };

        try {
            const res = await axios.put(`${URL}/api/comments/${commentId}`, updatedComment, { withCredentials: true });
            navigate("/posts/post/" + res.data.postId); // Ensure res.data.postId is correctly referenced
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchComment();
    }, [commentId]);

    return (
        <div>
            <Navbar />
            <div className='px-6 md:px-[200px] mt-8'>
                <h1 className='font-bold md:text-2xl text-xl '>Update a comment</h1>
                <form className='w-full flex flex-col space-y-4 md:space-y-8 mt-4'>
                    <textarea onChange={(e) => setText(e.target.value)} value={text} rows={4} className='px-4 py-2 outline-none' placeholder='Enter comment text' />
                    <button onClick={handleUpdate} className='bg-black w-full md:w-[20%] mx-auto text-white font-semibold px-4 py-2 md:text-xl text-lg'>Update</button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default EditComment;

