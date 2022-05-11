import React from "react";
import "./App.css";
import { Education } from "./components/Education";
import { Employment } from "./components/Employment";
import { Header } from "./components/Header";

function App() {
  return (
    <div className="App container mx-auto bg-white shadow-xl print:shadow-none">
      <Header />
      <Employment />
      <Education />
    </div>
  );
}

export default App;
