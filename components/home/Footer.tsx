import Image from "next/image";
import { INK } from "@/lib/home-theme";

export default function Footer() {
  return (
    <footer
      className="border-t border-white/10 px-6 py-10 text-center"
      style={{ backgroundColor: INK }}
    >
      <Image
        src="/IMG_8197-removebg-preview.png"
        alt="IB Barber"
        width={100}
        height={34}
        className="mx-auto h-8 w-auto opacity-80"
      />
      <p className="mt-4 text-sm text-white/50">
        Contacte-moi sur Snapchat —{" "}
        <span className="font-medium text-white/80">@i-ftyyy08</span>
      </p>
      <p className="mt-6 text-xs text-white/30">
        © {new Date().getFullYear()} IB Barber
      </p>
    </footer>
  );
}
