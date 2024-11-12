import React, { useEffect, useState } from "react";

function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.body.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDarkMode ? "light" : "dark");
  };

  return (
    <div className="theme-toggle">
      <input
        type="checkbox"
        id="switch-mode"
        checked={isDarkMode}
        onChange={toggleTheme}
        hidden
      />
      <label htmlFor="switch-mode" className="switch-mode"></label>
    </div>
  );
}

export default ThemeToggle;
