"use client"
import { DashboardLayout } from "~/components/dashboard-layout";
import { AppointmentsView } from "~/components/appointments-view";
import { useUser} from "@clerk/nextjs";
import { Loading } from "~/components/loading";

export default  function AdminAppointmentsPage() {
    const {isLoaded, isSignedIn, user} = useUser();
    if (!isLoaded || !isSignedIn) {
        return <Loading />
    }
    if (user.publicMetadata.role !== 'admin') {
        return <div>You are not authorized to view this page.</div>;
    }
    return (
        <DashboardLayout>
            <AppointmentsView />
        </DashboardLayout>
    );
}