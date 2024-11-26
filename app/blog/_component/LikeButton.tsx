"use client"
import { style } from "../constants/style" //className={` ${style} border-indigo-50 absolute top-2 right-2`}
import React, { useState } from 'react';

export default function LikeButton({ id, likePost, unlikePost }: { id: number, likePost: Function, unlikePost:Function }) {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
    }
  };
  const handleClick = () => {
    if (isLiked) {
      unlikePost(id); // Call the passed `unlikePost` function
    } else {
      likePost(id); // Call the passed `likePost` function
    }
    handleLike(); // Update local state
  };

  return (
    <span>
      <input type="checkbox" id={`like-${id}`} className="hidden" checked={isLiked} onChange={handleClick}/>
      <label htmlFor={`like-${id}`} className={`cursor-pointer text-xl`} >
        {isLiked ? "❤️" : "🤍"}
      </label>
    </span>
  );
};
