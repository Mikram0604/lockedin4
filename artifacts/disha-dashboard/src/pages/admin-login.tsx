import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [_, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem("adminAuth") === "true") {
      setLocation("/dashboard");
    }
  }, [setLocation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      localStorage.setItem("adminAuth", "true");
      setLocation("/dashboard");
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect counselor password.",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-counselor-login flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-6">
        <Button variant="ghost" className="text-slate-500 hover:text-slate-900" onClick={() => setLocation("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-3xl shadow-sm border-0 bg-white overflow-hidden">
          <div className="h-2 w-full bg-indigo-500" />
          <CardHeader className="text-center pt-8 pb-6">
            <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-500">
              <Lock size={24} />
            </div>
            <CardTitle className="text-2xl font-bold" style={{ fontFamily: "var(--app-font-display)" }}>Counselor Login</CardTitle>
            <CardDescription>Enter the master password to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl h-12"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold">
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
