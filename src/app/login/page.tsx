"use client";

import { signup, login } from "./actions";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/y71wwxpKfsO
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, MountainIcon } from "lucide-react";
import { useState } from "react";



export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <MountainIcon className="h-10 w-10" />
          <h2 className="text-2xl font-bold">Agrivet POS</h2>
          <p className="text-muted-foreground">
            Enter your email and password to sign in.
          </p>
        </div>
        <Card>
          <form>
            <CardContent className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email"  type="email" placeholder="name@example.com" />
              </div>
              <div className="grid gap-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[33px] text-muted-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link
                href="#"
                className="text-sm text-muted-foreground"
                prefetch={false}
              >
                Forgot password?
              </Link>
              <Button formAction={login}>Log in</Button>
              <Button formAction={signup}>Sign up</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
