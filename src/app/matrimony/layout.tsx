
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
    return <>{children}</>;
}
