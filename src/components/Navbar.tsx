"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import HeaderTopBar from "./header/HeaderTopBar";
import HeaderNavigation from "./header/HeaderNavigation";
import HeaderMain from "./header/HeaderMain";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);

  const handleCategoryToggle = () => {
    setCategoryOpen((prev) => !prev);
  };

  const handleMobileMenuOpen = () => {
    setMobileMenuOpen(true);
    setCategoryOpen(false);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
    setCategoryOpen(false);
  };

  const handleMobileCategoryClose = () => {
    setCategoryOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[0_1px_8px_rgba(15,118,110,0.06)]">

      {/* Top Utility Bar */}
      <HeaderTopBar />

      {/* Main Header */}
      <HeaderMain
        onMenuOpen={handleMobileMenuOpen}
        categoryOpen={categoryOpen}
        onCategoryToggle={handleCategoryToggle}
      />

      {/* Navigation */}
      <div ref={categoryRef}>
        <HeaderNavigation
          categoryOpen={categoryOpen}
          mobileMenuOpen={mobileMenuOpen}
          onCategoryToggle={handleCategoryToggle}
          onMobileMenuClose={handleMobileMenuClose}
          onMobileCategoryClose={handleMobileCategoryClose}
        />
      </div>

    </header>
  );
};

export default Navbar;