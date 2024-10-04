import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import UserMenu from "./user-menu";
import { PenBox } from "lucide-react";
import Image from "next/image";

const Header = () => {
  return (
    <header className="container mx-auto py-6 flex justify-between items-center px-4">
      <Link href="/">
        <h1 className="text-2xl font-bold">
          <Image
            src={"/logo2.png"}
            alt="Zscrum Logo"
            width={200}
            height={56}
            className="h-10 w-auto object-contain"
          />
        </h1>
      </Link>
      <nav>
        <div className="flex items-center gap-4">
          <Link href="/events?create=true">
            <Button variant="default" className="flex items-center gap-2">
              <PenBox size={18} />
              <span className="hidden sm:inline">Create Project</span>
            </Button>
          </Link>
          <SignedOut>
            <SignInButton forceRedirectUrl="/onboarding">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserMenu />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
