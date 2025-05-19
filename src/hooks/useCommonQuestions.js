// src/hooks/useCommonQuestions.js
import { useState, useCallback, useContext } from "react";
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { AuthContext } from "../context/AuthContext";

export const useCommonQuestions = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add a new common question
  const addCommonQuestion = useCallback(
    async (questionData) => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        setLoading(true);
        setError(null);

        const questionRef = doc(collection(db, "users", currentUser.uid, "commonQuestions"));

        await setDoc(questionRef, {
          question: questionData.question,
          defaultAnswer: questionData.defaultAnswer || "",
          category: questionData.category || "general",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return { id: questionRef.id, ...questionData };
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  // Update an existing common question
  const updateCommonQuestion = useCallback(
    async (questionId, questionData) => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        setLoading(true);
        setError(null);

        const questionRef = doc(db, "users", currentUser.uid, "commonQuestions", questionId);

        await updateDoc(questionRef, {
          ...questionData,
          updatedAt: new Date(),
        });

        return { id: questionId, ...questionData };
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  // Delete a common question
  const deleteCommonQuestion = useCallback(
    async (questionId) => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        setLoading(true);
        setError(null);

        await deleteDoc(doc(db, "users", currentUser.uid, "commonQuestions", questionId));

        return { success: true };
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  // Get all common questions
  const getAllCommonQuestions = useCallback(
    async (category = null) => {
      if (!currentUser) return [];

      try {
        setLoading(true);
        setError(null);

        const questionsRef = collection(db, "users", currentUser.uid, "commonQuestions");
        let q;

        if (category) {
          q = query(questionsRef, where("category", "==", category));
        } else {
          q = query(questionsRef);
        }

        const querySnapshot = await getDocs(q);
        const questions = [];

        querySnapshot.forEach((doc) => {
          questions.push({ id: doc.id, ...doc.data() });
        });

        return questions;
      } catch (err) {
        setError(err.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  return {
    loading,
    error,
    addCommonQuestion,
    updateCommonQuestion,
    deleteCommonQuestion,
    getAllCommonQuestions,
  };
};
