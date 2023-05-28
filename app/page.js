"use client";

import { useEffect } from "react";

import runETL from "../support/etl";

export default function Home() {
  const init = async () => {
    await runETL();
  };

  useEffect(() => {
    init();
  }, []);

  return <main>😊</main>;
}
