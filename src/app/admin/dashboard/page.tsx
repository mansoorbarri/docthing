"use client"
import { DashboardLayout } from "~/components/dashboard-layout";
import { DashboardOverview } from "~/components/dashboard-overview";
import { useUser} from "@clerk/nextjs";
import { Loading } from "~/components/loading";

export default  function AdminDashboardPage() {
    const {isLoaded, isSignedIn, user} = useUser();
    if (!isLoaded || !isSignedIn) {
        return <Loading />
    }
    if (user.publicMetadata.role !== 'admin') {
        return <div>You are not authorized to view this page.</div>;
    }
    return (
        <DashboardLayout>
            <DashboardOverview />
        </DashboardLayout>
    );
}