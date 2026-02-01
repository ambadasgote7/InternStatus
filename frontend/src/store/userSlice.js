import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name : "user",
    initialState : null,
    reducers : {
        addUser: (state, action) => {
            if (!state) return action.payload; // initial login
            return {
                ...state,
                ...action.payload,
            };
        },

        removeUser : () => null,
    }
});

export const { addUser, removeUser } = userSlice.actions;

export default userSlice.reducer;