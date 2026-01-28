
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Dashboard | Bari Samaj",
    description: "Manage community members, matrimony profiles, and events.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
