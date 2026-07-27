import React from "react";
import { Analytics } from "@vercel/analytics/react";
import Builder from "./Builder"; // ✅ Capital B

export default function App() {
  return (
    <>
      <Builder />
      <Analytics />
    </>
  );
}