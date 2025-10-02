"use client"
import { DashboardLayout } from "~/components/dashboard-layout";
import { PatientsView } from "~/components/patients-view";
import { useUser} from "@clerk/nextjs";
import { Loading } from "~/components/loading";

export default  function AdminPatientsPage() {
    const {isLoaded, isSignedIn, user} = useUser();
    if (!isLoaded || !isSignedIn) {
        return <Loading />
    }
    if (user.publicMetadata.role !== 'admin') {
        return <div>You are not authorized to view this page.</div>;
    }
    return (
        <DashboardLayout>
            <PatientsView />
        </DashboardLayout>
    );
}