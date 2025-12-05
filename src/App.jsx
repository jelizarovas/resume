import React from "react";
import "./App.css";
import { Education } from "./components/Education";
import { Employment } from "./components/Employment";
import { Header } from "./components/Header";
import { Skills } from "./components/Skills";

function App() {
  return (
    <div className="App container mx-auto bg-white shadow-xl print:shadow-none pb-10 mb-24 print:mb-0">
      <Header />
      <Education />
      <Employment />
      <Skills />
    </div>
  );
}

export default App;
