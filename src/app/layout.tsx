import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { VisualEditsMessenger } from "orchids-visual-edits";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Slate - Write Your Future",
  description: "Unified learning and commerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${outfit.variable} font-sans antialiased`}
      >
          <AuthProvider>
            {children}
            <Toaster
              position="top-center"
              richColors
              closeButton
              toastOptions={{
                style: {
                  fontFamily: 'var(--font-outfit), sans-serif',
                  borderRadius: '14px',
                  border: '1px solid',
                  fontSize: '13px',
                  fontWeight: '500',
                  padding: '14px 16px',
                },
                classNames: {
                  toast: 'shadow-lg shadow-gray-200/50',
                  title: 'font-semibold text-sm',
                  description: 'text-xs text-gray-500 mt-0.5',
                  actionButton: 'bg-black! text-white! text-xs! rounded-lg! px-3! py-1.5!',
                  cancelButton: 'bg-gray-100! text-gray-700!',
                }
              }}
            />
          </AuthProvider>

        <VisualEditsMessenger />
      </body>
    </html>
  );
}
