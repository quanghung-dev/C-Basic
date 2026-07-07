"use client";

import { useEffect, useState } from "react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          Product Management API
        </h1>
        <p className="mt-4 text-lg text-slate-300">
          Ứng dụng quản lý sản phẩm sử dụng Next.js (CSR) & Tailwind CSS v4.
        </p>
      </div>
    </main>
  );
}
