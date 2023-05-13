import { createSlice } from "@reduxjs/toolkit";
import { createGlobalStyle } from "styled-components";

export const prayerSlice = createSlice({
  name: 'prayer',
  initialState: {
    prayer: [],
    answeredPrayers: [],
    favoriteVerses: [],
  },
  reducers: {
    addToFavorites: (state, action) => {
      const Favorites = [action.payload, ...state.favoriteVerses]
      state.favoriteVerses = Favorites
    },
    clearPrayerData: (state) => {
      state.prayer = []
      state.answeredPrayers = []
      state.favoriteVerses = []
    },
    deleteFavorites: (state, action) => {
      state.favoriteVerses = []
    },
    deleteFavoriteVerse: (state, action) => {
      state.favoriteVerses = state.favoriteVerses.filter((verse) => verse.id !== action.payload)
    },
    addPrayer: (state, action) => {
      const Prayers = [action.payload, ...state.prayer]
      state.prayer = Prayers
    },
    addNoteToPrayer: (state, action) => {
      state.answeredPrayers = state.answeredPrayers.map(obj => obj.id === action.payload.id ? { ...obj, answerNoted: action.payload.answerNote } : obj)
    },
    deletePrayer: (state, action) => {
      console.log(action.payload)
      state.prayer = state.prayer.filter((prayer) => prayer.id !== action.payload)
    },
    editPrayer: (state, action) => {
      const newPrayers = [...state.prayer]
      const prayerIndex = state.prayer.findIndex((prayer) => prayer.id === action.payload.id)
      newPrayers.splice(prayerIndex, 1, action.payload)
      state.prayer = newPrayers
    },
    addToAnsweredPrayer: (state, action) => {
      // state.answeredPrayers.push(action.payload)
      const AnsweredPrayers = [action.payload, ...state.answeredPrayers]
      state.answeredPrayers = AnsweredPrayers
    },
    removeAnsweredPrayer: (state, action) => {
      state.answeredPrayers = state.answeredPrayers.filter((prayer) => prayer.prayer.id !== action.payload)
    },
    deleteAnsweredPrayers: (state, action) => {
      state.answeredPrayers = []
    }
  }
},
)

export const {
  addPrayer,
  deletePrayer,
  editPrayer,
  addToAnsweredPrayer,
  deleteAnsweredPrayers,
  removeAnsweredPrayer,
  setVerse,
  addNoteToPrayer,
  addToFavorites,
  deleteFavorites,
  clearPrayerData,
  deleteFavoriteVerse
} = prayerSlice.actions

export default prayerSlice.reducer