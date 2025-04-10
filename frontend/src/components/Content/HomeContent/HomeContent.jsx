import React from "react";
import CreatePost from "./CreatePost";
import Stories from "./Stories";
import PostItem from "./PostItem";
import Post from "./PostList";
import PostList from "./PostList";

const Feed = () => {
  return (
    <div className="pt-3 pb-4 flex justify-center px-4">

      <div className="max-w-[520px] w-full space-y-4">
        <CreatePost />
        <Stories />
        <PostList/>
      </div>
    </div>
  );
};

export default Feed;
