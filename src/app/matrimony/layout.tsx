
export const dynamic = "force-dynamic";

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Matrimony | Bari Samaj",
    description: "Find your life partner within the Bari Samaj community. Browse profiles of brides and grooms, create your profile.",
};

export default function MatrimonyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-ivory-50 py-8">
            <div className="container mx-auto px-6 max-w-6xl">{children}</div>
        </div>
    );
}
