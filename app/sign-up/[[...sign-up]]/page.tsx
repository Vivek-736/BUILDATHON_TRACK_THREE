import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-2 mb-6 group">
        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-xs flex items-center justify-center">
          <Image
            src="/favicon.svg"
            alt="RecoverAI Logo"
            width={22}
            height={22}
            className="object-contain"
          />
        </div>
        <span className="font-extrabold text-lg tracking-tight text-gray-900">
          Recover<span className="text-[#ea580c]">AI</span>
        </span>
      </Link>

      <div className="w-full max-w-md flex justify-center">
        <SignUp
          appearance={{
            elements: {
              card: "shadow-lg border border-gray-200 rounded-2xl bg-white",
              formButtonPrimary: "bg-[#ea580c] hover:bg-[#c2410c] text-white",
              headerTitle: "text-gray-900 font-bold",
              headerSubtitle: "text-gray-500 text-xs",
            },
          }}
        />
      </div>
    </div>
  );
}