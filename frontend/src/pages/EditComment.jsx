import React, { useContext, useEffect, useState } from "react";
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
  const [error, setError] = useState(null);

  const fetchComment = async () => {
    try {
      const res = await axios.get(`${URL}/api/comments/${commentId}`);
      setText(res.data.comment);
    } catch (err) {
      setError("An error occurred while fetching the comment.");
      console.error(err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validate if the text is empty before making an API call
    if (text.trim() === "") {
      setError("Please enter a valid comment text.");
      return;
    }

    const updatedComment = {
      comment: text,
      userId: user._id,
    };

    try {
      const res = await axios.put(
        `${URL}/api/comments/${commentId}`,
        updatedComment,
        { withCredentials: true }
      );
      navigate("/posts/post/" + res.data.postId);
    } catch (err) {
      setError("An error occurred while updating the comment.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComment();
  }, [commentId]);

  return (
    <div>
      <Navbar />
      <div className="px-6 md:px-[200px] mt-8">
        <h1 data-testid="update-a-comment" className="font-bold md:text-2xl text-xl ">
          Update a comment
        </h1>
        {error && <p className="text-red-500">{error}</p>}
        <form className="w-full flex flex-col space-y-4 md:space-y-8 mt-4">
          <textarea
            onChange={(e) => setText(e.target.value)}
            value={text}
            rows={4}
            className="px-4 py-2 outline-none"
            placeholder="Enter comment text"
          />
          <button
            data-testid="update-button"
            onClick={handleUpdate}
            className="bg-black w-full md:w-[20%] mx-auto text-white font-semibold px-4 py-2 md:text-xl text-lg"
          >
            Update
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditComment;


