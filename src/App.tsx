import React from "react";
import "./App.css";
import { Education } from "./components/Education";
import { Employment } from "./components/Employment";
import { Header } from "./components/Header";

function App() {
  return (
    <div className="App">
      <Header />
      <Employment />
      <Education />
    </div>
  );
}

export default App;
