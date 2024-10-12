import FancyAnimation from "@/components/common/fancy-animation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/dashboard"
        className="z-30 mt-80 flex items-center gap-2 rounded-full px-4 py-2 hover:bg-muted"
      >
        Dashboard <ArrowRight size={16} />
      </Link>
      <div className="absolute">
        <FancyAnimation></FancyAnimation>
      </div>
    </div>
  );
}
