import React from 'react';

import axios from "axios";
import { BiEdit } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom"; // Make sure to import useNavigate
import { URL } from "../url";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const Comment = ({ c, post }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate(); // Initialize navigate

  const deleteComment = async (id) => {
    try {
      await axios.delete(`${URL}/api/comments/${id}`, { withCredentials: true });
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const navigateToEditComment = (commentId) => {
    navigate(`/edit-comment/${commentId}`); // Make sure this matches your route for editing comments
  };

  return (
    <div data-testid='comment-1' className="px-2 py-2 bg-gray-200 rounded-lg my-2">
      <div className="flex items-center justify-between">
        <h3 data-testid='author' className="font-bold text-gray-600">@{c.author}</h3>
        <div data-testid='updated-time' className="flex justify-center items-center space-x-4">
          <p>{new Date(c.updatedAt).toLocaleString()}</p>
          
          {user?._id === c?.userId && (
            <div className="flex items-center justify-center space-x-2">
              <BiEdit className="cursor-pointer" onClick={() => navigateToEditComment(c._id)} data-testid='edit-button' />
              <MdDelete 
                className="cursor-pointer" 
                onClick={() => deleteComment(c._id)} 
                data-testid='delete-button' 
              />
            </div>
          )}
        </div>
      </div>
      <p className="px-4 mt-2">{c.comment}</p>
    </div>
  );
};

export default Comment;
