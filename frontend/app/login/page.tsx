"use client";
import React from "react";
import LoginForm from "@/components/login/LoginForm";

export default function Login() {
  return (
    <div className="w-full h-screen overflow-hidden bg-black text-white lg:grid lg:grid-cols-2">
      {/* Left side */}
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-4xl font-bold mb-4">Apex IoT Platform</h1>
          </div>
          <LoginForm />
          <div className="rounded border border-white/10 p-3 text-center text-sm text-white/70">
            Demo login: <span className="font-semibold text-white">+1 555 010 0001</span>
            <br />
            One-time code: <span className="font-semibold text-white">1234</span>
          </div>
        </div>
      </div>

      <div
  className="hidden lg:block"
  style={{ backgroundColor: 'hsl(336, 10%, 10%, 1)' }}
>
</div>
    </div>
  );
}
