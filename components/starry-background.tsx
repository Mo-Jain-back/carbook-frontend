"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Stars from "@/public/stars-black.jpg";
import Sky from "@/public/blue-sky.jpg";

const StarryBackground: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;


  return (
    <div className="fixed top-0 left-0 w-full h-full -z-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image src={Stars} alt="stars"  className="absolute inset-0 object-cover opacity-0 dark:opacity-100 transition-opacity duration-1000 ease-in-out z-20 w-full h-full" />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image src={Sky} alt="sky"  className="absolute inset-0 h-screen w-screen opacity-50 dark:opacity-0 transition-opacity duration-1000 ease-in-out  w-full h-full" />
      </div>
    </div>
  );
};

export default StarryBackground;
