import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    posts: [],
    status: 'idle',
    error: null,
};

const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        addPost: (state, action) => {
            state.posts.unshift(action.payload);
        },
        deletePost: (state, action) => {
            state.posts = state.posts.filter((post) => post.id !== action.payload);
        },
        updatePost: (state, action) => {
            const index = state.posts.findIndex((post) => post.id === action.payload.id);
            if (index !== -1) {
                state.posts[index] = action.payload;
            }
        },
        setPosts: (state, action) => {
            state.posts = action.payload;
        },
        refreshPosts: (state, action) => {
            const posts = action.payload;
            if (Array.isArray(posts)) {
                const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                state.posts = sortedPosts;
            }
        },
    },
});

export const { addPost, deletePost, updatePost, setPosts, refreshPosts } = postSlice.actions;
export default postSlice.reducer;
