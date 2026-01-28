
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Matrimony | Bari Samaj",
    description: "Find your life partner within the Bari Samaj community. View profiles of brides and grooms.",
};

export default function MatrimonyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
