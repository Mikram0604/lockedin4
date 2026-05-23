import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentLogin() {
  const [_, setLocation] = useLocation();
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (localStorage.getItem("studentPhone")) {
      setLocation("/student/dashboard");
    }
  }, [setLocation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length >= 10) {
      localStorage.setItem("studentPhone", phone.trim());
      setLocation("/student/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-student-login flex flex-col items-center justify-center p-4">
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
          <div className="h-2 w-full bg-blue-500" />
          <CardHeader className="text-center pt-8 pb-6">
            <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <Phone size={24} />
            </div>
            <CardTitle className="text-2xl font-bold" style={{ fontFamily: "var(--app-font-display)" }}>Student Portal</CardTitle>
            <CardDescription>Enter your phone number to access your chat history and continue onboarding.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 font-semibold">+91</span>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="rounded-xl h-12 pl-12"
                    autoFocus
                    maxLength={10}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={phone.length < 10}>
                Continue <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
