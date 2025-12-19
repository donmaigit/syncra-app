"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  // NEW: Separate Names
  const lastName = formData.get("lastName") as string;
  const firstName = formData.get("firstName") as string;
  
  // Computed Display Name (Japanese Order: Last First)
  const fullName = `${lastName} ${firstName}`.trim();

  const rawSubdomain = formData.get("subdomain") as string;

  if (!email || !password || !rawSubdomain || !lastName || !firstName) {
    return { error: "Missing required fields" };
  }

  // Clean subdomain
  const subdomain = rawSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");
  
  // Restricted subdomains
  const restricted = ["app", "www", "admin", "dashboard", "api", "mail", "support", "billing"];
  if (restricted.includes(subdomain) || subdomain.length < 3) {
    return { error: "This subdomain is not allowed or too short." };
  }

  try {
    // 1. Check Email
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return { error: "Email already in use" };

    // 2. Check Subdomain
    const existingSubdomain = await prisma.user.findUnique({ where: { subdomain } });
    if (existingSubdomain) return { error: "URL is already taken. Please choose another." };

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create User
    await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        name: fullName, // Save combined for easy display fallback
        password: hashedPassword,
        subdomain, 
        role: "merchant", // Default to merchant
        plan: "starter"   // Default plan
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Registration failed. Please try again." };
  }
}